import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { SubscriptionPlanListItem } from "../../models/SubscriptionPlan.model";

export type SubscriptionPlanSliceStateType = {
  items: SubscriptionPlanListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedSubscriptionPlanId: string;
};

const initialState: SubscriptionPlanSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedSubscriptionPlanId: "",
};

const subscriptionPlanSlice: Slice<SubscriptionPlanSliceStateType> =
  createSlice({
    name: "subscriptionPlanSlice",
    initialState,
    reducers: {
      setSubscriptionPlanItems: (
        state,
        action: PayloadAction<SubscriptionPlanListItem[]>
      ) => {
        state.items = action.payload;
      },
      setSubscriptionPlanPage: (state, action: PayloadAction<number>) => {
        state.page = action.payload;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setSubscriptionPlanRowsPerPage: (state, action: PayloadAction<number>) => {
        state.rowsPerPage = action.payload;
        state.page = 1;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setSubscriptionPlanSearchValue: (state, action: PayloadAction<string>) => {
        state.searchValue = action.payload;
        state.page = 1;
      },
      setSubscriptionPlanTotalItems: (state, action: PayloadAction<number>) => {
        state.totalItems = action.payload;
      },
      setSubscriptionPlanIsTableLoading: (
        state,
        action: PayloadAction<boolean>
      ) => {
        state.isTableLoading = action.payload;
      },
      setSubscriptionPlanIsOpenAddDialog: (
        state,
        action: PayloadAction<boolean>
      ) => {
        state.isOpenAddDialog = action.payload;
      },
      setSubscriptionPlanIsOpenEditDialog: (
        state,
        action: PayloadAction<boolean>
      ) => {
        state.isOpenEditDialog = action.payload;
      },
      setSelectedSubscriptionPlanId: (state, action: PayloadAction<string>) => {
        state.selectedSubscriptionPlanId = action.payload;
      },
    },
  });

export const {
  setSubscriptionPlanItems,
  setSubscriptionPlanPage,
  setSubscriptionPlanRowsPerPage,
  setSubscriptionPlanSearchValue,
  setSubscriptionPlanTotalItems,
  setSubscriptionPlanIsTableLoading,
  setSubscriptionPlanIsOpenAddDialog,
  setSubscriptionPlanIsOpenEditDialog,
  setSelectedSubscriptionPlanId,
} = subscriptionPlanSlice.actions;

export default subscriptionPlanSlice.reducer;
