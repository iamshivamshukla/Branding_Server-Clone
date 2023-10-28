const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trendingAndNews_ItemSchema = new Schema({
  // trendingAndNews_itemId: { type: String },
  // trendingAndNews_item_ImageOrVideoName: { type: String },
  // trendingAndNews_item_ImageOrVideo: { type: String },
  // isVideo: { type: Boolean },
  // trendingAndNews_CategoryName: { type: String },
  trendingAndNews_itemId: { type: String },
  todayAndTomorrowImageOrVideoName: { type: String },
  todayAndTomorrowImageOrVideo: { type: String },
  isVideo: { type: Boolean },
  categoryName: { type: String },
  languageName: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  comp_iamge: { type: String },
  addDate: { type: String}
});

module.exports = mongoose.model(
  "trendings-section",
  trendingAndNews_ItemSchema
);
