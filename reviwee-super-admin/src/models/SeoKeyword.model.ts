export type SeoKeywordListItem = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  keywordList: string[];
  categoryName?: string;
  subcategoryName?: string;
  isActive?: boolean;
};

export type SeoKeywordFormValues = {
  categoryId: string;
  subCategoryId: string;
  keywordList: string[];
};

export type SeoKeywordEditFormValues = {
  categoryId: string;
  subCategoryId: string;
  keyword: string;
};

export type SeoKeywordListPayload = {
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

export type SeoKeywordAddPayload = {
  categoryId: string;
  subCategoryId: string;
  keywordList?: string[];
  keyword?: string;
};

export type SeoKeywordUpdatePayload = {
  categoryId: string;
  subCategoryId: string;
  keyword: string;
};
