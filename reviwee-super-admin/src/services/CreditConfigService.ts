import type {
  CreditConfigFormValues,
  CreditConfigListPayload,
} from "../models/CreditConfig.model";
import apiSlice from "./ApiSlice";

type CreditConfigUpdatePayload = {
  id: string;
  body: CreditConfigFormValues;
};

type CreditConfigStatusChangePayload = {
  id: string;
  body: { isActive: boolean };
};

export const CreditConfigApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCreditConfigData: builder.query({
      providesTags: ["creditConfig"],
      query: (body: CreditConfigListPayload) => ({
        url: "/credit-config",
        method: "POST",
        body,
      }),
    }),
    getCreditConfigById: builder.query({
      providesTags: ["creditConfig"],
      query: (id: string) => ({
        url: `/credit-config/${id}`,
        method: "GET",
      }),
    }),
    addCreditConfig: builder.mutation({
      invalidatesTags: ["creditConfig"],
      query: (body) => ({
        url: "/credit-config/add",
        method: "POST",
        body,
      }),
    }),
    updateCreditConfigById: builder.mutation({
      invalidatesTags: ["creditConfig"],
      query: ({ id, body }: CreditConfigUpdatePayload) => ({
        url: `/credit-config/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteCreditConfigById: builder.mutation({
      invalidatesTags: ["creditConfig"],
      query: (id: string) => ({
        url: `/credit-config/${id}`,
        method: "DELETE",
      }),
    }),
    changeStatusCreditConfigById: builder.mutation({
      invalidatesTags: ["creditConfig"],
      query: ({ id, body }: CreditConfigStatusChangePayload) => ({
        url: `/credit-config/status-change/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllCreditConfigDataQuery,
  useGetCreditConfigByIdQuery,
  useAddCreditConfigMutation,
  useUpdateCreditConfigByIdMutation,
  useDeleteCreditConfigByIdMutation,
  useChangeStatusCreditConfigByIdMutation,
} = CreditConfigApi;
