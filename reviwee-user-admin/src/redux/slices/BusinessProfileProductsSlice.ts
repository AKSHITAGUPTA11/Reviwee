import { createSlice, type PayloadAction, type Slice } from "@reduxjs/toolkit";
import type {
  BusinessProfileProductItem,
  CatalogStatus,
} from "../../models/BusinessProfileProduct.model";

export type BusinessProfileProductsSliceStateType = {
  items: BusinessProfileProductItem[];
  totalItems: number;
  isTableLoading: boolean;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  statusFilter: "ALL" | CatalogStatus;
};

const initialState: BusinessProfileProductsSliceStateType = {
  items: [],
  totalItems: 0,
  isTableLoading: true,
  page: 1,
  rowsPerPage: 10,
  searchValue: "",
  statusFilter: "ALL",
};

const businessProfileProductsSlice: Slice<BusinessProfileProductsSliceStateType> =
  createSlice({
    name: "businessProfileProductsSlice",
    initialState,
    reducers: {
      setProductItems: (
        state,
        action: PayloadAction<BusinessProfileProductItem[]>
      ) => {
        state.items = action.payload;
      },
      setProductTotalItems: (state, action: PayloadAction<number>) => {
        state.totalItems = action.payload;
      },
      setProductsIsTableLoading: (state, action: PayloadAction<boolean>) => {
        state.isTableLoading = action.payload;
      },
      setProductPage: (state, action: PayloadAction<number>) => {
        state.page = action.payload;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setProductRowsPerPage: (state, action: PayloadAction<number>) => {
        state.rowsPerPage = action.payload;
        state.page = 1;
        document.getElementById("scroll-top")?.scrollTo(0, 0);
      },
      setProductSearchValue: (state, action: PayloadAction<string>) => {
        state.searchValue = action.payload;
        state.page = 1;
      },
      setProductStatusFilter: (
        state,
        action: PayloadAction<"ALL" | CatalogStatus>
      ) => {
        state.statusFilter = action.payload;
        state.page = 1;
      },
    },
  });

export const {
  setProductItems,
  setProductTotalItems,
  setProductsIsTableLoading,
  setProductPage,
  setProductRowsPerPage,
  setProductSearchValue,
  setProductStatusFilter,
} = businessProfileProductsSlice.actions;

export default businessProfileProductsSlice.reducer;

