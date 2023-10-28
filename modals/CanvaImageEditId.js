const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const languageSchema = new Schema({
  canvaImageEditId: { type: String },
  CanvaImageIdForEdit: { type: String },
});

module.exports = mongoose.model("CanvaImageEditId", languageSchema);
