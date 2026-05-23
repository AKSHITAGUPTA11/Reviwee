const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    value: {
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

const searchKeys = ["value", "createdAt"];
module.exports = mongoose.model("Config", configSchema);
module.exports.searchKeys = [...searchKeys];
