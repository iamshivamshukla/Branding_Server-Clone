const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const frameSchema = new Schema({
  frameId: { type: String },
  frame: { type: Object, required: true },
  frameImage: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("frame", frameSchema);
