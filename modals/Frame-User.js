const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const frame_userSchema = new Schema({
  frame_userId: { type: String },
  userId: { type: String },
  fullName_user: { type: String },
  mobileNumber_user: { type: Number },
  savedFrame_user: { type: String },
  savedFrameLayer_user: { type: Object, required: true },
});

module.exports = mongoose.model("frame_user", frame_userSchema);
