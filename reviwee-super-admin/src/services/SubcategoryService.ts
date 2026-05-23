import type {
  SubcategoryFormValues,
  SubcategoryListPayload,
} from "../models/Subcategory.model";
import apiSlice from "./ApiSlice";

type SubcategoryUpdatePayload = {
  id: string;
  body: SubcategoryFormValues;
};

export const SubcategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubcategoryData: builder.query({
      providesTags: ["subcategory"],
      query: (body: SubcategoryListPayload) => ({
        url: "/sub-category",
        method: "POST",
        body,
      }),
    }),
    getAllSubcategory: builder.query({
      providesTags: ["subcategory"],
      query: () => ({
        url: `/sub-category`,
        method: "GET",
      }),
    }),
    getSubcategoryById: builder.query({
      providesTags: ["subcategory"],
      query: (id: string) => ({
        url: `/sub-category/${id}`,
        method: "GET",
      }),
    }),
    addSubcategory: builder.mutation({
      invalidatesTags: ["subcategory"],
      query: (body: SubcategoryFormValues) => ({
        url: "/sub-category/add",
        method: "POST",
        body,
      }),
    }),
    updateSubcategoryById: builder.mutation({
      invalidatesTags: ["subcategory"],
      query: ({ id, body }: SubcategoryUpdatePayload) => ({
        url: `/sub-category/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteSubcategoryById: builder.mutation({
      invalidatesTags: ["subcategory"],
      query: (id: string) => ({
        url: `/sub-category/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllSubcategoryDataQuery,
  useGetSubcategoryByIdQuery,
  useLazyGetSubcategoryByIdQuery,
  useAddSubcategoryMutation,
  useUpdateSubcategoryByIdMutation,
  useDeleteSubcategoryByIdMutation,
  useGetAllSubcategoryQuery,
} = SubcategoryApi;
