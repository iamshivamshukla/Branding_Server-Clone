var express = require("express");
var router = express.Router();
var AddDefaultDaysForCategory = require("../modals/AddDefaultDaysForCategory")
var { verifyToken } = require("../authentication");

// Post Category Days
router.post("/categorydays", verifyToken, async (req, res) => {
    try {
        var count = await AddDefaultDaysForCategory.count();
        function pad(num) {
            num = num.toString();
            while (num.length < 2) num = "0" + num;
            return num;
        }
        req.body["languageId"] = pad(count + 1);
        var data = await AddDefaultDaysForCategory.create(req.body);
        res.json({
            statusCode: 200,
            data: data,
            message: "Add Language Successfully",
        });
    } catch (error) {
        res.json({
            statusCode: 500,
            message: error.message,
        });
    }
});

// Get Category Days
router.get("/categorydays", verifyToken, async (req, res) => {
    try {
        var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
        var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

        var data = await AddDefaultDaysForCategory.aggregate([
            {
                $skip: pageSize * pageNumber,
            },
            {
                $limit: pageSize,
            },
        ]);

        var count = await AddDefaultDaysForCategory.countDocuments();

        // Optionally reverse the data array
        data.reverse();

        res.json({
            statusCode: 200,
            data: data,
            LanguageCount: count,
            message: "Read All Category Days",
        });
    } catch (error) {
        res.json({
            statusCode: 500,
            message: error.message,
        });
    }
});

// Edit Languages
router.put("/categorydays/:id", verifyToken, async (req, res) => {
    try {
        let result = await AddDefaultDaysForCategory.findByIdAndUpdate(req.params.id, req.body);
        res.json({
            statusCode: 200,
            data: result,
            message: "Category-Days Updated Successfully",
        });
    } catch (err) {
        res.json({
            statusCode: 500,
            message: err.message,
        });
    }
});

module.exports = router;