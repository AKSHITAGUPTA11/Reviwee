import type {
  SeoKeywordAddPayload,
  SeoKeywordListPayload,
  SeoKeywordUpdatePayload,
} from "../models/SeoKeyword.model";
import apiSlice from "./ApiSlice";

type SeoKeywordUpdateMutationPayload = {
  id: string;
  body: SeoKeywordUpdatePayload;
};

export const SeoKeywordApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSeoKeywordData: builder.query({
      providesTags: ["seoKeyword"],
      query: (body: SeoKeywordListPayload) => ({
        url: "/seo-keyword",
        method: "POST",
        body,
      }),
    }),
    getSeoKeywordById: builder.query({
      providesTags: ["seoKeyword"],
      query: (id: string) => ({
        url: `/seo-keyword/${id}`,
        method: "GET",
      }),
    }),
    addSeoKeyword: builder.mutation({
      invalidatesTags: ["seoKeyword"],
      query: (body: SeoKeywordAddPayload) => ({
        url: "/seo-keyword/add",
        method: "POST",
        body,
      }),
    }),
    updateSeoKeywordById: builder.mutation({
      invalidatesTags: ["seoKeyword"],
      query: ({ id, body }: SeoKeywordUpdateMutationPayload) => ({
        url: `/seo-keyword/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteSeoKeywordById: builder.mutation({
      invalidatesTags: ["seoKeyword"],
      query: (id: string) => ({
        url: `/seo-keyword/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllSeoKeywordDataQuery,
  useGetSeoKeywordByIdQuery,
  useLazyGetSeoKeywordByIdQuery,
  useAddSeoKeywordMutation,
  useUpdateSeoKeywordByIdMutation,
  useDeleteSeoKeywordByIdMutation,
} = SeoKeywordApi;
