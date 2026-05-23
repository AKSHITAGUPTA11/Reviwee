const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { genderEnum } = require("../../../utils/enumUtils");

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    default: "",
    trim: true,
  },
  localLocationAliases: {
    type: [String],
    default: [],
    trim: true,
  },
});

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    categoryId: {
      type: ObjectId,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    subCategoryId: {
      type: ObjectId,
      required: true,
    },
    subCategoryName: {
      type: String,
      required: true,
    },
    ownerLabel: {
      type: String,
      default: "",
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      trim: true,
    },
    businessDisplayName: {
      type: String,
      required: true,
      trim: true,
    },
    businessDescription: {
      type: String,
      default: "",
      trim: true,
    },
    googleBusinessLink: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: addressSchema,
      default: {},
    },
    businessAliases: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    creditConfigId: {
      type: ObjectId,
      default: null,
    },
    perRequestCredit: {
      type: Number,
      default: 0,
    },
    minWords: {
      type: Number,
      default: 0,
    },
    maxWords: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    remainingCredits: {
      type: Number,
      default: 0,
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    languages: {
      type: [
        {
          languageName: {
            type: String,
            required: true,
          },
          languageDescription: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },
    owner: {
      type: [
        {
          name: {
            type: String,
            default: "",
          },
          aliases: {
            type: [String],
            default: [],
          },
          gender: {
            type: String,
            enum: [...Object.values(genderEnum)],
          },
          description: {
            type: String,
            default: "",
            trim: true,
          },
          isActive: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
    },
    staff: {
      type: [
        {
          name: {
            type: String,
            default: "",
          },
          gender: {
            type: String,
            enum: [...Object.values(genderEnum)],
          },
          description: {
            type: String,
            default: "",
            trim: true,
          },
          isActive: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
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
  {
    timestamps: true,
  },
);

const searchKeys = ["businessDisplayName", "createdAt"];
module.exports = mongoose.model("Profile", profileSchema);
module.exports.searchKeys = [...searchKeys];

