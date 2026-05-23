const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const reviewsSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    profileId: {
      type: ObjectId,
      required: true,
    },
    reviewsText: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      trim: true,
      default: "",
    },
    productName: {
      type: String,
      trim: true,
      default: "",
    },
    ownerName: {
      type: String,
      trim: true,
      default: "",
    },
    language: {
      type: String,
      trim: true,
      default: "",
    },
    writerGender: {
      type: String,
      trim: true,
      default: "",
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAtTime: {
      type: String,
      default: "",
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

const searchKeys = ["reviewsName", "createdAt"];
module.exports = mongoose.model("reviews", reviewsSchema);
module.exports.searchKeys = [...searchKeys];
