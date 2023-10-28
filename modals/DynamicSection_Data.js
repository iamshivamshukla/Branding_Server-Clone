const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ds_ItemSchema = new Schema({
  ds_itemId: { type: String },
  ds_category: { type: String },
  ds_itemImage: { type: String },
  ds_itemSwitch: { type: Boolean },
  languageName: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  comp_iamge: { type: String },
  addDate: { type: String },
  isVideo: { type: Boolean },
});

module.exports = mongoose.model("dynamic_section_item", ds_ItemSchema);
