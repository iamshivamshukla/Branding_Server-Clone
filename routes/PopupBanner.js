var express = require("express");
var router = express.Router();
var PopupBanner = require("../modals/PopupBanner");
var moment = require("moment");

router.post("/popup_banner", async (req, res) => {
  try {
    // Check if the maximum number of banner posts (10) has been reached
    const currentBannerCount = await PopupBanner.count();
    if (currentBannerCount >= 2) {
      return res.json({
        statusCode: 500,
        message: "Maximum number of banner posts (2) reached",
      });
    }

    const currentDate = new Date();

    let findPopuoBannerName = await PopupBanner.findOne({
      popupBannerName: req.body.popupBannerName,
    });
    if (!findPopuoBannerName) {
      var count = await PopupBanner.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }

      req.body["popupBannerId"] = pad(count + 1);

      // Check if the current date is within the specified range
      const startDate = new Date(req.body.shedualStartDate);
      const endDate = new Date(req.body.shedualEndDate);
      const isActive = currentDate >= startDate && currentDate <= endDate;

      req.body["popupBannerSwitch"] = isActive;
      var data = await PopupBanner.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Popup_Banner Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.popupBannerName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/get_popup_banner", async (req, res) => {
  try {
    var pageSize = req.body.pageSize;
    var pageNumber = req.body.pageNumber;
    var data = await PopupBanner.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);
    var count = await PopupBanner.count();
    data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      PopupBannerCount: count,
      message: "Read All Popup-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/popup_banner/:id", async (req, res) => {
  try {
    let result = await PopupBanner.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Popup-Banner Updated Successfully",
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
    let result = await PopupBanner.deleteMany({ _id: { $in: req.body } });
    res.json({
      statusCode: 200,
      data: result,
      message: "Popup-banner Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_popupbanner", async (req, res) => {
  try {
    let newArray = [];
    // if (Number(req.body.search)) {
    //   // console.log("number");
    //   newArray.push({
    //     popupBannerId: { $regex: req.body.search, $options: "i" },
    //   });
    // } else {
    // console.log("not number");
    newArray.push(
      {
        popupBannerName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      // {
      //   shedualDate: !isNaN(req.body.search)
      //     ? req.body.search
      //     : { $regex: req.body.search, $options: "i" },
      // },
      // {
      //   popupBannerSwitch: !isNaN(req.body.search)
      //     ? req.body.search
      //     : { $regex: req.body.search, $options: "i" },
      // }
    );
    // }

    var data = await PopupBanner.find({
      $or: newArray,
    });
    const dataCount = data.length;
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      count: dataCount,
      message: "Read All Popup-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.get("/popup_banner", async (req, res) => {
//   try {
//     const currentDate = moment(); // Get the current date

//     // Find all documents in the collection
//     const data = await PopupBanner.find();
//     // console.log(data, "data")

//     // Update the documents with new values based on the comparison
//     await Promise.all(
//       data.map(async (item) => {
//         console.log(item, "item")
//         const shedualDate = moment(item.shedualDate, "YYYY-MM-DD");
//         console.log(shedualDate, "shedualDate")
//         const popupBannerSwitch = currentDate.isSame(shedualDate, "day");

//         // Update the document in the database
//         await PopupBanner.updateOne(
//           { _id: item._id },
//           { popupBannerSwitch: popupBannerSwitch }
//         );

//         // Modify the current item in the data array to reflect the new value
//         item.popupBannerSwitch = popupBannerSwitch;
//         return item;
//       })
//     );

//     // Filter the updatedData array to only show items with popupBannerSwitch: true
//     const updatedDataToShow = data.filter((item) => item.popupBannerSwitch);

//     res.json({
//       statusCode: 200,
//       data: updatedDataToShow,
//       message: "Find Popup-Banner",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/popup_banner", async (req, res) => {
  try {
    const currentDate = new Date(); // Get the current date

    // Find all documents in the collection
    const data = await PopupBanner.find();

    // Update the documents with new values based on the comparison
    await Promise.all(
      data.map(async (item) => {
        const startDate = new Date(item.shedualStartDate);
        const endDate = new Date(item.shedualEndDate);

        // Check if the current date falls within the range of startDate and endDate
        const popupBannerSwitch =
          currentDate >= startDate && currentDate <= endDate;

        // Update the document in the database
        await PopupBanner.updateOne(
          { _id: item._id },
          { popupBannerSwitch: popupBannerSwitch }
        );

        // Modify the current item in the data array to reflect the new value
        item.popupBannerSwitch = popupBannerSwitch;
        return item;
      })
    );

    // Filter the updatedData array to only show items with popupBannerSwitch: true
    const updatedDataToShow = data.filter((item) => item.popupBannerSwitch);

    res.json({
      statusCode: 200,
      data: updatedDataToShow,
      message: "Find Popup-Banner",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/abc", async (req, res) => {
  try {
    const currentDate = new Date();

    const categories = await PopupBanner.find();

    for (const category of categories) {
      const startDate = new Date(category.shedualStartDate);
      const endDate = new Date(category.shedualEndDate);
      const isActive = currentDate >= startDate && currentDate <= endDate;

      await PopupBanner.updateOne(
        { _id: category._id },
        { $set: { popupBannerSwitch: isActive } }
      );
    }

    const updatedData = await PopupBanner.find({
      popupBannerSwitch: true,
    });
    updatedData.reverse();

    res.json({
      statusCode: 200,
      data: updatedData,
      message: "Read All Popup-Banner",
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
          shedualEndDate: { $gte: req.body.startingDate },
        },
      });
    }

    // Match documents based on ending date
    if (req.body.endingDate) {
      pipeline.push({
        $match: {
          shedualEndDate: { $lte: req.body.endingDate },
        },
      });
    }

    // Add a $count stage to count the documents
    pipeline.push({
      $count: "totalCount",
    });

    // Execute the aggregation pipeline
    let results = await PopupBanner.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await PopupBanner.aggregate(pipeline);

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
