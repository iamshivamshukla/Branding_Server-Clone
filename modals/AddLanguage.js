const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const languageSchema = new Schema({
  languageId: { type: String },
  languageName: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("language", languageSchema);
