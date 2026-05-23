export type DuesListPayload = {
  params: string[];
  searchValue: string;
  isActive?: boolean;
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

export type DuesListItem = {
  id: string;
  name?: string;
  [key: string]: unknown;
};
