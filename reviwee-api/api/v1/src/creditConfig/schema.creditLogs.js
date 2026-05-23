const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const creditLogSchema = new mongoose.Schema(
  {
    profileId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    previousCredits: {
      type: Number,
      required: true,
    },
    deductedCredits: {
      type: Number,
      required: true,
    },
    remainingCredits: {
      type: Number,
      required: true,
    },
    actionType: {
      type: String,
      enum: ["REVIEW_GENERATE", "REVIEW_REUSE", "REVIEW_FALLBACK_DB"],
      required: true,
    },
    reviewId: {
      type: ObjectId,
      default: null,
    },
    description: {
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

module.exports = mongoose.model("CreditLog", creditLogSchema);
