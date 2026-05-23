import { apiSlice } from "./ApiSlice";

export type ReviewTemplateProduct = {
  _id: string;
  productName: string;
};
export type ReviewTemplateLanguage = {
  _id: string;
  languageName: string;
  languageDescription?: string;
};

export type ReviewTemplateServiceItem = {
  _id: string;
  serviceName: string;
};

export type ReviewTemplateOwner = {
  _id: string;
  name: string;
  aliases?: string[];
  gender?: string;
  isActive?: boolean;
};

export type ReviewTemplateStaffMember = {
  _id: string;
  name: string;
  gender?: string;
  isActive?: boolean;
};

/** Single entry from generate API: plain string or `{ review, rating }`. */
export type GeneratedReviewApiItem =
  | string
  | { review?: string; rating?: number };

export type NormalizedGeneratedReview = {
  text: string;
  rating?: number;
};

/** Flat API response (generate + template detail) */
export type ReviewTemplateResponse = {
  message?: string;
  businessName?: string;
  ownerLabel?: string;
  googleBusinessLink?: string;
  /** Some APIs send snake_case; we read this in the page if camelCase is empty. */
  google_business_link?: string;
  reviews?: GeneratedReviewApiItem[];
  /** API may return objects or plain strings; the page normalizes to objects */
  languages?: ReviewTemplateLanguage[] | string[];
  products?: ReviewTemplateProduct[];
  services?: ReviewTemplateServiceItem[];
  owner?: ReviewTemplateOwner[];
  staff?: ReviewTemplateStaffMember[];
  success?: boolean;
  /** Some APIs use `status: false` for business errors while HTTP stays 200 */
  status?: boolean;
  code?: string;
  issue?: string | null;
  deductedCredits?: number;
  remainingCredits?: number;
  businessAliases?: string[];
  seoKeywords?: string[];
  /** Business topic tags from profile; one can be sent on generate as `tag`. */
  tags?: string[];
};

/** Maps API `reviews` to normalized objects for UI render/copy. */
export function normalizeGeneratedReviews(
  raw: GeneratedReviewApiItem[] | undefined
): NormalizedGeneratedReview[] {
  if (!Array.isArray(raw)) return [];
  const out: NormalizedGeneratedReview[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push({ text: t });
    } else if (item && typeof item === "object") {
      const text = item.review;
      if (typeof text === "string" && text.trim()) {
        const maybeRating = typeof item.rating === "number" ? item.rating : undefined;
        const boundedRating =
          typeof maybeRating === "number"
            ? Math.max(1, Math.min(5, Math.round(maybeRating)))
            : undefined;
        out.push({ text: text.trim(), rating: boundedRating });
      }
    }
  }
  return out;
}

export type GenerateReviewParams = {
  templateId: string;
  body: {
    language: string;
    product: string;
    service: string;
    rating: number;
    ownerName: string;
    ownerGender?: string | null;
    /** Required by backend when language is not English */
    writerGender?: string | null;
    staffName: string;
    /** Single tag chosen from profile `tags` to steer review topic. */
    tag?: string;
  };
};

export const reviewTemplateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Initial load: public profile (business meta, credits, filters).
     * Generate review still uses `generateReview` → `review-template/generate/:id`.
     */
    getReviewTemplate: builder.query<ReviewTemplateResponse, string>({
      query: (id) => ({
        url: `profile/public/${encodeURIComponent(id)}`,
        method: "GET",
      }),
    }),
    generateReview: builder.mutation<ReviewTemplateResponse, GenerateReviewParams>(
      {
        query: ({ templateId, body }) => ({
          url: `review-template/generate/${encodeURIComponent(templateId)}`,
          method: "POST",
          body,
        }),
      },
    ),
  }),
});

export const {
  useGetReviewTemplateQuery,
  useGenerateReviewMutation,
} = reviewTemplateApi;
