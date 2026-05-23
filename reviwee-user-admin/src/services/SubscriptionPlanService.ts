import type {
  SubscriptionPlanListPayload,
} from "../models/SubscriptionPlan.model";
import apiSlice from "./ApiSlice";

export const SubscriptionPlanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptionPlanData: builder.query({
      providesTags: ["subscriptionPlan"],
      query: (body: SubscriptionPlanListPayload) => ({
        url: "/subscription-plan",
        method: "POST",
        body,
      }),
    }),
    getSubscriptionPlanById: builder.query({
      providesTags: ["subscriptionPlan"],
      query: (id: string) => ({
        url: `/subscription-plan/${id}`,
        method: "GET",
      }),
    }),
    getActivePackage: builder.query({
      providesTags: ["subscriptionPlan"],
      query: () => ({
        url: "/customer-subscription",
        method: "GET",
      }),
    }),
    addActivePackage: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: (body: Record<string, unknown>) => ({
        url: "/customer-subscription/add",
        method: "POST",
        body,
      }),
    }),
    verifyPayment: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: (body: Record<string, unknown>) => ({
        url: "/customer-subscription/payment-verify",
        method: "POST",
        body,
      }),
    }),
    renewSubscriptionById: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: ({ id, body }: { id: string; body: Record<string, unknown> }) => ({
        url: `/customer-subscription/${id}/renew`,
        method: "PUT",
        body,
      }),
    }),
    upgradeActivePackageById: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: ({ id, body }: { id: string; body: Record<string, unknown> }) => ({
        url: `/customer-subscription/${id}/upgrade`,
        method: "PUT",
        body,
      }),
    }),
    getInvoiceList: builder.query({
      providesTags: ["subscriptionPlan"],
      query: () => ({
        url: "/invoice",
        method: "GET",
      }),
    }),
    getLatestInvoice: builder.query({
      providesTags: ["subscriptionPlan"],
      query: () => ({
        url: "/invoice/latest",
        method: "GET",
      }),
    }),
    updateInvoiceGstDetails: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: (body: Record<string, unknown>) => ({
        url: "/invoice/update-gst-details",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllSubscriptionPlanDataQuery,
  useGetSubscriptionPlanByIdQuery,
  useLazyGetSubscriptionPlanByIdQuery,
  useGetActivePackageQuery,
  useAddActivePackageMutation,
  useVerifyPaymentMutation,
  useRenewSubscriptionByIdMutation,
  useUpgradeActivePackageByIdMutation,
  useGetInvoiceListQuery,
  useLazyGetInvoiceListQuery,
  useGetLatestInvoiceQuery,
  useLazyGetLatestInvoiceQuery,
  useUpdateInvoiceGstDetailsMutation,
} = SubscriptionPlanApi;
