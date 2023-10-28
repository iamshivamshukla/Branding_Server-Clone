const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todayAndTomorrowSchema = new Schema({
  todayAndTomorrowId: { type: String },
  todayAndTomorrowImageOrVideoName: { type: String },
  categoryName: { type: String },
  todayAndTomorrowImageOrVideo: { type: String },
  isVideo: { type: Boolean },
  languageName: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  comp_iamge: { type: String },
  addDate: { type: String },
});

module.exports = mongoose.model("todayandtomorrow", todayAndTomorrowSchema);
