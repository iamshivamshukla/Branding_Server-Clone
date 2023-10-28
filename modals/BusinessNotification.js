const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const businessNotificationSchema = new Schema({
  businessNotificationId: { type: String },
  notificationTitle: { type: String },
  notificationContent: { type: String },
  token: { type: String },
});

module.exports = mongoose.model(
  "business-notification",
  businessNotificationSchema
);
