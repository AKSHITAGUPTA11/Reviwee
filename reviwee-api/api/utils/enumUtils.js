const { object } = require("joi");

//token types
const tokenEnum = Object.freeze({ login: "LOGIN", otpverify: "OTP_VERIFY" });

//file types
const allFileEnum = Object.freeze({
  image: "IMAGE",
  document: "DOCUMENT",
  video: "VIDEO",
});

//user types
const userEnum = Object.freeze({
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
});

//gender types
const genderEnum = Object.freeze({
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
});

//lo0gin types
const loginTypeEnum = {
  EMAIL: "email", // normal email/password login
  GOOGLE: "google", // Google SSO
  FACEBOOK: "facebook", // Facebook SSO
  APPLE: "apple", // Apple SSO
  ANDROID: "android", // Android native login
};

//duration types
const planDurationEnum = Object.freeze({
  weekly: "WEEKLY",
  monthly: "MONTHLY",
  quarterly: "QUARTERLY",
  halfYearly: "HALF_YEARLY",
  yearly: "YEARLY",
});

//discount types
const discountTypeEnum = Object.freeze({
  percentage: "PERCENTAGE",
  flat: "FLAT",
  none: "NONE",
});

//ledger type
const ledgertypeEnum = Object.freeze({
  debit: "DEBIT",
  credit: "CREDIT",
});

//payment methods
const paymentMethod = Object.freeze({
  offline: "OFFLINE",
  razorpay: "RAZORPAY",
  free: "FREE",
});

//transaction status
const transactionStatus = Object.freeze({
  success: "SUCCESS",
  failed: "FAILED",
  pending: "PENDING",
});

//plan status
const planStatusEnum = Object.freeze({
  active: "ACTIVE",
  expired: "EXPIRED",
  pending: "PENDING",
});

//variable enum
const variableEnum = Object.freeze({
  businessName: "{{BUSINESS_NAME}}",
  productName: "{{PRODUCT_NAME}}",
  serviceName: "{{SERVICE_NAME}}",
  ownerName: "{{OWNER_NAME}}",
  ownerGender: "{{OWNER_GENDER}}",
  staffName: "{{STAFF_NAME}}",
  staffGender: "{{STAFF_GENDER}}",
  location: "{{LOCATION}}",
});

//export enums
module.exports = {
  tokenEnum,
  allFileEnum,
  userEnum,
  genderEnum,
  loginTypeEnum,
  planDurationEnum,
  discountTypeEnum,
  ledgertypeEnum,
  paymentMethod,
  transactionStatus,
  planStatusEnum,
  variableEnum,
};
