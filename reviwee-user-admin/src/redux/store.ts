import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./slices/AuthSlice";
import UserSlice from "./slices/UserSlice";
import apiSlice from "../services/ApiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import SideNavLayoutSlice from "./slices/SideNavLayoutSlice";
import BusinessProfileSlice from "./slices/BusinessProfileSlice";
import SubscriptionSlice from "./slices/SubscriptionSlice";
import BusinessProfileProductsSlice from "./slices/BusinessProfileProductsSlice";
import BusinessProfileServicesSlice from "./slices/BusinessProfileServicesSlice";

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    user: UserSlice,
    businessProfile: BusinessProfileSlice,
    businessProfileProducts: BusinessProfileProductsSlice,
    businessProfileServices: BusinessProfileServicesSlice,
    subscription: SubscriptionSlice,
    sideNavLayout: SideNavLayoutSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([
      apiSlice.middleware,
    ]),
});

setupListeners(store.dispatch);
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
