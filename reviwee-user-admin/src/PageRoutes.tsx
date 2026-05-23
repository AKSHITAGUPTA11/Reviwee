import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import PageNotFound from "./PageNotFound";
import LoginPageWrapper from "./screens/Login/LoginPageWrapper";
import ForgotPasswordPageWrapper from "./screens/ForgotPassword/ForgotPasswordPageWrapper";
import SignUpPageWrapper from "./screens/SignUp/SignUpPageWrapper";
import AdminDashboardWrapper from "./screens/Dashboard/AdminDashboardWrapper";
import BusinessProfileListingWrapper from "./screens/BusinessProfile/List/BusinessProfileListingWrapper";
import AddBusinessProfilePage from "./screens/BusinessProfile/Add/AddBusinessProfilePage";
import EditBusinessProfilePage from "./screens/BusinessProfile/Edit/EditBusinessProfilePage";
import ViewBusinessProfileWrapper from "./screens/BusinessProfile/View/ViewBusinessProfileWrapper";
import ViewBusinessProfileSeoWrapper from "./screens/BusinessProfile/View/ViewBusinessProfileSeoWrapper";
import ProductsListingWrapper from "./screens/BusinessProfile/Products/List/ProductsListingWrapper";
import ServicesListingWrapper from "./screens/BusinessProfile/Services/List/ServicesListingWrapper";
import SubscriptionListWrapper from "./screens/Subscription/SubscriptionListWrapper";
import OnboardingSubscriptionWrapper from "./screens/Onboarding/Subscription/OnboardingSubscriptionWrapper";
import OnboardingAddBusinessProfileWrapper from "./screens/Onboarding/BusinessProfile/OnboardingAddBusinessProfileWrapper";
import AuthHOC from "./AuthHOC";

/** Old /add and /edit URLs redirect to the listing (inline form lives there). */
const LegacyProductsListingRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/business-profile/view/${id}/products`} replace />;
};

const LegacyServicesListingRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/business-profile/view/${id}/services`} replace />;
};





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
            <Route path="/admin/forgot-password" element={<ForgotPasswordPageWrapper />} />
            <Route path="/signup" element={<SignUpPageWrapper />} />
            <Route
            path="/dashboard"
            element={<AuthHOC component={<AdminDashboardWrapper />} />
            }
          />
            <Route
              path="/business-profile"
              element={ <AuthHOC component={<BusinessProfileListingWrapper />} />
              }
            />
            <Route
              path="/business-profile/add"
              element={<AuthHOC component={<AddBusinessProfilePage />} />}
            />
            <Route
              path="/business-profile/edit/:id"
              element={<AuthHOC component={<EditBusinessProfilePage />} />}
            />
            <Route
              path="/business-profile/view/:id"
              element={ <AuthHOC component={<ViewBusinessProfileWrapper />} />
              }
            />
            <Route
              path="/business-profile/view/:id/services"
              element={ <AuthHOC component={<ServicesListingWrapper />} />
              }
            />
            <Route
              path="/business-profile/view/:id/services/add"
              element={
                <AuthHOC component={<LegacyServicesListingRedirect />} />
              }
            />
            <Route
              path="/business-profile/view/:id/services/edit/:catalogId"
              element={
                <AuthHOC component={<LegacyServicesListingRedirect />} />
              }
            />
            <Route
              path="/business-profile/view/:id/products"
              element={ <AuthHOC component={<ProductsListingWrapper />} />
              }
            />
            <Route
              path="/business-profile/view/:id/products/add"
              element={
                <AuthHOC component={<LegacyProductsListingRedirect />} />
              }
            />
            <Route
              path="/business-profile/view/:id/products/edit/:catalogId"
              element={
                <AuthHOC component={<LegacyProductsListingRedirect />} />
              }
            />
            <Route
              path="/business-profile/view/:id/seo"
              element={ <AuthHOC component={<ViewBusinessProfileSeoWrapper />} />
              }
            />
            <Route
              path="/subscription"
              element={ <AuthHOC component={<SubscriptionListWrapper />} />
              }
            />

            {/* Onboarding routes (no side-nav / no back UI). */}
            <Route
              path="/onboarding/subscription"
              element={<AuthHOC component={<OnboardingSubscriptionWrapper />} />}
            />
            <Route
              path="/onboarding/business-profile-add"
              element={
                <AuthHOC component={<OnboardingAddBusinessProfileWrapper />} />
              }
            />
         
            <Route path="*" element={<PageNotFound />} />
          </Routes>
      </BrowserRouter>
    </>
  );
};

export default PageRoutes;
