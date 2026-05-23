import type {
  ReviewFeatureAddFormValues,
  ReviewFeatureEditFormValues,
  ReviewFeatureListPayload,
} from "../models/ReviewFeature.model";
import apiSlice from "./ApiSlice";

type ReviewFeatureUpdatePayload = {
  id: string;
  body: ReviewFeatureEditFormValues;
};

export const ReviewFeatureApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllReviewFeatureData: builder.query({
      providesTags: ["reviewFeature"],
      query: (body: ReviewFeatureListPayload) => ({
        url: "/review-feature",
        method: "POST",
        body,
      }),
    }),
    getAllReviewFeature: builder.query({
      providesTags: ["reviewFeature"],
      query: () => ({
        url: `/review-feature`,
        method: "GET",
      }),
    }),
    getReviewFeatureById: builder.query({
      providesTags: ["reviewFeature"],
      query: (id: string) => ({
        url: `/review-feature/${id}`,
        method: "GET",
      }),
    }),
    addReviewFeature: builder.mutation({
      invalidatesTags: ["reviewFeature"],
      query: (body: ReviewFeatureAddFormValues) => ({
        url: "/review-feature/add",
        method: "POST",
        body,
      }),
    }),
    updateReviewFeatureById: builder.mutation({
      invalidatesTags: ["reviewFeature"],
      query: ({ id, body }: ReviewFeatureUpdatePayload) => ({
        url: `/review-feature/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteReviewFeatureById: builder.mutation({
      invalidatesTags: ["reviewFeature"],
      query: (id: string) => ({
        url: `/review-feature/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllReviewFeatureDataQuery,
  useGetReviewFeatureByIdQuery,
  useLazyGetReviewFeatureByIdQuery,
  useAddReviewFeatureMutation,
  useUpdateReviewFeatureByIdMutation,
  useDeleteReviewFeatureByIdMutation,
  useGetAllReviewFeatureQuery,
} = ReviewFeatureApi;
