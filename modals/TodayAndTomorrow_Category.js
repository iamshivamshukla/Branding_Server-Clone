const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todayAndTomorrowCategorySchema = new Schema(
  {
    todayAndTomorrowCategoryId: { type: String },
    categoryName: { type: String },
    imageName: { type: String },
    image: { type: String },
    imageDate: { type: String },
    todayAndTomorrowCategorySwitch: { type: Boolean },
    shedualStartDate: { type: String },
    shedualEndDate: { type: String },

    showCategoryDaysSwitch: { type: Boolean },
    showCategoryToDays: { type: Number },
    createDate: { type: String },
    createTime: { type: String },
    updateDate: { type: String },
    updateTime: { type: String },
    comp_iamge: { type: String },
    addDate: { type: String}
  },
  { versionKey: false }
);

module.exports = mongoose.model(
  "todayandtomorrow_category",
  todayAndTomorrowCategorySchema
);
