const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ds_CategorySchema = new Schema({
  ds_Id: { type: String },
  ds_category: { type: String },
  ds_switch: { type: Boolean },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  addDate: { type: String },
});

module.exports = mongoose.model("dynamic_section_category", ds_CategorySchema);
