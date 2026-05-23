import type { BusinessProfileFormValues } from "src/models/BusinessProfile.model";

/** Maps GET profile response (data or data.data) into form initial values. */
export function mapApiToBusinessProfileFormValues(
  source: Record<string, unknown>
): BusinessProfileFormValues {
  const mapOwner = (o: {
    name?: string;
    gender?: string;
    aliases?: unknown;
    description?: string;
  }) => ({
    name: o?.name || "",
    gender: (o?.gender === "FEMALE" ? "FEMALE" : "MALE") as "MALE" | "FEMALE",
    aliases: Array.isArray(o?.aliases)
      ? o.aliases.map((a) => String(a).trim()).filter(Boolean)
      : [],
    description: String(o?.description ?? ""),
  });

  const mapStaff = (s: {
    name?: string;
    gender?: string;
    description?: string;
  }) => ({
    name: s?.name || "",
    gender: (s?.gender === "FEMALE" ? "FEMALE" : "MALE") as "MALE" | "FEMALE",
    description: String(s?.description ?? ""),
  });

  const addr = (source?.address ?? {}) as Record<string, unknown>;

  let owner = Array.isArray(source?.owner)
    ? (
        source.owner as {
          name?: string;
          gender?: string;
          aliases?: unknown;
          description?: string;
        }[]
      ).map(mapOwner)
    : [];
  let staff = Array.isArray(source?.staff)
    ? (source.staff as { name?: string; gender?: string; description?: string }[]).map(
        mapStaff
      )
    : [];

  if (!owner.length && !staff.length && Array.isArray(source?.employees)) {
    staff = (
      source.employees as { name?: string; gender?: string; description?: string }[]
    ).map(mapStaff);
  }

  const businessAliases = Array.isArray(source?.businessAliases)
    ? (source.businessAliases as unknown[])
        .map((a) => String(a).trim())
        .filter(Boolean)
    : [];
  const tags = Array.isArray(source?.tags)
    ? (source.tags as unknown[])
        .map((a) => String(a).trim())
        .filter(Boolean)
    : Array.isArray(source?.businessTags)
      ? (source.businessTags as unknown[])
          .map((a) => String(a).trim())
          .filter(Boolean)
      : businessAliases;

  const localLocationAliases = Array.isArray(addr?.localLocationAliases)
    ? (addr.localLocationAliases as unknown[])
        .map((a) => String(a).trim())
        .filter(Boolean)
    : [];

  return {
    categoryId: String(source?.categoryId ?? ""),
    subCategoryId: String(source?.subCategoryId ?? ""),
    businessDisplayName: String(source?.businessDisplayName ?? ""),
    googleBusinessLink: String(source?.googleBusinessLink ?? ""),
    creditConfigId: String(source?.creditConfigId ?? ''),
    businessDescription: String(source?.businessDescription ?? ""),
    businessAliases,
    tags,
    address: {
      address: String(addr.address ?? addr.addressLine1 ?? ""),
      localLocationAliases,
    },
    owner,
    staff,
  };
}
