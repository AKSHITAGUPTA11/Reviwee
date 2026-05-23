import type {
  ReviewFeatureOptionEditFormValues,
  ReviewFeatureOptionFormValues,
  ReviewFeatureOptionListPayload,
} from "../models/ReviewFeatureOption.model";
import apiSlice from "./ApiSlice";

type ReviewFeatureOptionUpdatePayload = {
  id: string;
  body: ReviewFeatureOptionEditFormValues;
};

export const ReviewFeatureOptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllReviewFeatureOptionData: builder.query({
      providesTags: ["reviewFeatureOption"],
      query: (body: ReviewFeatureOptionListPayload) => ({
        url: "/review-feature-option",
        method: "POST",
        body,
      }),
    }),
    getReviewFeatureOptionById: builder.query({
      providesTags: ["reviewFeatureOption"],
      query: (id: string) => ({
        url: `/review-feature-option/${id}`,
        method: "GET",
      }),
    }),
    getLaguage: builder.query({
      query: () => ({ 
        url: `/language`,
        method: "GET",
      }),
    }),
    addReviewFeatureOption: builder.mutation({
      invalidatesTags: ["reviewFeatureOption"],
      query: (body: ReviewFeatureOptionFormValues) => ({
        url: "/review-feature-option/add",
        method: "POST",
        body,
      }),
    }),
    updateReviewFeatureOptionById: builder.mutation({
      invalidatesTags: ["reviewFeatureOption"],
      query: ({ id, body }: ReviewFeatureOptionUpdatePayload) => ({
        url: `/review-feature-option/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteReviewFeatureOptionById: builder.mutation({
      invalidatesTags: ["reviewFeatureOption"],
      query: (id: string) => ({
        url: `/review-feature-option/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllReviewFeatureOptionDataQuery,
  useGetReviewFeatureOptionByIdQuery,
  useLazyGetReviewFeatureOptionByIdQuery,
  useAddReviewFeatureOptionMutation,
  useUpdateReviewFeatureOptionByIdMutation,
  useDeleteReviewFeatureOptionByIdMutation,
  useGetLaguageQuery,
} = ReviewFeatureOptionApi;
