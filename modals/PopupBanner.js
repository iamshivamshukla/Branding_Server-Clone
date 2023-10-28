const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const popupBannerSchema = new Schema({
  popupBannerId: { type: String },
  popupBannerName: { type: String },
  popupBannerImage: { type: String },
  // shedualDate: { type: String },
  popupBannerSwitch: { type: Boolean },
  shedualStartDate: { type: String },
  shedualEndDate: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("popup-banner", popupBannerSchema);
