import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Slice } from "@reduxjs/toolkit";
import { authTokenKeyName, refreshTokenKeyName } from "../../utils/configs/authConfig";


export type userData = {
  email: string;
  fullName: string;
  mobile: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  userType: string;
};

export interface AuthSLiceStateType {
  accessToken: string | null;
  refreshToken: string | null;
  userAccess: string | null;
  userData: userData | null;
}

const initialState: AuthSLiceStateType = {
  accessToken: localStorage.getItem(authTokenKeyName) || null,
  refreshToken: localStorage.getItem(refreshTokenKeyName) || null,
  userAccess: null,
  userData: null,
};

const authSlice: Slice<AuthSLiceStateType> = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
    },

    /** Full sign-out: do not reuse module `initialState` (it snapshots localStorage at import time). */
    resetState: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userAccess = null;
      state.userData = null;
    },
    setUserAccess: (state, action: PayloadAction<string | null>) => {
      state.userAccess = action.payload;
    },
    setUserData: (state, action: PayloadAction<userData | null>) => {
      state.userData = action.payload;
    },
  },
});

export const {
  setAccessToken,
  setRefreshToken,
  resetState,
  setUserAccess,
  setUserData,
} = authSlice.actions;
export default authSlice.reducer;
