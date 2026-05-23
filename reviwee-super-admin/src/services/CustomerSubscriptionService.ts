import type {
  CustomerSubscriptionAddPayload,
  CustomerSubscriptionListPayload,
  CustomerSubscriptionPaymentInPayload,
  CustomerSubscriptionRenewPayload,
} from "../models/CustomerSubscription.model";
import apiSlice from "./ApiSlice";

export const CustomerSubscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerSubscriptionList: builder.query({
      providesTags: ["customerSubscription"],
      query: (body: CustomerSubscriptionListPayload) => ({
        url: "/customer-subscription",
        method: "POST",
        body,
      }),
    }),
    addCustomerSubscription: builder.mutation({
      invalidatesTags: ["customerSubscription", "customer"],
      query: (body: CustomerSubscriptionAddPayload) => ({
        url: "/customer-subscription/add",
        method: "POST",
        body,
      }),
    }),
    renewCustomerSubscription: builder.mutation({
      invalidatesTags: ["customerSubscription", "customer"],
      query: ({
        id,
        body,
      }: {
        id: string;
        body: CustomerSubscriptionRenewPayload;
      }) => ({
        url: `/customer-subscription/${id}/renew`,
        method: "PUT",
        body,
      }),
    }),
    paymentInCustomerSubscription: builder.mutation({
      invalidatesTags: ["customerSubscription", "customer"],
      query: ({
        id,
        body,
      }: {
        id: string;
        body: CustomerSubscriptionPaymentInPayload;
      }) => ({
        url: `/customer-subscription/${id}/payment-in`,
        method: "PUT",
        body,
      }),
    }),
    getCustomerSubscriptionLedger: builder.query({
      providesTags: ["customerSubscription"],
      query: (customerId: string) => ({
        url: `/customer-subscription/${customerId}/ledger`,
        method: "GET",
      }),
    }),
    getCustomerSubscriptionById: builder.query({
      providesTags: ["customerSubscription"],
      query: (id: string) => ({
        url: `/customer-subscription/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCustomerSubscriptionListQuery,
  useAddCustomerSubscriptionMutation,
  useRenewCustomerSubscriptionMutation,
  usePaymentInCustomerSubscriptionMutation,
  useGetCustomerSubscriptionLedgerQuery,
  useGetCustomerSubscriptionByIdQuery,
} = CustomerSubscriptionApi;
