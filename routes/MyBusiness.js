var express = require("express");
var router = express.Router();
var MyBusiness = require("../modals/MyBusiness");
var moment = require("moment");

// router.post("/business", async (req, res) => {
//   try {
//     var count = await MyBusiness.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["myBusinessId"] = pad(count + 1);
//     var data = await MyBusiness.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add My-Business Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/business", async (req, res) => {
  try {
    let { myBusinessName } = req.body;

    // Check if the initial name already exists in the database
    let count = await MyBusiness.countDocuments({
      myBusinessName: myBusinessName,
    });

    let increment = 1;

    // If the initial name already exists, keep incrementing the number until a unique name is found
    while (count > 0) {
      myBusinessName = `${req.body.myBusinessName} ${increment}`;
      count = await MyBusiness.countDocuments({
        myBusinessName: myBusinessName,
      });
      increment++;
    }

    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }

    // Get the count of existing documents in the collection
    const existingCount = await MyBusiness.countDocuments();

    // Increment the count by 1 to determine the next available myBusinessId
    const nextId = existingCount + 1;

    req.body["myBusinessId"] = pad(nextId);
    req.body["myBusinessName"] = myBusinessName;

    var data = await MyBusiness.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add My-Business Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



router.post("/get_business", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await MyBusiness.aggregate([
      {
        $project: {
          myBusinessId: 1,
          myBusinessName: 1,
          businessTypeName: 1,

          isVideo: 1,
          myBusinessImageOrVideo: 1,
          businessCategoryName: 1,

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
        $sort: { addDate: -1 }, // Sort by addDate in descending order
      },
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    const count = await MyBusiness.count();

    res.json({
      statusCode: 200,
      data: data,
      myBusinessCount: count,
      message: "Read All Added-Business",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/get_business", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;
//     var data = await MyBusiness.aggregate([
//       {
//         $skip: pageSize * pageNumber,
//       },
//       {
//         $limit: pageSize,
//       },
//     ]);
//     var count = await MyBusiness.count();
//     data.reverse();
//     res.json({
//       statusCode: 200,
//       data: data,
//       myBusinessCount: count,
//       message: "Read All Added-Business",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/business/:id", async (req, res) => {
  try {
    let result = await MyBusiness.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Business Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_business", async (req, res) => {
  try {
    let result = await MyBusiness.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Business Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_business_type", async (req, res) => {
  try {
    let newArray = [];
      // console.log("not number");
      newArray.push(
        {
          myBusinessName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          businessTypeName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          isVideo: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        }
      );

    var data = await MyBusiness.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All Business",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.get("/my_business/:businessCategoryName", async (req, res) => {
//   try {
//     const targetCategory = req.params.businessCategoryName;
//     var data = await MyBusiness.find({});
//     data.reverse();

//     // Filter data to include only items with the specified category
//     const filteredData = data.filter(
//       (item) => item.businessTypeName === targetCategory
//     );
//     console.log(filteredData, "filteredData");

//     // Create an object to store items by category
//     const itemsByCategory = {};

//     // Iterate through the filtered data and group items by category
//     filteredData.forEach((item) => {
//       const { businessCategoryName } = item;
//       if (!itemsByCategory[businessCategoryName]) {
//         itemsByCategory[businessCategoryName] = [];
//       }
//       itemsByCategory[businessCategoryName].push(item);
//     });

//     // Create an array of objects with category and items
//     const result = Object.keys(itemsByCategory).map((businessCategoryName) => ({
//       businessCategoryName: businessCategoryName,
//       items: itemsByCategory[businessCategoryName],
//     }));

//     res.json({
//       statusCode: 200,
//       data: result,
//       message: `Read All My TodayandTomorrow Data for Category: ${targetCategory}`,
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// Filter Api (Select Businesscategory in Dropdawn and get Selected Category ToData) - Pagination
router.post("/filter_business", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.businessTypeName) {
      pipeline.push({
        $match: { businessTypeName: req.body.businessTypeName },
      });
    }
    // if (req.body.businessCategoryName) {
    //   pipeline.push({
    //     $match: { businessCategoryName: req.body.businessCategoryName },
    //   });
    // }

    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 10 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });

    let result = await MyBusiness.aggregate(pipeline);

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

// Filter Api (Select Businesscategory in Dropdawn and get Selected Category ToData) - Without Pagination
// router.post("/filter_business", async (req, res) => {
//   try {
//     const pipeline = [];
    
//     if (req.body.businessTypeName) {
//       pipeline.push({
//         $match: { businessTypeName: req.body.businessTypeName },
//       });
//     }

//     const result = await MyBusiness.aggregate(pipeline);

//     res.json({
//       statusCode: 200,
//       data: result,
//       totalCount: result.length, // Total count is the length of the result array
//       message: "Filtered data retrieved successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });


// router.get("/my_business", async (req, res) => {
//   try {
//     var data = await MyBusiness.find({});
//     data.reverse();

//     // Create an object to store items by category
//     const itemsByCategory = {};

//     // Iterate through the data and group items by category
//     data.forEach((item) => {
//       const {
//         businessTypeName,
//         myBusinessImageOrVideo,
//         myBusinessId,
//         myBusinessName,
//         isVideo,
//         _id,
//         businessCategoryName,
//       } = item;
//       if (!itemsByCategory[businessTypeName]) {
//         itemsByCategory[businessTypeName] = [];
//       }
//       itemsByCategory[businessTypeName].push({
//         _id: _id,
//         imageUrl: myBusinessImageOrVideo,
//         myBusinessId: myBusinessId,
//         myBusinessName: myBusinessName,
//         businessTypeName: businessTypeName,
//         isVideo: isVideo,
//         myBusinessId: myBusinessId,
//         businessCategoryName: businessCategoryName,
//       });
//     });

//     // Create an array of objects with category and items
//     const result = Object.keys(itemsByCategory).map((category) => ({
//       businessTypeName: category,
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



router.get("/my_business", async (req, res) => {
  try {
    var data = await MyBusiness.find({});
    data.reverse();

    // Create an object to store items by category
    const itemsByCategory = {};

    // Iterate through the data and group items by category
    data.forEach((item) => {
      const {
        businessTypeName,
        myBusinessImageOrVideo,
        myBusinessId,
        myBusinessName,
        isVideo,
        _id,
        businessCategoryName,
      } = item;
      if (!itemsByCategory[businessTypeName]) {
        itemsByCategory[businessTypeName] = [];
      }
      itemsByCategory[businessTypeName].push({
        _id: _id,
        imageUrl: myBusinessImageOrVideo,
        myBusinessId: myBusinessId,
        myBusinessName: myBusinessName,
        businessTypeName: businessTypeName,
        isVideo: isVideo,
        myBusinessId: myBusinessId,
        businessCategoryName: businessCategoryName,
      });
    });

    // Create an array of objects with category and items
    const result = Object.keys(itemsByCategory)
      .sort() // Sort businessTypeName alphabetically
      .map((category) => ({
        businessTypeName: category,
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


router.get("/my_business/pagination", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter or default to page 1
    const perPage = 10; // Number of items per page

    const distinctBusinessTypes = await MyBusiness.distinct("businessTypeName");
    const totalPages = Math.ceil(distinctBusinessTypes.length / perPage);

    const businessTypesForPage = distinctBusinessTypes.slice(
      (page - 1) * perPage,
      page * perPage
    );

    const data = await Promise.all(
      businessTypesForPage.map(async (businessType) => {
        const items = await MyBusiness.find({ businessTypeName: businessType })
          .sort({
            /* Add your sorting criteria here */
          })
          .lean(); // Convert to plain JavaScript objects

        const itemsCount = await MyBusiness.countDocuments({
          businessTypeName: businessType,
        });

        // Rename myBusinessImageOrVideo to imageUrl and remove the original field
        const itemsWithRenamedField = items.map((item) => ({
          ...item,
          imageUrl: item.myBusinessImageOrVideo,
          myBusinessImageOrVideo: undefined,
        }));

        return {
          businessTypeName: businessType,
          items: itemsWithRenamedField,
          itemsCount: itemsCount,
        };
      })
    );

    res.json({
      statusCode: 200,
      data: data,
      currentPage: page,
      totalPages: totalPages,
      message: "Read All Dynamic-Section Data",
    });
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
    let results = await MyBusiness.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await MyBusiness.aggregate(pipeline);

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
