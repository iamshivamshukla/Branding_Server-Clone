var express = require("express");
var router = express.Router();
var MyBusiness_Banner = require("../modals/MyBusiness_Banner");
var AddDefaultDaysForCategory = require("../modals/AddDefaultDaysForCategory");
var moment = require("moment");

router.post("/business_banner", async (req, res) => {
  try {
    var count = await MyBusiness_Banner.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["businessBannerId"] = pad(count + 1);
    var data = await MyBusiness_Banner.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Business-Banner Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/business_banner/get", async (req, res) => {
  try {
    var pageSize = req.body.pageSize;
    var pageNumber = req.body.pageNumber;
    var data = await MyBusiness_Banner.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);
    var count = await MyBusiness_Banner.count();
    res.json({
      statusCode: 200,
      data: data,
      MyBusiness_CategoryCount: count,
      message: "Read All Business-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/business_banner/:id", async (req, res) => {
  try {
    let result = await MyBusiness_Banner.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Business-Banner Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/business_banner", async (req, res) => {
  try {
    let result = await MyBusiness_Banner.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Banner Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});


router.get("/business_banner", async (req, res) => {
  try {
    const generalDay = await AddDefaultDaysForCategory.findOne(
      {},
      "showCategoryDays"
    );
    const iGeneralDays = generalDay.get("showCategoryDays");

    const data = await MyBusiness_Banner.find();

    // Sort data based on imageDate in ascending order
    data.sort((a, b) => {
      const dateA = new Date(a.specialDate);
      const dateB = new Date(b.specialDate);
      return dateA - dateB;
    });

    const outputresult = [];

    const currentDate = new Date(); // Current date

    data.forEach((element) => {
      const specialDate = new Date(element.specialDate);
      const startOfImageDate = new Date(
        specialDate.getFullYear(),
        specialDate.getMonth(),
        specialDate.getDate()
      );
      const startOfNextDay = new Date(specialDate);
      startOfNextDay.setDate(specialDate.getDate() + 1);

      if (
        element.isBannerDaysSwitch &&
        element.showBannerDays !== null
      ) {
        const daysDifference = element.showBannerDays;
        const dStartDate = new Date(specialDate);
        dStartDate.setDate(specialDate.getDate() - daysDifference);

        if (currentDate >= dStartDate && currentDate < startOfNextDay) {
          outputresult.push(element);
        }
      } else {
        const dStartDate = new Date(specialDate);
        dStartDate.setDate(specialDate.getDate() - iGeneralDays);

        if (currentDate >= dStartDate && currentDate < startOfNextDay) {
          outputresult.push(element);
        }
      }
    });

    res.json({
      statusCode: 200,
      data: outputresult,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
