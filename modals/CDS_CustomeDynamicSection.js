const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cds_CategorySchema = new Schema({
  cds_Id: { type: String },
  // cds_categoryName: { type: String },
  cds_template: { type: Object, required: true },
  cds_categoryName: { type: String },
  cds_canvaImage: { type: String },
  createDate: { type: String },
  createTime: { type: String },
  updateDate: { type: String },
  updateTime: { type: String },
});

module.exports = mongoose.model(
  "cds-custome_dynamic_section",
  cds_CategorySchema
);

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const cds_CategorySchema = new Schema({
//   cds_Id: { type: String },
//   cds_template: { type: Object },
// });

// module.exports = mongoose.model(
//   "cds-custome_dynamic_section",
//   cds_CategorySchema
// );
