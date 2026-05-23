import type {
  SubscriptionPlanFormValues,
  SubscriptionPlanListPayload,
} from "../models/SubscriptionPlan.model";
import apiSlice from "./ApiSlice";

type SubscriptionPlanUpdatePayload = {
  id: string;
  body: SubscriptionPlanFormValues;
};

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
    addSubscriptionPlan: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: (body: SubscriptionPlanFormValues) => ({
        url: "/subscription-plan/add",
        method: "POST",
        body,
      }),
    }),
    updateSubscriptionPlanById: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: ({ id, body }: SubscriptionPlanUpdatePayload) => ({
        url: `/subscription-plan/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteSubscriptionPlanById: builder.mutation({
      invalidatesTags: ["subscriptionPlan"],
      query: (id: string) => ({
        url: `/subscription-plan/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllSubscriptionPlanDataQuery,
  useGetSubscriptionPlanByIdQuery,
  useLazyGetSubscriptionPlanByIdQuery,
  useAddSubscriptionPlanMutation,
  useUpdateSubscriptionPlanByIdMutation,
  useDeleteSubscriptionPlanByIdMutation,
} = SubscriptionPlanApi;
