const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const frameRequestSchema = new Schema({
  frameRequestId: { type: String },
  frameRequestDate: { type: String },
  userId: { type: String },
  userName: { type: String },
  userMobileNumber: { type: String },
  isFrameCreated: { type: Boolean },
  frameCompleteUrl: { type: String },
  frameCompleteDate: { type: String },
  frameRequestImage: { type: String },
});

module.exports = mongoose.model("frame-request", frameRequestSchema);
