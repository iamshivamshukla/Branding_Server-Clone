const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const withdrawalSchema = new Schema({
  withdrawalId: { type: String },
  UpiId: { type: String },

  withdrawalAmount: { type: Number },
  bankName: { type: String },
  acNumber: { type: Number },
  acName: { type: String },
  ifsc: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  isWidrawalRequestsSendToBank: { type: Boolean, default: false },
  isWidrawalRequestsMoneyReceive: { type: Boolean, default: false },
  addDate: { type: String}
});

module.exports = mongoose.model("withdrawal", withdrawalSchema);
