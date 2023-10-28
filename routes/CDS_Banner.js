var express = require("express");
var router = express.Router();
var CDS_Banner = require("../modals/CDS_Banner");
var moment = require("moment");
var { verifyToken } = require("../authentication");

// =====================Admin===========================================
// Post Custome Dynamic Section Banner
router.post("/banner", verifyToken, async (req, res) => {
  try {
    let find_cdsBannerName = await CDS_Banner.findOne({
      cds_bannerName: req.body.cds_bannerName,
    });
    if (!find_cdsBannerName) {
      var count = await CDS_Banner.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["cds_bannerId"] = pad(count + 1);

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
        req.body.cds_bannerSwitch = isWithinRange; // Update to false when shedualSwitch is true and current date is outside the range
      }

      var data = await CDS_Banner.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add CDS-Banner Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.cds_bannerName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: false,
      message: error.message,
    });
  }
});

// Get Custome Dynamic Section Banner
router.get("/banner", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await CDS_Banner.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await CDS_Banner.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      customeBannerCount: count,
      message: "Read All Custome-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Put Custome Dynamic Section Banner
router.put("/banner/:id", verifyToken, async (req, res) => {
  try {
    let result = await CDS_Banner.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "CustomeDynamic-Banner Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Delete Custome Dynamic Section Banner
router.delete("/banner", verifyToken, async (req, res) => {
  try {
    let result = await CDS_Banner.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Custome-banner Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Search Custome Dynamic Section Banner
router.post("/banner/search", verifyToken, async (req, res) => {
  try {
    let newArray = [];

    // console.log("not number");
    newArray.push({
      cds_bannerName: !isNaN(req.body.search)
        ? req.body.search
        : { $regex: req.body.search, $options: "i" },
    });

    var data = await CDS_Banner.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Custome-Banner",
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
    let results = await CDS_Banner.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await CDS_Banner.aggregate(pipeline);

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

// ============================Application==================================
// Get Custome Dynamic Section Banner (Application - Api)
router.get("/banner/custome", async (req, res) => {
  try {
    const currentDate = moment().format("YYYY-MM-DD"); // Get the current date in "YYYY-MM-DD" format

    // Find banners with shedualSwitch: true and the current date falls within the range
    const bannersToUpdate = await CDS_Banner.find({
      cds_bannerSwitch: false,
      shedualSwitch: true,
      shedualStartDate: { $lte: currentDate },
      shedualEndDate: { $gte: currentDate },
    });

    // Update the advertiseSwitch to true for the banners that match the date range
    await CDS_Banner.updateMany(
      { _id: { $in: bannersToUpdate.map((banner) => banner._id) } },
      { $set: { cds_bannerSwitch: true } }
    );

    // Retrieve the updated data
    const data = await CDS_Banner.find({
      $or: [
        { cds_bannerSwitch: true },
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

module.exports = router;
