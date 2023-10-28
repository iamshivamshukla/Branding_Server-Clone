const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cds_CategorySchema = new Schema({
  cds_categoryId: { type: String },
  cds_categoryName: { type: String },
  // cds_imageName: { type: String },
  // cds_image: { type: String },
  cds_categorySwitch: { type: Boolean },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("cds_category", cds_CategorySchema);
