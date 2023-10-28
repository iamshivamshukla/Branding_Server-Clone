var express = require("express");
var router = express.Router();
var CDS_Category = require("../modals/CDS_Category");
var moment = require("moment");
var { verifyToken } = require("../authentication");

// =================Admin=======================
// Post Custome-Category (Admin)
router.post("/category", verifyToken, async (req, res) => {
  try {
    let findCdsCategoryName = await CDS_Category.findOne({
      cds_categoryName: req.body.cds_categoryName,
    });
    if (!findCdsCategoryName) {
      var count = await CDS_Category.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["cds_categoryId"] = pad(count + 1);
      var data = await CDS_Category.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Custome-Dynamic-Section Category Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.cds_categoryName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Custome-Category (Admin)
router.get("/category", verifyToken, async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await CDS_Category.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await CDS_Category.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      CDS_CategoryCount: count,
      message: "Read All Custome-Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Put Custome-Category (Admin)
router.put("/category/:id", verifyToken, async (req, res) => {
  try {
    let result = await CDS_Category.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "CDS-Category Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Delete Custome-Category (Admin)
router.delete("/category", verifyToken, async (req, res) => {
  try {
    let result = await CDS_Category.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "CDS-Category Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Search Custome-Category (Admin)
router.post("/category/search", verifyToken, async (req, res) => {
  try {
    let newArray = [];
    newArray.push({
      cds_categoryName: !isNaN(req.body.search)
        ? req.body.search
        : { $regex: req.body.search, $options: "i" },
    });

    var data = await CDS_Category.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Custome-Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});
// ==================================================

// Get Custome Dynamic Section Category (Application - Api)
router.get("/category/cds", verifyToken, async (req, res) => {
  try {
    var data = await CDS_Category.find({ cds_categorySwitch: true });
    data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Custome-Category",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Custome Dynamic Category (Use in When Canva Image Save)
router.get("/get_category", async (req, res) => {
  try {
    var data = await CDS_Category.find({ cds_categorySwitch: true }).select({
      _id: 0,
      cds_categoryName: 1,
    });
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Category",
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
    let results = await CDS_Category.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await CDS_Category.aggregate(pipeline);

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
