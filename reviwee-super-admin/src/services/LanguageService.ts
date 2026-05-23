import type {
  LanguageFormValues,
  LanguageListPayload,
} from "../models/Language.model";
import apiSlice from "./ApiSlice";

type LanguageUpdatePayload = {
  id: string;
  body: LanguageFormValues;
};

type LanguageStatusChangePayload = {
  id: string;
  body: { isActive: boolean };
};

export const LanguageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllLanguageData: builder.query({
      providesTags: ["language"],
      query: (body: LanguageListPayload) => ({
        url: "/language",
        method: "POST",
        body,
      }),
    }),
    getAllLanguage: builder.query({
      providesTags: ["language"],
      query: () => ({
        url: "/language",
        method: "GET",
      }),
    }),
    getLanguageById: builder.query({
      providesTags: ["language"],
      query: (id: string) => ({
        url: `/language/${id}`,
        method: "GET",
      }),
    }),
    addLanguage: builder.mutation({
      invalidatesTags: ["language"],
      query: (body: LanguageFormValues) => ({
        url: "/language/add",
        method: "POST",
        body,
      }),
    }),
    updateLanguageById: builder.mutation({
      invalidatesTags: ["language"],
      query: ({ id, body }: LanguageUpdatePayload) => ({
        url: `/language/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteLanguageById: builder.mutation({
      invalidatesTags: ["language"],
      query: (id: string) => ({
        url: `/language/${id}`,
        method: "DELETE",
      }),
    }),
    changeStatusLanguageById: builder.mutation({
      invalidatesTags: ["language"],
      query: ({ id, body }: LanguageStatusChangePayload) => ({
        url: `/language/status-change/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllLanguageDataQuery,
  useGetAllLanguageQuery,
  useGetLanguageByIdQuery,
  useAddLanguageMutation,
  useUpdateLanguageByIdMutation,
  useDeleteLanguageByIdMutation,
  useChangeStatusLanguageByIdMutation,
} = LanguageApi;
