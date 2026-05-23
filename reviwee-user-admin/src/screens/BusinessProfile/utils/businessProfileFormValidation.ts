import { array, boolean, object, string } from "yup";

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function countCharacters(text: string): number {
  return (text ?? "").trim().length;
}

const businessDescriptionField = (label: string, requiredMsg: string) =>
  string()
    .trim()
    .required(requiredMsg)
    .test(
      "char-count",
      `${label} must be between 200 and 500 characters`,
      (val) => {
        const n = countCharacters(val ?? "");
        return n >= 200 && n <= 500;
      },
    );

const ownerEntrySchema = object({
  id: string().optional(),
  isActive: boolean().optional(),
  name: string().trim().required("Please enter owner name"),
  gender: string().oneOf(["MALE", "FEMALE"]).required(),
  aliases: array().of(string()).default([]),
  description: string().trim().default(""),
});

const staffEntrySchema = object({
  id: string().optional(),
  isActive: boolean().optional(),
  name: string().trim().required("Please enter staff name"),
  gender: string().oneOf(["MALE", "FEMALE"]).required(),
  description: string().trim().default(""),
});

export const businessProfileFormValidationSchema = object({
  categoryId: string().required("Please select category"),
  subCategoryId: string().required("Please select subcategory"),
  businessDisplayName: string().required("Please enter business display name"),
  googleBusinessLink: string().required("Please enter google business link"),
  creditConfigId: string().default(""),
  businessAliases: array().of(string()).default([]),
  tags: array().of(string()).default([]),
  businessDescription: businessDescriptionField(
    "Business description",
    "Please enter business description",
  ),
  address: object({
    address: string().required("Please enter address"),
    localLocationAliases: array().of(string()).default([]),
  }),
  owner: array().of(ownerEntrySchema).default([]),
  staff: array().of(staffEntrySchema).default([]),
});
