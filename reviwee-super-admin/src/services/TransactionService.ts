import type { TransactionListPayload } from "../models/Transaction.model";
import apiSlice from "./ApiSlice";

export const TransactionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionList: builder.query({
      providesTags: ["transaction"],
      query: (body: TransactionListPayload) => ({
        url: "/transaction",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetTransactionListQuery } = TransactionApi;
