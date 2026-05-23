import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { CategoryListItem } from "../../models/Category.model";

export type CategorySliceStateType = {
  items: CategoryListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedCategoryId: string;
};

const initialState: CategorySliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedCategoryId: "",
};

const categorySlice: Slice<CategorySliceStateType> = createSlice({
  name: "categorySlice",
  initialState,
  reducers: {
    setCategoryItems: (state, action: PayloadAction<CategoryListItem[]>) => {
      state.items = action.payload;
    },
    setCategoryPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setCategoryRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setCategorySearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setCategoryTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setCategoryIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setCategoryIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setCategoryIsOpenEditDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenEditDialog = action.payload;
    },
    setSelectedCategoryId: (state, action: PayloadAction<string>) => {
      state.selectedCategoryId = action.payload;
    },
  },
});

export const {
  setCategoryItems,
  setCategoryPage,
  setCategoryRowsPerPage,
  setCategorySearchValue,
  setCategoryTotalItems,
  setCategoryIsTableLoading,
  setCategoryIsOpenAddDialog,
  setCategoryIsOpenEditDialog,
  setSelectedCategoryId,
} = categorySlice.actions;

export default categorySlice.reducer;
