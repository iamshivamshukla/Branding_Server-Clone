var express = require("express");
var router = express.Router();
var TrendingAndNewsBanner = require("../modals/TrendingAndNewsBanner");
var moment = require("moment");

router.post("/trending_banner", async (req, res) => {
  try {
    let findTrendingBannerName = await TrendingAndNewsBanner.findOne({
      trendingBannerName: req.body.trendingBannerName,
    });
    if (!findTrendingBannerName) {
      var count = await TrendingAndNewsBanner.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["trendingBannerId"] = pad(count + 1);
      var data = await TrendingAndNewsBanner.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Trending-Banner Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.trendingBannerName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/get_trending_banner", async (req, res) => {
  try {
    var pageSize = req.body.pageSize;
    var pageNumber = req.body.pageNumber;
    var data = await TrendingAndNewsBanner.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);
    var count = await TrendingAndNewsBanner.count();
    data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      TrendingAndNewsBannerCount: count,
      message: "Read All TrendingAndNews-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/trending_banner/:id", async (req, res) => {
  try {
    let result = await TrendingAndNewsBanner.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Trending-Banner Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_popup_banner", async (req, res) => {
  try {
    let result = await TrendingAndNewsBanner.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Trending-banner Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_trending_banner", async (req, res) => {
  try {
    let newArray = [];
    if (Number(req.body.search)) {
      // console.log("number");
      newArray.push({
        trendingBannerId: { $regex: req.body.search, $options: "i" },
      });
    } else {
      // console.log("not number");
      newArray.push(
        {
          trendingBannerName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          shedualDate: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          trendingBannerSwitch: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        }
      );
    }

    var data = await TrendingAndNewsBanner.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Trending-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//  Trending Banner (Application)
router.get("/trending_banner", async (req, res) => {
  try {
    const currentDate = moment(); // Get the current date

    // Find all documents in the collection
    const data = await TrendingAndNewsBanner.find();

    // Update the documents with new values based on the comparison
    await Promise.all(
      data.map(async (item) => {
        const shedualDate = moment(item.shedualDate, "YYYY-MM-DD");
        const trendingBannerSwitch = currentDate.isSame(shedualDate, "day");
        
        // Update the document in the database
        await TrendingAndNewsBanner.updateOne({ _id: item._id }, { trendingBannerSwitch: trendingBannerSwitch });
        
        // Modify the current item in the data array to reflect the new value
        item.trendingBannerSwitch = trendingBannerSwitch;
        return item;
      })
    );

    // Filter the updatedData array to only show items with popupBannerSwitch: true
    const updatedDataToShow = data.filter(item => item.trendingBannerSwitch);

    res.json({
      statusCode: 200,
      data: updatedDataToShow,
      message: "Find Trending-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
