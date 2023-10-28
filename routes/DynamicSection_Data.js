var express = require("express");
var router = express.Router();
var DynamicSection_Item = require("../modals/DynamicSection_Data");
var moment = require("moment");

router.post("/ds_item", async (req, res) => {
  try {
    var count = await DynamicSection_Item.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
    req.body["ds_itemId"] = pad(count + 1);
    var data = await DynamicSection_Item.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add Dynamic_Section Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/get_ds_item", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await DynamicSection_Item.aggregate([
      {
        $project: {
          ds_itemId: 1,
          ds_category: 1,
          ds_itemImage: 1,

          ds_itemSwitch: 1,
          languageName: 1,
          isVideo: 1,
          createDate: 1,
          createTime: 1,
          updateDate: 1,
          updateTime: 1,
          comp_iamge: 1,
          addDate: {
            $dateFromString: {
              dateString: "$addDate",
              format: "%Y-%m-%d %H:%M:%S",
            },
          },
        },
      },
      {
        $sort: { addDate: -1 }, // Sort by addDate in descending orders
      },
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    const count = await DynamicSection_Item.count();

    res.json({
      statusCode: 200,
      data: data,
      DynamicSection_ItemCount: count,
      message: "Read All DynamicSection",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/get_ds_item", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;

//     // Calculate the skip value
//     var skipValue = pageSize * pageNumber;

//     var data = await DynamicSection_Item.aggregate([
//       {
//         $sort: { _id: -1 }, // Sort by _id in descending order (latest first)
//       },
//       {
//         $facet: {
//           paginatedData: [{ $skip: skipValue }, { $limit: pageSize }],
//           totalCount: [{ $count: "count" }],
//         },
//       },
//     ]);

//     var paginatedData = data[0].paginatedData;
//     var totalCount = data[0].totalCount[0].count;

//     res.json({
//       statusCode: 200,
//       data: paginatedData,
//       DynamicSection_ItemCount: totalCount,
//       message: "Read All DynamicSection",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/ds_item/:id", async (req, res) => {
  try {
    let result = await DynamicSection_Item.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "DynamicSection Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_ds_item", async (req, res) => {
  try {
    let result = await DynamicSection_Item.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "DynamicSection Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_ds_item", async (req, res) => {
  try {
    let newArray = [];
    newArray.push(
      {
        ds_category: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      },
      {
        languageName: !isNaN(req.body.search)
          ? req.body.search
          : { $regex: req.body.search, $options: "i" },
      }
    );

    var data = await DynamicSection_Item.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All DynamicSection",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//  Get Dynamic Section (Application)
// router.get("/ds_item", async (req, res) => {
//   try {
//     var data = await DynamicSection_Item.find({
//       ds_itemSwitch: true,
//     });

//     // Create an object to store items by category
//     const itemsByCategory = {};
//     console.log(itemsByCategory, "itemsByCategory");

//     // Iterate through the data and group items by category
//     data.forEach((item) => {
//       const { ds_category, ds_itemImage, languageName, isVideo } = item;
//       if (!itemsByCategory[ds_category]) {
//         itemsByCategory[ds_category] = [];
//       }
//       itemsByCategory[ds_category].push({
//         imageUrl: ds_itemImage,
//         languageName: languageName,
//         isVideo: isVideo,
//       });
//     });

//     // Create an array of objects with category and items
//     const result = Object.keys(itemsByCategory).map((category) => ({
//       ds_category: category,
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


router.get("/ds_item", async (req, res) => {
  try {
    var data = await DynamicSection_Item.find({
      ds_itemSwitch: true,
    });

    // Create an object to store items by category
    const itemsByCategory = {};

    // Iterate through the data and group items by category
    data.forEach((item) => {
      const { ds_category, ds_itemImage, languageName, isVideo } = item;
      if (!itemsByCategory[ds_category]) {
        itemsByCategory[ds_category] = [];
      }
      itemsByCategory[ds_category].push({
        imageUrl: ds_itemImage,
        languageName: languageName,
        isVideo: isVideo,
      });
    });

    // Sort the categories in a case-insensitive ascending order (A to Z)
    const sortedCategories = Object.keys(itemsByCategory).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    // Create an array of objects with sorted category and items
    const result = sortedCategories.map((category) => ({
      ds_category: category,
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


// Filter Api (Select DynamicSection Category in Dropdawn and get Selected Category ToData)
router.post("/filter_ds_item", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.ds_category) {
      pipeline.push({
        $match: { ds_category: req.body.ds_category },
      });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });

    let result = await DynamicSection_Item.aggregate(pipeline);

    const responseData = {
      data: result[0].data,
      totalCount:
        result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
    };

    res.json({
      statusCode: 200,
      data: responseData.data,
      totalCount: responseData.totalCount,
      message: "Filtered data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
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
    let results = await DynamicSection_Item.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await DynamicSection_Item.aggregate(pipeline);

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
