import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import SideNavLayout from "../../../components/layouts/SideNavLayout/SideNavLayout";
import {
  useGetBusinessProfileByIdQuery,
  useUpdateBusinessProfileByIdMutation,
} from "../../../services/BusinessProfileService";
import {
  getApiMessage,
  showToast,
} from "../../../utils/validations/showToaster";
import BusinessProfileViewTabs from "./BusinessProfileViewTabs";
import ATMTagsInput from "src/components/UI/atoms/formFields/ATMTagsInput/ATMTagsInput";
import ATMTagsSelect from "src/components/UI/atoms/formFields/ATMTagsSelect/ATMTagsSelect";
import type { TagsSelectOption } from "src/components/UI/atoms/formFields/ATMTagsSelect/ATMTagsSelect";
import useLanguage from "src/hooks/useLaguage";

type ProfileSeoFields = {
  languages?: unknown;
  businessAliases?: unknown;
  seoKeywords?: unknown;
  seoKeyword?: unknown;
};

type LanguagePayloadItem = {
  languageName: string;
  languageDescription: string;
};

type LanguageOptionMeta = TagsSelectOption & {
  description: string;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const normalizeLanguageArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return normalizeStringArray(value);

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const lang = item as Record<string, unknown>;
        const languageName = String(lang.languageName ?? "").trim();
        const languageDescription = String(
          lang.languageDescription ?? ""
        ).trim();
        return languageName || languageDescription;
      }
      return "";
    })
    .filter(Boolean);
};


const mapLanguageListToOptions = (raw: unknown[]): LanguageOptionMeta[] =>
  raw
    .map((item: unknown): LanguageOptionMeta | null => {
      if (item == null) return null;
      if (typeof item === "string") {
        const s = item.trim();
        return s ? { label: s, value: s, description: s } : null;
      }
      if (typeof item === "object") {
        const o = item as Record<string, unknown>;
        const label = String(o.languageName ?? o.label ?? o.value ?? "").trim();
        const value = String(o.languageName ?? o.value ?? o.label ?? "").trim();
        const description = String(
          o.languageDescription ?? o.description ?? label
        ).trim();
        if (!label && !value) return null;
        return {
          label: label || value,
          value: value || label,
          description: description || label || value,
        };
      }
      return null;
    })
    .filter((o): o is LanguageOptionMeta => o !== null);

const ViewBusinessProfileSeo = () => {
  const { language, isDataLoading } = useLanguage();
  const languageOptions = useMemo(
    () => mapLanguageListToOptions(Array.isArray(language) ? language : []),
    [language]
  );
  const languageDescriptionMap = useMemo(
    () =>
      new Map(
        languageOptions.map((opt) => [opt.value.trim().toLowerCase(), opt.description])
      ),
    [languageOptions]
  );
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isFetching } = useGetBusinessProfileByIdQuery(
    id ?? "",
    { skip: !id }
  );
  const [updateBusinessProfileById, { isLoading: isUpdating }] =
    useUpdateBusinessProfileByIdMutation();

  const item = (data?.data || data || {}) as ProfileSeoFields;
  const [languages, setLanguages] = useState<string[]>([]);
  const [businessAliases, setBusinessAliases] = useState<string[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);

  useEffect(() => {
    setLanguages(normalizeLanguageArray(item.languages));
    setBusinessAliases(normalizeStringArray(item.businessAliases));
    const seoRaw =
      item.seoKeywords !== undefined && item.seoKeywords !== null
        ? item.seoKeywords
        : item.seoKeyword;
    setSeoKeywords(normalizeStringArray(seoRaw));
  }, [item.languages, item.businessAliases, item.seoKeywords, item.seoKeyword]);

  const parsedValues = useMemo(
    () => ({
      languages: languages.map((lang): LanguagePayloadItem => {
        const normalized = String(lang).trim();
        const mappedDescription =
          languageDescriptionMap.get(normalized.toLowerCase()) ?? normalized;
        return {
          languageName: normalized,
          languageDescription: mappedDescription,
        };
      }),
      businessAliases,
      seoKeywords,
    }),
    [businessAliases, languages, seoKeywords, languageDescriptionMap]
  );

  const handleSave = async () => {
    if (!id) return;

    const response = await updateBusinessProfileById({
      id,
      body: parsedValues,
    });

    if ("error" in response) {
      showToast(
        "error",
        getApiMessage(response, "Unable to update SEO details")
      );
      return;
    }

    showToast(
      "success",
      getApiMessage(response.data, "SEO details updated successfully")
    );
  };

  if (isLoading || isFetching) {
    return (
      <SideNavLayout>
        <div className="flex min-h-[200px] items-center justify-center p-4">
          <CircularProgress />
        </div>
      </SideNavLayout>
    );
  }

  return (
    <SideNavLayout>
      <div className="p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 min-h-[calc(100vh-140px)]">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">
              View Business Profile
            </h1>
            <button
              type="button"
              onClick={() => navigate("/business-profile")}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Back
            </button>
          </div>

          <BusinessProfileViewTabs profileId={id} activeTab="seo" />

          <div className="space-y-5 max-w-3xl">
            <div>
              <ATMTagsSelect
                label="Languages"
                options={languageOptions}
                value={languages}
                onChange={setLanguages}
                placeholder="Select language"
                isLoading={isDataLoading}
              />
            </div>

            <div>
              <ATMTagsInput
                label="Business aliases"
                tags={businessAliases}
                setTags={setBusinessAliases}
                placeholder="Type alias, press Enter"
                addOnSpace={false}
              />
            </div>

            <div>
              <ATMTagsInput
                label="SEO keywords"
                tags={seoKeywords}
                setTags={setSeoKeywords}
                placeholder="Type keyword, press Enter"
                addOnSpace={false}
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating}
              className="rounded-md bg-(--primary-main) px-4 py-2 text-sm font-semibold text-white hover:bg-(--primary-hover) disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </SideNavLayout>
  );
};

export default ViewBusinessProfileSeo;
