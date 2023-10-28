var express = require("express");
var router = express.Router();
var SplashScreen = require("../modals/SplashScreen");
var AddDefaultDaysForCategory = require("../modals/AddDefaultDaysForCategory");
var moment = require("moment");

router.post("/splashscreen", async (req, res) => {
  try {
    var count = await SplashScreen.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["splashScreenId"] = pad(count + 1);
    var data = await SplashScreen.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Splash-Screen Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/splashscreen/get", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await SplashScreen.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await SplashScreen.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      SplashScreenCount: count,
      message: "Read All Splash-Screen",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/splashscreen/:id", async (req, res) => {
  try {
    let result = await SplashScreen.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Splash-Screen Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/splashscreen/remove", async (req, res) => {
  try {
    let result = await SplashScreen.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Splash-Screen Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/splashscreen", async (req, res) => {
  try {
    const generalDay = await AddDefaultDaysForCategory.findOne(
      {},
      "showCategoryDays"
    );
    const iGeneralDays = generalDay.get("showCategoryDays");

    const data = await SplashScreen.find();

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

      if (element.isSplashScreenDaysSwitch && element.showSplashScreenDays !== null) {
        const daysDifference = element.showSplashScreenDays;
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
