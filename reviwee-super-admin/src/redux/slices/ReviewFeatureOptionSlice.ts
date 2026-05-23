import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { ReviewFeatureOptionListItem } from "../../models/ReviewFeatureOption.model";

export type ReviewFeatureOptionSliceStateType = {
  items: ReviewFeatureOptionListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedReviewFeatureOptionId: string;
};

const initialState: ReviewFeatureOptionSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedReviewFeatureOptionId: "",
};

const reviewFeatureOptionSlice: Slice<ReviewFeatureOptionSliceStateType> =
  createSlice({
    name: "reviewFeatureOptionSlice",
    initialState,
    reducers: {
      setReviewFeatureOptionItems: (
        state,
        action: PayloadAction<ReviewFeatureOptionListItem[]>
      ) => {
        state.items = action.payload;
      },
      setReviewFeatureOptionPage: (state, action: PayloadAction<number>) => {
        state.page = action.payload;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setReviewFeatureOptionRowsPerPage: (
        state,
        action: PayloadAction<number>
      ) => {
        state.rowsPerPage = action.payload;
        state.page = 1;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setReviewFeatureOptionSearchValue: (
        state,
        action: PayloadAction<string>
      ) => {
        state.searchValue = action.payload;
        state.page = 1;
      },
      setReviewFeatureOptionTotalItems: (
        state,
        action: PayloadAction<number>
      ) => {
        state.totalItems = action.payload;
      },
      setReviewFeatureOptionIsTableLoading: (
        state,
        action: PayloadAction<boolean>
      ) => {
        state.isTableLoading = action.payload;
      },
      setReviewFeatureOptionIsOpenAddDialog: (
        state,
        action: PayloadAction<boolean>
      ) => {
        state.isOpenAddDialog = action.payload;
      },
      setReviewFeatureOptionIsOpenEditDialog: (
        state,
        action: PayloadAction<boolean>
      ) => {
        state.isOpenEditDialog = action.payload;
      },
      setSelectedReviewFeatureOptionId: (
        state,
        action: PayloadAction<string>
      ) => {
        state.selectedReviewFeatureOptionId = action.payload;
      },
    },
  });

export const {
  setReviewFeatureOptionItems,
  setReviewFeatureOptionPage,
  setReviewFeatureOptionRowsPerPage,
  setReviewFeatureOptionSearchValue,
  setReviewFeatureOptionTotalItems,
  setReviewFeatureOptionIsTableLoading,
  setReviewFeatureOptionIsOpenAddDialog,
  setReviewFeatureOptionIsOpenEditDialog,
  setSelectedReviewFeatureOptionId,
} = reviewFeatureOptionSlice.actions;

export default reviewFeatureOptionSlice.reducer;
