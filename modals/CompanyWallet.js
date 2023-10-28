const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const companyWalletSchema = new Schema({
//   totalBalance: { type: Number },
//   registerUser: { type: Array },
//   debitedHistory: { type: Array },
//   creditedHistory: { type: Array },
//   allTransactionHistory: { type: Array },
// });

const companyWalletSchema = new Schema({
  totalBalance: { type: Number, default: 0 },
  registerUser: [
    { userName: String, mobileNumber: Number, registrationDate: Date },
  ],
  creditedHistory: [
    {
      userName: String,
      mobileNumber: Number,
      amount: Number,
      transactionDate: Date,
      message: String,
    },
  ],
  debitedHistory: [
    {
      userName: String,
      mobileNumber: Number,
      amount: Number,
      transactionDate: Date,
      message: String,
    },
  ],
  allTransactionHistory: [
    {
      transactionType: String,
      userName: String,
      mobileNumber: Number,
      amount: Number,
      transactionDate: Date,
    },
  ],
});

module.exports = mongoose.model("company-wallet", companyWalletSchema);
