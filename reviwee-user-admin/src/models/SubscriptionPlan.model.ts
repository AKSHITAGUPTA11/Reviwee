export type SubscriptionPlanFormValues = {
  planName?: string;
  planPrice?: number;
  durationInDays?: number;
  totalTiffinsAllowed?: number;
  noOfCustomers?: number;
  description?: string;
};

export type SubscriptionPlanListItem = {
  _id?: string;
  id?: string;
  planName: string;
  planPrice: number | string;
  credits?: number;
  durationInDays?: number;
  totalTiffinsAllowed?: number;
  noOfCustomers?: number;
  description?: string;
};

export type SubscriptionPlanListPayload = {
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
