import type {
  AddBusinessProfileProductPayload,
  BusinessProfileProductListPayload,
  BusinessProfileProductItem,
  EditBusinessProfileProductPayload,
} from "../models/BusinessProfileProduct.model";
import apiSlice from "./ApiSlice";

export const BusinessProfileProductsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addBusinessProducts: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (body: AddBusinessProfileProductPayload) => ({
        url: "/product/add",
        method: "POST",
        body,
      }),
    }),
    // Placeholder endpoints (backend schema/paths to be confirmed)
    updateBusinessProductsById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: ({
        id,
        body,
      }: {
        id: string;
        body: EditBusinessProfileProductPayload;
      }) => ({
        url: `/product/${id}`,
        method: "PUT",
        body,
      }),
    }),
    changeProductStatusById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (id: string) => ({
        url: `/product/status-change/${id}`,
        method: "PUT",
      }),
    }),
    deleteBusinessProductsById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (id: string) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
    }),
    getBusinessProductsByBusinessId: builder.query<
      { data: BusinessProfileProductItem[]; totalItem?: number },
      BusinessProfileProductListPayload
    >({
      providesTags: ["businessProfile"],
      query: (body) => ({
        url: "/product",
        method: "POST",
        body,
      }),
    }),
    getStateList: builder.query({
      providesTags: ["businessProfile"],
      query: () => ({
        url: "/state",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useAddBusinessProductsMutation,
  useUpdateBusinessProductsByIdMutation,
  useDeleteBusinessProductsByIdMutation,
  useGetBusinessProductsByBusinessIdQuery,
  useChangeProductStatusByIdMutation,
  useGetStateListQuery,
} = BusinessProfileProductsApi;
