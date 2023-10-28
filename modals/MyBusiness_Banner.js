const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const myBusinessCategorySchema = new Schema({
  businessBannerId: { type: String },
  businessBanner: { type: String },
  specialDate: { type: String },
  isBannerDaysSwitch: { type: Boolean },
  showBannerDays: { type: Number },

  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("mybusiness-banner", myBusinessCategorySchema);
