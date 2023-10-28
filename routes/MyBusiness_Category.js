var express = require("express");
var router = express.Router();
var MyBusiness_Category = require("../modals/MyBusiness_Category");
var moment = require("moment");

router.post("/business_category", async (req, res) => {
  try {
    let findBusinessCategoryName = await MyBusiness_Category.findOne({
      businessCategoryName: req.body.businessCategoryName,
    });
    if (!findBusinessCategoryName) {
      var count = await MyBusiness_Category.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["businessCategoryId"] = pad(count + 1);
      var data = await MyBusiness_Category.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Business-Category Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.businessCategoryName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



router.post("/get_business_category", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await MyBusiness_Category.aggregate([
      {
        $project: {
          businessCategoryId: 1,
          businessTypeName: 1,
          businessCategoryName: 1,

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

    const count = await MyBusiness_Category.count();

    res.json({
      statusCode: 200,
      data: data,
      MyBusiness_CategoryCount: count,
      message: "Read All Business-Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// router.post("/get_business_category", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;
//     var data = await MyBusiness_Category.aggregate([
//       {
//         $skip: pageSize * pageNumber,
//       },
//       {
//         $limit: pageSize,
//       },
//     ]);
//     var count = await MyBusiness_Category.count();
//     data.reverse();
//     res.json({
//       statusCode: 200,
//       data: data,
//       MyBusiness_CategoryCount: count,
//       message: "Read All Business-Category",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/business_category/:id", async (req, res) => {
  try {
    let result = await MyBusiness_Category.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Business-Category Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_business_category", async (req, res) => {
  try {
    let result = await MyBusiness_Category.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Business-Category Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_business_category", async (req, res) => {
  try {
    let newArray = [];
      // console.log("not number");
      newArray.push(
        {
          businessTypeName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          businessCategoryName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
      );

    var data = await MyBusiness_Category.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Business-Type",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/businesstype_to_category/:businessTypeName", async (req, res) => {
  try {
    let findBusinesstypeToCategory = await MyBusiness_Category.find({
      businessTypeName: req.params.businessTypeName,
    }).select({
      _id: 0,
      businessCategoryName: 1,
    });
    console.log(findBusinesstypeToCategory, "findBusinesstypeToCategory")
    res.json({
      statusCode: 200,
      result: findBusinesstypeToCategory,
      message: "find the category form BusinessType Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Filter Api (Select Businesscategory in Dropdawn and get Selected Category ToData)
router.post("/filter_businesscategory", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.businessTypeName) {
      pipeline.push({
        $match: { businessTypeName: req.body.businessTypeName },
      });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });

    let result = await MyBusiness_Category.aggregate(pipeline);

    const responseData = {
      data: result[0].data,
      totalCount:
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
    };

    res.json({
      statusCode: 200,
      data: responseData.data,
      totalCount: responseData.totalCount,
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
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
    let results = await MyBusiness_Category.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await MyBusiness_Category.aggregate(pipeline);

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
