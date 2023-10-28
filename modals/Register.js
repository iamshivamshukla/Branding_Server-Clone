const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = new Schema({
  // User
  profileImage: { type: String },
  Designation: { type: String },
  gender: { type: String },
  dob: { type: String },

  // Business
  businessLogo: { type: String },
  businessType: { type: String },
  businessStartDate: { type: String },
  mobileNumberSecond: { type: Number },
  website: { type: String },
  businessName: { type: String },
  

  // Both
  mobileNumber: { type: Number, unique: true },
  fullName: { type: String },
  email: { type: String },
  adress: { type: String },
  // password: { type: String },
  // cPassword: { type: String },
  // adhaar: { type: Number },
  isPersonal: { type: Boolean },
  token: { type: String },
  otp: { type: Number },
  mPin: { type: Number, default: null},
  mPinResetOTP: {type: Number}
});

module.exports = mongoose.model("register", registerSchema);
