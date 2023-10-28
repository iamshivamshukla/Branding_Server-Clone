var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose
  .connect(
    "mongodb+srv://brandingprofitable:CinnSsjx3sY4ftS2@brandingprofitable.25jye.mongodb.net/Branding-Profitable-kuber"
  )
  .then(() => console.log("connection successful"))
  .catch((err) => console.error("MongoDB Error", err));

module.exports = mongoose.connection;
