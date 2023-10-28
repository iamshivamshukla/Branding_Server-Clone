const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymenstStatusSchema = new Schema({
  PaymentStatusId: { type: String },
  transactionImage: { type: String },
  transactionDate: { type: String },
  transactionTime: { type: String },
  fullName: { type: String },
  mobileNumber: { type: String },
  email: { type: String },
  adhaar: { type: String },
  isPayment: { type: Boolean, default: false },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("payment-status", paymenstStatusSchema);
