const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const languageSchema = new Schema({
  showCategoryDays: { type: Number }, 
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("Category-Days", languageSchema);
