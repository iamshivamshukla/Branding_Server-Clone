var express = require("express");
var router = express.Router();
var AddLanguage = require("../modals/AddLanguage");
var Withdrawal = require("../modals/Withdrawal");
var { verifyToken } = require("../authentication");
var moment = require("moment")

// Post Withrawl History (Application)
router.post("/withdrawal", verifyToken, async (req, res) => {
  try {
    var count = await Withdrawal.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["withdrawalId"] = pad(count + 1);
    var data = await Withdrawal.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Withdrawal Request has been Send",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get withdrawal history
router.get("/withdrawal", async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.pageNumber) || 0;

    const data = await Withdrawal.find({})
      .sort({ addDate: -1 }) // Sort by addDate in descending order
      .skip(pageSize * pageNumber)
      .limit(pageSize);


    const count = await Withdrawal.countDocuments();

    res.json({
      statusCode: 200,
      data: data,
      LanguageCount: count,
      message: "Read All Withdrawal History",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



router.get("/withdrawal/history", async (req, res) => {
  try {
    const data = await Withdrawal.find(); // Fetch all records without pagination

    res.json({
      statusCode: 200,
      data: data,
      LanguageCount: data.length,
      message: "Read All Withdrawal History",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// Delete withdrawal History
router.delete("/withdrawal", verifyToken, async (req, res) => {
  try {
    let result = await Withdrawal.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Withdrawal History Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.put("/withdrawal/tobank", async (req, res) => {
  try {
      let result = await Withdrawal.updateMany({}, {isWidrawalRequestsSendToBank: true});
      res.json({
          statusCode: 200,
          data: result,
          message: "Withdrawal Request Send to Bank Successfully",
      });
  } catch (err) {
      res.json({
          statusCode: 500,
          message: err.message,
      });
  }
});


router.put("/received", async (req, res) => {
  try {
    // Extract the array of _id values from the request body
    const { _ids } = req.body;

    if (!_ids || !Array.isArray(_ids) || _ids.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid or empty _ids array provided.",
      });
    }

    // Use the $in operator to match documents by _id and update isWidrawalRequestsMoneyReceive to true
    const result = await Withdrawal.updateMany(
      { _id: { $in: _ids } },
      { $set: { isWidrawalRequestsMoneyReceive: true } }
    );

    res.json({
      statusCode: 200,
      data: result,
      message: "Withdrawal Requests Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});





module.exports = router;
