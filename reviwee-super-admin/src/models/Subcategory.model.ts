export type SubcategoryListItem = {
  id: string;
  subCategoryName: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  isActive?: boolean;
};

export type SubcategoryFormValues = {
  subCategoryName: string;
  description: string;
  categoryId: string;
  ownerLabel: string;
};

export type SubcategoryListPayload = {
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
