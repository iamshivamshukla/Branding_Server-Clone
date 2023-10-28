var express = require("express");
var router = express.Router();
var TrendingAndNews_Data = require("../modals/TrendingAndNews_Data");
var TrendingAndNews_Category = require("../modals/TrendingAndNews_Category");
var TodayAndTomorrow = require("../modals/TodayAndTomorrow");
var TodayAndTomorrowCategory = require("../modals/TodayAndTomorrow_Category");
var moment = require("moment");

// router.post("/trendingandnews_item", async (req, res) => {
//   try {
//     var count = await TrendingAndNews_Data.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["trendingAndNews_itemId"] = pad(count + 1);
//     var data = await TrendingAndNews_Data.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add TrendingAndNews_Data Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/trendingandnews_item", async (req, res) => {
  try {
    let { todayAndTomorrowImageOrVideoName } = req.body;

    // Check if the initial name already exists in the database
    let count = await TrendingAndNews_Data.countDocuments({
      todayAndTomorrowImageOrVideoName: todayAndTomorrowImageOrVideoName,
    });

    let increment = 1;

    // If the initial name already exists, keep incrementing the number until a unique name is found
    while (count > 0) {
      todayAndTomorrowImageOrVideoName = `${req.body.todayAndTomorrowImageOrVideoName} ${increment}`;
      count = await TrendingAndNews_Data.countDocuments({
        todayAndTomorrowImageOrVideoName: todayAndTomorrowImageOrVideoName,
      });
      increment++;
    }

    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }

    // Get the count of existing documents in the collection
    const existingCount = await TrendingAndNews_Data.countDocuments();

    // Increment the count by 1 to determine the next available todayAndTomorrowId
    const nextId = existingCount + 1;

    req.body["trendingAndNews_itemId"] = pad(nextId);
    req.body["todayAndTomorrowImageOrVideoName"] =
      todayAndTomorrowImageOrVideoName;

    var data = await TrendingAndNews_Data.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add TrendingAndNews_Data Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


router.post("/get_trendingandnews_item", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await TrendingAndNews_Data.aggregate([
      {
        $project: {
          trendingAndNews_itemId: 1,
          todayAndTomorrowImageOrVideoName: 1,
          todayAndTomorrowImageOrVideo: 1,
          isVideo: 1,
          categoryName: 1,
          languageName: 1,
          createDate: 1,
          createTime: 1,
          updateDate: 1,
          comp_iamge: 1,
          addDate: {
            $dateFromString: {
              dateString: "$addDate",
              format: "%Y-%m-%d %H:%M:%S",
            },
          },
        },
      },
      {
        $sort: { addDate: -1 }, // Sort by addDate in descending order
      },
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    const count = await TrendingAndNews_Data.count();

    res.json({
      statusCode: 200,
      data: data,
      TrendingAndNews_DataCount: count,
      message: "Read All TrendingAndNews_Data",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



// router.post("/get_trendingandnews_item", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;
//     var data = await TrendingAndNews_Data.aggregate([
//       {
//         $skip: pageSize * pageNumber,
//       },
//       {
//         $limit: pageSize,
//       },
//     ]);
//     var count = await TrendingAndNews_Data.count();
//     data.reverse();
//     res.json({
//       statusCode: 200,
//       data: data,
//       TrendingAndNews_DataCount: count,
//       message: "Read All TrendingAndNews_Data",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/trendingandnews_item/:id", async (req, res) => {
  try {
    let result = await TrendingAndNews_Data.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "TrendingAndNews_Data Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_trendingandnews_item", async (req, res) => {
  try {
    let result = await TrendingAndNews_Data.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "TrendingAndNews_Data Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_trendingandnews_item", async (req, res) => {
  try {
    let newArray = [];
    if (Number(req.body.search)) {
      // console.log("number");
      newArray.push({
        trendingAndNews_itemId: { $regex: req.body.search, $options: "i" },
      });
    } else {
      // console.log("not number");
      newArray.push(
        {
          categoryName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          isVideo: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          isVtodayAndTomorrowImageOrVideoNameideo: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        }
      );
    }

    var data = await TrendingAndNews_Data.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All TrendingAndNews_Data",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get trendingandnews_item Data (Application)
// router.get("/trendingandnews_item", async (req, res) => {
//   try {
//     var data = await TrendingAndNews_Data.find({});
//     data.reverse();

//     // Create an object to store items by category
//     const itemsByCategory = {};

//     // Iterate through the data and group items by category
//     data.forEach((item) => {
//       const { categoryName } = item;
//       if (!itemsByCategory[categoryName]) {
//         itemsByCategory[categoryName] = [];
//       }
//       itemsByCategory[categoryName].push(item);
//     });

//     // Create an array of objects with category and items
//     const result = Object.keys(itemsByCategory).map((categoryName) => ({
//       categoryName: categoryName,
//       items: itemsByCategory[categoryName],
//     }));

//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "Read All My TrendingAndNews_Data Data",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/trendingandnews_item", async (req, res) => {
  try {
    // Fetch data from TrendingAndNews_Data
    const data = await TrendingAndNews_Data.find({});

    // Create an object to store items by category
    const itemsByCategory = {};

    // Iterate through the data and group items by category
    data.forEach((item) => {
      const { categoryName } = item;
      if (!itemsByCategory[categoryName]) {
        itemsByCategory[categoryName] = [];
      }
      itemsByCategory[categoryName].push(item);
    });

    // Fetch data from TrendingAndNews_Category
    const categoryData = await TrendingAndNews_Category.find({
      trendingAndNews_switch: true, // Filter by the switch condition
    });

    // Create an array of objects with category and items
    const result = categoryData.map((category) => ({
      _id: category._id,
      categoryName: category.trendingAndNews_CategoryName,
      trendingAndNewsCategory_Id: category._id,
      trendingAndNews_CategoryName: category.trendingAndNews_CategoryName,
      trendingAndNews_CategoryImage: category.trendingAndNews_CategoryImage,
      trendingAndNews_CategoryImageName:
        category.trendingAndNews_CategoryImageName,
      trendingAndNews_switch: category.trendingAndNews_switch,
      items: itemsByCategory[category.trendingAndNews_CategoryName] || [],
    }));

    result.reverse();

    res.json({
      statusCode: 200,
      data: result,
      message: "Read All My TrendingAndNews_Data Data",
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
    let results = await TrendingAndNews_Data.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await TrendingAndNews_Data.aggregate(
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

// ----------------------------------------------------------------




// async function addNewDateToWithdrawal() {
//   try {
//     // Find documents where you want to add the new date field
//     const documentsToUpdate = await TrendingAndNews_Data.find({ /* your query criteria here */ });

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
