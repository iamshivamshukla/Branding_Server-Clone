var express = require("express");
var router = express.Router();
var DynamicSection_Title = require("../modals/DynamicSection_Title");
var moment = require("moment");

router.post("/ds_title", async (req, res) => {
  try {
    let findCdsCategoryName = await DynamicSection_Title.findOne({
      ds_category: req.body.ds_category,
    });
    if (!findCdsCategoryName) {
      var count = await DynamicSection_Title.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["ds_Id"] = pad(count + 1);
      var data = await DynamicSection_Title.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Dynamic-Category Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.ds_category} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


router.post("/get_ds_title", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await DynamicSection_Title.aggregate([
      {
        $project: {
          ds_Id: 1,
          ds_category: 1,
          ds_switch: 1,

          createDate: 1,
          createTime: 1,
          updateDate: 1,
          updateTime: 1,
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

    const count = await DynamicSection_Title.count();

    res.json({
      statusCode: 200,
      data: data,
      DynamicSection_TitleCount: count,
      message: "Read All DynamicSection",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/get_ds_title", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;

//     // Calculate the skip value
//     var skipValue = pageSize * pageNumber;

//     var data = await DynamicSection_Title.aggregate([
//       {
//         $sort: { _id: -1 }, // Sort by _id in descending order (latest first)
//       },
//       {
//         $facet: {
//           paginatedData: [{ $skip: skipValue }, { $limit: pageSize }],
//           totalCount: [{ $count: "count" }],
//         },
//       },
//     ]);

//     var paginatedData = data[0].paginatedData;
//     var totalCount = data[0].totalCount[0].count;

//     res.json({
//       statusCode: 200,
//       data: paginatedData,
//       DynamicSection_TitleCount: totalCount,
//       message: "Read All DynamicSection",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/ds_title/:id", async (req, res) => {
  try {
    let result = await DynamicSection_Title.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Dynamic-Category Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});



router.post("/delete_ds_title", async (req, res) => {
  try {
    const deletedIds = req.body; // Array of _id values to be deleted

    let result = await DynamicSection_Title.deleteMany({
      _id: { $in: deletedIds },
    });

    // Log the deleted _id values
    console.log('Deleted _id values:', deletedIds);

    res.json({
      statusCode: 200,
      data: result,
      message: "Dynamic-Category Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});


// router.post("/delete_ds_title", async (req, res) => {
//   try {
//     let result = await DynamicSection_Title.deleteMany({
//       _id: { $in: req.body },
//     });
//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "Dynamic-Category Deleted Successfully",
//     });
//   } catch (err) {
//     res.json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

router.post("/search_ds_category", async (req, res) => {
  try {
    let newArray = [];
    if (Number(req.body.search)) {
      // console.log("number");
      newArray.push({
        ds_Id: { $regex: req.body.search, $options: "i" },
      });
    } else {
      // console.log("not number");
      newArray.push(
        {
          ds_name: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          ds_switch: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        }
      );
    }

    var data = await DynamicSection_Title.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Dynamic-Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get CategoryName Only (Admin)
router.get("/ds_category", async (req, res) => {
  try {
    var data = await DynamicSection_Title.find().select({
      _id: 0,
      ds_category: 1,
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
    let results = await DynamicSection_Title.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await DynamicSection_Title.aggregate(
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
