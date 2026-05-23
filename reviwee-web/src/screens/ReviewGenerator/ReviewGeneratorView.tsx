import { useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import PoweredBy from "../../components/atoms/PoweredBy/PoweredBy";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { HiOutlineExternalLink, HiStar } from "react-icons/hi";
import type {
  NormalizedGeneratedReview,
  ReviewTemplateLanguage,
  ReviewTemplateOwner,
  ReviewTemplateProduct,
  ReviewTemplateServiceItem,
  ReviewTemplateStaffMember,
} from "../../services/ReviewTemplateService";

export type ReviewGeneratorViewProps = {
  businessName?: string;
  reviews: NormalizedGeneratedReview[];
  googleBusinessLink?: string;
  isTemplateLoading: boolean;
  templateError: boolean;
  isGenerating: boolean;
  hasGenerated: boolean;
  hasCopiedReview: boolean;
  languages: ReviewTemplateLanguage[];
  products: ReviewTemplateProduct[];
  services: ReviewTemplateServiceItem[];
  tags: string[];
  owners: ReviewTemplateOwner[];
  staffMembers: ReviewTemplateStaffMember[];
  showLanguageSelect: boolean;
  showProductSelect: boolean;
  showServiceSelect: boolean;
  showOwnerSelect: boolean;
  showStaffSelect: boolean;
  showTagSelect: boolean;
  showWriterGenderSelect: boolean;
  ownerFieldLabel: string;
  language: string;
  productId: string;
  serviceId: string;
  rating: number;
  showRatingError: boolean;
  showWriterGenderError: boolean;
  writerGender: string;
  ownerId: string;
  staffId: string;
  selectedTag: string;
  onLanguageChange: (value: string) => void;
  onProductChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onWriterGenderChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onStaffChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onGenerateReview: () => void;
  onCopy: (text: string) => void;
};

const selectSx = {
  borderRadius: "12px",
  bgcolor: "white",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(226 232 240)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(203 213 225)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--color-secondary)",
    borderWidth: "2px",
  },
} as const;

const primaryButtonSx = {
  borderRadius: "12px",
  fontWeight: 600,
  textTransform: "none" as const,
  bgcolor: "var(--color-primary)",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
  "&:hover": { bgcolor: "var(--color-primary)", filter: "brightness(1.08)" },
  "&.Mui-disabled": { bgcolor: "var(--color-primary)", color: "white", opacity: 0.5 },
};

const typingSubjects = ["service", "team", "experience", "staff", "quality", "support"] as const;
const typingMoods = ["great", "friendly", "smooth", "professional", "quick", "amazing"] as const;
const typingActions = ["today", "during my visit", "this week", "for my order", "at this place"] as const;

function createRandomTypingLine() {
  const subject = typingSubjects[Math.floor(Math.random() * typingSubjects.length)];
  const mood = typingMoods[Math.floor(Math.random() * typingMoods.length)];
  const action = typingActions[Math.floor(Math.random() * typingActions.length)];
  return `AI draft: The ${subject} was ${mood} ${action}.`;
}

const ReviewGeneratorView = ({
  businessName,
  reviews,
  googleBusinessLink,
  isTemplateLoading,
  templateError,
  isGenerating,
  hasGenerated,
  hasCopiedReview,
  languages,
  products,
  services,
  tags,
  owners,
  // staffMembers,
  showLanguageSelect,
  showProductSelect,
  showServiceSelect,
  showOwnerSelect,
  showStaffSelect,
  showTagSelect,
  showWriterGenderSelect,
  ownerFieldLabel,
  language,
  productId,
  serviceId,
  rating,
  showRatingError,
  showWriterGenderError,
  writerGender,
  ownerId,
  // staffId,
  selectedTag,
  onLanguageChange,
  onProductChange,
  onServiceChange,
  onRatingChange,
  onWriterGenderChange,
  onOwnerChange,
  // onStaffChange,
  onTagChange,
  onGenerateReview,
  onCopy,
}: ReviewGeneratorViewProps) => {
  const isBusy = isTemplateLoading || isGenerating;
  const isRatingSelected = rating > 0;
  const [typingPreview, setTypingPreview] = useState("");
  const [typingCursorVisible, setTypingCursorVisible] = useState(true);
  /** After copy, always show the bar; prefer the template’s Google link, else a search fallback. */
  const showGoogleCta = hasCopiedReview;
  const googleOpenUrl = googleBusinessLink?.trim() || "https://www.google.com/maps";
  const hasDirectGoogleLink = Boolean(googleBusinessLink?.trim());
  const hasAnyFilterSelect =
    showLanguageSelect ||
    showProductSelect ||
    showServiceSelect ||
    showOwnerSelect ||
    showStaffSelect ||
    showTagSelect ||
    showWriterGenderSelect;
  const loadingTypingText = useMemo(
    () => typingPreview || "AI draft: Starting to write your review...",
    [typingPreview]
  );

  useEffect(() => {
    if (!isGenerating) {
      // Keep typing UI cleared when generation stops.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTypingPreview("");
      return;
    }

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let currentLine = createRandomTypingLine();
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
      if (!isActive) return;

      if (isDeleting) {
        charIndex = Math.max(0, charIndex - 1);
        setTypingPreview(currentLine.slice(0, charIndex));

        if (charIndex === 0) {
          isDeleting = false;
          currentLine = createRandomTypingLine();
          timer = setTimeout(tick, 140);
          return;
        }
        timer = setTimeout(tick, 18 + Math.floor(Math.random() * 28));
        return;
      }

      charIndex = Math.min(currentLine.length, charIndex + 1);
      setTypingPreview(currentLine.slice(0, charIndex));

      if (charIndex === currentLine.length) {
        isDeleting = true;
        timer = setTimeout(tick, 520);
        return;
      }

      timer = setTimeout(tick, 30 + Math.floor(Math.random() * 35));
    };

    tick();

    return () => {
      isActive = false;
      if (timer) clearTimeout(timer);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTypingCursorVisible(true);
      return;
    }

    const cursorTimer = setInterval(() => {
      setTypingCursorVisible((prev) => !prev);
    }, 450);

    return () => clearInterval(cursorTimer);
  }, [isGenerating]);

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-secondary/5" />
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-transparent via-transparent to-primary/5" />
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-8">
        <div
          className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain ${
            showGoogleCta ? "pb-[calc(8.75rem+env(safe-area-inset-bottom,0px))]" : ""
          }`}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-sm sm:rounded-3xl">
          {/* Header */}
          <div className="relative overflow-hidden border-b border-slate-100 px-5 py-6 sm:px-8 sm:py-8">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-secondary/10" />
            <div className="relative">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {businessName || "Your business"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {hasAnyFilterSelect ? (
                  <>
                    When a list has more than one option, a field appears so you can choose.
                    Then tap{" "}
                    <span className="font-medium text-slate-600">Generate review</span>.
                  </>
                ) : (
                  <>
                    Tap{" "}
                    <span className="font-medium text-slate-600">Generate review</span>{" "}
                    to create a review from your template.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4">
              {showLanguageSelect && (
                <FormControl fullWidth size="small" disabled={isTemplateLoading}>
                  <InputLabel id="rg-language-label">Language</InputLabel>
                  <Select
                    labelId="rg-language-label"
                    id="rg-language"
                    label="Language"
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="">
                      <em>Not selected (sends empty)</em>
                    </MenuItem>
                    {languages.map((lang) => (
                      <MenuItem
                        key={lang._id}
                        value={lang.languageDescription?.trim() || lang.languageName}
                      >
                        {lang.languageName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {showWriterGenderSelect && (
                <FormControl fullWidth size="small" disabled={isBusy}>
                  <InputLabel id="rg-writer-gender-label">Your gender</InputLabel>
                  <Select
                    labelId="rg-writer-gender-label"
                    id="rg-writer-gender"
                    label="Your gender"
                    value={writerGender}
                    onChange={(e) => onWriterGenderChange(e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="">
                      <em>Not selected</em>
                    </MenuItem>
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                  {showWriterGenderError && !writerGender && (
                    <p className="mt-2 text-xs text-red-600">
                      Your gender is required for the selected language.
                    </p>
                  )}
                </FormControl>
              )}

              {(showOwnerSelect || showStaffSelect) && (
                <div
                  className={
                    showOwnerSelect && showStaffSelect
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
                      : "grid grid-cols-1 gap-4"
                  }
                >
                  {showOwnerSelect && (
                    <FormControl fullWidth size="small" disabled={isTemplateLoading}>
                      <InputLabel id="rg-owner-label">{ownerFieldLabel}</InputLabel>
                      <Select
                        labelId="rg-owner-label"
                        id="rg-owner"
                        label={ownerFieldLabel}
                        value={ownerId}
                        onChange={(e) => onOwnerChange(e.target.value)}
                        sx={selectSx}
                      >
                        <MenuItem value="">
                          <em>Not selected</em>
                        </MenuItem>
                        {owners.map((o) => (
                          <MenuItem key={String(o._id)} value={String(o._id)}>
                            {o.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {/* {showStaffSelect && (
                    <FormControl fullWidth size="small" disabled={isTemplateLoading}>
                      <InputLabel id="rg-staff-label">Staff</InputLabel>
                      <Select
                        labelId="rg-staff-label"
                        id="rg-staff"
                        label="Staff"
                        value={staffId}
                        onChange={(e) => onStaffChange(e.target.value)}
                        sx={selectSx}
                      >
                        <MenuItem value="">
                          <em>Not selected</em>
                        </MenuItem>
                        {staffMembers.map((s) => (
                          <MenuItem key={String(s._id)} value={String(s._id)}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )} */}
                </div>
              )}

              {(showProductSelect || showServiceSelect) && (
                <div
                  className={
                    showProductSelect && showServiceSelect
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
                      : "grid grid-cols-1 gap-4"
                  }
                >
                  {showProductSelect && (
                    <FormControl fullWidth size="small" disabled={isTemplateLoading}>
                      <InputLabel id="rg-product-label">Product</InputLabel>
                      <Select
                        labelId="rg-product-label"
                        id="rg-product"
                        label="Product"
                        value={productId}
                        onChange={(e) => onProductChange(e.target.value)}
                        sx={selectSx}
                      >
                        <MenuItem value="">
                          <em>Not selected</em>
                        </MenuItem>
                        {products.map((p) => (
                          <MenuItem key={p._id} value={p.productName}>
                            {p.productName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {showServiceSelect && (
                    <FormControl fullWidth size="small" disabled={isTemplateLoading}>
                      <InputLabel id="rg-service-label">Service taken</InputLabel>
                      <Select
                        labelId="rg-service-label"
                        id="rg-service"
                        label="Service taken"
                        value={serviceId}
                        onChange={(e) => onServiceChange(e.target.value)}
                        sx={selectSx}
                      >
                        <MenuItem value="">
                          <em>Not selected</em>
                        </MenuItem>
                        {services.map((s) => (
                          <MenuItem key={s._id} value={s.serviceName}>
                            {s.serviceName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </div>
              )}

              {showTagSelect && (
                <FormControl fullWidth size="small" disabled={isTemplateLoading}>
                  <InputLabel id="rg-tag-label">Topic tag</InputLabel>
                  <Select
                    labelId="rg-tag-label"
                    id="rg-tag"
                    label="Topic tag"
                    value={selectedTag}
                    onChange={(e) => onTagChange(e.target.value)}
                    sx={selectSx}
                  >
                    <MenuItem value="">
                      <em>Not selected</em>
                    </MenuItem>
                    {tags.map((t, i) => (
                      <MenuItem key={`${t}-${i}`} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Rating <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""} selected` : "Not selected"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        disabled={isBusy}
                        aria-label={`Select ${star} star${star > 1 ? "s" : ""}`}
                        className="rounded-md p-1 transition hover:scale-105 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <HiStar
                          className={`h-6 w-6 ${isSelected ? "text-amber-400" : "text-slate-300"}`}
                        />
                      </button>
                    );
                  })}
                </div>
                {showRatingError && !isRatingSelected && (
                  <p className="mt-2 text-xs text-red-600">Rating is required.</p>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="contained"
              onClick={onGenerateReview}
              disabled={isBusy || (showWriterGenderSelect && !writerGender.trim())}
              sx={{
                ...primaryButtonSx,
                mt: 3,
                height: { xs: 48, sm: 44 },
                width: { xs: "100%", sm: "auto" },
                minWidth: { sm: 200 },
                px: { sm: 4 },
              }}
            >
              {isGenerating
                ? "AI is writing…"
                : hasGenerated
                  ? "Regenerate review"
                  : "Generate review"}
            </Button>
          </div>

          {/* Reviews */}
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h2 className="text-lg font-semibold text-slate-800">Generated reviews</h2>
              {!isBusy && hasGenerated && !templateError && reviews.length > 0 && (
                <span className="inline-flex w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            <div className="mt-5">
              {isTemplateLoading ? (
                <div className="space-y-4">
                  <p className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    Loading template…
                  </p>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="h-4 w-4 rounded bg-slate-200" />
                          ))}
                        </div>
                        <div className="h-3 w-full rounded bg-slate-200" />
                        <div className="h-3 w-11/12 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : templateError ? (
                <div className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50/60 p-5 sm:items-center sm:p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <span className="text-xl leading-none">!</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-red-800">Could not load template</p>
                    <p className="mt-1 text-sm text-red-600/90">
                      Check your business ID and try again.
                    </p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="space-y-4">
                  <p className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-primary">
                    AI is crafting your reviews — this may take a moment…
                  </p>
                  <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-700 sm:text-sm">
                    {loadingTypingText}
                    <span
                      className={`inline-block w-3 text-primary transition-opacity ${
                        typingCursorVisible ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden
                    >
                      |
                    </span>
                  </p>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="h-4 w-4 rounded bg-slate-200" />
                          ))}
                        </div>
                        <div className="h-3 w-full rounded bg-slate-200" />
                        <div className="h-3 w-11/12 rounded bg-slate-200" />
                        <div className="h-3 w-2/3 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasGenerated ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-8 text-center sm:p-10">
                  <HiStar className="mx-auto h-11 w-11 text-slate-300 sm:h-12 sm:w-12" />
                  <p className="mt-3 font-medium text-slate-600">No reviews yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                    Adjust the options above if you like, then tap{" "}
                    <span className="font-medium text-slate-600">Generate review</span>.
                  </p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-10 text-center sm:p-12">
                  <HiStar className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-600">No reviews returned</p>
                  <p className="mt-1 text-sm text-slate-500">Try generating again or change your selections.</p>
                </div>
              ) : (
                <ul className="space-y-3 sm:space-y-4">
                  {reviews.map((review, index) => (
                    <li key={index} className="list-none">
                      <button
                        type="button"
                        onClick={() => onCopy(review.text)}
                        className="w-full cursor-pointer rounded-2xl border border-slate-100 bg-slate-50/40 p-4 text-left transition hover:border-slate-200 hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:p-5"
                        aria-label="Copy review to clipboard"
                      >
                        <div className="mb-2 flex gap-0.5 text-secondary">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <HiStar
                              key={star}
                              className={`h-4 w-4 shrink-0 ${
                                star <= (review.rating ?? 5)
                                  ? "fill-current"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700">{review.text}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        </div>

        {!showGoogleCta && <PoweredBy />}
      </div>

      {/* Fixed bar: hint + button (above) + powered-by footer flush to screen bottom */}
      {showGoogleCta && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 shadow-[0_-10px_40px_rgba(15,23,42,0.08)] backdrop-blur-md supports-backdrop-filter:bg-white/90">
          <div className="mx-auto max-w-2xl px-3 pt-2 sm:px-4">
            <p className="mb-1 text-center text-xs text-slate-500 sm:text-left">
              {hasDirectGoogleLink
                ? "Review copied — open Google to paste it."
                : "Review copied — open Google to find your business and paste it."}
            </p>
            <Button
              type="button"
              variant="contained"
              fullWidth
              onClick={() =>
                window.open(googleOpenUrl, "_blank", "noopener,noreferrer")
              }
              startIcon={<HiOutlineExternalLink className="h-5 w-5 shrink-0" />}
              sx={{
                ...primaryButtonSx,
                height: 48,
                mb: 0,
                "&:active": { transform: "scale(0.99)" },
              }}
            >
              {hasDirectGoogleLink ? "Open Google Reviews" : "Open Google"}
            </Button>
            <PoweredBy
              variant="stickyBar"
              className="pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewGeneratorView;
