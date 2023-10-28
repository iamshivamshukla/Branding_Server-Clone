var express = require("express");
var router = express.Router();
var FrameRequest = require("../modals/FrameRequest");
var FrameUserCollection = require("../modals/Frame-User");
var { verifyToken } = require("../authentication");

// router.post("/framerequest", verifyToken, async (req, res) => {
//   try {
//     var count = await FrameRequest.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["frameRequestId"] = pad(count + 1);
//     var data = await FrameRequest.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Frame-request Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/framerequest", verifyToken, async (req, res) => {
  try {
    const userId = req.body.userId;

    // Check if there is a frame request with the same userId
    const existingFrameRequest = await FrameRequest.findOne({ userId });

    if (existingFrameRequest) {
      if (existingFrameRequest.isFrameCreated) {
        // If isFrameCreated is true, don't allow creating a new frame request
        return res.json({
          statusCode: 400,
          message: "You already have an active frame request.",
        });
      } else {
        // If isFrameCreated is false, update the existing frame request
        await FrameRequest.updateOne({ userId }, req.body);
        return res.json({
          statusCode: 200,
          message: "Updated existing frame request.",
        });
      }
    } else {
      // If no frame request exists for the user, create a new one
      var count = await FrameRequest.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["frameRequestId"] = pad(count + 1);
      var data = await FrameRequest.create(req.body);
      return res.json({
        statusCode: 200,
        data: data,
        message: "Added Frame-request Successfully.",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/framerequest", verifyToken, async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await FrameRequest.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await FrameRequest.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      FrameRequestCount: count,
      message: "Read All Frame-Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/framerequest", verifyToken, async (req, res) => {
  try {
    let result = await FrameRequest.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "FrameRequest Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/user/framerequest", async (req, res) => {
  try {
    var data = await FrameRequest.find({ isFrameCreated: false }).select({
      _id: 1,
      userName: 1,
      userId: 1,
    });
    res.json({
      data: data,
      statusCode: 200,
      message: "Read All Frame-Request User",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Post Canva-Fram (User Send Request To Create Frame and Store in Frame_Collection)
router.post("/frame/user", async (req, res) => {
  try {
    var count = await FrameUserCollection.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["frame_userId"] = pad(count + 1);
    var data = await FrameUserCollection.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Create Frame Successfully",
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
          frameRequestDate: { $gte: req.body.startingDate },
        },
      });
    }

    // Match documents based on ending date
    if (req.body.endingDate) {
      pipeline.push({
        $match: {
          frameRequestDate: { $lte: req.body.endingDate },
        },
      });
    }

    // Add a $count stage to count the documents
    pipeline.push({
      $count: "totalCount",
    });

    // Execute the aggregation pipeline
    let results = await FrameRequest.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await FrameRequest.aggregate(pipeline);

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

router.get("/ownframe/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await FrameUserCollection.find({ userId });

    res.json({
      data,
      statusCode: 200,
      message: `Read Frame-Request for user with ID: ${userId}`,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});





module.exports = router;
