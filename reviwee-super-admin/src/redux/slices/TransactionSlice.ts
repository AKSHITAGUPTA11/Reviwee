import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { TransactionListItem } from "../../models/Transaction.model";

export type TransactionSliceStateType = {
  items: TransactionListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  dateFilter: {
    startDate: string;
    endDate: string;
    dateFilterKey: string;
  };
  isOpenFilterModal: boolean;
};

const initialState: TransactionSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: true,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  dateFilter: {
    startDate: "",
    endDate: "",
    dateFilterKey: "createdAt",
  },
  isOpenFilterModal: false,
};

const transactionSlice: Slice<TransactionSliceStateType> = createSlice({
  name: "transactionSlice",
  initialState,
  reducers: {
    setTransactionItems: (
      state,
      action: PayloadAction<TransactionListItem[]>
    ) => {
      state.items = action.payload;
    },
    setTransactionPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setTransactionRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setTransactionSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setTransactionTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setTransactionIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setTransactionDateFilter: (
      state,
      action: PayloadAction<{
        startDate: string;
        endDate: string;
        dateFilterKey?: string;
      }>
    ) => {
      state.dateFilter = {
        ...state.dateFilter,
        ...action.payload,
      };
      state.page = 1;
    },
    setTransactionIsOpenFilterModal: (state, action: PayloadAction<boolean>) => {
      state.isOpenFilterModal = action.payload;
    },
  },
});

export const {
  setTransactionItems,
  setTransactionPage,
  setTransactionRowsPerPage,
  setTransactionSearchValue,
  setTransactionTotalItems,
  setTransactionIsTableLoading,
  setTransactionDateFilter,
  setTransactionIsOpenFilterModal,
} = transactionSlice.actions;

export default transactionSlice.reducer;
