var express = require("express");
var router = express.Router();
var TrendingAndNews_Category = require("../modals/TrendingAndNews_Category");
var TrendingAndNews_Data = require("../modals/TrendingAndNews_Data");
var moment = require("moment");

router.post("/trendingandnews_category", async (req, res) => {
  try {
    let findCdsCategoryName = await TrendingAndNews_Category.findOne({
      trendingAndNews_CategoryName: req.body.trendingAndNews_CategoryName,
    });
    if (!findCdsCategoryName) {
      var count = await TrendingAndNews_Category.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["trendingAndNewsCategory_Id"] = pad(count + 1);
      var data = await TrendingAndNews_Category.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add TrendingAndNews_Category Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.trendingAndNews_CategoryName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



router.post("/get_trendingandnews_category", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await TrendingAndNews_Category.aggregate([
      {
        $project: {
          trendingAndNews_itemId: 1,
          trendingAndNews_CategoryName: 1,
          trendingAndNews_CategoryImage: 1,

          trendingAndNews_CategoryImageName: 1,
          trendingAndNews_switch: 1,
          createDate: 1,
          createTime: 1,
          updateDate: 1,
          updateTime: 1,
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

    const count = await TrendingAndNews_Category.count();

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


// router.post("/get_trendingandnews_category", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;
//     var data = await TrendingAndNews_Category.aggregate([
//       {
//         $sort: { updateDate: -1 } // Sort by updateDate in descending order
//       },
//       {
//         $skip: pageSize * pageNumber,
//       },
//       {
//         $limit: pageSize,
//       },
//     ]);
//     var count = await TrendingAndNews_Category.count();
//     res.json({
//       statusCode: 200,
//       data: data,
//       TrendingAndNews_CategoryCount: count,
//       message: "Read All TrendingAndNews_Category",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/trendingandnews_category/:id", async (req, res) => {
  try {
    let result = await TrendingAndNews_Category.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "TrendingAndNews_Category Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_trendingandnews_category", async (req, res) => {
  try {
    let result = await TrendingAndNews_Category.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "TrendingAndNews_Category Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});


// router.post("/delete_trendingandnews_category", async (req, res) => {
//   try {
//     // Check if the category is used in TrendingAndNews_Data
//     const categoryInUse = await TrendingAndNews_Data.findOne({
//       categoryName: req.body.trendingAndNews_CategoryName
//     });

//     if (categoryInUse) {
//       return res.json({
//         statusCode: 400,
//         message: "Cannot delete the category as it is being used in TrendingAndNews_Data."
//       });
//     }

//     // If the category is not in use, proceed with deletion
//     const result = await TrendingAndNews_Category.deleteMany({
//       _id: { $in: req.body },
//     });

//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "TrendingAndNews_Category Deleted Successfully",
//     });
//   } catch (err) {
//     res.json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });



router.post("/search_trendingandnews_category", async (req, res) => {
  try {
    let newArray = [];
    if (Number(req.body.search)) {
      // console.log("number");
      newArray.push({
        trendingAndNews_Id: { $regex: req.body.search, $options: "i" },
      });
    } else {
      // console.log("not number");
      newArray.push(
        {
          trendingAndNews_CategoryName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          trendingAndNews_CategoryImageName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        }
      );
    }

    var data = await TrendingAndNews_Category.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All TrendingAndNews_Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get CategoryName Only (Admin)
router.get("/get_trendingandnews_category", async (req, res) => {
  try {
    var data = await TrendingAndNews_Category.find().select({
      _id: 0,
      trendingAndNews_CategoryName: 1,
    });
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Data",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Category (Application)
router.get("/trendingandnews_category", async (req, res) => {
  try {
    var data = await TrendingAndNews_Category.find({
      trendingAndNews_switch: true,
    });
    data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All TrendingAndNews_Category Data",
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
    let results = await TrendingAndNews_Category.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await TrendingAndNews_Category.aggregate(
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






module.exports = router;
