const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const serviceSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    serviceName: {
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

const searchKeys = ["serviceName", "createdAt"];
module.exports = mongoose.model("service", serviceSchema);
module.exports.searchKeys = [...searchKeys];
