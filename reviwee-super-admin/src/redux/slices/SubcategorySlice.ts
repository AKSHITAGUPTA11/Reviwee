import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { SubcategoryListItem } from "../../models/Subcategory.model";

export type SubcategorySliceStateType = {
  items: SubcategoryListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedSubcategoryId: string;
};

const initialState: SubcategorySliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedSubcategoryId: "",
};

const subcategorySlice: Slice<SubcategorySliceStateType> = createSlice({
  name: "subcategorySlice",
  initialState,
  reducers: {
    setSubcategoryItems: (state, action: PayloadAction<SubcategoryListItem[]>) => {
      state.items = action.payload;
    },
    setSubcategoryPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setSubcategoryRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setSubcategorySearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setSubcategoryTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setSubcategoryIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setSubcategoryIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setSubcategoryIsOpenEditDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenEditDialog = action.payload;
    },
    setSelectedSubcategoryId: (state, action: PayloadAction<string>) => {
      state.selectedSubcategoryId = action.payload;
    },
  },
});

export const {
  setSubcategoryItems,
  setSubcategoryPage,
  setSubcategoryRowsPerPage,
  setSubcategorySearchValue,
  setSubcategoryTotalItems,
  setSubcategoryIsTableLoading,
  setSubcategoryIsOpenAddDialog,
  setSubcategoryIsOpenEditDialog,
  setSelectedSubcategoryId,
} = subcategorySlice.actions;

export default subcategorySlice.reducer;
