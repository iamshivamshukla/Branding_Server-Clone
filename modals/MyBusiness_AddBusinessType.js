const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const myBusinessSchema = new Schema({
  businessTypeId: { type: String },
  businessTypeName: { type: String },
  businessTypeImage: { type: String },
  businessTypeSwitch: { type: Boolean },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
  comp_iamge: { type: String },
  addDate: { type: String}
});

module.exports = mongoose.model("mybusiness-type", myBusinessSchema);
