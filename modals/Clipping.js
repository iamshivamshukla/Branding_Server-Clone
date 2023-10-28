const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clippingSchema = new Schema({
    clippingAt: { type: Number },
    createDate: { type: String },
    createTime: { type: String },
    updateDate: { type: String },
    updateTime: { type: String },
});

module.exports = mongoose.model("clipping", clippingSchema);
