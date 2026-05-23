export type AddressType = "HOME" | "OFFICE" | "OTHER";

export type BusinessAddressType = {
  address: string;
  localLocationAliases: string[];
  /** API may nest city on address; listing also uses top-level `city` */
  city?: string;
};

export type StaffMemberType = {
  id?: string;
  name: string;
  gender: "MALE" | "FEMALE";
  /** Optional */
  description: string;
  isActive?: boolean;
};

export type OwnerMemberType = {
  id?: string;
  name: string;
  gender: "MALE" | "FEMALE";
  aliases: string[];
  /** Optional */
  description: string;
  isActive?: boolean;
};

export type BusinessProfileFormValues = {
  categoryId: string;
  subCategoryId: string;
  businessDisplayName: string;
  googleBusinessLink: string;
  creditConfigId: string;
  businessAliases: string[];
  tags: string[];
  /** Min 200, max 500 words */
  businessDescription: string;
  address: BusinessAddressType;
  owner: OwnerMemberType[];
  staff: StaffMemberType[];
};

export type BusinessProfileListItem = {
  id?: string;
  _id?: string;
  businessId?: string;
  totalCredits?: number;
  remainingCredits?: number;
  businessDisplayName: string;
  googleBusinessLink: string;
  businessDescription?: string;
  owner?: OwnerMemberType[];
  staff?: StaffMemberType[];
  /** @deprecated API may still return this; prefer owner + staff */
  employees?: StaffMemberType[];
  categoryId: string;
  categoryName?: string;
  subCategoryId: string;
  subCategoryName?: string;
  address?: BusinessAddressType;
  city?: string;
  isActive: boolean;
  status?: "Active" | "Inactive";
};

export type BusinessProfileListPayload = {
  params: string[];
  searchValue: string;
  dateFilter: {
    startDate: string;
    endDate: string;
    dateFilterKey: string;
  };
  rangeFilterBy: {
    rangeFilterKey: string;
    rangeInitial: string;
    rangeEnd: string;
  };
  orderBy: string;
  orderByValue: 1 | -1;
  limit: number;
  page: number;
  filterBy: { fieldName: string; value: string[] }[];
  isPaginationRequired: boolean;
};
