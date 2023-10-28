var express = require("express");
var router = express.Router();
var DefaultBanner = require("../modals/DefaultBanner")
var moment = require("moment");



router.post("/default_banner", async (req, res) => {
    try {
        var data = await DefaultBanner.create(req.body);
        res.json({
            statusCode: 200,
            data: data,
            message: "Add DefaultBanner Successfully",
        });
    } catch (error) {
        res.json({
            statusCode: 500,
            message: error.message,
        });
    }
});


router.get("/ad_banner_default", async (req, res) => {
    try {
      var data = await DefaultBanner.find({defaultBannerType: "Advertise Banner"})
      res.json({
        data: data,
        statusCode: 200,
        message: "Read All DefaultBanner",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });




module.exports = router;