import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { SeoKeywordListItem } from "../../models/SeoKeyword.model";

export type SeoKeywordSliceStateType = {
  items: SeoKeywordListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedSeoKeywordId: string;
};

const initialState: SeoKeywordSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedSeoKeywordId: "",
};

const seoKeywordSlice: Slice<SeoKeywordSliceStateType> = createSlice({
  name: "seoKeywordSlice",
  initialState,
  reducers: {
    setSeoKeywordItems: (
      state,
      action: PayloadAction<SeoKeywordListItem[]>
    ) => {
      state.items = action.payload;
    },
    setSeoKeywordPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setSeoKeywordRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setSeoKeywordSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setSeoKeywordTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setSeoKeywordIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setSeoKeywordIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setSeoKeywordIsOpenEditDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isOpenEditDialog = action.payload;
    },
    setSelectedSeoKeywordId: (state, action: PayloadAction<string>) => {
      state.selectedSeoKeywordId = action.payload;
    },
  },
});

export const {
  setSeoKeywordItems,
  setSeoKeywordPage,
  setSeoKeywordRowsPerPage,
  setSeoKeywordSearchValue,
  setSeoKeywordTotalItems,
  setSeoKeywordIsTableLoading,
  setSeoKeywordIsOpenAddDialog,
  setSeoKeywordIsOpenEditDialog,
  setSelectedSeoKeywordId,
} = seoKeywordSlice.actions;

export default seoKeywordSlice.reducer;
