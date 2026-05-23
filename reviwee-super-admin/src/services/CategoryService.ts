import type {
  CategoryFormValues,
  CategoryListPayload,
} from "../models/Category.model";
import apiSlice from "./ApiSlice";

type CategoryUpdatePayload = {
  id: string;
  body: CategoryFormValues;
};

export const CategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategoryData: builder.query({
      providesTags: ["category"],
      query: (body: CategoryListPayload) => ({
        url: "/category",
        method: "POST",
        body,
      }),
    }),
    getAllCategory: builder.query({
      providesTags: ["category"],
      query: () => ({
        url: `/category`,
        method: "GET",
      }),
    }),
    getCategoryById: builder.query({
      providesTags: ["category"],
      query: (id: string) => ({
        url: `/category/${id}`,
        method: "GET",
      }),
    }),
    addCategory: builder.mutation({
      invalidatesTags: ["category"],
      query: (body: CategoryFormValues) => ({
        url: "/category/add",
        method: "POST",
        body,
      }),
    }),
    updateCategoryById: builder.mutation({
      invalidatesTags: ["category"],
      query: ({ id, body }: CategoryUpdatePayload) => ({
        url: `/category/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteCategoryById: builder.mutation({
      invalidatesTags: ["category"],
      query: (id: string) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllCategoryDataQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoryByIdQuery,
  useAddCategoryMutation,
  useUpdateCategoryByIdMutation,
  useDeleteCategoryByIdMutation,
  useGetAllCategoryQuery,
} = CategoryApi;
