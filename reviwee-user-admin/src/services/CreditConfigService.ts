import apiSlice from "./ApiSlice";

export const CreditConfigApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCreditConfig: builder.query({
      providesTags: ["creditConfig"],
      query: () => ({
        url: `/credit-config`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllCreditConfigQuery } = CreditConfigApi;
