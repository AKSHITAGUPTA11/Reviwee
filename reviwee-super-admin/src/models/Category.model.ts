export type CategoryListItem = {
  id: string;
  categoryName: string;
  description: string;
  isActive?: boolean;
};

export type CategoryFormValues = {
  categoryName: string;
  description: string;
};

export type CategoryListPayload = {
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
