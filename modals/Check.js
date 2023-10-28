const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const languageSchema = new Schema({
  todayAndTomorrowCategoryId: { type: String },
  categoryName: { type: String },
  imageName: { type: String },
  image: { type: String },
  imageDate: { type: String },
  todayAndTomorrowCategorySwitch: { type: Boolean },

  shedualStartDate: { type: String },
  shedualEndDate: { type: String },

  showCategoryDaysSwitch: { type: String },
  showCategoryToDays: { type: Number },
});

module.exports = mongoose.model("Check", languageSchema);
