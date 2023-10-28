const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

// const registerSchema = new Schema({
//   // User
//   profileImage: { type: String },
//   Designation: { type: String },
//   gender: { type: String },
//   dob: { type: String },

//   // Business
//   businessLogo: { type: String },
//   businessType: { type: String },
//   businessStartDate: { type: String },

//   // Both
//   mobileNumber: { type: Number },
//   fullName: { type: String },
//   email: { type: String },
//   adress: { type: String },
//   referralCode: { type: String, unique: true },
//   referredBy: {
//     type: String,
//   },
//   referralChain: [
//     { type: mongoose.Schema.Types.ObjectId, ref: "user-register" },
//   ],
//   totalRewards: { type: Number, default: 0 },
//   redWallet: { type: Number, default: 0 }, // New field to store points in the red wallet
//   greenWallet: { type: Number, default: 0 }, // New field to store points in the green wallet
//   completedPairs: { type: Number, default: 0 }, // New field to store the number of completed pairs
//   password: { type: String },
//   cPassword: { type: String },
//   treeId: { type: Number, unique: true },
//   adhaar: { type: Number, unique: true },

//   walletAdditions: { type: Number, default: 0 },
//   side: { type: String, enum: ["left", "right"] },
//   leftUser: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user-register",
//     default: null,
//   },
//   rightUser: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user-register",
//     default: null,
//   },
//   level: { type: Number, default: 0 },
//   registrationDate: { type: Date, default: Date.now },

//   pairFound: { type: Boolean, default: false },
//   isPayment: { type: Boolean, default: false },

//   mlmPurchaseDate: { type: String },
//   mlmPurchaseTime: { type: String },
// });

const registerSchema = new Schema({
  // User
  profileImage: { type: String },
  Designation: { type: String },
  gender: { type: String },
  dob: { type: String }, // Business
  businessLogo: { type: String },
  businessType: { type: String },
  businessStartDate: { type: String }, // Both
  mobileNumber: { type: Number },
  fullName: { type: String },
  email: { type: String },
  adress: { type: String },
  referralCode: { type: String, unique: true },
  referredBy: {
    type: String,
  },
  referralChain: [
    { type: mongoose.Schema.Types.ObjectId, ref: "user-register" },
  ],
  totalRewards: { type: Number, default: 0 },
  redWallet: { type: Number, default: 0 }, // New field to store points in the red wallet
  greenWallet: { type: Number, default: 0 }, // New field to store points in the green wallet
  completedPairs: { type: Number, default: 0 }, // New field to store the number of completed pairs
  password: { type: String },
  cPassword: { type: String },
  treeId: { type: Number, unique: true },
  // adhaar: { type: Number },
  walletAdditions: { type: Number, default: 0 },
  side: { type: String, enum: ["left", "right"] },
  leftUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user-register",
    default: null,
  },
  rightUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user-register",
    default: null,
  },
  level: { type: Number, default: 0 },
  registrationDate: { type: Date, default: "2023-09-14T13:44:23.675Z" },
  pairFound: { type: Boolean, default: false },
  isPayment: { type: Boolean, default: true },
  mlmPurchaseDate: { type: String },
  mlmPurchaseTime: { type: String },
  lastPairAddedAt: {
    type: Date,
    default: null, // Initialize with null or a default value
  },
  pairCount: {
    type: Number,
    default: 0, // Initialize with 0 or the appropriate value
  },
  resetCount: { type: Number, default: 0 },
  pairRatio: { type: String },
  usersNeededForBalanced: { type: Number, default: 0 },
  leftCount: { type: Number },
  rightCount: { type: Number },
  totalEarnings: { type: Number, default: 0 },
  role: { type: String, default: "V" },
  mPin: { type: Number, default: null },
});

module.exports = mongoose.model("user-register", registerSchema);
