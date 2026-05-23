import { BrowserRouter, Route, Routes } from "react-router-dom";
import { v4 as uuid } from "uuid";
import PageNotFound from "./PageNotFound";
import LoginPageWrapper from "./screens/Login/LoginPageWrapper";
import AdminDashboardWrapper from "./screens/Dashboard/AdminDashboardWrapper";
import CustomerListingWrapper from "./screens/Customer/List/CustomerListingWrapper";
import ViewCustomerWrapper from "./screens/Customer/View/ViewCustomerWrapper";
import SubscriptionListingWrapper from "./screens/Subscription/List/SubscriptionListingWrapper";
import ViewSubscriptionPlanWrapper from "./screens/Subscription/View/ViewSubscriptionPlanWrapper";
import CategoryListingWrapper from "./screens/Category/List/CategoryListingWrapper";
import SubcategoryListingWrapper from "./screens/Subcategory/List/SubcategoryListingWrapper";
import ReviewFeatureListingWrapper from "./screens/ReviewFeature/List/ReviewFeatureListingWrapper";
import ReviewFeatureManageWrapper from "./screens/ReviewFeature/ReviewFeatureManage/ReviewFeatureManageWrapper";
import ReviewFeatureOptionListingWrapper from "./screens/ReviewFeatureOption/List/ReviewFeatureOptionListingWrapper";
import SeoKeywordListingWrapper from "./screens/SeoKeyword/List/SeoKeywordListingWrapper";
import TransactionListingWrapper from "./screens/Transaction/List/TransactionListingWrapper";
import DuesListingWrapper from "./screens/Dues/List/DuesListingWrapper";
import ViewCategoryWrapper from "./screens/Category/View/ViewCategoryWrapper";
import ViewSubcategoryWrapper from "./screens/Subcategory/View/ViewSubcategoryWrapper";
import ViewReviewFeatureWrapper from "./screens/ReviewFeature/View/ViewReviewFeatureWrapper";
import ViewReviewFeatureOptionWrapper from "./screens/ReviewFeatureOption/View/ViewReviewFeatureOptionWrapper";
import ViewSeoKeywordWrapper from "./screens/SeoKeyword/View/ViewSeoKeywordWrapper";
import LanguageListingWrapper from "./screens/Language/List/LanguageListingWrapper";
import CreditConfigListingWrapper from "./screens/CreditConfig/List/CreditConfigListingWrapper";
import AuthHOC from "./AuthHOC";





const PageRoutes = () => {
  const deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    localStorage.setItem("deviceId", uuid());
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPageWrapper />} />
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
          <Route
            path="/dashboard"
            element={<AuthHOC component={<AdminDashboardWrapper />} />
            }
          />
          <Route
            path="/customer"
            element={<AuthHOC component={<CustomerListingWrapper />} />
            }
          />
          <Route
            path="/customer/view/:id"
            element={<AuthHOC component={<ViewCustomerWrapper />} />
            }
          />
          <Route
            path="/subscription"
            element={<AuthHOC component={<SubscriptionListingWrapper />} />
            }
          />
          <Route
            path="/subscription/view/:id"
            element={<AuthHOC component={<ViewSubscriptionPlanWrapper />} />
            }
          />
          <Route
            path="/transaction"
            element={<AuthHOC component={<TransactionListingWrapper />} />
            }
          />
          <Route
            path="/admin/dues"
            element={<AuthHOC component={<DuesListingWrapper />} />
            }
          />
          <Route
            path="/category"
            element={<AuthHOC component={<CategoryListingWrapper />} />
            }
          />
          <Route
            path="/category/view/:id"
            element={<AuthHOC component={<ViewCategoryWrapper />} />
            }
          />
          <Route
            path="/subcategory"
            element={<AuthHOC component={<SubcategoryListingWrapper />} />
            }
          />
          <Route
            path="/subcategory/view/:id"
            element={<AuthHOC component={<ViewSubcategoryWrapper />} />
            }
          />
          <Route
            path="/review-feature"
            element={<AuthHOC component={<ReviewFeatureListingWrapper />} />
            }
          />
          <Route
            path="/review-feature/manage"
            element={<AuthHOC component={<ReviewFeatureManageWrapper />} />
            }
          />
          <Route
            path="/review-feature/view/:id"
            element={<AuthHOC component={<ViewReviewFeatureWrapper />} />
            }
          />
          <Route
            path="/review-feature-option"
            element={<AuthHOC component={<ReviewFeatureOptionListingWrapper />} />
            }
          />
          <Route
            path="/review-feature-option/view/:id"
            element={<AuthHOC component={<ViewReviewFeatureOptionWrapper />} />
            }
          />
          <Route
            path="/seo-keywords"
            element={<AuthHOC component={<SeoKeywordListingWrapper />} />
            }
          />
          <Route
            path="/seo-keywords/view/:id"
            element={<AuthHOC component={<ViewSeoKeywordWrapper />} />
            }
          />
          <Route
            path="/language"
            element={<AuthHOC component={<LanguageListingWrapper />} />}
          />
          <Route
            path="/credit-config"
            element={<AuthHOC component={<CreditConfigListingWrapper />} />}
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default PageRoutes;
