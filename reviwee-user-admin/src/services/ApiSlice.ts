import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {Mutex} from "async-mutex"
import { v4 as uuid } from "uuid";
import {
  authTokenKeyName,
  clearLocalStorage,
  refreshTokenKeyName,
} from "../utils/configs/authConfig";
import { setAccessToken, setRefreshToken } from "../redux/slices/AuthSlice";
import { BASE_URL } from "../utils/constants";
import type { RootState } from "../redux/store";

const mutex = new Mutex();
const deviceId = localStorage.getItem("deviceId") || uuid();

const tagTypes = [
  "admin",
  "template",
  "onboarding",
  "review",
  "patient",
  "businessProfile",
  "subscriptionPlan",
  "creditConfig"
] as const;

const baseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}`,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token =
      (getState() as RootState)?.auth?.accessToken ||
      localStorage.getItem(authTokenKeyName);
    if (token && endpoint !== "getAccessModules") {
      headers.set("x-access-token", token);
    }
    return headers;
  },
});

type RefreshResponse = {
  data: {
    token: string;
    refreshToken: string;
    name?: string;
    mobile?: string;
    email?: string;
    userId?: string;
  };
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          {
            url: "/admin/refresh",
            method: "POST",
            headers: {
              "device-id": deviceId,
            },
            body: { refreshToken: localStorage.getItem(refreshTokenKeyName) },
          },
          api,
          extraOptions
        );

        if (
          refreshResult?.error &&
          (refreshResult.error.status === 400 ||
            refreshResult.error.status === 500)
        ) {
          clearLocalStorage();
          window.location.replace("/");
        }

        if (refreshResult?.data) {
          const refreshData = refreshResult.data as RefreshResponse;

          localStorage.setItem(authTokenKeyName, refreshData.data.token);
          localStorage.setItem(
            refreshTokenKeyName,
            refreshData.data.refreshToken
          );

          api.dispatch(setAccessToken(refreshData.data.token));
          api.dispatch(setRefreshToken(refreshData.data.refreshToken));

          result = await baseQuery(args, api, extraOptions);
        } else {
          clearLocalStorage();
          window.location.replace("/");
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReauth,
  tagTypes: tagTypes,
  endpoints: () => ({}),
});

export default apiSlice;
