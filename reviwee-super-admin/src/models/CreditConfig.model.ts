export type CreditConfigListItem = {
  id: string;
  credit: number;
  minWords: number;
  /** API field name (typo preserved for backend compatibility) */
  maxWords: number;
  isDefault?: boolean;
  isActive?: boolean;
};

export type CreditConfigFormValues = {
  credit: number;
  minWords: number;
  maxWords: number;
  isDefault: boolean;
};

export type CreditConfigListPayload = {
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
