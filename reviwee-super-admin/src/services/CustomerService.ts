import type {
  CreditLogListPayload,
  CustomerListPayload,
  ProfileListPayload,
} from "../models/Customer.model";
import apiSlice from "./ApiSlice";

export const CustomerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCustomerData: builder.query({
      providesTags: ["customer"],
      query: (body: CustomerListPayload) => ({
        url: "/admin",
        method: "POST",
        body,
      }),
    }),
    getCustomerById: builder.query({
      providesTags: ["customer"],
      query: (id: string) => ({
        url: `/admin/${id}`,
        method: "GET",
      }),
    }),
    getAllProfileData: builder.query({
      providesTags: ["customer"],
      query: (body: ProfileListPayload) => ({
        url: "/profile",
        method: "POST",
        body,
      }),
    }),
    getAllProfileCreditLogsData: builder.query({
      providesTags: ["customer"],
      query: (body: CreditLogListPayload) => ({
        url: "/profile/credit-logs",
        method: "POST",
        body,
      }),
    }),
    resetCustomerPassword: builder.mutation<
      unknown,
      { id: string; body: { password: string } }
    >({
      invalidatesTags: ["customer"],
      query: ({ id, body }) => ({
        url: `/admin/reset-password/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllCustomerDataQuery,
  useGetCustomerByIdQuery,
  useLazyGetCustomerByIdQuery,
  useGetAllProfileDataQuery,
  useGetAllProfileCreditLogsDataQuery,
  useResetCustomerPasswordMutation,
} = CustomerApi;
