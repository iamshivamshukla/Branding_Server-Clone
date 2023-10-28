const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const languageSchema = new Schema({
  languageId: { type: String },
});

module.exports = mongoose.model("language", languageSchema);
