var express = require("express");
var router = express.Router();
var FrameUserCollection = require("../modals/Frame-User");
var { verifyToken } = require("../authentication");

router.post("/frame/save", verifyToken, async (req, res) => {
  try {
    var count = await FrameUserCollection.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["frameRequestId"] = pad(count + 1);
    var data = await FrameUserCollection.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Frame-request Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//
router.get("/frame/save/:userId", async (req, res) => {
  try {
    const userId = req.params.userId; // Get the user ID from the URL parameter
    var data = await FrameUserCollection.find({ userId: userId });
    if (data) {
      res.json({
        data: data,
        statusCode: 200,
        message: "Get All Frame Successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Profile not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// only get Canva Created frame url (Application)
router.get("/frameimage", async (req, res) => {
  try {
    const frames = await FrameUserCollection.find().select({
      _id: 1,
      savedFrame_user: 1,
    });

    const formattedFrames = frames.map((frame) => ({
      _id: frame._id,
      image: frame.savedFrame_user,
    }));

    res.json({
      data: formattedFrames,
      statusCode: 200,
      message: "Read All Frame",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Send id and get Created Canva frame (Application)
router.get("/frameimage/:id", async (req, res) => {
  try {
    var data = await FrameUserCollection.findById(req.params.id).select(
      "-savedFrame_user -fullName_user -userId"
    );

    // Create a new response object with modified fields
    const modifiedData = {
      _id: data._id,
      frameId: data.frame_userId,
      frame: data.savedFrameLayer_user,
      __v: data.__v,
    };

    res.json({
      statusCode: 200,
      data: modifiedData,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
