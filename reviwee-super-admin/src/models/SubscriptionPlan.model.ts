export type SubscriptionPlanListItem = {
  id: string;
  planName: string;
  description: string;
  planPrice: number;
  planDuration: string;
  credits: number;
  [key: string]: unknown;
};

export type SubscriptionPlanFormValues = {
  planName: string;
  description: string;
  planPrice: number;
  planDuration: string;
  credits: number;
};

export type SubscriptionPlanListPayload = {
  params: string[];
  searchValue: string;
  dateFilter: { startDate: string; endDate: string; dateFilterKey: string };
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
