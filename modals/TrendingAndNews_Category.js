const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trendingAndNews_CategorySchema = new Schema({
  trendingAndNewsCategory_Id: { type: String },
  trendingAndNews_CategoryName: { type: String },
  trendingAndNews_CategoryImage: { type: String },
  trendingAndNews_CategoryImageName: { type: String },
  trendingAndNews_switch: { type: Boolean },
  isSwitchOff: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  comp_iamge: { type: String },
  addDate: { type: String}
});

module.exports = mongoose.model(
  "trendings-category",
  trendingAndNews_CategorySchema
);
