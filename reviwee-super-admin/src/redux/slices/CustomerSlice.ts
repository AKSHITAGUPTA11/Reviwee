import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { CustomerListItem } from "../../models/Customer.model";

export type CustomerSliceStateType = {
  items: CustomerListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
};

const initialState: CustomerSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: true,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
};

const customerSlice: Slice<CustomerSliceStateType> = createSlice({
  name: "customerSlice",
  initialState,
  reducers: {
    setCustomerItems: (state, action: PayloadAction<CustomerListItem[]>) => {
      state.items = action.payload;
    },
    setCustomerPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setCustomerRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setCustomerSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setCustomerTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setCustomerIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
  },
});

export const {
  setCustomerItems,
  setCustomerPage,
  setCustomerRowsPerPage,
  setCustomerSearchValue,
  setCustomerTotalItems,
  setCustomerIsTableLoading,
} = customerSlice.actions;

export default customerSlice.reducer;
