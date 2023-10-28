const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const myBusinessSchema = new Schema({
  myBusinessId: { type: String },
  myBusinessName: { type: String },
  businessTypeName: { type: String },
  isVideo: { type: Boolean },
  myBusinessImageOrVideo: { type: String },
  businessCategoryName: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  comp_iamge: { type: String },
  addDate: { type: String },
  // languageName: { type: String },
});

module.exports = mongoose.model("mybusiness", myBusinessSchema);
