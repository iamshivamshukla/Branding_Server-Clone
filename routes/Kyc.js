var express = require("express");
var router = express.Router();
var KycDetails = require("../modals/Kyc");

router.post("/kyc", async (req, res) => {
  try {
    var count = await KycDetails.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["kycId"] = pad(count + 1);
    var data = await KycDetails.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Kyc Detais Uploade Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/kyc", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await KycDetails.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await KycDetails.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      KycCount: count,
      message: "Read All KYC-Details",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/kyccheck/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;

    const data = await KycDetails.findOne({ mobileNumber });

    if (!data) {
      return res.status(204).json({
        statusCode: 204,
        message: "Data not found",
      });
    }

    if (data.status.length === 0) {
      return res.status(201).json({
        statusCode: 201,
        message: "Your KYC is Not Set",
      });
    } else if (data.status.includes("Pending")) {
      return res.status(202).json({
        statusCode: 202,
        message: "Your KYC is Under Verification",
      });
    } else if (data.status.includes("Reject")) {
      return res.status(203).json({
        statusCode: 203,
        message: "Your KYC is Reject",
      });
    } else if (data.status.includes("Complete")) {
      return res.status(200).json({
        statusCode: 200,
        message: "Your KYC is Approved",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});


router.put("/kyc/:id", async (req, res) => {
    try {
      let result = await KycDetails.findByIdAndUpdate(req.params.id, req.body);
      res.json({
        statusCode: 200,
        data: result,
        message: "KYC Updated Successfully",
      });
    } catch (err) {
      res.json({
        statusCode: 500,
        message: err.message,
      });
    }
  });

module.exports = router;
