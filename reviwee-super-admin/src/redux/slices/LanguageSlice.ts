import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { LanguageListItem } from "../../models/Language.model";

export type LanguageSliceStateType = {
  items: LanguageListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedLanguageId: string;
};

const initialState: LanguageSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedLanguageId: "",
};

const languageSlice: Slice<LanguageSliceStateType> = createSlice({
  name: "languageSlice",
  initialState,
  reducers: {
    setLanguageItems: (state, action: PayloadAction<LanguageListItem[]>) => {
      state.items = action.payload;
    },
    setLanguagePage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setLanguageRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setLanguageSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setLanguageTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setLanguageIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setLanguageIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setLanguageIsOpenEditDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenEditDialog = action.payload;
    },
    setSelectedLanguageId: (state, action: PayloadAction<string>) => {
      state.selectedLanguageId = action.payload;
    },
  },
});

export const {
  setLanguageItems,
  setLanguagePage,
  setLanguageRowsPerPage,
  setLanguageSearchValue,
  setLanguageTotalItems,
  setLanguageIsTableLoading,
  setLanguageIsOpenAddDialog,
  setLanguageIsOpenEditDialog,
  setSelectedLanguageId,
} = languageSlice.actions;

export default languageSlice.reducer;
