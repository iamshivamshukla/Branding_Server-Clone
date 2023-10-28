var express = require("express");
var router = express.Router();
var AddDefaultDaysForCategory = require("../modals/AddDefaultDaysForCategory")
var ClippingCount = require("../modals/Clipping")
var { verifyToken } = require("../authentication");

// Post ClippingCount
router.post("/clipping", verifyToken, async (req, res) => {
    try {
        var data = await ClippingCount.create(req.body);
        res.json({
            statusCode: 200,
            data: data,
            message: "Add ClippingCount Successfully",
        });
    } catch (error) {
        res.json({
            statusCode: 500,
            message: error.message,
        });
    }
});

// Get Category Days
router.get("/clipping", verifyToken, async (req, res) => {
    try {
        var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
        var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

        var data = await ClippingCount.aggregate([
            {
                $skip: pageSize * pageNumber,
            },
            {
                $limit: pageSize,
            },
        ]);

        var count = await ClippingCount.countDocuments();

        // Optionally reverse the data array
        data.reverse();

        res.json({
            statusCode: 200,
            data: data,
            ClippingCount: count,
            message: "Read All ClippingCount",
        });
    } catch (error) {
        res.json({
            statusCode: 500,
            message: error.message,
        });
    }
});

// Edit Languages
router.put("/clipping/:id", verifyToken, async (req, res) => {
    try {
        let result = await ClippingCount.findByIdAndUpdate(req.params.id, req.body);
        res.json({
            statusCode: 200,
            data: result,
            message: "ClippingCounts Updated Successfully",
        });
    } catch (err) {
        res.json({
            statusCode: 500,
            message: err.message,
        });
    }
});

module.exports = router;