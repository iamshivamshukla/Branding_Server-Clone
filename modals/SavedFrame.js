const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const savedFrameSchema = new Schema({
  savedFrameId: { type: String },
  mobileNumber: { type: Number },
  userId: { type: String },
  savedFrame: { type: Array },
  image: { type: String },
  name: { type: String },
});

module.exports = mongoose.model("saved-frame", savedFrameSchema);
