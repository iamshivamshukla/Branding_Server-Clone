var express = require("express");
var router = express.Router();
var AddBusinessType = require("../modals/MyBusiness_AddBusinessType");
var moment = require("moment");

router.post("/business_type", async (req, res) => {
  try {
    let findBusinessTypeName = await AddBusinessType.findOne({
      businessTypeName: req.body.businessTypeName,
    });
    if (!findBusinessTypeName) {
      var count = await AddBusinessType.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["businessTypeId"] = pad(count + 1);
      var data = await AddBusinessType.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Business-Type Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.businessTypeName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


router.post("/get_business_type", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await AddBusinessType.aggregate([
      {
        $project: {
          businessTypeId: 1,
          businessTypeName: 1,
          businessTypeImage: 1,
          businessTypeSwitch: 1,
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

    const count = await AddBusinessType.count();

    res.json({
      statusCode: 200,
      data: data,
      AddBusinessTypeCount: count,
      message: "Read All AddBusinessType",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// router.post("/get_business_type", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;
//     var data = await AddBusinessType.aggregate([
//       {
//         $skip: pageSize * pageNumber,
//       },
//       {
//         $limit: pageSize,
//       },
//     ]);
//     var count = await AddBusinessType.count();
//     data.reverse();
//     res.json({
//       statusCode: 200,
//       data: data,
//       BusinessTypeCount: count,
//       message: "Read All Business-Type",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/business_type/:id", async (req, res) => {
  try {
    let result = await AddBusinessType.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "Business-Type Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_business_type", async (req, res) => {
  try {
    let result = await AddBusinessType.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Business-Type Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_business_type", async (req, res) => {
  try {
    let newArray = [];
      // console.log("not number");
      newArray.push(
        {
          businessTypeName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
      );

    var data = await AddBusinessType.find({
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

// Get businessTypeName For Admin
router.get("/get_business_type", async (req, res) => {
  try {
    var data = await AddBusinessType.find().select({
      _id: 0,
      businessTypeName: 1,
    });
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

// Get businessType (Application)
router.get("/business_type", async (req, res) => {
  try {
    var data = await AddBusinessType.find({ businessTypeSwitch: true });
    data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Business Type",
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
    let results = await AddBusinessType.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await AddBusinessType.aggregate(pipeline);

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
