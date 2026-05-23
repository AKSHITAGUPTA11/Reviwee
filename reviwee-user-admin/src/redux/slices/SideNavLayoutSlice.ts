import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type InitialStateType = {
  isCollapsed: boolean;
  expandedIndex:number ;
};

const initialState: InitialStateType = {
  isCollapsed: false,
  expandedIndex:-1
};

const sideNavLayoutSlice: any = createSlice({
  name: "sideNavLayout",
  initialState,
  reducers: {
    setIsCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
    },
    setExpandedIndex: (state, action: PayloadAction<number>) => {
      state.expandedIndex = action.payload;
    },
  },
});

export const { setIsCollapsed , setExpandedIndex } = sideNavLayoutSlice.actions;
export default sideNavLayoutSlice.reducer;
