import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { SubscriptionPlanListItem } from "../../models/SubscriptionPlan.model";

export type SubscriptionSliceStateType = {
  items: SubscriptionPlanListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
};

const initialState: SubscriptionSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: true,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
};

const subscriptionSlice: Slice<SubscriptionSliceStateType> = createSlice({
  name: "subscriptionSlice",
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<SubscriptionPlanListItem[]>) => {
      state.items = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
  },
});

export const {
  setItems,
  setPage,
  setRowsPerPage,
  setSearchValue,
  setTotalItems,
  setIsTableLoading,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
