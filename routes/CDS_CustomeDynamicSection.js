var express = require("express");
var router = express.Router();
var CDS_CustomeDynamicSection = require("../modals/CDS_CustomeDynamicSection");
var CanvaImageEditId = require("../modals/CanvaImageEditId");
const mongoose = require("mongoose");

// Post Canva Creted Image (Cnava - TypeScript)
// router.post("/cd_section", async (req, res) => {
//   try {
//     // if (!req.body.cds_template) {
//     //   // If 'cds_template' is not provided, respond with a message indicating it's missing
//     //   return res.status(400).json({
//     //     statusCode: 400,
//     //     message: "'cds_template' is required in the request body.",
//     //   });
//     // }

//     var count = await CDS_CustomeDynamicSection.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["cds_Id"] = pad(count + 1);
//     var data = await CDS_CustomeDynamicSection.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add Custome-Dynamic-Section Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/add_cd_section", async (req, res) => {
  try {
  
      var count = await CDS_CustomeDynamicSection.count();
      function pad(num) {
        num = num.toString();
        while (num.length < 2) num = "0" + num;
        return num;
      }
      req.body["cds_Id"] = pad(count + 1);
      var data = await CDS_CustomeDynamicSection.create(req.body);
      res.json({
        statusCode: 200,
        data: data,
        message: "Add Custome-Dynamic-Section Successfully",
      });
   
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get All Canva Images (Admin)
router.post("/get_cds_category", async (req, res) => {
  try {
    var pageSize = req.body.pageSize;
    var pageNumber = req.body.pageNumber;

    // Calculate the skip value
    var skipValue = pageSize * pageNumber;

    var data = await CDS_CustomeDynamicSection.aggregate([
      {
        $sort: { _id: -1 }, // Sort by _id in descending order (latest first)
      },
      {
        $facet: {
          paginatedData: [{ $skip: skipValue }, { $limit: pageSize }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    var paginatedData = data[0].paginatedData;
    var totalCount = data[0].totalCount[0].count;

    res.json({
      statusCode: 200,
      data: paginatedData,
      CDS_CustomeDynamicSectionCount: totalCount,
      message: "Read All Custome Dynamic Section",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get All Canva Images (Application)
router.get("/cd_section", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Set the limit of results per page, default to 10
    const page = parseInt(req.query.page) || 1; // Get the page number from the request query, default to page 1

    // Use cursor-based pagination
    const cursor = CDS_CustomeDynamicSection.find({})
      .sort({ _id: -1 }) // Sort by a unique identifier (assuming _id is an ObjectId) in descending order for cursor pagination
      .skip((page - 1) * limit)
      .limit(limit);

    const data = await cursor.lean();
    const totalDocuments = await CDS_CustomeDynamicSection.countDocuments({});
    const totalPages = Math.ceil(totalDocuments / limit);

    res.json({
      statusCode: 200,
      data: data,
      page: page,
      totalPages: totalPages,
      message: "Read All CustomeDynamicSection Data",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Canva Image Edit
router.put("/cd_section/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await CDS_CustomeDynamicSection.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({
        statusCode: 404,
        message: "Document not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: result,
      message: "Custome-Dynamic-Section Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/cd_section/remove", async (req, res) => {
  try {
    let result = await CDS_CustomeDynamicSection.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Custome-Dynamic-Section Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Id to Get Before Created Canva Image All Data
router.get("/cds_data/:id", async (req, res) => {
  try {
    var data = await CDS_CustomeDynamicSection.findById(req.params.id).select(
      "-cds_canvaImage"
    );
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

// CDS (Get CategortName and There Images)
// router.get("/cds_category_with_image", async (req, res) => {
//   try {
//     var data = await CDS_CustomeDynamicSection.find({});

//     // Create an object to store items by category
//     const itemsByCategory = {};

//     // Iterate through the data and group items by category
//     data.forEach((item) => {
//       const { cds_categoryName, cds_canvaImage, _id } = item; // Include _id here
//       if (!itemsByCategory[cds_categoryName]) {
//         itemsByCategory[cds_categoryName] = [];
//       }
//       itemsByCategory[cds_categoryName].push({
//         imageUrl: cds_canvaImage,
//         cds_id: _id,
//       });
//     });

//     // Create an array of objects with category and items
//     const result = Object.keys(itemsByCategory).map((category) => ({
//       cds_categoryName: category,
//       items: itemsByCategory[category],
//     }));

//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "Read All Dynamic-Section Data",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });


router.get("/cds_category_with_image", async (req, res) => {
  try {
    var data = await CDS_CustomeDynamicSection.find({});

    // Create an object to store items by category
    const itemsByCategory = {};

    // Iterate through the data and group items by category
    data.forEach((item) => {
      const { cds_categoryName, cds_canvaImage, _id } = item; // Include _id here
      if (!itemsByCategory[cds_categoryName]) {
        itemsByCategory[cds_categoryName] = [];
      }
      itemsByCategory[cds_categoryName].push({
        imageUrl: cds_canvaImage,
        cds_id: _id,
      });
    });

    // Create an array of objects with category and items
    const result = Object.keys(itemsByCategory)
      .sort() // Sort cds_categoryName alphabetically
      .map((category) => ({
        cds_categoryName: category,
        items: itemsByCategory[category],
      }));

    res.json({
      statusCode: 200,
      data: result,
      message: "Read All Dynamic-Section Data",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// Canva Id Post
router.post("/canva", async (req, res) => {
  try {
    var count = await CanvaImageEditId.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["canvaImageEditId"] = pad(count + 1);
    var data = await CanvaImageEditId.create(req.body);
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

router.get("/canva", async (req, res) => {
  try {
    const data = await CanvaImageEditId.find().select({
      _id: 1, // Include _id in the result
      CanvaImageIdForEdit: 1,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.put("/canva/:id", async (req, res) => {
  try {
    let result = await CanvaImageEditId.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "CanvaID Store Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// router.delete("/canva", async (req, res) => {
//   try {
//     let result = await CanvaImageEditId.deleteMany({
//       _id: { $in: req.body },
//     });
//     res.json({
//       statusCode: 200,
//       data: result,
//       message: "CanvaEditId Deleted Successfully",
//     });
//   } catch (err) {
//     res.json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

router.delete("/canva/:id", async (req, res) => {
  try {
    const idToDelete = req.params.id;
    let result = await CanvaImageEditId.deleteOne({ _id: idToDelete });

    if (result.deletedCount === 0) {
      return res.json({
        statusCode: 404,
        message: "CanvaEditId not found",
      });
    }

    res.json({
      statusCode: 200,
      data: result,
      message: "CanvaEditId Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
