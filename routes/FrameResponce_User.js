var express = require("express");
var router = express.Router();
var FrameRequestResponce = require("../modals/Frame-User");
var moment = require("moment")




router.get("/frame/responce", async (req, res) => {
    try {
      var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
      var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided
  
      var data = await FrameRequestResponce.aggregate([
        {
          $skip: pageSize * pageNumber,
        },
        {
          $limit: pageSize,
        },
      ]);
  
      var count = await FrameRequestResponce.countDocuments();
  
      // Optionally reverse the data array
      data.reverse();
  
      res.json({
        statusCode: 200,
        data: data,
        FrameRequestCount: count,
        message: "Read All Frame-Responce",
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  });



  router.delete("/frame/responce", async (req, res) => {
    try {
      let result = await FrameRequestResponce.deleteMany({
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


  router.put("/frame_responce/edit/:id", async (req, res) => {
    try {
      req.body["updateDate"] = moment(new Date()).format("DD-MM-YYYY");
      req.body["updateTime"] = moment(new Date()).format("HH:mm:ss");
      const id = req.params.id;
      const updatedData = req.body;
  
  
      const result = await FrameRequestResponce.findByIdAndUpdate(id, updatedData, {
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

module.exports = router;
