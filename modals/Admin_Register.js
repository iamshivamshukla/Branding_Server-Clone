const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = new Schema({
  userName: { type: String },
  email: { type: String, unique: true },
  mobileNumber: { type: Number },
  password: { type: String },
  cPassword: { type: String },
  accessType: { type: Array },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("admin-register", registerSchema);
