var express = require("express");
var router = express.Router();
var AddLanguage = require("../modals/AddLanguage");
var { verifyToken } = require("../authentication");

// Post Language
router.post("/language", verifyToken, async (req, res) => {
  try {
    let findLanguageNameName = await AddLanguage.findOne({
      languageName: req.body.languageName,
    });
    if (!findLanguageNameName) {
      var count = await AddLanguage.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["languageId"] = pad(count + 1);
      var data = await AddLanguage.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Language Successfully",
      });
    } else {
      res.json({
        statusCode: 500,
        message: `${req.body.languageName} Name Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Languages
router.get("/language", verifyToken, async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await AddLanguage.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await AddLanguage.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      LanguageCount: count,
      message: "Read All Language",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Edit Languages
router.put("/language/:id", verifyToken, async (req, res) => {
  try {
    let result = await AddLanguage.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Language Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Delete Languages
router.delete("/language", verifyToken, async (req, res) => {
  try {
    let result = await AddLanguage.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Language Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Only Get LangugaeName For Dropdawn
router.get("/languages", verifyToken, async (req, res) => {
  try {
    var data = await AddLanguage.find().select({
      _id: 0,
      languageName: 1,
    });
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Language",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/language/search", verifyToken, async (req, res) => {
  try {
    let newArray = [];

    newArray.push({
      languageName: !isNaN(req.body.search)
        ? req.body.search
        : { $regex: req.body.search, $options: "i" },
    });

    var data = await AddLanguage.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Search Language has been found!",
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
    let results = await AddLanguage.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await AddLanguage.aggregate(pipeline);

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
