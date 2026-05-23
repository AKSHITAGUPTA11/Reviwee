import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  GOOGLE_BUSINESS_CONFIG_KEY,
  isProbablyFullGoogleBusinessLink,
  mergeGoogleBusinessLinkPrefixWithPlaceId,
  pickConfigValueByKey,
  useGetConfigQuery,
} from "../../services/ConfigService";
import {
  useGetReviewTemplateQuery,
  useGenerateReviewMutation,
  normalizeGeneratedReviews,
  type NormalizedGeneratedReview,
  type ReviewTemplateLanguage,
  type ReviewTemplateOwner,
  type ReviewTemplateResponse,
  type ReviewTemplateStaffMember,
} from "../../services/ReviewTemplateService";
import ReviewGeneratorView from "./ReviewGeneratorView";
import {
  getErrorPayloadData,
  isInsufficientCreditsError,
  isInsufficientCreditsPayload,
  pickBusinessNameFromPayload,
} from "../../utils/insufficientCredits";

/** Keeps the “AI is writing” UI visible at least this long so fast APIs don’t feel instant. */
const MIN_GENERATION_DISPLAY_MS = 1200;

function getLanguagePayloadValue(language: ReviewTemplateLanguage | undefined): string {
  if (!language) return "";
  const description = language.languageDescription?.trim();
  if (description) return description;
  return language.languageName?.trim() ?? "";
}

function extractBackendErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      for (const key of ["message", "issue", "error"] as const) {
        const v = d[key];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return "Could not generate reviews. Please try again.";
}

/** Hide Google CTA when backend sent a broken place id in the URL. */
function sanitizeGoogleBusinessLink(link: string | undefined): string | undefined {
  if (!link?.trim()) return undefined;
  if (/placeid=(undefined|null)\b/i.test(link) || /placeid=\s*$/i.test(link)) return undefined;
  return link.trim();
}

/** Prefer camelCase; fall back to snake_case from API. */
function pickRawGoogleBusinessLink(data: ReviewTemplateResponse | undefined): string | undefined {
  const camel = data?.googleBusinessLink;
  if (typeof camel === "string" && camel.trim()) return camel;
  const snake = data?.google_business_link;
  if (typeof snake === "string" && snake.trim()) return snake;
  return undefined;
}

/** Ensure a usable absolute URL for navigation (Maps / search links often omit https). */
function normalizeGoogleBusinessUrl(link: string | undefined): string | undefined {
  const sanitized = sanitizeGoogleBusinessLink(link);
  if (!sanitized) return undefined;
  const t = sanitized.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return `https://${t}`;
}

const ReviewGeneratorPage = () => {
  const { businessId: businessIdParam } = useParams<{ businessId?: string }>();
  const navigate = useNavigate();
  const businessId = businessIdParam ?? "";

  const [language, setLanguage] = useState("");
  const [productId, setProductId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [rating, setRating] = useState(0);
  const [hasTriedGenerate, setHasTriedGenerate] = useState(false);
  const [writerGender, setWriterGender] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [generatedReviews, setGeneratedReviews] = useState<NormalizedGeneratedReview[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [hasCopiedReview, setHasCopiedReview] = useState(false);
  const [isGeneratingUi, setIsGeneratingUi] = useState(false);
  const isMountedRef = useRef(true);
  const isEnglishLanguage = (lang: string) => {
    const t = lang.trim().toLowerCase();
    // Handles "English", "English (US)" etc.
    return t === "english" || t.startsWith("english ");
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setGeneratedReviews([]);
    setHasGenerated(false);
    setHasCopiedReview(false);
    setLanguage("");
    setProductId("");
    setServiceId("");
    setRating(0);
    setHasTriedGenerate(false);
    setWriterGender("");
    setOwnerId("");
    setStaffId("");
    setSelectedTag("");
  }, [businessId]);

  const {
    data: templateData,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useGetReviewTemplateQuery(businessId, { skip: !businessId });

  const { data: configResponse } = useGetConfigQuery(undefined, { skip: !businessId });

  /** QR / deep link: template load fails with “no credits” → dedicated page. */
  useEffect(() => {
    if (!businessId || !templateError) return;
    if (isInsufficientCreditsError(templateError)) {
      navigate("/no-credits", {
        replace: true,
        state: {
          businessName:
            pickBusinessNameFromPayload(getErrorPayloadData(templateError)) ?? undefined,
        },
      });
    }
  }, [businessId, templateError, navigate]);

  /** Some APIs return HTTP 200 with `{ status: false, message: "Insufficient credits." }`. */
  useEffect(() => {
    if (!businessId || !templateData) return;
    const apiFailed =
      templateData.success === false ||
      templateData.status === false ||
      templateData.code === "ERR";
    if (apiFailed && isInsufficientCreditsPayload(templateData)) {
      navigate("/no-credits", {
        replace: true,
        state: {
          businessName: pickBusinessNameFromPayload(templateData) ?? undefined,
        },
      });
    }
  }, [businessId, templateData, navigate]);

  const [generateReview] = useGenerateReviewMutation();

  const businessName = templateData?.businessName;
  const googleReviewUrlPrefix = useMemo(
    () => pickConfigValueByKey(configResponse?.data, GOOGLE_BUSINESS_CONFIG_KEY),
    [configResponse]
  );
  const googleBusinessLink = useMemo(() => {
    const raw = pickRawGoogleBusinessLink(templateData);
    if (!raw) return undefined;
    if (isProbablyFullGoogleBusinessLink(raw)) {
      return normalizeGoogleBusinessUrl(raw);
    }
    return normalizeGoogleBusinessUrl(
      mergeGoogleBusinessLinkPrefixWithPlaceId(googleReviewUrlPrefix, raw)
    );
  }, [templateData, googleReviewUrlPrefix]);
  const ownerFieldLabel =
    templateData?.ownerLabel?.trim() || "Owner";
  const languages = useMemo((): ReviewTemplateLanguage[] => {
    const raw = templateData?.languages;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) =>
      typeof item === "string"
        ? { _id: item, languageName: item, languageDescription: item }
        : {
            _id: item._id,
            languageName: item.languageName,
            languageDescription: item.languageDescription,
          }
    );
  }, [templateData?.languages]);
  const products = templateData?.products ?? [];
  const services = templateData?.services ?? [];
  const tags = useMemo(() => {
    const raw = templateData?.tags;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean);
  }, [templateData?.tags]);
  const owners = useMemo((): ReviewTemplateOwner[] => {
    const raw = templateData?.owner;
    let list: ReviewTemplateOwner[] = [];
    if (!raw) list = [];
    else if (Array.isArray(raw)) list = raw as ReviewTemplateOwner[];
    else list = [raw as ReviewTemplateOwner];
    return list.filter((o) => o.isActive !== false);
  }, [templateData?.owner]);
  const staffMembers = useMemo((): ReviewTemplateStaffMember[] => {
    const raw = templateData?.staff;
    let list: ReviewTemplateStaffMember[] = [];
    if (!raw) list = [];
    else if (Array.isArray(raw)) list = raw as ReviewTemplateStaffMember[];
    else list = [raw as ReviewTemplateStaffMember];
    return list.filter((s) => s.isActive !== false);
  }, [templateData?.staff]);

  const showLanguageSelect = languages.length > 1;
  const showProductSelect = products.length > 0;
  const showServiceSelect = services.length > 0;
  const showOwnerSelect = owners.length > 1;
  const showStaffSelect = staffMembers.length > 0;
  const showTagSelect = tags.length > 0;

  // Used for backend validation: language != English requires `writerGender`.
  const effectiveLanguage =
    languages.length === 1 && languages[0] ? getLanguagePayloadValue(languages[0]) : language || "";
  const showWriterGenderSelect = Boolean(effectiveLanguage) && !isEnglishLanguage(effectiveLanguage);
  const writerGenderRequired = showWriterGenderSelect && !writerGender;

  // Default only for owner + language: single option auto-applies; other fields need an explicit user selection.
  useEffect(() => {
    if (owners.length === 1) {
      const id = String(owners[0]._id);
      setOwnerId((prev) => prev || id);
    }
  }, [owners]);

  useEffect(() => {
    if (languages.length === 1) {
      setLanguage(getLanguagePayloadValue(languages[0]));
    }
  }, [languages]);

  useEffect(() => {
    if (tags.length === 1) {
      setSelectedTag((prev) => prev || tags[0]);
    }
  }, [tags]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopiedReview(true);
      toast.success("Review copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const [businessIdInput, setBusinessIdInput] = useState("");

  const handleBusinessIdSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = businessIdInput.trim();
    if (trimmed) {
      navigate(`/${encodeURIComponent(trimmed)}`, { replace: false });
    }
  };

  const handleGenerateReview = async () => {
    if (!businessId) return;
    setHasTriedGenerate(true);
    // Rating is required; keep backend calls consistent with UI state.
    if (rating <= 0) {
      toast.error("Please select a rating first.");
      return;
    }

    // Language & owner: only auto-filled when there is exactly one option; if multiple, user must select or we send "".

    const languageBody =
      languages.length === 1 && languages[0]
        ? getLanguagePayloadValue(languages[0])
        : language || "";

    const writerGenderNeedsOnBackend =
      Boolean(languageBody) && !isEnglishLanguage(languageBody);
    if (writerGenderNeedsOnBackend && !writerGender.trim()) {
      toast.error("Please select your gender.");
      return;
    }

    setHasCopiedReview(false);
    setIsGeneratingUi(true);
    const startedAt = Date.now();

    const productBody = productId || "";
    const serviceBody = serviceId || "";
    const ratingBody = rating;
    const tagBody = selectedTag.trim();

    const pickedOwner =
      ownerId ? owners.find((o) => String(o._id) === String(ownerId)) : undefined;
    const ownerName =
      owners.length === 1 && owners[0]
        ? (pickedOwner?.name ?? owners[0].name)?.trim() ?? ""
        : owners.length > 1 && pickedOwner
          ? pickedOwner.name?.trim() ?? ""
          : "";

    const ownerGender =
      ownerName && pickedOwner
        ? pickedOwner.gender
        : ownerName && owners.length === 1 && owners[0]
          ? owners[0].gender
          : undefined;

    const staffById = staffId
      ? staffMembers.find((s) => String(s._id) === String(staffId))
      : undefined;
    const staffName = staffById?.name?.trim() ?? "";

    try {
      const res = await generateReview({
        templateId: businessId,
        body: {
          language: languageBody,
          product: productBody,
          service: serviceBody,
          rating: ratingBody,
          ownerName,
          ownerGender,
          writerGender: writerGenderNeedsOnBackend ? writerGender.trim() : undefined,
          staffName,
          tag: tagBody || undefined,
        },
      }).unwrap();
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_GENERATION_DISPLAY_MS - elapsed);
      if (remaining > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, remaining));
      }
      if (!isMountedRef.current) return;

      const apiFailed =
        res.success === false ||
        res.status === false ||
        res.code === "ERR";

      if (apiFailed) {
        setGeneratedReviews([]);
        setHasGenerated(true);
        if (isInsufficientCreditsPayload(res)) {
          navigate("/no-credits", {
            replace: true,
            state: {
              businessName:
                pickBusinessNameFromPayload(res) ?? businessName?.trim() ?? undefined,
            },
          });
          return;
        }
        const errText =
          [res.message, res.issue].find((s) => typeof s === "string" && s.trim()) ||
          "Could not generate reviews. Please try again.";
        toast.error(errText.trim());
        return;
      }

      setGeneratedReviews(normalizeGeneratedReviews(res.reviews));
      setHasGenerated(true);
    } catch (err) {
      setGeneratedReviews([]);
      setHasGenerated(true);
      if (isInsufficientCreditsError(err)) {
        navigate("/no-credits", {
          replace: true,
          state: {
            businessName:
              pickBusinessNameFromPayload(getErrorPayloadData(err)) ??
              businessName?.trim() ??
              undefined,
          },
        });
        return;
      }
      toast.error(extractBackendErrorMessage(err));
    } finally {
      if (isMountedRef.current) setIsGeneratingUi(false);
    }
  };

  if (!businessId) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-secondary/5" />
          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
            <div className="relative overflow-hidden px-8 py-12 text-center sm:px-12 sm:py-16">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-secondary/10" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Review Generator
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-slate-600">
                  Enter your business ID to open the review generator.
                </p>
                <form onSubmit={handleBusinessIdSubmit} className="mt-8 text-left">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 2, sm: 1 },
                      alignItems: { sm: "flex-start" },
                    }}
                  >
                    <TextField
                      id="business-id"
                      label="Business ID"
                      value={businessIdInput}
                      onChange={(e) => setBusinessIdInput(e.target.value)}
                      placeholder="your-business-id"
                      autoFocus
                      fullWidth
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={{
                        flex: { sm: 1 },
                        minWidth: 0,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          bgcolor: "white",
                        },
                        "& .MuiInputLabel-root": {
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgb(100 116 139)",
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!businessIdInput.trim()}
                      sx={{
                        width: { xs: "100%", sm: "auto" },
                        flexShrink: 0,
                        borderRadius: "12px",
                        px: 2.5,
                        py: 1.25,
                        fontWeight: 600,
                        textTransform: "none",
                        bgcolor: "var(--color-primary)",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                        "&:hover": { bgcolor: "var(--color-primary)", filter: "brightness(1.08)" },
                        "&.Mui-disabled": { bgcolor: "var(--color-primary)", color: "white", opacity: 0.5 },
                      }}
                    >
                      Continue
                    </Button>
                  </Box>
                </form>
                <p className="mt-6 text-sm text-slate-500">
                  You can find your business ID in your dashboard or shared link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReviewGeneratorView
      businessName={businessName}
      reviews={generatedReviews}
      googleBusinessLink={googleBusinessLink}
      isTemplateLoading={isTemplateLoading}
      templateError={!!templateError}
      isGenerating={isGeneratingUi}
      hasGenerated={hasGenerated}
      hasCopiedReview={hasCopiedReview}
      languages={languages}
      products={products}
      services={services}
      tags={tags}
      owners={owners}
      staffMembers={staffMembers}
      showLanguageSelect={showLanguageSelect}
      showProductSelect={showProductSelect}
      showServiceSelect={showServiceSelect}
      showOwnerSelect={showOwnerSelect}
      showStaffSelect={showStaffSelect}
      showTagSelect={showTagSelect}
      showWriterGenderSelect={showWriterGenderSelect}
      ownerFieldLabel={ownerFieldLabel}
      language={language}
      productId={productId}
      serviceId={serviceId}
      rating={rating}
      showRatingError={hasTriedGenerate && rating <= 0}
      showWriterGenderError={writerGenderRequired}
      writerGender={writerGender}
      ownerId={ownerId}
      staffId={staffId}
      selectedTag={selectedTag}
      onLanguageChange={(next) => {
        setLanguage(next);
        if (next && isEnglishLanguage(next)) setWriterGender("");
      }}
      onProductChange={setProductId}
      onServiceChange={setServiceId}
      onRatingChange={(next) => {
        setRating(next);
        if (next > 0) setHasTriedGenerate(false);
      }}
      onWriterGenderChange={(next) => {
        setWriterGender(next);
        if (next.trim()) setHasTriedGenerate(false);
      }}
      onOwnerChange={setOwnerId}
      onStaffChange={setStaffId}
      onTagChange={setSelectedTag}
      onGenerateReview={handleGenerateReview}
      onCopy={handleCopy}
    />
  );
};

export default ReviewGeneratorPage;
