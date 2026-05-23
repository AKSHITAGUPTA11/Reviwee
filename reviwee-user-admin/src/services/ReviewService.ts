import apiSlice from "./ApiSlice";

export const ReviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecentReviews: builder.query({
      providesTags: ["review"],
      query: () => ({
        url: "/reviews/",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetRecentReviewsQuery } = ReviewApi;
