const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const languageSchema = new mongoose.Schema(
  {
    languageName: {
      type: String,
      required: true,
    },
    languageDescription: {
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

const searchKeys = ["languageName", "createdAt"];
module.exports = mongoose.model("Language", languageSchema);
module.exports.searchKeys = [...searchKeys];
