const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const invoiceConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
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

const searchKeys = ["value", "createdAt"];
module.exports = mongoose.model("InvoiceConfig", invoiceConfigSchema);
module.exports.searchKeys = [...searchKeys];
