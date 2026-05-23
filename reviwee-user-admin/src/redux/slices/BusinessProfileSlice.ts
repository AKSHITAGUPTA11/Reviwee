import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { BusinessProfileListItem } from "../../models/BusinessProfile.model";

export type BusinessProfileSliceStateType = {
  items: BusinessProfileListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  sortValue: { field: string; value: "DESC" | "ASC" };
  filterBy: { fieldName: string; value: string[] }[];
  dateFilter: { start_date: string | null; end_date: string | null };
  isOpenAddDialog: boolean;
  isOpenEditDialog: boolean;
  selectedBusinessId: string;
};

const initialState: BusinessProfileSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: true,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  sortValue: { field: "createdAt", value: "DESC" },
  filterBy: [],
  dateFilter: { start_date: null, end_date: null },
  isOpenAddDialog: false,
  isOpenEditDialog: false,
  selectedBusinessId: "",
};

const businessProfileSlice: Slice<BusinessProfileSliceStateType> = createSlice({
  name: "businessProfileSlice",
  initialState,
  reducers: {
    setBusinessItems: (state, action: PayloadAction<BusinessProfileListItem[]>) => {
      state.items = action.payload;
    },
    setBusinessPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setBusinessRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setBusinessSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setBusinessSortValue: (
      state,
      action: PayloadAction<{ field: string; value: "DESC" | "ASC" }>
    ) => {
      state.sortValue = action.payload;
      state.page = 1;
    },
    setBusinessTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setBusinessIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setBusinessFilterBy: (
      state,
      action: PayloadAction<{ fieldName: string; value: string[] }[]>
    ) => {
      state.filterBy = action.payload;
      state.page = 1;
    },
    setBusinessDateFilter: (
      state,
      action: PayloadAction<{ start_date: string | null; end_date: string | null }>
    ) => {
      state.dateFilter = action.payload;
    },
    setBusinessIsOpenAddDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenAddDialog = action.payload;
    },
    setBusinessIsOpenEditDialog: (state, action: PayloadAction<boolean>) => {
      state.isOpenEditDialog = action.payload;
    },
    setSelectedBusinessId: (state, action: PayloadAction<string>) => {
      state.selectedBusinessId = action.payload;
    },
  },
});

export const {
  setBusinessItems,
  setBusinessPage,
  setBusinessRowsPerPage,
  setBusinessSearchValue,
  setBusinessSortValue,
  setBusinessTotalItems,
  setBusinessIsTableLoading,
  setBusinessFilterBy,
  setBusinessDateFilter,
  setBusinessIsOpenAddDialog,
  setBusinessIsOpenEditDialog,
  setSelectedBusinessId,
} = businessProfileSlice.actions;

export default businessProfileSlice.reducer;
