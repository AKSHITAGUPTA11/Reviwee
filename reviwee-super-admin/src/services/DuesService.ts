import type { DuesListPayload } from "../models/Dues.model";
import apiSlice from "./ApiSlice";

export const DuesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDuesList: builder.query({
      providesTags: ["dues"],
      query: (body: DuesListPayload) => ({
        url: "/admin/dues",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetDuesListQuery } = DuesApi;
