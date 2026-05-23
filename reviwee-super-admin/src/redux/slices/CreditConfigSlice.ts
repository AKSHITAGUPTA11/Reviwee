import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { CreditConfigListItem } from "../../models/CreditConfig.model";

export type CreditConfigSliceStateType = {
  items: CreditConfigListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedCreditConfigId: string;
};

const initialState: CreditConfigSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: false,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedCreditConfigId: "",
};

const creditConfigSlice: Slice<CreditConfigSliceStateType> = createSlice({
  name: "creditConfigSlice",
  initialState,
  reducers: {
    setCreditConfigItems: (state, action: PayloadAction<CreditConfigListItem[]>) => {
      state.items = action.payload;
    },
    setCreditConfigPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setCreditConfigRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setCreditConfigSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setCreditConfigTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setCreditConfigIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setCreditConfigIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setCreditConfigIsOpenEditDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenEditDialog = action.payload;
    },
    setSelectedCreditConfigId: (state, action: PayloadAction<string>) => {
      state.selectedCreditConfigId = action.payload;
    },
  },
});

export const {
  setCreditConfigItems,
  setCreditConfigPage,
  setCreditConfigRowsPerPage,
  setCreditConfigSearchValue,
  setCreditConfigTotalItems,
  setCreditConfigIsTableLoading,
  setCreditConfigIsOpenAddDialog,
  setCreditConfigIsOpenEditDialog,
  setSelectedCreditConfigId,
} = creditConfigSlice.actions;

export default creditConfigSlice.reducer;
