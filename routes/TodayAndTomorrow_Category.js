var express = require("express");
var router = express.Router();
var TodayAndTomorrowCategory = require("../modals/TodayAndTomorrow_Category");
var TodayAndTomorrow = require("../modals/TodayAndTomorrow");
var moment = require("moment");
var Checks = require("../modals/Check");
var AddDefaultDaysForCategory = require("../modals/AddDefaultDaysForCategory");

// router.post("/today_category", async (req, res) => {
//   try {
//     let findCategoryName = await TodayAndTomorrowCategory.findOne({
//       categoryName: req.body.categoryName,
//     });

//     const currentDate = new Date();

//     if (!findCategoryName) {
//       var count = await TodayAndTomorrowCategory.count();
//       function pad(num) {
//         num = num.toString();
//         while (num.length < 2) num = "0" + num;
//         return num;
//       }
//       req.body["todayAndTomorrowCategoryId"] = pad(count + 1);

//       // Check if the current date is within the specified range
//       const startDate = new Date(req.body.shedualStartDate);
//       const endDate = new Date(req.body.shedualEndDate);
//       const isActive = currentDate >= startDate && currentDate <= endDate;

//       req.body["todayAndTomorrowCategorySwitch"] = isActive;

//       var data = await TodayAndTomorrowCategory.create(req.body);
//       res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add TodayandTomorrow-Category Successfully",
//       });
//     } else {
//       res.json({
//         statusCode: 500,
//         message: `${req.body.categoryName} Name Already Added`,
//       });
//     }
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// router.post("/today_category", async (req, res) => {
//   try {
//     const { categoryName, imageDate, showCategoryToDays } = req.body;
//     const currentDate = new Date();

//     const findCategoryName = await TodayAndTomorrowCategory.findOne({
//       categoryName: categoryName,
//     });

//     if (!findCategoryName) {
//       const count = await TodayAndTomorrowCategory.countDocuments();
//       const pad = (num) => (num < 10 ? `0${num}` : num);
//       const todayAndTomorrowCategoryId = pad(count + 1);

//       // Calculate shedualEndDate based on imageDate
//       const shedualEndDate = imageDate;

//       // Calculate shedualStartDate by subtracting showCategoryToDays from imageDate
//       const imageDateObj = new Date(imageDate);
//       const shedualStartDateObj = new Date(imageDateObj);
//       shedualStartDateObj.setDate(imageDateObj.getDate() - showCategoryToDays);
//       const shedualStartDate = shedualStartDateObj.toISOString().split('T')[0];

//       // Determine todayAndTomorrowCategorySwitch based on currentDate
//       const startDateObj = new Date(shedualStartDate);
//       const endDateObj = new Date(shedualEndDate);
//       const isActive = currentDate >= startDateObj && currentDate <= endDateObj;

//       const data = await TodayAndTomorrowCategory.create({
//         todayAndTomorrowCategoryId,
//         categoryName,
//         imageName: req.body.imageName || "",
//         image: req.body.image || "",
//         imageDate,
//         todayAndTomorrowCategorySwitch: isActive,
//         shedualStartDate,
//         shedualEndDate,
//         showCategoryDaysSwitch: req.body.showCategoryDaysSwitch || "",
//         showCategoryToDays,
//       });

//       res.json({
//         statusCode: 200,
//         data,
//         message: "Add TodayandTomorrow-Category Successfully",
//       });
//     } else {
//       res.json({
//         statusCode: 500,
//         message: `${categoryName} Name Already Added`,
//       });
//     }
//   } catch (error) {
//     console.error(error); // Log the error to the console for debugging
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }

// });

router.post("/today_category", async (req, res) => {
  try {
    let findCategoryName = await TodayAndTomorrowCategory.findOne({
      categoryName: req.body.categoryName,
    });

    const currentDate = new Date();

    if (!findCategoryName) {
      var count = await TodayAndTomorrowCategory.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["todayAndTomorrowCategoryId"] = pad(count + 1);

      // Check if the current date is within the specified range
      const imageDateStr = req.body.imageDate;
      const imageDate = moment(imageDateStr, "YYYY-MM-DD");

      if (!imageDate.isValid()) {
        // Handle invalid date format
        throw new Error("Invalid date format for imageDate");
      }

      let startDate = moment(imageDate); // Start date is initially the imageDate

      if (req.body.showCategoryDaysSwitch === true) {
        // If showCategoryDaysSwitch is explicitly true, calculate startDate based on showCategoryToDays
        const showCategoryToDays = req.body.showCategoryToDays || 0;
        startDate.subtract(showCategoryToDays, "days");
      }

      req.body["shedualStartDate"] = startDate.format("YYYY-MM-DD");
      req.body["shedualEndDate"] = imageDateStr;

      const data = await TodayAndTomorrowCategory.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add TodayandTomorrow-Category Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.categoryName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/today_category", async (req, res) => {
//   try {
//     let findCategoryName = await TodayAndTomorrowCategory.findOne({
//       categoryName: req.body.categoryName,
//     });

//     const currentDate = new Date();

//     if (!findCategoryName) {
//       var count = await TodayAndTomorrowCategory.count();
//       function pad(num) {
//         num = num.toString();
//         while (num.length < 2) num = "0" + num;
//         return num;
//       }
//       req.body["todayAndTomorrowCategoryId"] = pad(count + 1);

//       // Check if the current date is within the specified range
//       const imageDateStr = req.body.imageDate;
//       const imageDate = moment(imageDateStr, "YYYY-MM-DD");

//       if (!imageDate.isValid()) {
//         // Handle invalid date format
//         throw new Error("Invalid date format for imageDate");
//       }

//       const startDate = moment(imageDate); // Start date is initially the imageDate

//       if (req.body.showCategoryDaysSwitch === false) {
//         // If showCategoryDaysSwitch is explicitly false, calculate startDate based on showCategoryToDays
//         const showCategoryToDays = req.body.showCategoryToDays || 0;
//         startDate.subtract(showCategoryToDays, "days");
//       }

//       req.body["shedualStartDate"] = startDate.format("YYYY-MM-DD");
//       req.body["shedualEndDate"] = imageDateStr;

//       const data = await TodayAndTomorrowCategory.create(req.body);
//       res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add TodayandTomorrow-Category Successfully",
//       });
//     } else {
//       res.json({
//         statusCode: 500,
//         message: `${req.body.categoryName} Name Already Added`,
//       });
//     }
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });



router.post("/get_today_category", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await TodayAndTomorrowCategory.aggregate([
      {
        $project: {
          todayAndTomorrowCategoryId: 1,
          categoryName: 1,
          imageName: 1,
          image: 1,
          imageDate: {
            $dateFromString: {
              dateString: "$createDate", // Convert string to date
              format: "%d-%m-%Y" // Define the input date format
            }
          },
          shedualStartDate: 1,
          shedualEndDate: 1,
          showCategoryDaysSwitch: 1,
          showCategoryToDays: 1,
          createDate: 1,
          createTime: 1,
          comp_iamge: 1
        }
      },
      {
        $sort: { imageDate: -1 } // Sort by imageDate in descending order
      },
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    const count = await TodayAndTomorrowCategory.count();

    res.json({
      statusCode: 200,
      data: data,
      TodayAndTomorrowCategoryCount: count,
      message: "Read All TodayandTomorrow-Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/get_today_category", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;
//     var data = await TodayAndTomorrowCategory.aggregate([
//       {
//         $sort: { createDate: -1 } // Sort by updateDate in descending order
//       },
//       {
//         $skip: pageSize * pageNumber,
//       },
//       {
//         $limit: pageSize,
//       },
//     ]);
//     var count = await TodayAndTomorrowCategory.count();
//     // data.reverse();
//     res.json({
//       statusCode: 200,
//       data: data,
//       TodayAndTomorrowCategoryCount: count,
//       message: "Read All TodayandTomorrow-Category",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/today_category/:id", async (req, res) => {
  try {
    let result = await TodayAndTomorrowCategory.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "TodayandTomorrow-Category Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_today_category", async (req, res) => {
  try {
    let result = await TodayAndTomorrowCategory.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "TodayandTomorrow-Category Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// router.post("/search_today_category", async (req, res) => {
//   try {
//     let newArray = [];
//     // console.log("not number");
//     newArray.push(
//       {
//         categoryName: !isNaN(req.body.search)
//           ? req.body.search
//           : { $regex: req.body.search, $options: "i" },
//       },
//       {
//         imageName: !isNaN(req.body.search)
//           ? req.body.search
//           : { $regex: req.body.search, $options: "i" },
//       },
//     );

//     var data = await TodayAndTomorrowCategory.find({
//       $or: newArray,
//     });
//     // data.reverse();
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Read All TodayandTomorrow-Category",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/search_today_category", async (req, res) => {
  try {
    let newArray = [];
    newArray.push(
      {
        categoryName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        imageName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      }
    );

    var data = await TodayAndTomorrowCategory.find({
      $or: newArray,
    });

    // Calculate the count of the searched data
    const dataCount = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: dataCount, // Include the count in the response
      message: "Read All TodayandTomorrow-Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get CategoryName Only (Admin)
router.get("/category_name", async (req, res) => {
  try {
    var data = await TodayAndTomorrowCategory.find().select({
      _id: 0,
      categoryName: 1,
    });
    data.reverse();
    res.json({
      statusCode: 200,
      data: data,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// TodayandTomorrow Category (Application - APP.JS)
router.get("/today_category", async (req, res) => {
  try {
    const currentDate = new Date();

    const categories = await TodayAndTomorrowCategory.find();

    for (const category of categories) {
      const startDate = new Date(category.shedualStartDate);
      const endDate = new Date(category.shedualEndDate);
      const isActive = currentDate >= startDate && currentDate <= endDate;

      await TodayAndTomorrowCategory.updateOne(
        { _id: category._id },
        { $set: { todayAndTomorrowCategorySwitch: isActive } }
      );
    }

    const updatedData = await TodayAndTomorrowCategory.find({
      todayAndTomorrowCategorySwitch: true,
    });
    updatedData.reverse();

    res.json({
      statusCode: 200,
      data: updatedData,
      message: "Read All TodayandTomorrow-Category Data",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// TodayandTomorrow Category
// router.get("/category/today_category", async (req, res) => {
//   try {
//     const generalDay = await AddDefaultDaysForCategory.findOne({}, "showCategoryDays");
//     const iGeneralDays = generalDay.get('showCategoryDays');

//     var data = await TodayAndTomorrowCategory.find();
//     var outputresult = [];
//     // data.reverse();

//     data.forEach(element => {
//       const startDate = element.imageDate;

//       if (element.showCategoryDaysSwitch == true && element.showCategoryToDays != null) {
//         const dimageDate = new Date(element.imageDate);
//         const Setdays = element.showCategoryToDays;
//         const dStartDate = new Date(dimageDate);
//         dStartDate.setDate(dimageDate.getDate() - Setdays);
//         const currentDate = new Date();
//         if (currentDate >= dStartDate && currentDate <= dimageDate) {
//           outputresult.push(element);
//         }
//       }
//       else {
//         const dimageDate = new Date(element.imageDate);
//         const dStartDate = new Date(dimageDate);
//         dStartDate.setDate(dimageDate.getDate() - iGeneralDays);
//         const currentDate = new Date();
//         if (currentDate >= dStartDate && currentDate <= dimageDate) {
//           outputresult.push(element);
//         }
//       }
//     });

//     res.json({
//       statusCode: 200,
//       data: outputresult,
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/category/today_category", async (req, res) => {
  try {
    const generalDay = await AddDefaultDaysForCategory.findOne(
      {},
      "showCategoryDays"
    );
    const iGeneralDays = generalDay.get("showCategoryDays");

    const data = await TodayAndTomorrowCategory.find();

    // Sort data based on imageDate in ascending order
    data.sort((a, b) => {
      const dateA = new Date(a.imageDate);
      const dateB = new Date(b.imageDate);
      return dateA - dateB;
    });

    const outputresult = [];

    const currentDate = new Date(); // Current date

    data.forEach((element) => {
      const imageDate = new Date(element.imageDate);
      const startOfImageDate = new Date(
        imageDate.getFullYear(),
        imageDate.getMonth(),
        imageDate.getDate()
      );
      const startOfNextDay = new Date(imageDate);
      startOfNextDay.setDate(imageDate.getDate() + 1);

      if (
        element.showCategoryDaysSwitch &&
        element.showCategoryToDays !== null
      ) {
        const daysDifference = element.showCategoryToDays;
        const dStartDate = new Date(imageDate);
        dStartDate.setDate(imageDate.getDate() - daysDifference);

        if (currentDate >= dStartDate && currentDate < startOfNextDay) {
          outputresult.push(element);
        }
      } else {
        const dStartDate = new Date(imageDate);
        dStartDate.setDate(imageDate.getDate() - iGeneralDays);

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

// Filter Api
router.post("/filterData", async (req, res) => {
  try {
    let pipeline = [];

    // Match documents based on starting date
    if (req.body.startingDate) {
      pipeline.push({
        $match: {
          imageDate: { $gte: req.body.startingDate },
        },
      });
    }

    // Match documents based on ending date
    if (req.body.endingDate) {
      pipeline.push({
        $match: {
          imageDate: { $lte: req.body.endingDate },
        },
      });
    }

    // Add a $count stage to count the documents
    pipeline.push({
      $count: "totalCount",
    });

    // Execute the aggregation pipeline
    let results = await TodayAndTomorrowCategory.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await TodayAndTomorrowCategory.aggregate(
        pipeline
      );

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



// async function addNewDateToWithdrawal() {
//   try {
//     // Find documents where you want to add the new date field
//     const documentsToUpdate = await TodayAndTomorrowCategory.find({ /* your query criteria here */ });

//     // Update the documents with the new formatted date field
//     for (const doc of documentsToUpdate) {
//       // Calculate the new date (current date + 2 seconds)
//       const newDate = moment().add(2, 'seconds').format("YYYY-MM-DD HH:mm:ss");

//       // Add the new date to the document
//       doc.addDate = newDate;

//       // Save the updated document
//       await doc.save();
//     }

//     console.log("New dates added successfully!");
//   } catch (error) {
//     console.error("Error adding new dates:", error);
//   }
// }

// // Call the function to add new dates with a 2-second delay
// setTimeout(addNewDateToWithdrawal, 2000); // 2000 milliseconds (2 seconds)

module.exports = router;
