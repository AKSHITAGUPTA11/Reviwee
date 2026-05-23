import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { ReviewFeatureListItem } from "../../models/ReviewFeature.model";

export type ReviewFeatureSliceStateType = {
  items: ReviewFeatureListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedReviewFeatureId: string;
};

const initialState: ReviewFeatureSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedReviewFeatureId: "",
};

const reviewFeatureSlice: Slice<ReviewFeatureSliceStateType> = createSlice({
  name: "reviewFeatureSlice",
  initialState,
  reducers: {
    setReviewFeatureItems: (
      state,
      action: PayloadAction<ReviewFeatureListItem[]>
    ) => {
      state.items = action.payload;
    },
    setReviewFeaturePage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setReviewFeatureRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setReviewFeatureSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setReviewFeatureTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setReviewFeatureIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setReviewFeatureIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setReviewFeatureIsOpenEditDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isOpenEditDialog = action.payload;
    },
    setSelectedReviewFeatureId: (state, action: PayloadAction<string>) => {
      state.selectedReviewFeatureId = action.payload;
    },
  },
});

export const {
  setReviewFeatureItems,
  setReviewFeaturePage,
  setReviewFeatureRowsPerPage,
  setReviewFeatureSearchValue,
  setReviewFeatureTotalItems,
  setReviewFeatureIsTableLoading,
  setReviewFeatureIsOpenAddDialog,
  setReviewFeatureIsOpenEditDialog,
  setSelectedReviewFeatureId,
} = reviewFeatureSlice.actions;

export default reviewFeatureSlice.reducer;
