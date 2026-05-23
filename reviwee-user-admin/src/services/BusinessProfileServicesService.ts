import type {
  AddBusinessProfileServicePayload,
  BusinessProfileServiceItem,
  BusinessProfileServiceListPayload,
  EditBusinessProfileServicePayload,
} from "../models/BusinessProfileService.model";
import apiSlice from "./ApiSlice";

export const BusinessProfileServicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addBusinessServices: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (body: AddBusinessProfileServicePayload) => ({
        url: "/service/add",
        method: "POST",
        body,
      }),
    }),
    // Placeholder endpoints (backend schema/paths to be confirmed)
    updateBusinessServicesById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: ({
        id,
        body,
      }: {
        id: string;
        body: EditBusinessProfileServicePayload;
      }) => ({
        url: `/service/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteBusinessServicesById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (id: string) => ({
        url: `/service/${id}`,
        method: "DELETE",
      }),
    }),
    changeStatusServiceById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (id: string) => ({
        url: `/service/status-change/${id}`,
        method: "PUT",
      }),
    }),
    getBusinessServicesByBusinessId: builder.query<
      { data: BusinessProfileServiceItem[]; totalItem?: number },
      BusinessProfileServiceListPayload
    >({
      providesTags: ["businessProfile"],
      query: (body) => ({
        url: "/service",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useAddBusinessServicesMutation,
  useUpdateBusinessServicesByIdMutation,
  useDeleteBusinessServicesByIdMutation,
  useGetBusinessServicesByBusinessIdQuery,
  useChangeStatusServiceByIdMutation
} = BusinessProfileServicesApi;
