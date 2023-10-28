var express = require("express");
var router = express.Router();
var AdvertiseBanner = require("../modals/AdvertiseBanner");
var moment = require("moment");
var { verifyToken } = require("../authentication");

// Post Advertise-Banner (Admin)
router.post("/banner", verifyToken, async (req, res) => {
  try {
    let findAdvertiseBannerName = await AdvertiseBanner.findOne({
      advertiseBannerName: req.body.advertiseBannerName,
    });
    if (!findAdvertiseBannerName) {
      var count = await AdvertiseBanner.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["advertiseBannerId"] = pad(count + 1);

      // Check if shedualSwitch is true and both shedualStartDate and shedualEndDate are provided
      if (
        req.body.shedualSwitch &&
        req.body.shedualStartDate &&
        req.body.shedualEndDate
      ) {
        const currentDate = moment().format("YYYY-MM-DD");
        const isWithinRange = moment(currentDate).isBetween(
          req.body.shedualStartDate,
          req.body.shedualEndDate,
          null,
          "[]"
        );
        req.body.advertiseSwitch = isWithinRange; // Update to false when shedualSwitch is true and current date is outside the range
      }

      var data = await AdvertiseBanner.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Advertise_Banner Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.advertiseBannerName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: false,
      message: error.message,
    });
  }
});

// Get Advertise-Banner (Admin)
router.get("/banner", verifyToken, async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await AdvertiseBanner.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await AdvertiseBanner.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      AdvertiseBannerCount: count,
      message: "Read All Language",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Put Advertise-Banner (Admin)
router.put("/banner/:id", verifyToken, async (req, res) => {
  try {
    let result = await AdvertiseBanner.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Advertise-Banner Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Delete Advertise-Banner (Admin)
router.delete("/banner", verifyToken, async (req, res) => {
  try {
    let result = await AdvertiseBanner.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Advertise-banner Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Search Advertise-Banner (Admin)
router.post("/banner/search", verifyToken, async (req, res) => {
  try {
    let newArray = [];

    // console.log("not number");
    newArray.push({
      advertiseBannerName: !isNaN(req.body.search)
        ? req.body.search
        : { $regex: req.body.search, $options: "i" },
    });

    var data = await AdvertiseBanner.find({
      $or: newArray,
    });
    const dataCount = data.length;
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      count: dataCount,
      message: "Read All Advertise-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});
// ================================Application===============================================
// Application
router.get("/advertise_banner", async (req, res) => {
  try {
    const currentDate = moment().format("YYYY-MM-DD"); // Get the current date in "YYYY-MM-DD" format

    // Find banners with shedualSwitch: true and the current date falls within the range
    const bannersToUpdate = await AdvertiseBanner.find({
      advertiseSwitch: false,
      shedualSwitch: true,
      shedualStartDate: { $lte: currentDate },
      shedualEndDate: { $gte: currentDate },
    });

    // Update the advertiseSwitch to true for the banners that match the date range
    await AdvertiseBanner.updateMany(
      { _id: { $in: bannersToUpdate.map((banner) => banner._id) } },
      { $set: { advertiseSwitch: true } }
    );

    // Retrieve the updated data
    const data = await AdvertiseBanner.find({
      $or: [
        { advertiseSwitch: true },
        { _id: { $in: bannersToUpdate.map((banner) => banner._id) } },
      ],
    });
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Banner Type",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/filterData", async (req, res) => {
  try {
    let pipeline = [];

    // Match documents based on starting date
    if (req.body.startingDate) {
      pipeline.push({
        $match: {
          updateDate: { $gte: req.body.startingDate },
        },
      });
    }

    // Match documents based on ending date
    if (req.body.endingDate) {
      pipeline.push({
        $match: {
          updateDate: { $lte: req.body.endingDate },
        },
      });
    }

    // Add a $count stage to count the documents
    pipeline.push({
      $count: "totalCount",
    });

    // Execute the aggregation pipeline
    let results = await AdvertiseBanner.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await AdvertiseBanner.aggregate(pipeline);

      res.json({
        statusCode: 200,
        totalCount: totalCount,
        findByDateWisenData: findByDateWisenData,
        message: "Find SelectDate Data Successfully",
      });
    } else {
      // No matching documents
      res.json({
        statusCode: 200,
        totalCount: 0,
        findByDateWisenData: [],
        message: "No data found for the selected date range",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
