export type CustomerListItem = {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  displayName?: string;
  [key: string]: unknown;
};

export type CustomerListPayload = {
  params: string[];
  searchValue: string;
  dateFilter: { startDate: string; endDate: string; dateFilterKey: string };
  rangeFilterBy: { rangeFilterKey: string; rangeInitial: string; rangeEnd: string };
  orderBy: string;
  orderByValue: 1 | -1;
  limit: number;
  page: number;
  filterBy: { fieldName: string; value: string[] }[];
  isPaginationRequired: boolean;
};

export type ProfileListPayload = {
  params: string[];
  searchValue: string;
  dateFilter: { startDate: string; endDate: string; dateFilterKey: string };
  rangeFilterBy: { rangeFilterKey: string; rangeInitial: string; rangeEnd: string };
  orderBy: string;
  orderByValue: 1 | -1;
  limit: number;
  page: number;
  filterBy: { fieldName: string; value: string[] }[];
  isPaginationRequired: boolean;
};

export type CreditLogListPayload = ProfileListPayload;

export type ProfileListItem = {
  displayName?: string;
  businessDisplayName?: string;
  category?: string;
  subCategory?: string;
  isActive?: boolean;
  [key: string]: unknown;
};

export type ProfileViewModel = ProfileListItem & {
  userId?: string;
  userName?: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  businessId?: string;
  creditConfigId?: string;
  businessDescription?: string;
  googleBusinessLink?: string;
  ownerLabel?: string;
  addressLine?: string;
  businessAliases?: string[];
  seoKeywords?: string[];
  owner?: string[];
  staff?: string[];
  languages?: string[];
  perRequestCredit?: number;
  minWords?: number;
  maxWords?: number;
  totalCredits?: number;
  remainingCredits?: number;
};

export type CreditLogListItem = {
  id: string;
  businessDisplayName?: string;
  profileName?: string;
  credit?: number;
  transactionType?: string;
  remark?: string;
  createdAt?: string;
  [key: string]: unknown;
};
