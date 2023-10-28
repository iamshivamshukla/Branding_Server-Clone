var express = require("express");
var router = express.Router();
var PaymentStatus = require("../modals/PaymentStatus");
var moment = require("moment");
var { verifyToken } = require("../authentication");
var UserRegister = require("../modals/User_Register");

// Post Payment Screen shoot (Aplicaion)
router.post("/payment", async (req, res) => {
  try {
    var count = await PaymentStatus.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["PaymentStatusId"] = pad(count + 1);
    var data = await PaymentStatus.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Payment-Status Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Payment Screen shoot (Aplicaion)
router.get("/payment", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await PaymentStatus.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await PaymentStatus.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      paymentStatusCount: count,
      message: "Read All Payment-Status",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.put("/payment/:id", verifyToken, async (req, res) => {
//   try {
//     let result = await PaymentStatus.findByIdAndUpdate(req.params.id, req.body);
//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "Payment-Status Updated Successfully",
//     });
//   } catch (err) {
//     res.json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

router.put("/payment/:id", async (req, res) => {
  try {
    const updatedPayment = req.body;

    // Update the PaymentStatus collection
    let result = await PaymentStatus.findByIdAndUpdate(
      req.params.id,
      updatedPayment
    );

    // Check if the isPayment flag in PaymentStatus is true
    if (updatedPayment.isPayment === true) {
      // Update the corresponding mlm document's isPayment field
      await UserRegister.updateOne(
        { adhaar: result.adhaar },
        { $set: { isPayment: true } }
      );
    }

    res.json({
      statusCode: 200,
      data: result,
      message: "Payment-Status Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/payment/:adhaar", async (req, res) => {
  try {
    const adhaar = req.params.adhaar;

    const data = await UserRegister.findOne({ adhaar });

    if (!data) {
      return res.status(203).json({
        statusCode: 203,
        message: "Data not found",
      });
    }

    let statusCode, message;

    if (data.isPayment === true) {
      statusCode = 200;
      message = "Your Subscription has been purchased";
    } else {
      statusCode = 202;
      message = "Payment not made";
    }

    res.status(statusCode).json({
      statusCode,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
