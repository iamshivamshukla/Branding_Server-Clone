var express = require("express");
var router = express.Router();
var MainBanner = require("../modals/MainBanner");
var moment = require("moment");

// Add Main Banner
// router.post("/mainbanner", async (req, res) => {
//   try {
//     let findMainBannerName = await MainBanner.findOne({
//       bannerName: req.body.bannerName,
//     });
//     if (!findMainBannerName) {
//       var count = await MainBanner.count();
//       function pad(num) {
//         num = num.toString();
//         while (num.length < 2) num = "0" + num;
//         return num;
//       }
//       req.body["mainBannerId"] = pad(count + 1);
//       var data = await MainBanner.create(req.body);
//       res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add Main_Banner Successfully",
//       });
//     } else {
//       res.json({
//         statusCode: 500,
//         message: `${req.body.bannerName} Name Allready Added`,
//       });
//     }
//   } catch (error) {
//     res.json({
//       statusCode: false,
//       message: error.message,
//     });
//   }
// });

router.post("/mainbanner", async (req, res) => {
  try {
    let findMainBannerName = await MainBanner.findOne({
      bannerName: req.body.bannerName,
    });
    if (!findMainBannerName) {
      var count = await MainBanner.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["mainBannerId"] = pad(count + 1);


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
        req.body.bannerSwitch = isWithinRange; // Update to false when shedualSwitch is true and current date is outside the range
      }

      var data = await MainBanner.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Main_Banner Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.bannerName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: false,
      message: error.message,
    });
  }
});

// Get Banner (Admin-Side)
router.post("/get_mainbanner", async (req, res) => {
  try {
    var pageSize = req.body.pageSize;
    var pageNumber = req.body.pageNumber;

    // Calculate the skip value
    var skipValue = pageSize * pageNumber;

    var data = await MainBanner.aggregate([
      {
        $sort: { _id: -1 }, // Sort by _id in descending order (latest first)
      },
      {
        $facet: {
          paginatedData: [{ $skip: skipValue }, { $limit: pageSize }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    var paginatedData = data[0].paginatedData;
    var totalCount = data[0].totalCount[0].count;

    res.json({
      statusCode: 200,
      data: paginatedData,
      MainBanner: totalCount,
      message: "Read All Banner Type",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/mainbanner/:id", async (req, res) => {
  try {
    let result = await MainBanner.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Banner Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_mainbanner", async (req, res) => {
  try {
    let result = await MainBanner.deleteMany({ _id: { $in: req.body } });
    res.json({
      statusCode: 200,
      data: result,
      message: "Main-Banner Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_mainbanner", async (req, res) => {
  try {
    let newArray = [];
    if (Number(req.body.search)) {
      // console.log("number");
      newArray.push({
        mainBannerId: { $regex: req.body.search, $options: "i" },
      });
    } else {
      // console.log("not number");
      newArray.push(
        {
          bannerName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        // {
        //   bannerSwitch: !isNaN(req.body.search)
        //     ? req.body.search
        //     : { $regex: req.body.search, $options: "i" },
        // },
        // {
        //   shedualSwitch: !isNaN(req.body.search)
        //     ? req.body.search
        //     : { $regex: req.body.search, $options: "i" },
        // },
        // {
        //   shedualStartDate: !isNaN(req.body.search)
        //     ? req.body.search
        //     : { $regex: req.body.search, $options: "i" },
        // },
        // {
        //   shedualStartDate: !isNaN(req.body.search)
        //     ? req.body.search
        //     : { $regex: req.body.search, $options: "i" },
        // }
      );
    }

    var data = await MainBanner.find({
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

// ======================Application=================================================

router.get("/mainbanner", async (req, res) => {
  try {
    const currentDate = moment().format("YYYY-MM-DD"); // Get the current date in "YYYY-MM-DD" format

    // Find banners with shedualSwitch: true and the current date falls within the range
    const bannersToUpdate = await MainBanner.find({
      bannerSwitch: false,
      shedualSwitch: true,
      shedualStartDate: { $lte: currentDate },
      shedualEndDate: { $gte: currentDate },
    });

    // Update the advertiseSwitch to true for the banners that match the date range
    await MainBanner.updateMany(
      { _id: { $in: bannersToUpdate.map((banner) => banner._id) } },
      { $set: { bannerSwitch: false } }
    );

    // Retrieve the updated data
    const data = await MainBanner.find({
      $or: [
        { bannerSwitch: true },
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
    let results = await MainBanner.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await MainBanner.aggregate(pipeline);

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
