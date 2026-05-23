// model schema starts here
const { ObjectId } = require("mongodb");
const { userEnum } = require("../../../utils/enumUtils");
const mongoose = require("mongoose");
const { loginTypeEnum } = require("../../../utils/enumUtils");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
    },
    userType: {
      type: String,
      required: true,
      default: userEnum.admin,
    },
    loginType: {
      type: String,
      required: true,
      enum: Object.values(loginTypeEnum), // ["email", "google", "facebook", "apple"]
      default: loginTypeEnum.EMAIL,
    },
    password: {
      type: String,
      default: "",
    },
    dueAmt: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: String,
      default: "",
    },
    gstDetails: {
      type: {
        gstNumber: {
          type: String,
          default: "",
        },
        mobile: {
          type: String,
          default: "",
        },
        address: {
          type: String,
          default: "",
        },
        state: {
          type: String,
          default: "",
        },
        city: {
          type: String,
          default: "",
        },
        pincode: {
          type: String,
          default: "",
        },
      },
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const searchKeys = ["name", "mobile", "email", "createdAt"];
module.exports = mongoose.model("Admin", adminSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
