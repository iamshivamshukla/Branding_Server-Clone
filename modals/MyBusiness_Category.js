const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const myBusinessCategorySchema = new Schema({
  businessCategoryId: { type: String },
  businessTypeName: { type: String },
  businessCategoryName: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  addDate: { type: String },
});

module.exports = mongoose.model(
  "mybusiness-category",
  myBusinessCategorySchema
);
