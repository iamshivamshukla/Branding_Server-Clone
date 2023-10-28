const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const advertiseBannerSchema = new Schema({
  advertiseBannerId: { type: String },
  advertiseBannerName: { type: String },
  advertiseImage: { type: String },
  advertiseLink: { type: String },
  advertiseSwitch: { type: Boolean },
  shedualSwitch: { type: Boolean },
  shedualStartDate: { type: String },
  shedualEndDate: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  comp_iamge: { type: String },
});

module.exports = mongoose.model("advertise-banner", advertiseBannerSchema);
