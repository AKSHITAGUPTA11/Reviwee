const express = require("express");
const router = express.Router();
const docsRoute = require("./DocRoute");
const config = require("../../config/config");

/* define all routes */
const adminRoute = require("../v1/src/admins/route.admin");
const languageRoute = require("../v1/src/language/route.language");
const configRoute = require("../v1/src/config/route.config");
const categoryRoute = require("../v1/src/category/route.category");
const subCategoryRoute = require("./src/subcategory/route.subcategory");
const revieweFeatureRoute = require("./src/revieweFeature/route.revieweFeature");
const reviewFeatureOptionRoute = require("./src/reviewFeatureOption/route.reviewFeatureOption");
const seoKeywordRoute = require("./src/seoKeyword/route.seoKeyword");
const profileRoute = require("./src/profile/route.profile");
const productRoute = require("./src/product/route.product");
const serviceRoute = require("./src/service/route.service");
const reviewTemplateRoute = require("./src/reviewTemplate/route.reviewTemplate");
const subscriptionPlanRoute = require("./src/subscriptionPlan/route.subscriptionPlan");
const customerSubscriptionRoute = require("./src/customerSubcription/route.customerSubcription");
const transactionRoute = require("../v1/src/transaction/route.transaction");
const reviewsRoute = require("../v1/src/reviews/route.reviews");
const creditConfigRoute = require("../v1/src/creditConfig/route.creditConfig");
const invoiceRoute = require("../v1/src/invoice/route.invoice");
const stateRoute = require("../v1/src/state/route.state");
const googleRoute = require("../v1/helper/google");

const devRoutes = [
  // routes available only in development mode
  {
    path: "/api-docs",
    route: docsRoute,
  },
];
const defaultRoutes = [
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/language",
    route: languageRoute,
  },
  {
    path: "/config",
    route: configRoute,
  },
  {
    path: "/category",
    route: categoryRoute,
  },
  {
    path: "/sub-category",
    route: subCategoryRoute,
  },
  {
    path: "/review-feature",
    route: revieweFeatureRoute,
  },
  {
    path: "/review-feature-option",
    route: reviewFeatureOptionRoute,
  },
  {
    path: "/seo-keyword",
    route: seoKeywordRoute,
  },
  {
    path: "/profile",
    route: profileRoute,
  },
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/service",
    route: serviceRoute,
  },
  {
    path: "/review-template",
    route: reviewTemplateRoute,
  },
  {
    path: "/subscription-plan",
    route: subscriptionPlanRoute,
  },
  {
    path: "/customer-subscription",
    route: customerSubscriptionRoute,
  },
  {
    path: "/transaction",
    route: transactionRoute,
  },
  {
    path: "/reviews",
    route: reviewsRoute,
  },
  {
    path: "/credit-config",
    route: creditConfigRoute,
  },
  {
    path: "/invoice",
    route: invoiceRoute,
  },
  {
    path: "/state",
    route: stateRoute,
  },
  {
    path: "/google",
    route: googleRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
