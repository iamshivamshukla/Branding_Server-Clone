const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mainBannerSchema = new Schema({
  mainBannerId: { type: String },
  bannerName: { type: String },
  bannerImage: { type: String },
  bannerLink: { type: String },
  bannerSwitch: { type: Boolean },
  shedualSwitch: { type: Boolean },
  shedualStartDate: { type: String },
  shedualEndDate: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("main-banner", mainBannerSchema);
