const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mainBannerSchema = new Schema({
  defaultBannerId: { type: String },
  defaultBannerImage: { type: String },
  defaultBannerType: { type: String },
  createDate: { type: String },
  updateDate: { type: String },
});

module.exports = mongoose.model("default-banner", mainBannerSchema);
