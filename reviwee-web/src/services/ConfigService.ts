import { apiSlice } from "./ApiSlice";

export type AppConfigEntry = {
  _id?: string;
  key: string;
  value: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

export type ConfigListResponse = {
  message?: string;
  status?: boolean;
  data?: AppConfigEntry[];
  code?: string;
  issue?: string | null;
};

export const GOOGLE_BUSINESS_CONFIG_KEY = "GOOGLE_BUSINESS_LINK" as const;

export function pickConfigValueByKey(
  entries: AppConfigEntry[] | undefined,
  key: string
): string | undefined {
  if (!Array.isArray(entries)) return undefined;
  const row = entries.find(
    (e) => e.key === key && e.isActive !== false && e.isDeleted !== true
  );
  const v = row?.value?.trim();
  return v || undefined;
}

/** Template may still send a full Maps / writereview URL; otherwise value is treated as a place id. */
export function isProbablyFullGoogleBusinessLink(raw: string): boolean {
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return true;
  if (/\bplaceid=/i.test(t) && /placeid=[^&\s]+/i.test(t)) return true;
  if (
    t.includes("google.com") &&
    (t.includes("maps") || t.includes("writereview") || t.includes("local"))
  ) {
    return true;
  }
  return false;
}

export function mergeGoogleBusinessLinkPrefixWithPlaceId(
  prefix: string | undefined,
  placeId: string | undefined
): string | undefined {
  const p = prefix?.trim();
  const id = placeId?.trim();
  if (!p || !id) return undefined;
  if (/^(undefined|null)$/i.test(id)) return undefined;
  return `${p}${id}`;
}

export const configApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConfig: builder.query<ConfigListResponse, void>({
      query: () => ({ url: "config/", method: "GET" }),
    }),
  }),
});

export const { useGetConfigQuery } = configApi;
