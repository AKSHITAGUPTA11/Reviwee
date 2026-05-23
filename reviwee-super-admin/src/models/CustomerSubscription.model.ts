export type CustomerSubscriptionAddPayload = {
  customerId: string;
  subscriptionPlanId: string;
  planStartDate: string;
  discountType: "NONE" | "PERCENTAGE" | "FLAT";
  discountValue: string;
  receivedAmt: number;
  dueDate: string;
  paymentMode: "RAZORPAY" | "OFFLINE" | "CASH" | "UPI" | "CARD";
};

export type CustomerSubscriptionRenewPayload = {
  planStartDate: string;
  paymentMode: "RAZORPAY" | "OFFLINE" | "CASH" | "UPI" | "CARD";
  discountType: "NONE" | "PERCENTAGE" | "FLAT";
  discountValue: string;
  receivedAmt: number;
  dueDate: string;
};

export type CustomerSubscriptionPaymentInPayload = {
  receivedAmt: number;
  dueAmt: number;
  dueDate: string;
  remark?: string;
};

export type CustomerSubscriptionListPayload = {
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

export type CustomerSubscriptionListItem = {
  id: string;
  planName?: string;
  customerName?: string;
  status?: string;
  planStartDate?: string;
  dueDate?: string;
  [key: string]: unknown;
};
