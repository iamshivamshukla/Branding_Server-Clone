var express = require("express");
var router = express.Router();
var Frame = require("../modals/Frame");
var CanvaFrameEditd = require("../modals/CanvaFrameEditd");
var moment = require("moment")

// Post Canva-Frame
router.post("/frame", async (req, res) => {
  try {
    var count = await Frame.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["createDate"] = moment(new Date()).format("DD-MM-YYYY");
    req.body["createTime"] = moment(new Date()).format("HH:mm:ss");
    req.body["updateDate"] = moment(new Date()).format("DD-MM-YYYY");
    req.body["frameId"] = pad(count + 1);
    var data = await Frame.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Frame Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get All Canva Images (Admin)
router.post("/get_frame", async (req, res) => {
  try {
    var pageSize = req.body.pageSize;
    var pageNumber = req.body.pageNumber;
    var data = await Frame.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);
    var count = await Frame.count();
    data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      frameCount: count,
      message: "Read All Custome Dynamic Section",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/frame_delete", async (req, res) => {
  try {
    let result = await Frame.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Frame Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Get All Canva Images (Application)
router.get("/frame", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Set the limit of results per page, default to 10
    const page = parseInt(req.query.page) || 1; // Get the page number from the request query, default to page 1

    // Use cursor-based pagination
    const cursor = Frame.find({})
      .sort({ _id: -1 }) // Sort by a unique identifier (assuming _id is an ObjectId) in descending order for cursor pagination
      .skip((page - 1) * limit)
      .limit(limit);

    const data = await cursor.lean();
    const totalDocuments = await Frame.countDocuments({});
    const totalPages = Math.ceil(totalDocuments / limit);

    res.json({
      statusCode: 200,
      data: data,
      page: page,
      totalPages: totalPages,
      message: "Read All Frame",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// only get Canva Created Image url (Application)
router.get("/frameimage", async (req, res) => {
  try {
    const frames = await Frame.find().select({
      _id: 1,
      frameImage: 1,
    });

    const formattedFrames = frames.map((frame) => ({
      _id: frame._id,
      image: frame.frameImage,
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

// Send id and get Created Canva Image (Application)
router.get("/frameimage/:id", async (req, res) => {
  try {
    var data = await Frame.findById(req.params.id).select("-frameImage");
    res.json({
      statusCode: 200,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      // Use status() method to set status code
      statusCode: 500,
      message: error.message,
    });
  }
});

// Frmae Update for Canva
router.put("/frame/:id", async (req, res) => {
  try {
    req.body["updateDate"] = moment(new Date()).format("DD-MM-YYYY");
    req.body["updateTime"] = moment(new Date()).format("HH:mm:ss");
    const id = req.params.id;
    const updatedData = req.body;


    const result = await Frame.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).json({
        statusCode: 404,
        message: "Document not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: result,
      message: "Frame Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// FrameId Post For Only Canva
router.post("/framaid", async (req, res) => {
  try {
    var count = await CanvaFrameEditd.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["canvaImageEditId"] = pad(count + 1);
    var data = await CanvaFrameEditd.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Canvaid Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Id to Get Before Created Canva Frame All Data
router.get("/frmae_data/:id", async (req, res) => {
  try {
    var data = await Frame.findById(req.params.id).select("-frameImage");
    res.json({
      statusCode: 200,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      // Use status() method to set status code
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/frmae_remove/:id", async (req, res) => {
  try {
    const idToDelete = req.params.id;
    let result = await CanvaFrameEditd.deleteOne({ _id: idToDelete });

    if (result.deletedCount === 0) {
      return res.json({
        statusCode: 404,
        message: "CanvaFrameId not found",
      });
    }

    res.json({
      statusCode: 200,
      data: result,
      message: "CanvaFrameId Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/frame_idget", async (req, res) => {
  try {
    const data = await CanvaFrameEditd.find().select({
      _id: 1, // Include _id in the result
      CanvaFrameIdForEdit: 1,
    });

    res.json(data);
  } catch (error) {
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
    let results = await Frame.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await Frame.aggregate(pipeline);

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
