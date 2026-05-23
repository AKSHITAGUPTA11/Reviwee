import { useMemo, useState } from "react";
import type { FormikProps } from "formik";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { MdClose } from "react-icons/md";
import type {
  BusinessProfileFormValues,
  OwnerMemberType,
  StaffMemberType,
} from "../../../models/BusinessProfile.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMLoadingButton from "../../../components/UI/atoms/ATMLoadingButton/ATMLoadingButton";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMSelect from "../../../components/UI/atoms/formFields/ATMSelect/ATMSelect";
import useCategory from "../../../hooks/useCategoryOptions";
import useSubcategoryOptions from "../../../hooks/useSubcategoryOptions";
import usecreditScore from "../../../hooks/useCreditScoreOptions";
import ATMTagsInput from "src/components/UI/atoms/formFields/ATMTagsInput/ATMTagsInput";
import ATMTextArea from "src/components/UI/atoms/formFields/ATMTextArea/ATMTextArea";
import {
  countCharacters,
  countWords,
} from "../utils/businessProfileFormValidation";
import { useLazyGetBusinessDescriptionSuggestionsByPlaceIdQuery } from "src/services/BusinessProfileService";

type Props = {
  formikProps: FormikProps<BusinessProfileFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
  /** Inline layout for view page edit (no dialog chrome, no fixed 90vh). */
  embedded?: boolean;
  /** Onboarding usage: hide Cancel so no back/close UI shows. */
  hideCancelButton?: boolean;
  /** Richer layout: onboarding (no cancel) or full app page (add/edit routes). */
  embeddedVariant?: "default" | "onboarding" | "page";
};

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const PLACE_ID_HELP_VIDEO_URL =
  "https://www.youtube.com/embed?listType=search&list=how%20to%20find%20google%20place%20id";
const PLACE_ID_FINDER_URL =
  "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder";
const toText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const extractDescriptionSuggestions = (raw: unknown): string[] => {
  if (!raw || typeof raw !== "object") return [];
  const root = raw as Record<string, unknown>;
  const maybeArrays: unknown[] = [
    root.data,
    root.descriptions,
    root.descriptionSuggestions,
    root.suggestions,
    (root.data as Record<string, unknown> | undefined)?.descriptions,
    (root.data as Record<string, unknown> | undefined)?.suggestions,
  ];

  const collected = maybeArrays.find((item) => Array.isArray(item));
  if (!Array.isArray(collected)) return [];

  return collected
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        return toText(row.description || row.text || row.value || row.label);
      }
      return "";
    })
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
};

const extractTagSuggestions = (raw: unknown): string[] => {
  if (!raw || typeof raw !== "object") return [];
  const root = raw as Record<string, unknown>;
  const maybeArrays: unknown[] = [
    root.tags,
    (root.data as Record<string, unknown> | undefined)?.tags,
  ];
  const collected = maybeArrays.find((item) => Array.isArray(item));
  if (!Array.isArray(collected)) return [];

  return collected
    .map((item) => toText(item))
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
};

const BusinessProfileForm = ({
  formikProps,
  onClose,
  formType,
  embedded = false,
  hideCancelButton = false,
  embeddedVariant = "default",
}: Props) => {
  const isOnboardingEmbedded = embedded && embeddedVariant === "onboarding";
  const isPageEmbedded = embedded && embeddedVariant === "page";
  const isRichEmbedded = isOnboardingEmbedded || isPageEmbedded;
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;
  const [isPlaceIdHelpOpen, setIsPlaceIdHelpOpen] = useState(false);
  const [placeIdSuggestions, setPlaceIdSuggestions] = useState<string[]>([]);
  const [placeIdTagSuggestions, setPlaceIdTagSuggestions] = useState<string[]>([]);
  const [placeIdFeedback, setPlaceIdFeedback] = useState("");
  const [fetchDescriptionSuggestions, { isFetching: isPlaceIdDescriptionLoading }] =
    useLazyGetBusinessDescriptionSuggestionsByPlaceIdQuery();

  const { category, isDataLoading: isCategoryLoading } = useCategory();
  const { subcategory, isDataLoading: isSubcategoryLoading } =
    useSubcategoryOptions(values.categoryId);
  const { credit, isDataLoading: iscreditLoading } = usecreditScore();
  const creditOptions = credit.map(
    (c: {
      _id?: string;
      credit?: number;
      minWords?: number;
      maxWords?: number;
    }) => ({
      value: c._id ?? "",
      // Example: "200 - 250 (5 credits)"
      label: (() => {
        const min = c.minWords ?? "";
        const max = c.maxWords ?? "";
        const creditNum = c.credit;
        const creditPart =
          typeof creditNum === "number"
            ? `${creditNum} ${creditNum === 1 ? "credit use" : "credits use"}`
            : "";
        return `${min} - ${max}${creditPart ? ` (${creditPart})` : ""}`;
      })(),
    }),
  );

  const categoryOptions = category.map(
    (c: { _id?: string; categoryName?: string }) => ({
      value: c._id ?? "",
      label: c.categoryName ?? "",
    }),
  );

  const subCategoryOptions = subcategory.map(
    (s: { _id?: string; subCategoryName?: string }) => ({
      value: s._id ?? "",
      label: s.subCategoryName ?? "",
    }),
  );

  const categoryValue = values.categoryId
    ? (categoryOptions.find((c) => c.value === values.categoryId) ?? null)
    : null;

  const subCategoryValue = values.subCategoryId
    ? (subCategoryOptions.find((s) => s.value === values.subCategoryId) ?? null)
    : null;

  const creditConfigIdId =
    typeof values.creditConfigId === "string"
      ? values.creditConfigId
      : (values.creditConfigId as { value?: string } | null)?.value ?? "";
  const creditConfigIdValue = creditConfigIdId
    ? (creditOptions.find((o) => o.value === creditConfigIdId) ?? '')
    : null;

  const addOwner = () => {
    setFieldValue("owner", [
      ...values.owner,
      {
        name: "",
        gender: "MALE" as const,
        aliases: [],
        description: "",
      },
    ]);
  };

  const removeOwner = (index: number) => {
    setFieldValue(
      "owner",
      values.owner.filter((_, i) => i !== index),
    );
  };

  const updateOwner = (
    index: number,
    field: keyof Pick<OwnerMemberType, "name" | "gender" | "description">,
    value: string,
  ) => {
    const next = [...values.owner];
    next[index] = { ...next[index], [field]: value };
    setFieldValue("owner", next);
  };

  const setOwnerAliases = (index: number, newTags: string[]) => {
    const next = [...values.owner];
    next[index] = {
      ...next[index],
      aliases: newTags.map((t) => String(t).trim()).filter(Boolean),
    };
    setFieldValue("owner", next);
  };

  const addStaff = () => {
    setFieldValue("staff", [
      ...values.staff,
      { name: "", gender: "MALE" as const, description: "" },
    ]);
  };

  const removeStaff = (index: number) => {
    setFieldValue(
      "staff",
      values.staff.filter((_, i) => i !== index),
    );
  };

  const updateStaff = (
    index: number,
    field: keyof Pick<StaffMemberType, "name" | "gender" | "description">,
    value: string,
  ) => {
    const next = [...values.staff];
    next[index] = { ...next[index], [field]: value };
    setFieldValue("staff", next);
  };

  const basicsGridClass = isRichEmbedded
    ? "grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:grid-cols-2 sm:p-6"
    : "grid gap-4 md:grid-cols-2";

  const blockSectionClass = isRichEmbedded
    ? "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
    : "mt-6 rounded-xl border border-slate-200 p-4";

  const blockHeadingClass = isRichEmbedded
    ? "text-base font-bold text-slate-900"
    : "text-sm font-semibold text-slate-800";

  const secondaryButtonClass = isRichEmbedded
    ? "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
    : "rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100";

  const normalizedPlaceId = useMemo(
    () => toText(values.googleBusinessLink),
    [values.googleBusinessLink],
  );

  const normalizedBusinessDisplayName = useMemo(
    () => toText(values.businessDisplayName),
    [values.businessDisplayName],
  );

  const normalizedSubCategoryName = useMemo(() => {
    const sel = subCategoryOptions.find((s) => s.value === values.subCategoryId);
    return toText(sel?.label ?? "");
  }, [subCategoryOptions, values.subCategoryId]);

  const placeIdFetchReady =
    Boolean(normalizedPlaceId) &&
    Boolean(normalizedBusinessDisplayName) &&
    Boolean(normalizedSubCategoryName);

  const handleGenerateDescription = async () => {
    if (!placeIdFetchReady) {
      setPlaceIdSuggestions([]);
      setPlaceIdTagSuggestions([]);
      setPlaceIdFeedback(
        "Google Place ID, business display name aur subcategory bharne ke baad generate karein.",
      );
      return;
    }
    try {
      setPlaceIdFeedback("");
      const response = await fetchDescriptionSuggestions({
        placeId: normalizedPlaceId,
        businessDisplayName: normalizedBusinessDisplayName,
        subCategoryName: normalizedSubCategoryName,
      }).unwrap();
      const suggestions = extractDescriptionSuggestions(response);
      const tags = extractTagSuggestions(response);
      setPlaceIdSuggestions(suggestions);
      setPlaceIdTagSuggestions(tags);
      if (tags.length > 0) {
        setFieldValue("tags", tags);
      }
      if (suggestions.length === 0 && tags.length === 0) {
        setPlaceIdFeedback("No AI descriptions/tags found for this Place ID.");
      }
    } catch (error) {
      setPlaceIdSuggestions([]);
      setPlaceIdTagSuggestions([]);
      setPlaceIdFeedback("Could not fetch descriptions/tags. You can still type manually.");
      console.error("Place ID description fetch failed", error);
    }
  };

  const formBody = (
    <>
      <div className={basicsGridClass}>
        <ATMTextField
          name="businessDisplayName"
          label="Business Display Name"
          required
          value={values.businessDisplayName}
          onChange={(e) => setFieldValue("businessDisplayName", e.target.value)}
        />

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor="googleBusinessLink"
              className="block text-sm font-medium text-slate-700"
            >
              Google Place ID <span className="text-red-500">*</span>
            </label>
            <Tooltip title="How to get Google Place ID">
              <button
                type="button"
                onClick={() => setIsPlaceIdHelpOpen(true)}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                aria-label="How to get Google Place ID"
              >
                ?
              </button>
            </Tooltip>
          </div>
          <ATMTextField
            name="googleBusinessLink"
            id="googleBusinessLink"
            value={values.googleBusinessLink}
            onChange={(e) => {
              const nextValue = e.target.value;
              setFieldValue("googleBusinessLink", nextValue);
              setPlaceIdFeedback("");
            }}
          />
          <a
            href={PLACE_ID_FINDER_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Get Google Place ID from Google (opens in new tab)
          </a>
        </div>

        {formType === "EDIT" && (
          <ATMSelect
            options={creditOptions}
            isLoading={iscreditLoading}
            name="creditConfigId"
            label="Reviews length"
            value={creditConfigIdValue}
            onChange={(opt) =>
              setFieldValue("creditConfigId", opt?.value ?? "")
            }
          />
        )}

        <ATMSelect
          name="categoryId"
          label="Category"
          required
          options={categoryOptions}
          value={categoryValue}
          onChange={(opt) => {
            setFieldValue("categoryId", opt?.value ?? "");
            setFieldValue("subCategoryId", "");
          }}
          placeholder="Select category"
          isLoading={isCategoryLoading}
        />

        <ATMSelect
          name="subCategoryId"
          label="Subcategory"
          required
          options={subCategoryOptions}
          value={subCategoryValue}
          onChange={(opt) => setFieldValue("subCategoryId", opt?.value ?? "")}
          placeholder="Select subcategory"
          disabled={!values.categoryId}
          isLoading={isSubcategoryLoading}
        />

        <div className="md:col-span-2">
          <ATMTagsInput
            label="Business aliases"
            tags={values.businessAliases}
            setTags={(newTags) =>
              setFieldValue(
                "businessAliases",
                newTags.map((t) => String(t).trim()).filter(Boolean),
              )
            }
            placeholder="Type alias, press Enter"
            addOnSpace={false}
          />
        </div>

        <div className="md:col-span-2">
          <ATMTextArea
            name="businessDescription"
            label="Business description"
            required
            minRows={8}
            value={values.businessDescription}
            onChange={(v) => setFieldValue("businessDescription", v)}
            placeholder="Describe the business (200–500 characters)"
          />
          <p className="mt-1 text-xs text-slate-500">
            {countCharacters(values.businessDescription)} characters · required:
            200–500 characters
          </p>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs font-semibold text-slate-700">
              AI-generated descriptions
            </p>
            {!placeIdFetchReady ? (
              <p className="mt-1 text-[11px] text-slate-500">
                Suggestions tab load honge jab aap teeno bhar denge: Google Place ID, business
                display name, aur subcategory (dropdown se).
              </p>
            ) : (
              <>
                <p className="mt-1 text-[11px] text-slate-500">
                  Koi suggestion select karein ya manually apni description likhein.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isPlaceIdDescriptionLoading || !placeIdFetchReady}
                  className="mt-2 rounded-md bg-(--primary-main) px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {isPlaceIdDescriptionLoading ? "Generating..." : "Generate Description"}
                </button>
                {isPlaceIdDescriptionLoading && (
                  <p className="mt-2 text-xs text-slate-500">Fetching suggestions...</p>
                )}
                {!isPlaceIdDescriptionLoading && placeIdFeedback && (
                  <p className="mt-2 text-xs text-amber-700">{placeIdFeedback}</p>
                )}
                {!isPlaceIdDescriptionLoading && placeIdSuggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {placeIdSuggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion}-${index}`}
                        className="rounded-md border border-slate-200 bg-white p-2.5"
                      >
                        <p className="text-xs leading-relaxed text-slate-700">{suggestion}</p>
                        <button
                          type="button"
                          onClick={() => setFieldValue("businessDescription", suggestion)}
                          className="mt-2 rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Use this description
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <ATMTagsInput
            label="Tags"
            tags={values.tags}
            setTags={(newTags) => {
              const cleanedTags = newTags
                .map((t) => String(t).trim())
                .filter(Boolean);
              setFieldValue("tags", cleanedTags);
            }}
            placeholder="Type tag, press Enter"
            addOnSpace={false}
          />
          {placeIdTagSuggestions.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              AI tags loaded from Place ID. You can edit them as needed.
            </p>
          )}
        </div>
      </div>

      <div className={blockSectionClass}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className={blockHeadingClass}>Owner</h3>
          <button
            type="button"
            onClick={addOwner}
            className={secondaryButtonClass}
          >
            + Add Owner
          </button>
        </div>
        <div className="space-y-4">
          {values.owner.map((person, index) => (
            <div
              key={`owner-${index}`}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[160px] flex-1">
                  <ATMTextField
                    name={`owner.${index}.name`}
                    label="Name"
                    required
                    value={person.name}
                    onChange={(e) =>
                      updateOwner(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="w-[140px]">
                  <ATMSelect
                    name={`owner.${index}.gender`}
                    label="Gender"
                    required
                    options={genderOptions}
                    value={
                      genderOptions.find((g) => g.value === person.gender) ??
                      null
                    }
                    onChange={(opt) =>
                      updateOwner(index, "gender", opt?.value ?? "MALE")
                    }
                    placeholder="Select"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOwner(index)}
                  className="mb-1 ml-auto shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  title="Remove owner"
                >
                  Remove
                </button>
              </div>
              <ATMTagsInput
                label="Aliases"
                tags={person.aliases}
                setTags={(newTags) => setOwnerAliases(index, newTags)}
                placeholder="Type alias, press Enter"
                addOnSpace={false}
              />
              <div className="border-t border-slate-200/80 pt-3">
                <ATMTextArea
                  name={`owner.${index}.description`}
                  label="Description"
                  minRows={6}
                  value={person.description}
                  onChange={(v) => updateOwner(index, "description", v)}
                  placeholder="About this owner (optional)"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {countWords(person.description)} words · optional
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={blockSectionClass}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className={blockHeadingClass}>Staff</h3>
          <button
            type="button"
            onClick={addStaff}
            className={secondaryButtonClass}
          >
            + Add Staff
          </button>
        </div>
        <div className="space-y-4">
          {values.staff.map((person, index) => (
            <div
              key={`staff-${index}`}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[160px] flex-1">
                  <ATMTextField
                    name={`staff.${index}.name`}
                    label="Name"
                    required
                    value={person.name}
                    onChange={(e) =>
                      updateStaff(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="w-[140px]">
                  <ATMSelect
                    name={`staff.${index}.gender`}
                    label="Gender"
                    required
                    options={genderOptions}
                    value={
                      genderOptions.find((g) => g.value === person.gender) ??
                      null
                    }
                    onChange={(opt) =>
                      updateStaff(index, "gender", opt?.value ?? "MALE")
                    }
                    placeholder="Select"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeStaff(index)}
                  className="mb-1 ml-auto shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  title="Remove staff"
                >
                  Remove
                </button>
              </div>
              <div className="border-t border-slate-200/80 pt-3">
                <ATMTextArea
                  name={`staff.${index}.description`}
                  label="Description"
                  minRows={6}
                  value={person.description}
                  onChange={(v) => updateStaff(index, "description", v)}
                  placeholder="About this staff member (optional)"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {countWords(person.description)} words · optional
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={blockSectionClass}>
        <h3 className={`mb-3 ${blockHeadingClass}`}>Address</h3>
        <div className="grid gap-4 md:grid-cols-2">

          <ATMTextField
            name="address.address"
            label="Address"
            required
            value={values.address.address}
            onChange={(e) =>
              setFieldValue("address.address", e.target.value)
            }
          />


        </div>
        <div className="md:col-span-2">
          <ATMTagsInput
            label="Local location aliases"
            tags={values.address.localLocationAliases}
            setTags={(newTags) =>
              setFieldValue(
                "address.localLocationAliases",
                newTags.map((t) => String(t).trim()).filter(Boolean),
              )
            }
            placeholder="Type alias, press Enter"
            addOnSpace={false}
          />
        </div>
      </div>
    </>
  );

  const placeIdHelpDialog = (
    <Dialog
      open={isPlaceIdHelpOpen}
      onClose={() => setIsPlaceIdHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="flex items-center justify-between">
        <span>How to get Google Place ID</span>
        <IconButton
          size="small"
          onClick={() => setIsPlaceIdHelpOpen(false)}
          aria-label="Close Place ID help"
        >
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent className="space-y-4 pb-6">
        <p className="text-sm text-slate-600">
          Follow these steps: open Google Place ID Finder, search your business,
          click on the location, and copy the Place ID.
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Click the button below to open Google Place ID Finder.</li>
          <li>Search your business name or exact address.</li>
          <li>Select the correct map result.</li>
          <li>Copy the Place ID and paste it in this form field.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <a
            href={PLACE_ID_FINDER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Open Google Place ID Finder
          </a>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <iframe
            src={PLACE_ID_HELP_VIDEO_URL}
            title="How to find Google Place ID"
            className="h-[260px] w-full md:h-[320px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );

if (embedded) {
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={
          isRichEmbedded
            ? "flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)] sm:p-8"
            : "flex flex-col rounded-xl border border-slate-200 bg-white p-4 md:p-6"
        }
      >
        {isOnboardingEmbedded ? (
          <div className="mb-6 border-b border-slate-100 pb-6">
            
          </div>
        ) : isPageEmbedded ? (
          <div className="mb-6 border-b border-slate-100 pb-6">
           
          </div>
        ) : null}
        <div
          className={
            isRichEmbedded
              ? "flex min-h-0 flex-1 flex-col gap-8"
              : "min-h-0 flex-1 space-y-0"
          }
        >
          {formBody}
        </div>
        <div
          className={
            isRichEmbedded
              ? "mt-8 shrink-0 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
              : "mt-6 shrink-0 flex justify-end gap-2 border-t border-slate-200 pt-4"
          }
        >
          {isOnboardingEmbedded ? (
            <p className="text-xs text-slate-500">
              After you continue, you&apos;ll land on your dashboard with full
              navigation.
            </p>
          ) : isPageEmbedded ? (
            <p className="text-xs text-slate-500">
              Cancel returns to the business profile list without saving.
            </p>
          ) : null}
          <div className="flex justify-end gap-2 sm:ml-auto">
            {!hideCancelButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
            <ATMLoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving..."
              disabled={isSubmitting}
              className={
                isRichEmbedded
                  ? "min-w-[200px] rounded-xl! px-6 py-3 text-sm font-semibold shadow-md shadow-slate-900/10 w-auto!"
                  : "w-auto!"
              }
            >
              {isOnboardingEmbedded && formType === "ADD"
                ? "Complete setup & open dashboard"
                : formType === "ADD"
                  ? "Save Business Profile"
                  : "Update Business Profile"}
            </ATMLoadingButton>
          </div>
        </div>
      </form>
      {placeIdHelpDialog}
    </>
  );
}

return (
  <>
    <ATMFormLayout
      title={
        formType === "ADD" ? "Add Business Profile" : "Edit Business Profile"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD" ? "Save Business Profile" : "Update Business Profile"
      }
      showCancelButton={true}
    >
      {formBody}
    </ATMFormLayout>
    {placeIdHelpDialog}
  </>
);
};

export default BusinessProfileForm;
