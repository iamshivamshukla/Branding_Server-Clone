const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const kycSchema = new Schema({
  kycId: { type: String },
  fullName: { type: String },
  mobileNumber: { type: Number },
  email: { type: String },
  pancard: { type: String },
  pancardNumber: { type: String },
  adharcard: { type: String },
  adharcardNumber: { type: Number },
  status: { type: Array },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("kyc", kycSchema);
