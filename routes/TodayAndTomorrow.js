var express = require("express");
var router = express.Router();
var TodayAndTomorrow = require("../modals/TodayAndTomorrow");
var TodayAndTomorrowCategory = require("../modals/TodayAndTomorrow_Category");
var moment = require("moment");
var AddDefaultDaysForCategory = require("../modals/AddDefaultDaysForCategory");
var TrendingAndNews_Data = require("../modals/TrendingAndNews_Data");
var TrendingAndNews_Category = require("../modals/TrendingAndNews_Category");

// router.post("/today_tomorrow", async (req, res) => {
//   try {
//     let { todayAndTomorrowImageOrVideoName } = req.body;

//     // Check if the initial name already exists in the database
//     let count = await TodayAndTomorrow.countDocuments({
//       todayAndTomorrowImageOrVideoName: todayAndTomorrowImageOrVideoName,
//     });

//     let increment = 1;

//     // If the initial name already exists, keep incrementing the number until a unique name is found
//     while (count > 0) {
//       todayAndTomorrowImageOrVideoName = `${req.body.todayAndTomorrowImageOrVideoName} ${increment}`;
//       count = await TodayAndTomorrow.countDocuments({
//         todayAndTomorrowImageOrVideoName: todayAndTomorrowImageOrVideoName,
//       });
//       increment++;
//     }

//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }

//     // Get the count of existing documents in the collection
//     const existingCount = await TodayAndTomorrow.countDocuments();

//     // Increment the count by 1 to determine the next available todayAndTomorrowId
//     const nextId = existingCount + 1;

//     req.body["todayAndTomorrowId"] = pad(nextId);
//     req.body["todayAndTomorrowImageOrVideoName"] = todayAndTomorrowImageOrVideoName;

//     var data = await TodayAndTomorrow.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Add TodayandTomorrow Data Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/today_tomorrow", async (req, res) => {
  try {
    let { categoryName } = req.body;

    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }

    // Find the maximum todayAndTomorrowImageOrVideoName that matches the categoryName
    const maxNumberRecord = await TodayAndTomorrow.findOne({ categoryName })
      .sort({ todayAndTomorrowId: -1 })
      .exec();

    let todayAndTomorrowImageOrVideoName = categoryName;

    if (maxNumberRecord) {
      // Extract the number from the existing todayAndTomorrowImageOrVideoName
      const match =
        maxNumberRecord.todayAndTomorrowImageOrVideoName.match(/(\d+)$/);
      if (match) {
        const existingNumber = parseInt(match[1]);
        todayAndTomorrowImageOrVideoName = `${categoryName} ${
          existingNumber + 1
        }`;
      } else {
        todayAndTomorrowImageOrVideoName = `${categoryName} 2`;
      }
    }

    // Get the count of existing documents in the collection
    const existingCount = await TodayAndTomorrow.countDocuments();

    // Increment the count by 1 to determine the next available todayAndTomorrowId
    const nextId = existingCount + 1;

    req.body["todayAndTomorrowId"] = pad(nextId);
    req.body["todayAndTomorrowImageOrVideoName"] =
      todayAndTomorrowImageOrVideoName;
    req.body["categoryName"] = categoryName; // Set categoryName from the request

    var data = await TodayAndTomorrow.create(req.body);
    res.json({
      statusCode: 200,
      data: data,
      message: "Add TodayandTomorrow Data Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



router.post("/get_today_tomorrow", async (req, res) => {
  try {
    const pageSize = req.body.pageSize;
    const pageNumber = req.body.pageNumber;

    const data = await TodayAndTomorrow.aggregate([
      {
        $project: {
          todayAndTomorrowId: 1,
          todayAndTomorrowImageOrVideoName: 1,
          categoryName: 1,

          todayAndTomorrowImageOrVideo: 1,
          isVideo: 1,
          languageName: 1,
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

    const count = await TodayAndTomorrow.count();

    res.json({
      statusCode: 200,
      data: data,
      TrendingAndNews_DataCount: count,
      message: "Read All TrendingAndNews_Data",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.post("/get_today_tomorrow", async (req, res) => {
//   try {
//     var pageSize = req.body.pageSize;
//     var pageNumber = req.body.pageNumber;
//     var data = await TodayAndTomorrow.aggregate([
//       {
//         $sort: { createTime: -1 } // Sort by updateDate in descending order
//       },
//       {
//         $skip: pageSize * pageNumber,
//       },
//       {
//         $limit: pageSize,
//       },
//     ]);
//     var count = await TodayAndTomorrow.count();
//     // data.reverse();
//     res.json({
//       statusCode: 200,
//       data: data,
//       TodayAndTomorrowCount: count,
//       message: "Read All TodayandTomorrow Data",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.put("/today_tomorrow/:id", async (req, res) => {
  try {
    let result = await TodayAndTomorrow.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json({
      statusCode: 200,
      data: result,
      message: "TodayandTomorrow Data Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/delete_today_tomorrow", async (req, res) => {
  try {
    let result = await TodayAndTomorrow.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "TodayandTomorrow Data Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.post("/search_today_tomorrow", async (req, res) => {
  try {
    let newArray = [];
    if (Number(req.body.search)) {
      // console.log("number");
      newArray.push({
        todayAndTomorrowId: { $regex: req.body.search, $options: "i" },
      });
    } else {
      // console.log("not number");
      newArray.push(
        {
          categoryName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          todayAndTomorrowImageOrVideoName: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        },
        {
          isVideo: !isNaN(req.body.search)
            ? req.body.search
            : { $regex: req.body.search, $options: "i" },
        }
      );
    }

    var data = await PopupBanner.find({
      $or: newArray,
    });
    // data.reverse();
    res.json({
      statusCode: 200,
      data: data,
      message: "Read All TodayandTomorrow Data",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// Filter Api (Select Category in Dropdawn and get Selected Category ToData) - Without Padination
// router.post("/filter_category", async (req, res) => {
//   try {
//     let pipeline = [];
//     if (req.body.categoryName) {
//       pipeline.push({ $match: { categoryName: req.body.categoryName } });
//     }

//     pipeline.push({
//       $facet: {
//         data: [], // No need for $skip and $limit
//         totalCount: [{ $count: "count" }],
//       },
//     });

//     let result = await TodayAndTomorrow.aggregate(pipeline);

//     const responseData = {
//       data: result[0].data,
//       totalCount:
//         result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0,
//     };

//     res.json({
//       statusCode: 200,
//       data: responseData.data,
//       totalCount: responseData.totalCount,
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


// Filter Api (Select Category in Dropdawn and get Selected Category ToData) - With Padination
router.post("/filter_category", async (req, res) => {
  try {
    let pipeline = [];
    if (req.body.categoryName) {
      pipeline.push({ $match: { categoryName: req.body.categoryName } });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: 0 }, { $limit: 50 }], // Adjust skip and limit as needed
        totalCount: [{ $count: "count" }],
      },
    });

    let result = await TodayAndTomorrow.aggregate(pipeline);

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

// Get today_tomorrow Data (Application) Show Category name True Data
// router.get("/today_tomorrow", async (req, res) => {
//   try {
//     // Filter categories where todayAndTomorrowCategorySwitch is true
//     const categories = await TodayAndTomorrowCategory.find({
//       todayAndTomorrowCategorySwitch: true,
//     });

//     // Extract category names from the filtered categories
//     const categoryNames = categories.map((category) => category.categoryName);

//     // Fetch data from TodayAndTomorrow collection where categoryName matches
//     const data = await TodayAndTomorrow.find({
//       categoryName: { $in: categoryNames },
//     });

//     // Create an object to store items by category
//     const itemsByCategory = {};

//     // Iterate through the data and group items by category
//     data.forEach((item) => {
//       const { categoryName } = item;
//       if (!itemsByCategory[categoryName]) {
//         itemsByCategory[categoryName] = [];
//       }
//       itemsByCategory[categoryName].push(item);
//     });

//     // Create an array of objects with category and items
//     const result = Object.keys(itemsByCategory).map((categoryName) => ({
//       categoryName: categoryName,
//       items: itemsByCategory[categoryName],
//     }));

//     res.json({
//       statusCode: 200,
//       data: result,
//       message:
//         "Read All My TodayandTomorrow Data with todayAndTomorrowCategorySwitch: true",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// router.get("/data/today_tomorrow", async (req, res) => {
//   try {
//     // Fetch all categories where todayAndTomorrowCategorySwitch is true
//     const categories = await TodayAndTomorrowCategory.find({
//       todayAndTomorrowCategorySwitch: true,
//     });

//     // Create an array to store the final response data
//     const responseData = [];

//     for (const category of categories) {
//       const categoryName = category.categoryName;

//       // Fetch data from TodayAndTomorrow collection where categoryName matches
//       const data = await TodayAndTomorrow.find({
//         categoryName: categoryName,
//       });

//       // Create an object to store category data along with items
//       const categoryData = {
//         categoryName: categoryName,
//         ...category._doc, // Include all fields from TodayAndTomorrowCategory
//         items: data,
//       };

//       responseData.push(categoryData);
//     }

//     res.json({
//       statusCode: 200,
//       data: responseData,
//       message:
//         "Read All My TodayandTomorrow Data with todayAndTomorrowCategorySwitch: true",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/data/today_tomorrow", async (req, res) => {
  try {
    // Include the logic from the first API to fetch relevant data
    const generalDay = await AddDefaultDaysForCategory.findOne(
      {},
      "showCategoryDays"
    );
    const iGeneralDays = generalDay.get("showCategoryDays");

    const data = await TodayAndTomorrowCategory.find();

    // Sort data based on imageDate in ascending order
    data.sort((a, b) => {
      const dateA = new Date(a.imageDate);
      const dateB = new Date(b.imageDate);
      return dateA - dateB;
    });

    const outputresult = [];

    const currentDate = new Date(); // Current date

    data.forEach((element) => {
      const imageDate = new Date(element.imageDate);
      const startOfImageDate = new Date(
        imageDate.getFullYear(),
        imageDate.getMonth(),
        imageDate.getDate()
      );
      const startOfNextDay = new Date(imageDate);
      startOfNextDay.setDate(imageDate.getDate() + 1);

      if (
        element.showCategoryDaysSwitch &&
        element.showCategoryToDays !== null
      ) {
        const daysDifference = element.showCategoryToDays;
        const dStartDate = new Date(imageDate);
        dStartDate.setDate(imageDate.getDate() - daysDifference);

        if (currentDate >= dStartDate && currentDate < startOfNextDay) {
          outputresult.push(element);
        }
      } else {
        const dStartDate = new Date(imageDate);
        dStartDate.setDate(imageDate.getDate() - iGeneralDays);

        if (currentDate >= dStartDate && currentDate < startOfNextDay) {
          outputresult.push(element);
        }
      }
    });

    // Now you have the relevant data, and you can proceed with the second API logic

    // Fetch data for each specified category
    const responseData = [];

    for (const category of outputresult) {
      try {
        const data = await TodayAndTomorrow.find({
          categoryName: category.categoryName,
        }).exec();

        if (data.length > 0) {
          const categoryData = {
            ...category._doc, // Include all fields of categoryName object
            items: data,
          };

          responseData.push(categoryData);
        }
      } catch (error) {
        console.error(
          "Error fetching data for category:",
          category.categoryName
        );
      }
    }

    res.json({
      statusCode: 200,
      data: responseData,
      message: "Read TodayandTomorrow Data for the specified categories",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/category_to_today_tomorrow/:categoryName", async (req, res) => {
  try {
    let findCategoryNameToData = await TodayAndTomorrow.find({
      categoryName: req.params.categoryName,
    });
    res.json({
      statusCode: 200,
      data: findCategoryNameToData,
      message: "find the TodayAndTommotrow Data From category Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Filter Api
router.post("/filterData", async (req, res) => {
  try {
    let pipeline = [];

    // Match documents based on starting date
    if (req.body.startingDate) {
      pipeline.push({
        $match: {
          imageDate: { $gte: req.body.startingDate },
        },
      });
    }

    // Match documents based on ending date
    if (req.body.endingDate) {
      pipeline.push({
        $match: {
          imageDate: { $lte: req.body.endingDate },
        },
      });
    }

    // Add a $count stage to count the documents
    pipeline.push({
      $count: "totalCount",
    });

    // Execute the aggregation pipeline
    let results = await TodayAndTomorrow.aggregate(pipeline);

    if (results.length > 0) {
      const totalCount = results[0].totalCount;
      pipeline.pop(); // Remove the $count stage to get the actual data
      const findByDateWisenData = await TodayAndTomorrow.aggregate(pipeline);

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

// -----------------------------------------------------------------------

// Assuming you have imported the necessary models like AddDefaultDaysForCategory, TodayAndTomorrowCategory, TodayAndTomorrow

router.get("/todaytrending/:category/:id", async (req, res) => {
  try {
    const categoryType = req.params.category;
    const categoryId = req.params.id;

    let responseData = [];

    if (categoryType === "today") {
      const todayCategory = await TodayAndTomorrowCategory.findById(categoryId);
      console.log(todayCategory, "todayCategory");

      if (!todayCategory) {
        return res.status(404).json({
          statusCode: 404,
          data: [],
          message: "Category not found",
        });
      }

      try {
        const data = await TodayAndTomorrow.find({
          categoryName: todayCategory.categoryName,
        }).exec();

        if (data.length > 0) {
          const categoryData = {
            ...todayCategory._doc,
            items: data,
          };

          responseData.push(categoryData);
        }
      } catch (error) {
        console.error(
          "Error fetching data for category:",
          todayCategory.categoryName
        );
        return res.status(500).json({
          statusCode: 500,
          data: [],
          message: "Error fetching data for the specified category",
        });
      }

      res.json({
        statusCode: 200,
        today: "today",
        data: responseData,
        message: `Read data for today with id: ${categoryId}`,
      });
    } else if (categoryType === "trending") {
      const trendingCategory = await TrendingAndNews_Category.findById(
        categoryId
      );

      if (!trendingCategory) {
        return res.status(404).json({
          statusCode: 404,
          data: [],
          message: "Trending category not found",
        });
      }

      try {
        const data = await TrendingAndNews_Data.find({
          categoryName: trendingCategory.trendingAndNews_CategoryName,
        });

        const result = {
          _id: trendingCategory._id,
          categoryName: trendingCategory.trendingAndNews_CategoryName,
          trendingAndNewsCategory_Id: trendingCategory._id,
          trendingAndNews_CategoryName:
            trendingCategory.trendingAndNews_CategoryName,
          trendingAndNews_CategoryImage:
            trendingCategory.trendingAndNews_CategoryImage,
          trendingAndNews_CategoryImageName:
            trendingCategory.trendingAndNews_CategoryImageName,
          trendingAndNews_switch: trendingCategory.trendingAndNews_switch,
          items: data,
        };

        responseData.push(result);
      } catch (error) {
        console.error("Error fetching trending category data:", error.message);
        return res.status(500).json({
          statusCode: 500,
          data: [],
          message: "Error fetching trending category data",
        });
      }

      res.json({
        statusCode: 200,
        trending: "trending",
        data: responseData,
        message: `Read data for trending category with id: ${categoryId}`,
      });
    } else {
      res.status(400).json({
        statusCode: 400,
        data: [],
        message: "Invalid category type",
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      statusCode: 500,
      data: [],
      message: "Internal server error",
    });
  }
});

// router.get("/abc/today/:_id", async (req, res) => {
//   try {
//     const today = "today"; // Static parameter
//     const categoryId = req.params._id; // Get the category ID from the URL parameter

//     // Fetch data for the specified category based on _id
//     const responseData = [];

//     const category = await TodayAndTomorrowCategory.findById(categoryId);

//     if (!category) {
//       return res.status(404).json({
//         statusCode: 404,
//         today,
//         data: [],
//         message: "Category not found"
//       });
//     }

//     try {
//       const data = await TodayAndTomorrow.find({
//         categoryName: category.categoryName,
//       }).exec();

//       if (data.length > 0) {
//         const categoryData = {
//           ...category._doc,
//           items: data,
//         };

//         responseData.push(categoryData);
//       }
//     } catch (error) {
//       console.error(
//         "Error fetching data for category:",
//         category.categoryName
//       );
//       return res.status(500).json({
//         statusCode: 500,
//         today,
//         data: [],
//         message: "Error fetching data for the specified category"
//       });
//     }

//     res.json({
//       statusCode: 200,
//       today,
//       data: responseData,
//       message: `Read data for ${today} with id: ${categoryId}`,
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({
//       statusCode: 500,
//       today,
//       data: [],
//       message: "Internal server error"
//     });
//   }
// });

module.exports = router;
