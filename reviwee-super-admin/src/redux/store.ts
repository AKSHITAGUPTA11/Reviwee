import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./slices/AuthSlice";
import UserSlice from "./slices/UserSlice";
import apiSlice from "../services/ApiSlice";
import "../services/CategoryService";
import "../services/SubcategoryService";
import "../services/SubscriptionPlanService";
import "../services/ReviewFeatureService";
import "../services/ReviewFeatureOptionService";
import "../services/SeoKeywordService";
import "../services/CustomerService";
import "../services/CustomerSubscriptionService";
import "../services/TransactionService";
import "../services/DuesService";
import "../services/LanguageService";
import "../services/CreditConfigService";
import { setupListeners } from "@reduxjs/toolkit/query";
import SideNavLayoutSlice from "./slices/SideNavLayoutSlice";
import CustomerSlice from "./slices/CustomerSlice";
import CategorySlice from "./slices/CategorySlice";
import SubcategorySlice from "./slices/SubcategorySlice";
import ReviewFeatureSlice from "./slices/ReviewFeatureSlice";
import ReviewFeatureOptionSlice from "./slices/ReviewFeatureOptionSlice";
import SeoKeywordSlice from "./slices/SeoKeywordSlice";
import SubscriptionPlanSlice from "./slices/SubscriptionPlanSlice";
import TransactionSlice from "./slices/TransactionSlice";
import DuesSlice from "./slices/DuesSlice";
import LanguageSlice from "./slices/LanguageSlice";
import CreditConfigSlice from "./slices/CreditConfigSlice";

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    user: UserSlice,
    customer: CustomerSlice,
    category: CategorySlice,
    subcategory: SubcategorySlice,
    reviewFeature: ReviewFeatureSlice,
    reviewFeatureOption: ReviewFeatureOptionSlice,
    seoKeyword: SeoKeywordSlice,
    subscriptionPlan: SubscriptionPlanSlice,
    transaction: TransactionSlice,
    dues: DuesSlice,
    language: LanguageSlice,
    creditConfig: CreditConfigSlice,
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
