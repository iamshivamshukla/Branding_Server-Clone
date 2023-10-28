const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const openingLogoSchema = new Schema({
  splashScreenId: { type: String },
  splashScreenName: { type: String },
  splashScreenLogo: { type: String },
  specialDate: { type: String },
  isSplashScreenDaysSwitch: { type: Boolean },
  showSplashScreenDays: { type: Number },

  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("splash-screen", openingLogoSchema);
