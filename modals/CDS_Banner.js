const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cds_BannerSchema = new Schema({
  cds_bannerId: { type: String },
  cds_bannerName: { type: String },
  cds_bannerImage: { type: String },
  cds_bannerLink: { type: String },
  cds_bannerSwitch: { type: Boolean },
  shedualSwitch: { type: Boolean },
  shedualStartDate: { type: String },
  shedualEndDate: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("cds_banner", cds_BannerSchema);
