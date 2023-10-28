var express = require("express");
var router = express.Router();
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
  adminCreateToken,
} = require("../authentication");
var Registers = require("../modals/Admin_Register");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var nodemailer = require("nodemailer");

// Register
router.post("/register", async (req, res) => {
  try {
    const user = await Registers.findOne({ email: req.body.email });
    const mobileNumberCheck = await Registers.findOne({
      mobileNumber: req.body.mobileNumber,
    });
    if (user) {
      return res
        .status(401)
        .send({ statusCode: 401, message: "Email all ready in use" });
    }
    if (mobileNumberCheck) {
      return res
        .status(402)
        .send({ statusCode: 402, message: "Mobile-Number already in use" });
    }
    let hashConvert = await hashPassword(req.body.password, req.body.cPassword);
    req.body.password = hashConvert;
    req.body.cPassword = hashConvert;
    const data = await Registers.create(req.body);

    if (data) {
      res.json({
        statusCode: 200,
        data: data,
        message: "Add successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await Registers.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await hashCompare(req.body.password, user.password);
    if (!isMatch) {
      return res.json({ statusCode: 402, message: "Enter Valid Password" });
    }

    const tokens = await adminCreateToken({
      _id: user._id,
      userName: user.userName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      password: user.password,
      cPassword: user.cPassword,
      accessType: user.accessType,
    });
    if (isMatch) {
      res.json({
        statusCode: 200,
        message: "User Authenticated",
        token: tokens,
      });
    }
  } catch (error) {
    res.json({ statusCode: 500, message: error.message });
  }
});

router.get("/access/get", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await Registers.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await Registers.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      AccessCount: count,
      message: "Read All Access",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



router.delete("/register/remove", async (req, res) => {
  try {
    let result = await Registers.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Access Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});



router.put("/register/:id", async (req, res) => {
  try {
    let result = await Registers.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Access Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// chack authentication  // varify token
router.post("/auth", verifyToken, async (req, res) => {
  res.json({
    statusCode: 200,
    message: req.body.purpose,
  });
});

module.exports = router;
