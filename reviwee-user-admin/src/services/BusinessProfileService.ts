import type {
  BusinessProfileFormValues,
  BusinessProfileListPayload,
} from "../models/BusinessProfile.model";
import apiSlice from "./ApiSlice";

type BusinessProfilePartialUpdatePayload =
  Partial<BusinessProfileFormValues> & {
    languages?: { languageName: string; languageDescription: string }[];
    seoKeyword?: string;
  };

type BusinessProfileUpdatePayload = {
  id: string;
  body: BusinessProfilePartialUpdatePayload;
};

export type BusinessPlaceIdSuggestionsParams = {
  placeId: string;
  businessDisplayName: string;
  subCategoryName: string;
};

export const BusinessProfileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBusinessProfileData: builder.query({
      providesTags: ["businessProfile"],
      query: (body: BusinessProfileListPayload) => ({
        url: "/profile",
        method: "POST",
        body,
      }),
    }),
    getLaguage: builder.query({
      query: () => ({
        url: `/language`,
        method: "GET",
      }),
    }),
    getBusinessProfileById: builder.query({
      providesTags: ["businessProfile"],
      query: (id: string) => ({
        url: `/profile/${id}`,
        method: "GET",
      }),
    }),
    getBusinessDescriptionSuggestionsByPlaceId: builder.query<
      unknown,
      BusinessPlaceIdSuggestionsParams
    >({
      query: ({ placeId, businessDisplayName, subCategoryName }) => ({
        url: `/profile/place-id/${encodeURIComponent(placeId)}`,
        method: "GET",
        params: {
          businessDisplayName,
          subCategoryName,
        },
      }),
    }),
    getAllBusinessProfile: builder.query({
      providesTags: ["businessProfile"],
      query: () => ({
        url: `/profile`,
        method: "GET",
      }),
    }),
    addBusinessProfile: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (body: BusinessProfileFormValues) => ({
        url: "/profile/add",
        method: "POST",
        body,
      }),
    }),
    updateBusinessProfileById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: ({ id, body }: BusinessProfileUpdatePayload) => ({
        url: `/profile/${id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteBusinessProfileById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: (id: string) => ({
        url: `/profile/${id}`,
        method: "DELETE",
      }),
    }),
    getAllSubcategory: builder.query({
      providesTags: ["businessProfile"],
      query: () => ({
        url: `/sub-category`,
        method: "GET",
      }),
    }),
    getAllCategory: builder.query({
      providesTags: ["businessProfile"],
      query: () => ({
        url: `/category`,
        method: "GET",
      }),
    }),
    changeStatusBusinessProfileById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: ({ body, id }: { body?: unknown; id: string }) => ({
        url: `/profile/status-change/${id}`,
        method: "PUT",
        body: body || {},
      }),
    }),
    changeStatusMemberById: builder.mutation({
      invalidatesTags: ["businessProfile"],
      query: ({
        profileId,
        body,
      }: {
        profileId: string;
        body: unknown;
      }) => ({
        url: `/profile/member-status-change/${profileId}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllBusinessProfileDataQuery,
  useGetBusinessProfileByIdQuery,
  useLazyGetBusinessProfileByIdQuery,
  useLazyGetBusinessDescriptionSuggestionsByPlaceIdQuery,
  useGetAllBusinessProfileQuery,
  useAddBusinessProfileMutation,
  useUpdateBusinessProfileByIdMutation,
  useDeleteBusinessProfileByIdMutation,
  useChangeStatusBusinessProfileByIdMutation,
  useGetAllSubcategoryQuery,
  useGetAllCategoryQuery,
  useGetLaguageQuery,
  useChangeStatusMemberByIdMutation,
} = BusinessProfileApi;
