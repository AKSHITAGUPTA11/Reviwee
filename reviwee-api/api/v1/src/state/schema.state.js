const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const stateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
  },
});

const searchKeys = ["state"];
module.exports = mongoose.model("state", stateSchema);
module.exports.searchKeys = [...searchKeys];
