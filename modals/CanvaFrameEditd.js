const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const canvaFrameEditIdSchema = new Schema({
  canvaFrameEditId: { type: String },
  CanvaFrameIdForEdit: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model("CanvaFrameEditId", canvaFrameEditIdSchema);
