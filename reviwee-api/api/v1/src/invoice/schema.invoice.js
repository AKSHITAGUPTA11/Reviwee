const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    invoiceDate: {
      type: String,
      required: true,
    },
    customerSubscriptionId: {
      type: ObjectId,
      required: true,
    },
    planName: {
      type: String,
      default: "",
      trim: true,
    },
    planPrice: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    gstDetails: {
      type: {
        gstNumber: {
          type: String,
          required: true,
        },
        mobile: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        pincode: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    gstBreakup: {
      type: Object,
      required: true,
    },
    invoiceSellerDetails: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const searchKeys = ["userName", "createdAt"];
module.exports.searchKeys = [...searchKeys];
module.exports = mongoose.model("invoice", invoiceSchema);
