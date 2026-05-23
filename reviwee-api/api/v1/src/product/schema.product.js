const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const productSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
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

const searchKeys = ["productName", "createdAt"];
module.exports = mongoose.model("Product", productSchema);
module.exports.searchKeys = [...searchKeys];
