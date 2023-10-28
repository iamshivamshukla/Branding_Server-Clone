const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trendingBannerSchema = new Schema({
  trendingBannerId: { type: String },
  trendingBannerName: { type: String },
  trendingBannerImage: { type: String },
  shedualDate: { type: String },
  trendingBannerSwitch: { type: Boolean },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("trendings-banner", trendingBannerSchema);
