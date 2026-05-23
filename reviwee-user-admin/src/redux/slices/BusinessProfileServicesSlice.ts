import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type {
  BusinessProfileServiceItem,
  CatalogStatus,
} from "../../models/BusinessProfileService.model";

export type BusinessProfileServicesSliceStateType = {
  items: BusinessProfileServiceItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  statusFilter: "ALL" | CatalogStatus;
};

const initialState: BusinessProfileServicesSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: true,
  page: 1,
  rowsPerPage: 10,
  searchValue: "",
  statusFilter: "ALL",
};

const businessProfileServicesSlice: Slice<BusinessProfileServicesSliceStateType> =
  createSlice({
    name: "businessProfileServicesSlice",
    initialState,
    reducers: {
      setServiceItems: (
        state,
        action: PayloadAction<BusinessProfileServiceItem[]>
      ) => {
        state.items = action.payload;
      },
      setServiceTotalItems: (state, action: PayloadAction<number>) => {
        state.totalItems = action.payload;
      },
      setServicesIsTableLoading: (state, action: PayloadAction<boolean>) => {
        state.isTableLoading = action.payload;
      },
      setServicePage: (state, action: PayloadAction<number>) => {
        state.page = action.payload;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setServiceRowsPerPage: (state, action: PayloadAction<number>) => {
        state.rowsPerPage = action.payload;
        state.page = 1;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setServiceSearchValue: (state, action: PayloadAction<string>) => {
        state.searchValue = action.payload;
        state.page = 1;
      },
      setServiceStatusFilter: (
        state,
        action: PayloadAction<"ALL" | CatalogStatus>
      ) => {
        state.statusFilter = action.payload;
        state.page = 1;
      },
    },
  });

export const {
  setServiceItems,
  setServiceTotalItems,
  setServicesIsTableLoading,
  setServicePage,
  setServiceRowsPerPage,
  setServiceSearchValue,
  setServiceStatusFilter,
} = businessProfileServicesSlice.actions;

export default businessProfileServicesSlice.reducer;

