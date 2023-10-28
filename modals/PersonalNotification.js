const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personalNotificationSchema = new Schema({
  businessNotificationId: { type: String },
  notificationTitle: { type: String },
  notificationContent: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model(
  "personal-notification",
  personalNotificationSchema
);
