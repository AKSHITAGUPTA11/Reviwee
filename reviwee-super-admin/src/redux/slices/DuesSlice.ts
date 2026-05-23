import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type { DuesListItem } from "../../models/Dues.model";

export type DuesSliceStateType = {
  items: DuesListItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  dateFilter: {
    startDate: string;
    endDate: string;
    dateFilterKey: string;
  };
  isOpenFilterModal: boolean;
};

const initialState: DuesSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: true,
  page: 1,
  rowsPerPage: 20,
  searchValue: "",
  dateFilter: {
    startDate: "",
    endDate: "",
    dateFilterKey: "createdAt",
  },
  isOpenFilterModal: false,
};

const duesSlice: Slice<DuesSliceStateType> = createSlice({
  name: "duesSlice",
  initialState,
  reducers: {
    setDuesItems: (state, action: PayloadAction<DuesListItem[]>) => {
      state.items = action.payload;
    },
    setDuesPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setDuesRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 1;
      document.getElementById("scroll-top")?.scrollTo(0, 0);
    },
    setDuesSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      state.page = 1;
    },
    setDuesTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    setDuesIsTableLoading: (state, action: PayloadAction<boolean>) => {
      state.isTableLoading = action.payload;
    },
    setDuesDateFilter: (
      state,
      action: PayloadAction<{
        startDate: string;
        endDate: string;
        dateFilterKey?: string;
      }>
    ) => {
      state.dateFilter = {
        ...state.dateFilter,
        ...action.payload,
      };
      state.page = 1;
    },
    setDuesIsOpenFilterModal: (state, action: PayloadAction<boolean>) => {
      state.isOpenFilterModal = action.payload;
    },
  },
});

export const {
  setDuesItems,
  setDuesPage,
  setDuesRowsPerPage,
  setDuesSearchValue,
  setDuesTotalItems,
  setDuesIsTableLoading,
  setDuesDateFilter,
  setDuesIsOpenFilterModal,
} = duesSlice.actions;

export default duesSlice.reducer;
