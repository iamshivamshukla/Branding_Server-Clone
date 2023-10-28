var express = require("express");
var router = express.Router();
var SplashScreen = require("../modals/SplashScreen");
var moment = require("moment");
var SavedFrame = require("../modals/SavedFrame");

// router.post("/frame/save", async (req, res) => {
//   try {
//     var count = await SavedFrame.count();
//     function pad(num) {
//       num = num.toString();
//       while (num.length < 2) num = "0" + num;
//       return num;
//     }
//     req.body["savedFrameId"] = pad(count + 1);
//     var data = await SavedFrame.create(req.body);
//     res.json({
//       statusCode: 200,
//       data: data,
//       message: "Frame Save Successfully",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });





router.post("/frame/save", async (req, res) => {
  try {
    const { mobileNumber, userId, image, name } = req.body;

    var count = await SavedFrame.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }

    const savedFrameId = pad(count + 1);

    // Construct the frame object
    const frameObject = { name, image };

    // Check if the userId exists in the database
    const existingFrame = await SavedFrame.findOne({ userId });

    if (existingFrame) {
      // If userId exists, update the savedFrame array
      existingFrame.savedFrame.push(frameObject);
      await existingFrame.save();

      res.json({
        statusCode: 200,
        data: existingFrame,
        message: "Frame updated successfully",
      });
    } else {
      // If userId doesn't exist, create a new frame entry
      const newFrame = new SavedFrame({
        savedFrameId,
        mobileNumber,
        userId,
        savedFrame: [frameObject],
      });

      const data = await newFrame.save();

      res.json({
        statusCode: 200,
        data,
        message: "Frame saved successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// router.post("/frame/save", async (req, res) => {
//   try {
//     const { mobileNumber, userId, savedFrame } = req.body;

//     // Check if the userId exists in the database
//     const existingFrame = await SavedFrame.findOne({ userId });

//     if (existingFrame) {
//       // If userId exists, update the savedFrame array
//       existingFrame.savedFrame.push(savedFrame);
//       await existingFrame.save();

//       res.json({
//         statusCode: 200,
//         data: existingFrame,
//         message: "Frame updated successfully",
//       });
//     } else {
//       // If userId doesn't exist, create a new frame entry
//       const count = await SavedFrame.count();
//       function pad(num) {
//         num = num.toString();
//         while (num.length < 2) num = "0" + num;
//         return num;
//       }

//       const newFrame = new SavedFrame({
//         savedFrameId: pad(count + 1),
//         mobileNumber,
//         userId,
//         savedFrame: [savedFrame],
//       });

//       const data = await newFrame.save();

//       res.json({
//         statusCode: 200,
//         data,
//         message: "Frame saved successfully",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/saved/frame/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await SavedFrame.find({ userId });

    res.json({
      data,
      statusCode: 200,
      message: `Read Saved-Frame for user with ID: ${userId}`,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});


router.delete("/savedframe/remove", async (req, res) => {
  try {
    let result = await SavedFrame.deleteMany({
      _id: { $in: req.body },
    });
    res.json({
      statusCode: 200,
      data: result,
      message: "Language Deleted Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});


router.delete("/savedframe/remove/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const imagePath = req.body.image;

    // Find the user by userId and remove the image
    let result = await SavedFrame.updateOne(
      { userId },
      { $pull: { savedFrame: { image: imagePath } } }
    );

    res.json({
      statusCode: 200,
      data: result,
      message: "Saved-Frame deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;
