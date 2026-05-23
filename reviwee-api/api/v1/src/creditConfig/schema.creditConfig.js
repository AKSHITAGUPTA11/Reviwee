const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const creditConfigSchema = new mongoose.Schema(
  {
    credit: {
      type: Number,
      required: true,
    },
    minWords: {
      type: Number,
      required: true,
    },
    maxWords: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

const searchKeys = ["createdAt"];
module.exports = mongoose.model("CreditConfig", creditConfigSchema);
module.exports.searchKeys = [...searchKeys];
