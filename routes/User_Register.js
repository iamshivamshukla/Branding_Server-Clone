var express = require("express");
var router = express.Router();
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../authentication");
// var Registers = require("../modals/Admin_Register");
var UserRegister = require("../modals/User_Register");
var Register = require("../modals/Register");
var JWT = require("jsonwebtoken");
var JWTD = require("jwt-decode");
var nodemailer = require("nodemailer");
var uniqid = require("uniqid");
const cron = require("node-cron");
var CompanyWallet = require("../modals/CompanyWallet");
var Clipping = require("../modals/Clipping");
var moment = require("moment");
const fast2sms = require("fast-two-sms");
var axios = require("axios");

router.get("/userdebit/history/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = parseInt(req.params.mobileNumber);

    const data = await CompanyWallet.aggregate([
      { $unwind: "$debitedHistory" }, // Unwind the debitedHistory array
      {
        $match: {
          "debitedHistory.mobileNumber": mobileNumber,
        },
      }, // Match the provided mobile number
      {
        $project: {
          _id: 0,
          debitedHistory: 1,
        },
      }, // Project only the debitedHistory
      { $sort: { "debitedHistory.transactionDate": -1 } }, // Sort by transactionDate in descending order
    ]);

    if (!data || data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No debited history found for the given mobile number.",
      });
    }

    const debitedHistory = data.map((item) => item.debitedHistory);

    res.json({
      statusCode: 200,
      count: debitedHistory.length,
      data: debitedHistory,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/usercredit/history/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = parseInt(req.params.mobileNumber);

    const data = await CompanyWallet.aggregate([
      { $unwind: "$creditedHistory" }, // Unwind the creditedHistory array
      {
        $match: {
          "creditedHistory.mobileNumber": mobileNumber,
        },
      }, // Match the provided mobile number
      {
        $project: {
          _id: 0,
          creditedHistory: 1,
        },
      }, // Project only the creditedHistory
      { $sort: { "creditedHistory.transactionDate": -1 } }, // Sort by transactionDate in descending order
    ]);

    if (!data || data.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No debited history found for the given mobile number.",
      });
    }

    const creditedHistory = data.map((item) => item.creditedHistory);

    res.json({
      statusCode: 200,
      count: creditedHistory.length,
      data: creditedHistory,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/abc/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = parseInt(req.params.mobileNumber);

    const debitedData = await CompanyWallet.aggregate([
      { $unwind: "$debitedHistory" },
      { $match: { "debitedHistory.mobileNumber": mobileNumber } },
      { $project: { _id: 0, transaction: "$debitedHistory", type: "Credit" } },
      { $sort: { "transaction.transactionDate": -1 } },
    ]);

    const creditedData = await CompanyWallet.aggregate([
      { $unwind: "$creditedHistory" },
      { $match: { "creditedHistory.mobileNumber": mobileNumber } },
      { $project: { _id: 0, transaction: "$creditedHistory", type: "Debit" } },
      { $sort: { "transaction.transactionDate": -1 } },
    ]);

    const transactionHistory = debitedData.concat(creditedData);

    if (transactionHistory.length === 0) {
      return res.json({
        statusCode: 404,
        message: "No transaction history found for the given mobile number.",
      });
    }

    transactionHistory.sort(
      (a, b) =>
        new Date(b.transaction.transactionDate) -
        new Date(a.transaction.transactionDate)
    );

    // Transform the response to match the desired format
    const transformedData = [];
    const dateMap = new Map();

    transactionHistory.forEach((item) => {
      const date = new Date(
        item.transaction.transactionDate
      ).toLocaleDateString();

      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }

      dateMap.get(date).push({
        ...item.transaction,
        type: item.type,
      });
    });

    dateMap.forEach((transactions, date) => {
      transformedData.push({
        date,
        transactions,
      });
    });

    res.json({
      statusCode: 200,
      count: transformedData.length,
      data: transformedData,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Function to generate a random 4-digit number as a strings
function generateOTP() {
  const min = 1000; // Minimum 4-digit number
  const max = 9999; // Maximum 4-digit number
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

router.post("/sendotp", async (req, res) => {
  try {
    const user = await Register.findOne({
      mobileNumber: req.body.mobileNumber,
    });

    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }

    // Generate a 6-digit OTP as a string
    // const otp = generateOTP();
    const otp = 1234;

    // Update the user document with the generated OTP
    user.otp = otp;
    await user.save();

    // // Send the OTP to the user's mobile number
    // const smsOptions = {
    //   authorization:
    //     "WSk4p31YrN1zGIt8IADgFq9kym3vqUTJaIya0pF0zVE1xolqIVu47iuhuKJk",
    //   message: otp,
    //   numbers: [user.mobileNumber],
    // };

    // Send the OTP using fast2sms
    // const response = await fast2sms.sendMessage(smsOptions);

    // Return a success response
    res.json({
      statusCode: 200,
      message: "OTP sent successfully",
      response: user,
    });
  } catch (error) {
    res.json({ statusCode: 500, message: error.message });
  }
});

// Not Otp Remove Time
router.post("/verify", async (req, res) => {
  try {
    const user = await Register.findOne({
      mobileNumber: req.body.mobileNumber,
      otp: 1234,
    });

    if (!user) {
      return res.json({
        statusCode: 403,
        message: "User doesn't exist or OTP is incorrect",
      });
    }

    const tokens = await createToken({
      _id: user._id,
      Designation: user.Designation,
      gender: user.gender,
      dob: user.dob,
      profileImage: user.profileImage,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName,
      email: user.email,
      adress: user.adress,
      password: user.password, // Remove password from here
      businessStartDate: user.businessStartDate,
      businessType: user.businessType,
      businessLogo: user.businessLogo,
      adhaar: user.adhaar,
      isPayment: user.isPayment,
      isPersonal: user.isPersonal,

      mobileNumberSecond: user.mobileNumberSecond,
      website: user.website,
      businessName: user.businessName,
    });

    // Successful authentication
    res.json({
      statusCode: 200,
      message: "User Authenticated",
      token: tokens,
    });
  } catch (error) {
    res.json({ statusCode: 500, message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await Register.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await Register.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      UsersCount: count,
      message: "Read All Users",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/mlm/users", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await UserRegister.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await UserRegister.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      MLMUsersCount: count,
      message: "Read All MLM- Users",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Remove Otp After 3-Minutes
// router.post("/verify", async (req, res) => {
//   try {
//     const user = await Register.findOne({
//       mobileNumber: req.body.mobileNumber,
//       otp: req.body.otp,
//     });

//     if (!user) {
//       return res.json({
//         statusCode: 403,
//         message: "User doesn't exist or OTP is incorrect",
//       });
//     }

//     // Calculate the time difference in milliseconds
//     const currentTime = new Date();
//     const timeDifference = currentTime - user.otpGeneratedAt;

//     // If more than 3 minutes have passed since OTP generation
//     if (timeDifference >= 3 * 60 * 1000) {
//       return res.json({
//         statusCode: 400,
//         message: "OTP has expired",
//       });
//     }

//     const tokens = await createToken({
//       _id: user._id,
//       Designation: user.Designation,
//       gender: user.gender,
//       dob: user.dob,
//       profileImage: user.profileImage,
//       mobileNumber: user.mobileNumber,
//       fullName: user.fullName,
//       email: user.email,
//       adress: user.adress,
//       password: user.password, // Remove password from here
//       businessStartDate: user.businessStartDate,
//       businessType: user.businessType,
//       businessLogo: user.businessLogo,
//       adhaar: user.adhaar,
//       isPayment: user.isPayment,
//       isPersonal: user.isPersonal,
//     });

//     // Successful authentication
//     res.json({
//       statusCode: 200,
//       message: "User Authenticated",
//       token: tokens,
//     });

//     // Schedule the removal of the otp field after 3 minutes
//     setTimeout(async () => {
//       try {
//         // Find the user again to ensure it hasn't been updated in the meantime
//         const userToUpdate = await Register.findOne({
//           _id: user._id,
//           otp: req.body.otp,
//         });

//         if (userToUpdate) {
//           userToUpdate.otp = undefined; // Remove the otp field
//           await userToUpdate.save();
//         }
//       } catch (error) {
//         console.error(`Error removing OTP: ${error.message}`);
//       }
//     }, 3 * 60 * 1000); // 3 minutes in milliseconds
//   } catch (error) {
//     res.json({ statusCode: 500, message: error.message });
//   }
// });

router.post("/user_login", async (req, res) => {
  try {
    const user = await Register.findOne({
      mobileNumber: req.body.mobileNumber,
    });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await hashCompare(req.body.password, user.password);

    const tokens = await createToken({
      _id: user._id,
      Designation: user.Designation,
      gender: user.gender,
      dob: user.dob,
      profileImage: user.profileImage,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName,
      email: user.email,
      adress: user.adress,
      password: user.password,
      businessStartDate: user.businessStartDate,
      businessType: user.businessType,
      businessLogo: user.businessLogo,
      adhaar: user.adhaar,
      isPayment: user.isPayment,
      isPersonal: user.isPersonal,
    });
    if (isMatch) {
      res.json({
        statusCode: 200,
        message: "User Authenticated",
        token: tokens,
      });
    } else {
      res.json({ statusCode: 400, message: "Email id or Password is wrong!" });
    }
  } catch (error) {
    res.json({ statusCode: 500, message: error.message });
  }
});

router.put("/user_register/:id", async (req, res) => {
  try {
    let result = await Register.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Profile Updated Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.put("/token/:id", async (req, res) => {
  try {
    let result = await Register.findByIdAndUpdate(req.params.id, req.body);
    res.json({
      statusCode: 200,
      data: result,
      message: "Token Added Successfully",
    });
  } catch (err) {
    res.json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/treeview/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const userData = await UserRegister.findOne({ mobileNumber }).lean();

    if (!userData) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    async function populateChildren(userId) {
      const children = [];
      const userData = await UserRegister.findOne({ _id: userId }).lean();

      if (userData?.leftUser) {
        const leftChild = await UserRegister.findOne({
          _id: userData.leftUser,
        }).lean();
        const leftChildNode = {
          name: leftChild?.fullName,
          referralId: leftChild?.referralCode,
          treeId: leftChild?.treeId,
          side: "left",
          redWallet: leftChild?.redWallet,
          greenWallet: leftChild?.greenWallet,
          children: await populateChildren(leftChild?._id),
        };
        children.push(leftChildNode);
      }

      if (userData?.rightUser) {
        const rightChild = await UserRegister.findOne({
          _id: userData.rightUser,
        }).lean();
        const rightChildNode = {
          name: rightChild?.fullName,
          referralId: rightChild?.referralCode,
          treeId: rightChild?.treeId,
          side: "right",
          redWallet: rightChild?.redWallet,
          greenWallet: rightChild?.greenWallet,
          children: await populateChildren(rightChild?._id),
        };
        children.push(rightChildNode);
      }

      return children;
    }

    const mainData = {
      statusCode: 200,
      name: userData?.fullName,
      referralId: userData?.referralCode,
      treeId: userData?.treeId,
      redWallet: userData?.redWallet,
      greenWallet: userData?.greenWallet,
      children: await populateChildren(userData?._id),
    };

    res.json(mainData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/treeview2/:mobileNumber", async (req, res) => {
  try {
    let totalcount = 0;
    const mobileNumber = req.params.mobileNumber;
    const userData = await UserRegister.findOne({ mobileNumber }).lean();

    if (!userData) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    async function populateChildren(userId) {
      const children = [];
      const userData = await UserRegister.findOne({ _id: userId }).lean();

      if (userData.leftUser) {
        const leftChild = await UserRegister.findOne({
          _id: userData.leftUser,
        }).lean();
        const leftChildNode = {
          name: leftChild.fullName,
          referralId: leftChild.referralCode,
          treeId: leftChild.treeId,
          side: "left",
          redWallet: leftChild?.redWallet,
          greenWallet: leftChild.greenWallet,
          children: await populateChildren(leftChild._id),
        };
        children.push(leftChildNode);
      }

      if (userData.rightUser) {
        const rightChild = await UserRegister.findOne({
          _id: userData.rightUser,
        }).lean();
        const rightChildNode = {
          name: rightChild.fullName,
          referralId: rightChild.referralCode,
          treeId: rightChild.treeId,
          side: "right",
          redWallet: rightChild?.redWallet,
          greenWallet: rightChild.greenWallet,
          children: await populateChildren(rightChild._id),
        };
        children.push(rightChildNode);
      }
      totalcount = totalcount + userData.greenWallet;
      return children;
    }

    const mainData = {
      statusCode: 200,
      name: userData.fullName,
      referralId: userData.referralCode,
      treeId: userData.treeId,
      redWallet: userData?.redWallet,
      greenWallet: userData.greenWallet,
      children: await populateChildren(userData._id),
      get: totalcount,
    };

    res.json(mainData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/findpair/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const userData = await UserRegister.findOne({ mobileNumber }).lean();

    if (!userData) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    async function findUsersWithOneChild(tree, resultArray) {
      // If the user has one child and no other children, add their name and opposite side to the result array
      if (tree.children.length === 1) {
        const oppositeSide = tree.side === "left" ? "right" : "left";
        resultArray.push({
          name: tree.name,
          treeId: tree.treeId,
          referralId: tree.referralId,
          side: [oppositeSide],
        });
      }
      // Recursively search for users with one child in the subtree
      for (const child of tree.children) {
        findUsersWithOneChild(child, resultArray);
      }
    }

    async function findUsersWithNoChildren(tree, resultArray) {
      // If the user has no children, add their name to the result array
      if (tree.children.length === 0) {
        resultArray.push({
          name: tree.name,
          treeId: tree.treeId,
          referralId: tree.referralId,
          side: ["right", "left"],
        });
      }
      // Recursively search for users with no children in the subtree
      for (const child of tree.children) {
        findUsersWithNoChildren(child, resultArray);
      }
    }

    const mainData = {
      statusCode: 200,
      name: userData?.fullName,
      referralId: userData?.referralCode,
      treeId: userData.treeId,
      redWallet: userData.redWallet,
      side: userData.side,
      greenWallet: userData.greenWallet,
      children: await populateChildren(userData._id),
    };

    const usersWithOneChild = [];
    findUsersWithOneChild(mainData, usersWithOneChild);

    const usersWithNoChildren = [];
    findUsersWithNoChildren(mainData, usersWithNoChildren);

    // Merge the two arrays into one
    const mergedUsers = usersWithOneChild.concat(usersWithNoChildren);

    const response = {
      users: mergedUsers, // Change the key name to 'users'
    };

    if (mergedUsers.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "No users with one child or no children found",
      });
    }

    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

async function populateChildren(userId) {
  const children = [];
  const userData = await UserRegister.findOne({ _id: userId }).lean();

  if (userData?.leftUser) {
    const leftChild = await UserRegister.findOne({
      _id: userData.leftUser,
    }).lean();
    const leftChildNode = {
      name: leftChild?.fullName,
      referralId: leftChild?.referralCode,
      treeId: leftChild?.treeId,
      redWallet: leftChild?.redWallet,
      side: "left",
      greenWallet: leftChild?.greenWallet,
      children: await populateChildren(leftChild?._id),
    };
    children.push(leftChildNode);
  }

  if (userData?.rightUser) {
    const rightChild = await UserRegister.findOne({
      _id: userData.rightUser,
    }).lean();
    const rightChildNode = {
      name: rightChild?.fullName,
      referralId: rightChild?.referralCode,
      treeId: rightChild?.treeId,
      redWallet: rightChild?.redWallet,
      side: "right",
      greenWallet: rightChild?.greenWallet,
      children: await populateChildren(rightChild?._id),
    };
    children.push(rightChildNode);
  }

  return children;
}

// async function populateChildren(userId) {
//   const children = [];
//   const userData = await UserRegister.findOne({ _id: userId }).lean();

//   if (userData.leftUser) {
//     const leftChild = await UserRegister.findOne({
//       _id: userData.leftUser,
//     }).lean();
//     const leftChildNode = {
//       name: leftChild?.fullName,
//       referralId: leftChild?.referralCode,
//       treeId: leftChild.treeId,
//       side: "left",
//       redWallet: leftChild.redWallet,
//       greenWallet: leftChild.greenWallet,
//       children: await populateChildren(leftChild._id),
//     };
//     children.push(leftChildNode);
//   }

//   if (userData.rightUser) {
//     const rightChild = await UserRegister.findOne({
//       _id: userData.rightUser,
//     }).lean();
//     const rightChildNode = {
//       name: rightChild?.fullName,
//       referralId: rightChild?.referralCode,
//       treeId: rightChild?.treeId,
//       side: "right",
//       redWallet: rightChild?.redWallet,
//       greenWallet: rightChild?.greenWallet,
//       children: await populateChildren(rightChild?._id),
//     };
//     children.push(rightChildNode);
//   }

//   return children;
// }

// async function populateChildren(userId) {
//   const children = [];
//   const userData = await UserRegister.findOne({ _id: userId }).lean();

//   if (userData.leftUser) {
//     const leftChild = await UserRegister.findOne({
//       _id: userData.leftUser,
//     }).lean();
//     const leftChildNode = {
//       name: leftChild?.fullName,
//       referralId: leftChild?.referralCode,
//       treeId: leftChild.treeId,
//       redWallet: leftChild.redWallet,
//       greenWallet: leftChild.greenWallet,
//       side: userData.side,
//       children: await populateChildren(leftChild._id),
//     };
//     children.push(leftChildNode);
//   }

//   if (userData.rightUser) {
//     const rightChild = await UserRegister.findOne({
//       _id: userData.rightUser,
//     }).lean();
//     const rightChildNode = {
//       name: rightChild?.fullName,
//       referralId: rightChild?.referralCode,
//       treeId: rightChild.treeId,
//       redWallet: rightChild.redWallet,
//       greenWallet: rightChild.greenWallet,
//       side: userData.side,
//       children: await populateChildren(rightChild._id),
//     };
//     children.push(rightChildNode);
//   }

//   return children;
// }

// Direct Refer
router.get("/directresponce/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;

    // Find the main data object with the provided _id
    const mainData = await UserRegister.findOne({ mobileNumber });

    if (!mainData) {
      res.json({
        statusCode: 404,
        message: "No data found for the provided mobileNumber",
      });
      return;
    }

    // Find the direct referrals (data with referredBy matching the _id)
    const directReferrals = await UserRegister.find({
      referredBy: mainData._id,
    }).lean();

    // Format the responses
    const response = {
      statusCode: 200,
      name: mainData.fullName,
      referralId: mainData.referralCode,
      treeId: mainData.treeId,
      side: mainData.side,
      redWallet: mainData.redWallet,
      greenWallet: mainData.greenWallet,
      children: directReferrals.map((referral) => ({
        name: referral.fullName,
        referralId: referral.referralCode,
        treeId: referral.treeId,
        side: referral.side,
        redWallet: referral.redWallet,
        greenWallet: referral.greenWallet,
      })),
    };

    res.json(response);
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

function generateReferralCode(email) {
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number
  const randomAlphabet = getRandomAlphabet(); // Get a random alphabet (A-Z)
  const emailPrefix = email.slice(0, 5).toLowerCase(); // Take the first 5 characters from the email and convert to lowercase
  const referralCode = emailPrefix + randomDigits + randomAlphabet;
  return referralCode;
}

function getRandomAlphabet() {
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabets[Math.floor(Math.random() * alphabets.length)];
}

function generateTreeId() {
  const maxFiveDigitNumber = 99999; // Maximum 5-digit number
  const randomSuffix = Math.floor(Math.random() * (maxFiveDigitNumber + 1)); // Generate random number up to 99999
  return randomSuffix;
}

// Normal
// router.post("/user_register", async (req, res) => {
//   try {
//     const user = await Register.findOne({ email: req.body.email });
//     const mobileNumberCheck = await Register.findOne({
//       mobileNumber: req.body.mobileNumber,
//     });
//     // const adhaarNumberCheck = await Register.findOne({
//     //   adhaar: req.body.adhaar,
//     // });

//     if (user) {
//       return res.json({
//         statusCode: 401,
//         message: "Email already in use",
//       });
//     }
//     if (mobileNumberCheck) {
//       return res.json({
//         statusCode: 402,
//         message: "Mobile-Number already in use",
//       });
//     }
//     // if (adhaarNumberCheck) {
//     //   return res.json({
//     //     statusCode: 403,
//     //     message: "Adhaar-Number already in use",
//     //   });
//     // }

//     // let hashConvert = await hashPassword(req.body.password, req.body.cPassword);
//     // req.body.password = hashConvert;
//     // req.body.cPassword = hashConvert;

//     const data = await Register.create(req.body);

//     if (data) {
//       return res.json({
//         statusCode: 200,
//         data: data,
//         message: "Added successfully",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.post("/user_register", async (req, res) => {
  try {
    const user = await Register.findOne({ email: req.body.email });
    const mobileNumberCheck = await Register.findOne({
      mobileNumber: req.body.mobileNumber,
    });

    if (user) {
      return res.json({
        statusCode: 401,
        message: "Email already in use",
      });
    }
    if (mobileNumberCheck) {
      return res.json({
        statusCode: 402,
        message: "Mobile-Number already in use",
      });
    }

    // Check if adhaar is provided in the request, otherwise set it to "-"
    const adhaar = req.body.adhaar || "-";

    // Create a new object with the adhaar value
    const data = await Register.create({ ...req.body, adhaar });

    if (data) {
      return res.json({
        statusCode: 200,
        data: data,
        message: "Added successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await Register.findOne({ email });

    if (user) {
      const tokens = await createToken({
        _id: user._id,
        Designation: user.Designation,
        gender: user.gender,
        dob: user.dob,
        profileImage: user.profileImage,
        mobileNumber: user.mobileNumber,
        fullName: user.fullName,
        email: user.email,
        adress: user.adress,
        password: user.password,
        businessStartDate: user.businessStartDate,
        businessType: user.businessType,
        businessLogo: user.businessLogo,
        adhaar: user.adhaar,
        isPayment: user.isPayment,
        isPersonal: user.isPersonal,

        mobileNumberSecond: user.mobileNumberSecond,
        website: user.website,
        businessName: user.businessName,
      });

      res.json({
        statusCode: 200,
        message: "Email found",
        user: tokens, // Assuming you want to send the token in the response
      });
    } else {
      return res.status(203).json({
        statusCode: 203,
        message: "Email not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const {
      profileImage,
      Designation,
      gender,
      dob,
      mobileNumber,
      fullName,
      email,
      adress,
      password,
      cPassword,
      side,
      treeId,
      referredBy,
      adhaar,
    } = req.body;
    // Your existing validation and error handling code heres
    const parentUser = await UserRegister.findOne({ treeId: treeId });
    if (!parentUser) {
      return res.status(401).json({
        statusCode: 401,
        message: "Parent user not found!",
      });
    }
    if (parentUser.leftUser && parentUser.rightUser) {
      return res.status(402).json({
        statusCode: 402,
        message:
          "Both leftUser and rightUser are already assigned to the parent user. Please use another tree ID.",
      });
    }
    if (side === "left" && parentUser.leftUser) {
      return res.status(403).json({
        statusCode: 403,
        message: "Left side is already full. Please try the right side.",
      });
    }
    if (side === "right" && parentUser.rightUser) {
      return res.status(405).json({
        statusCode: 405,
        message: "Right side is already full. Please try the left side.",
      });
    }
    const referredByUser = await UserRegister.findOne({
      referralCode: referredBy,
    });
    if (!referredByUser) {
      return res.status(406).json({ error: "Invalid referral code." });
    }

    const checkMobileNumber = await UserRegister.findOne({
      mobileNumber: mobileNumber,
    });
    if (checkMobileNumber) {
      return res.status(407).json({
        statusCode: 407,
        message: "This Number already in Use!",
      });
    }

    // const { referralCode } = generateReferralCode(adhaar);
    const referralCode = mobileNumber;
    const newTreeId = generateTreeId();
    const mlmPurchaseDate = moment(new Date()).format("DD-MM-YYYY");
    const mlmPurchaseTime = moment(new Date()).format("hh:mm:ss");
    const newUser = new UserRegister({
      profileImage,
      Designation,
      gender,
      dob,
      mobileNumber,
      fullName,
      email,
      adress,
      password,
      cPassword,
      side,
      referralCode,
      treeId: newTreeId,
      level: parentUser.level + 1,
      referredBy: referredByUser._id,
      adhaar,
      mlmPurchaseDate,
      mlmPurchaseTime,
    });
    referredByUser.referralChain.push(newUser._id);
    //  Calculate and update the rewards for the referrer
    const leftChildExists = !!referredByUser.leftUser;
    const rightChildExists = !!referredByUser.rightUser;
    if (leftChildExists && rightChildExists) {
      // Increment completedPairs count only if a pair is formed
      referredByUser.completedPairs += 1;
    }
    let totalRewards = 500; // Each successful referral gives 500 points
    // Check if the referrer has both left and right children (completed a pair)
    if (leftChildExists && rightChildExists) {
      totalRewards += 500; // Additional 500 points for completing the referral pair
    }
    //  if (referredByUser.referralChain.length % 2 === 0) {
    //   // Add 1000 points for a pair
    //   referredByUser.greenWallet += 1000;
    // }
    referredByUser.totalRewards += totalRewards;
    // Check if there is a pair of two IDs in the referralChain
    if (referredByUser.referralChain.length % 2 === 0) {
      // Additional 500 points for a pair of two IDs
      // referredByUser.totalRewards += 500;
      // Remove points from red wallet if the referral chain completes a pair
      referredByUser.redWallet -= 500;
      // Transfer 1500 points to the green wallet after every pair
      if (referredByUser.greenWallet) {
        referredByUser.greenWallet += 1000;
        referredByUser.pairFound = true;
      } else {
        referredByUser.greenWallet = 1000;
        referredByUser.pairFound = true;
      }
    } else {
      // Store points in the red wallet if the referral chain doesn't complete a pair
      referredByUser.redWallet += 500;
    }
    await referredByUser.save();
    await newUser.save();
    if (side === "left") {
      parentUser.leftUser = newUser._id;
    } else if (side === "right") {
      parentUser.rightUser = newUser._id;
    }
    await parentUser.save();
    // Get current date and time using 'moment'

    // After updating the user's green wallet
    if (referredByUser.greenWallet >= 1000) {
      const deductionAmount = referredByUser.greenWallet;
      referredByUser.greenWallet = 0;
      referredByUser.pairFound = false;

      // Deduct entire accumulated amount from company's total balance
      let companyWallet = await CompanyWallet.findOne();
      if (!companyWallet) {
        companyWallet = new CompanyWallet({ totalBalance: 0 });
        await companyWallet.save();
      }

      companyWallet.totalBalance -= deductionAmount;

      // Add the deduction transaction to debitedHistory
      companyWallet.debitedHistory.push({
        userName: referredByUser.fullName,
        mobileNumber: referredByUser.mobileNumber,
        amount: deductionAmount,
        transactionDate: new Date(),
      });

      // Save the updated company wallet
      await companyWallet.save();
    }

    // Update the company wallet's totalBalance
    let companyWallet = await CompanyWallet.findOne();
    if (!companyWallet) {
      companyWallet = new CompanyWallet({ totalBalance: 0 });
      await companyWallet.save();
    }

    companyWallet.totalBalance += 3999;

    // Add the newly registered user's information to creditedHistory
    companyWallet.creditedHistory.push({
      userName: fullName,
      mobileNumber: mobileNumber,
      amount: 3999,
      transactionDate: new Date(),
    });

    // Add the transaction to allTransactionHistory
    companyWallet.allTransactionHistory.push({
      transactionType: "Credit",
      userName: fullName,
      mobileNumber: mobileNumber,
      amount: 3999,
      transactionDate: new Date(),
    });

    // Save the updated company wallet
    await companyWallet.save();
    // Save the updated company wallet
    await companyWallet.save();
    res.status(200).json({
      statusCode: 200,
      data: newUser,
      message: "Added successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// // Level Wise Price Distribute
// cron.schedule("0 0 * * *", async () => {
//   try {
//     const pairNodes = await User.find({ pairFound: true });

//     findPairs(pairNodes);

//   } catch (err) {
//   }
// });

async function findPairs(users) {
  parentIds = [];
  parents = [];

  // Iterate over all users who have parFound true
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // If the parent is already processed in this loop, continue.
    if (user.referredBy && parentIds.includes(user.referredBy)) {
      continue;
    } else if (!user.referredBy) {
      continue;
    }

    let parent = await UserRegister.findById(user.referredBy);

    let otherChild;

    // Get sibling
    if (parent.leftUser === user._id) {
      otherChild = await UserRegister.findById(parent.rightUser);
    } else {
      otherChild = await UserRegister.findById(parent.leftUser);
    }

    // If sibling also have pairFound = True, that means we have pair
    if (otherChild.pairFound) {
      parent.pairFound = true;
      user.pairFound = false;
      otherChild.pairFound = false;

      parent.greenWallet += 500;
      parent.totalRewards += 500;

      parent = await parent.save();
      await user.save();
      await otherChild.save();

      parents.push(parent);
      parentIds.push(user.referredBy);
    }
  }

  if (parents.length) {
    return findPairs(parents);
  } else {
    return;
  }
}

// Pair Wise Price Distribute
// cron.schedule("0 0 * * *", async () => {
//   try {
//     const referredByUsers = await User.find({
//       referralChain: { $exists: true },
//     });

//     referredByUsers.forEach(async (referredByUser) => {
//       const referralChainLength = referredByUser.referralChain.length;

//       if (referralChainLength === 2 && referredByUser.completedPairs === 0) {
//         // Update completed pairs count
//         referredByUser.completedPairs = 1;

//         // Add 500 points to the green wallet
//         referredByUser.greenWallet = (referredByUser.greenWallet || 0) + 500;

//         // Deduct 500 points from the red wallet
//         referredByUser.redWallet = (referredByUser.redWallet || 0) - 500;

//         // Update the totalRewards value to reflect the changes
//         referredByUser.totalRewards = (referredByUser.totalRewards || 0) + 500;

//         // Save the updated user's data
//         await referredByUser.save();
//       }
//     });

//   } catch (error) {
//     console.error("Error in pair completion cron job:", error);
//   }
// });

// -------------------------------------------------------------------------------------------------------------------

// Today Join and Total Join Count
router.get("/count", async (req, res) => {
  try {
    const todayStart = moment().startOf("day").toDate(); // Get the start of the current day in local time
    const todayEnd = moment().endOf("day").toDate(); // Get the end of the current day in local time

    // Find user registrations for today
    const dataToday = await UserRegister.find({
      registrationDate: { $gte: todayStart, $lte: todayEnd }, // Filter data for today (local time)
    });

    // Calculate the join count for today
    const joinCountToday = dataToday.length;

    // Find total user count
    const totalUserCount = await UserRegister.countDocuments();

    res.json({
      statusCode: 200,
      data: {
        joinCountToday,
        totalUserCount,
      },
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Debit History Amount (Today Debit & Total Debit)
router.get("/debit", async (req, res) => {
  try {
    const today = moment().startOf("day"); // Get the start of the current day

    const todayData = await CompanyWallet.aggregate([
      {
        $unwind: "$debitedHistory", // Unwind the debitedHistory array for further processing
      },
      {
        $match: {
          "debitedHistory.transactionDate": { $gte: today.toDate() }, // Match transactions for today and onwards
        },
      },
      {
        $group: {
          _id: null,
          todayDebitAmount: { $sum: "$debitedHistory.amount" }, // Sum the amount for today's transactions
        },
      },
      {
        $project: {
          _id: 0,
          todayDebitAmount: 1,
        },
      },
    ]);

    const totalData = await CompanyWallet.aggregate([
      {
        $unwind: "$debitedHistory", // Unwind the debitedHistory array for further processing
      },
      {
        $group: {
          _id: null,
          totalDebitAmount: { $sum: "$debitedHistory.amount" }, // Sum the amount for all transactions
        },
      },
      {
        $project: {
          _id: 0,
          totalDebitAmount: 1,
        },
      },
    ]);

    let todayDebitAmount = 0;
    let totalDebitAmount = 0;

    if (todayData.length > 0) {
      todayDebitAmount = todayData[0].todayDebitAmount;
    }

    if (totalData.length > 0) {
      totalDebitAmount = totalData[0].totalDebitAmount;
    }

    res.json({
      statusCode: 200,
      todayDebitAmount,
      totalDebitAmount,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Credit History Amount (Today Credit & Total Credit)
router.get("/credit", async (req, res) => {
  try {
    const today = moment().startOf("day"); // Get the start of the current day

    const data = await CompanyWallet.aggregate([
      {
        $unwind: "$creditedHistory", // Unwind the creditedHistory array for further processing
      },
      {
        $match: {
          "creditedHistory.transactionDate": { $gte: today.toDate() }, // Match transactions for today and onwards
        },
      },
      {
        $group: {
          _id: null,
          todayCreditAmount: { $sum: "$creditedHistory.amount" }, // Sum the amount for today's transactions
        },
      },
      {
        $project: {
          _id: 0,
          todayCreditAmount: 1,
        },
      },
    ]);

    const totalData = await CompanyWallet.aggregate([
      {
        $unwind: "$creditedHistory", // Unwind the creditedHistory array for further processing
      },
      {
        $group: {
          _id: null,
          totalCreditAmount: { $sum: "$creditedHistory.amount" }, // Sum the amount for all transactions
        },
      },
      {
        $project: {
          _id: 0,
          totalCreditAmount: 1,
        },
      },
    ]);

    let todayCreditAmount = 0;
    let totalCreditAmount = 0;

    if (data.length > 0) {
      todayCreditAmount = data[0].todayCreditAmount;
    }

    if (totalData.length > 0) {
      totalCreditAmount = totalData[0].totalCreditAmount;
    }

    res.json({
      statusCode: 200,
      todayCreditAmount,
      totalCreditAmount,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/credit/history", async (req, res) => {
  try {
    const data = await CompanyWallet.find().select({
      _id: 0,
      creditedHistory: 1,
    });

    let creditedHistory = [];
    let count = 0;

    if (data.length > 0) {
      creditedHistory = data[0].creditedHistory;
      count = creditedHistory.length;
    }
    creditedHistory.reverse();

    res.json({
      statusCode: 200,
      count,
      data: creditedHistory,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/todaycredit/history", async (req, res) => {
  try {
    const data = await CompanyWallet.find().select({
      _id: 0,
      creditedHistory: 1,
    });

    let todayCreditedHistory = [];
    let count = 0;

    if (data.length > 0) {
      const allCreditedHistory = data[0].creditedHistory;
      const today = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

      todayCreditedHistory = allCreditedHistory.filter((item) => {
        const itemDate = new Date(item.transactionDate)
          .toISOString()
          .split("T")[0];
        return itemDate === today;
      });

      count = todayCreditedHistory.length;
    }

    todayCreditedHistory.reverse();

    res.json({
      statusCode: 200,
      count,
      data: todayCreditedHistory,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/debit/history", async (req, res) => {
  try {
    const data = await CompanyWallet.find().select({
      _id: 0,
      debitedHistory: 1,
    });

    let debitedHistory = [];
    let count = 0;

    if (data.length > 0) {
      debitedHistory = data[0].debitedHistory;
      count = debitedHistory.length;
    }
    debitedHistory.reverse();

    res.json({
      statusCode: 200,
      count,
      data: debitedHistory,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/todaydebit/history", async (req, res) => {
  try {
    const data = await CompanyWallet.find().select({
      _id: 0,
      debitedHistory: 1,
    });

    let todayDebitedHistory = [];
    let count = 0;

    if (data.length > 0) {
      const allDebitedHistory = data[0].debitedHistory;
      const today = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

      todayDebitedHistory = allDebitedHistory.filter((item) => {
        const itemDate = new Date(item.transactionDate)
          .toISOString()
          .split("T")[0];
        return itemDate === today;
      });

      count = todayDebitedHistory.length;
    }

    todayDebitedHistory.reverse();

    res.json({
      statusCode: 200,
      count,
      data: todayDebitedHistory,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/today/companybalance", async (req, res) => {
  try {
    const data = await CompanyWallet.find().select({
      _id: 0,
      debitedHistory: 1,
      creditedHistory: 1,
    });
    data.reverse();

    let todayCreditTotal = 0;
    let todayDebitTotal = 0;

    // Calculate today's credit total
    if (data.length > 0 && data[0].creditedHistory) {
      const creditedHistory = data[0].creditedHistory;
      const today = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

      creditedHistory.forEach((item) => {
        const itemDate = new Date(item.transactionDate)
          .toISOString()
          .split("T")[0];
        if (itemDate === today) {
          todayCreditTotal += item.amount;
        }
      });
    }

    // Calculate today's debit total
    if (data.length > 0 && data[0].debitedHistory) {
      const debitedHistory = data[0].debitedHistory;
      const today = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

      debitedHistory.forEach((item) => {
        const itemDate = new Date(item.transactionDate)
          .toISOString()
          .split("T")[0];
        if (itemDate === today) {
          todayDebitTotal += item.amount;
        }
      });
    }

    const totalAmount = todayCreditTotal - todayDebitTotal;

    res.json({
      statusCode: 200,
      todayCreditTotal,
      todayDebitTotal,
      totalAmount,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/companybalance", async (req, res) => {
  try {
    const data = await CompanyWallet.find().select({
      _id: 0,
      debitedHistory: 1,
      creditedHistory: 1,
    });
    data.reverse();

    let totalCreditAmount = 0;
    let totalDebitAmount = 0;

    // Calculate total credit amount
    if (data.length > 0 && data[0].creditedHistory) {
      const creditedHistory = data[0].creditedHistory;

      creditedHistory.forEach((item) => {
        totalCreditAmount += item.amount;
      });
    }

    // Calculate total debit amount
    if (data.length > 0 && data[0].debitedHistory) {
      const debitedHistory = data[0].debitedHistory;

      debitedHistory.forEach((item) => {
        totalDebitAmount += item.amount;
      });
    }

    const companyBalance = totalCreditAmount - totalDebitAmount;

    res.json({
      statusCode: 200,
      totalCreditAmount,
      totalDebitAmount,
      companyBalance,
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// --------------------------------------------------------------------------------------------------------------------------------

// Get MLM-User
router.get("/mlm/user", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await UserRegister.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    var count = await UserRegister.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      mlmUserCount: count,
      message: "Read All Language",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/todaymlm/user", async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.pageNumber) || 0;

    // Get the start and end of the current date
    const currentDateStart = moment().startOf("day").toISOString();
    const currentDateEnd = moment().endOf("day").toISOString();

    const data = await UserRegister.aggregate([
      {
        $match: {
          registrationDate: {
            $gte: new Date(currentDateStart),
            $lte: new Date(currentDateEnd),
          },
        },
      },
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    const count = await UserRegister.countDocuments({
      registrationDate: {
        $gte: new Date(currentDateStart),
        $lte: new Date(currentDateEnd),
      },
    });

    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      todayMlmUserCount: count,
      message: "Read Users for the current date",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// ------------------------------------------New MLM Logic ------------------------------------------------------------------------
let UserCount = 2;
let { MlmClippingAt } = process.env;

console.log("MlmClippingAt", MlmClippingAt);

const mjNewFunc = async (mobileNumber) => {
  try {
    const findClippingCount = await Clipping.findOne({}, "clippingAt");
    const getClippingCount = findClippingCount.get("clippingAt");

    // const mobileNumber = req.params.mobileNumber;
    const userData = await UserRegister.findOne({ mobileNumber }).lean();

    if (!userData) {
      return null;
    }

    async function countUsers(nodeId) {
      if (!nodeId) {
        return 0;
      }

      const nodeData = await UserRegister.findOne({ _id: nodeId }).lean();
      const leftCount = await countUsers(nodeData.leftUser);
      const rightCount = await countUsers(nodeData.rightUser);

      return 1 + leftCount + rightCount;
    }

    const leftCount = await countUsers(userData.leftUser);
    const rightCount = await countUsers(userData.rightUser);
    const totalTeam = leftCount + rightCount;
    const ratioString = `${rightCount} : ${leftCount} ratio`;
    const ratioArray = ratioString.split(" : ");
    const minSide = Math.min(parseInt(ratioArray[0]), parseInt(ratioArray[1]));
    // const today = new Date();
    // const todayStart = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate()
    // );
    // const todayEnd = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate() + 1
    // );

    // const usersJoinedToday = await UserRegister.countDocuments({
    //   registrationDate: { $gte: todayStart, $lt: todayEnd },
    // }).lean();
    async function countUserss(nodeId, side) {
      if (!nodeId) {
        return 0;
      }

      const nodeData = await UserRegister.findOne({ _id: nodeId }).lean();
      const leftCount = await countUserss(nodeData.leftUser, "left");
      const rightCount = await countUserss(nodeData.rightUser, "right");

      // aa check kre che jo aa register date check kre che ... jo date aaj ni hoy to left or right count +1 kari nakhse

      if (
        nodeData.registrationDate >= todayStart &&
        nodeData.registrationDate < todayEnd
      ) {
        if (side === "left") {
          await UserRegister.updateOne(
            { _id: nodeId },
            { $inc: { todayLeft: 1 } }
          );
        } else if (side === "right") {
          await UserRegister.updateOne(
            { _id: nodeId },
            { $inc: { todayRight: 1 } }
          );
        }
        return 1 + leftCount + rightCount;
      } else {
        return leftCount + rightCount;
      }
    }

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    async function calculateTodayCounts() {
      const rootUser = await UserRegister.findOne({}).lean();
      const leftTodayCount = await countUserss(rootUser.leftUser, "left");
      const rightTodayCount = await countUserss(rootUser.rightUser, "right");
      await UserRegister.updateOne(
        { _id: rootUser },
        { todayJoinedLeft: leftTodayCount, todayJoinedRight: rightTodayCount }
      );
    }

    const leftTodayCount = await countUserss(userData.leftUser, "left");
    const rightTodayCount = await countUserss(userData.rightUser, "right");
    calculateTodayCounts();

    const resetCount = userData.resetCount || 0;
    const pairCount = minSide;
    const difference = pairCount - resetCount;

    // const pointsToAdd = 500 * difference;
    // const usersNeededForBalanced = Math.abs(leftCount - rightCount);

    // let updatedGreenWallet = userData.greenWallet;
    // let updatedRedWallet = 0;
    // if (usersNeededForBalanced !== userData.usersNeededForBalanced) {
    //   const redWalletPointsToAdd = 500 * usersNeededForBalanced;

    //   if (usersNeededForBalanced > userData.usersNeededForBalanced) {
    //     updatedRedWallet += redWalletPointsToAdd;
    //   } else {
    //     const pointsToDeduct =
    //       500 * (userData.usersNeededForBalanced - usersNeededForBalanced);
    //     updatedRedWallet = updatedRedWallet - pointsToDeduct;
    //     updatedGreenWallet += pointsToDeduct;
    //   }

    //   // user na redwallet ma difference na peisa add karya

    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     { usersNeededForBalanced },
    //     { redWallet: updatedRedWallet }
    //   );
    // }

    // updatedGreenWallet += pointsToAdd;

    const currentTime = Date.now();
    const lastResetTimestamp = userData.lastResetTimestamp || 0;
    const timeDifferenceHours =
      (currentTime - lastResetTimestamp) / (1000 * 60 * 60);

    const minSideToday = Math.min(leftTodayCount, rightTodayCount);

    let updatedResetCount = minSideToday;
    let updatedLastResetTimestamp = lastResetTimestamp;

    if (timeDifferenceHours >= 24) {
      updatedResetCount = 0;
      updatedLastResetTimestamp = currentTime;
    }

    // if (updatedResetCount >= 32) {
    //   updatedResetCount = 32;
    // } else {
    //   updatedResetCount += 1;
    // }
    // getting the value of limit user count

    // try {
    //   const ClippingOn = await Clipping.find();
    // } catch (error) {
    // }

    // const nodeData = await UserRegister.findOne({ _id: nodeId }).lean();

    //

    //   pairRatio: ratioString,
    //   pairCount: minSide,
    //   resetCount: minSide,
    //   greenWallet: updatedGreenWallet,
    //   totalRewards: updatedGreenWallet,
    //   totalEarnings: updatedGreenWallet,
    //   leftCount,
    //   rightCount,
    //   redWallet: updatedRedWallet,
    //   usersNeededForBalanced: 0,
    // })

    // setTimeout(async () => {
    //   if (userData.mobileNumber == 1) {
    //     console.log(
    //       "minside today count A: ",
    //       userData.mobileNumber,
    //       minSideToday
    //     );
    //   }

    //   const clippingCount = 10;
    //   if (clippingCount+1 <= minSideToday) {
    //     console.log("Clipiing Stop", userData.mobileNumber);
    //     return;
    //   }

    //   // Clipping At
    //   // if (minSideToday <= clippingCount+1) {
    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       pairRatio: ratioString,
    //       pairCount: minSide,
    //       resetCount: minSide,
    //       greenWallet: updatedGreenWallet,
    //       totalRewards: updatedGreenWallet,
    //       totalEarnings: updatedGreenWallet,
    //       leftCount,
    //       rightCount,
    //       redWallet: updatedRedWallet,
    //       usersNeededForBalanced: 0,
    //     }
    //   );

    //   if (pointsToAdd > 0) {
    //     const companyWallet = await CompanyWallet.findOne();
    //     if (companyWallet) {
    //       // Subtract points from CompanyWallet's total balance
    //       companyWallet.totalBalance -= pointsToAdd;

    //       // Add the deduction transaction to debitedHistory
    //       companyWallet.debitedHistory.push({
    //         userName: userData.fullName,
    //         mobileNumber: userData.mobileNumber,
    //         amount: pointsToAdd,
    //         transactionDate: new Date(),
    //         message: "Referral Amount",
    //       });

    //       // Save the updated company wallet
    //       await companyWallet.save();
    //     }
    //   }
    //   // }
    // }, 500);

    // setTimeout(async () => {

    // Clipping At
    const clippingCount = 3000;
    if (minSideToday <= 33) {
      // Update user data if conditions met
      const updatedUserData = {
        pairRatio: ratioString,
        pairCount: minSide,
        resetCount: minSide,
        greenWallet: updatedGreenWallet,
        totalRewards: updatedGreenWallet,
        totalEarnings: updatedGreenWallet,
        leftCount,
        rightCount,
        redWallet: updatedRedWallet,
        usersNeededForBalanced: 0,
      };

      await UserRegister.updateOne({ _id: userData._id }, updatedUserData);

      if (pointsToAdd > 0) {
        const companyWallet = await CompanyWallet.findOne();
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          companyWallet.totalBalance -= pointsToAdd;

          // Add the deduction transaction to debitedHistory
          companyWallet.debitedHistory.push({
            userName: userData.fullName,
            mobileNumber: userData.mobileNumber,
            amount: pointsToAdd,
            transactionDate: new Date(),
            message: "Referral Amount",
          });

          // Save the updated company wallet
          await companyWallet.save();
        }
      }
      // return;
    } else {
      // Update user data if conditions met
      const updatedUserData = {
        pairRatio: ratioString,
        pairCount: minSide,
        resetCount: minSide,
        greenWallet: clippingCount * 500 + 1000,
        totalRewards: clippingCount * 500 + 1000,
        totalEarnings: clippingCount * 500 + 1000,
        leftCount,
        rightCount,
        redWallet: 0,
        usersNeededForBalanced: 0,
      };

      await UserRegister.updateOne({ _id: userData._id }, updatedUserData);

      // if (pointsToAdd > 0) {
      //   const companyWallet = await CompanyWallet.findOne();
      //   if (companyWallet) {
      //     // Subtract points from CompanyWallet's total balance
      //     companyWallet.totalBalance -= pointsToAdd;

      //     // Add the deduction transaction to debitedHistory
      //     companyWallet.debitedHistory.push({
      //       userName: userData.fullName,
      //       mobileNumber: userData.mobileNumber,
      //       amount: pointsToAdd,
      //       transactionDate: new Date(),
      //       message: "Referral Amount",
      //     });

      //     // Save the updated company wallet
      //     await companyWallet.save();
      //   }
      // }
    }

    // }, 500);

    //  else {
    //     "aa user e pairs complete kri! ",
    //     userData.mobileNumber,
    //     minSideToday
    //   );

    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       pairRatio: ratioString,
    //       pairCount: minSide,
    //       resetCount: minSide,
    //       leftCount,
    //       rightCount,
    //       usersNeededForBalanced: 0,
    //     }
    //   );
    // }

    // // ---------------------------------------VIP------------------------------------------------------------

    // if (
    //   minSide >= 12 &&
    //   userRole != "vip1" &&
    //   userRole != "vip2" &&
    //   userRole != "vip3" &&
    //   userRole != "vip4" &&
    //   userRole != "vip5" &&
    //   userRole != "vip6" &&
    //   userRole != "vip7"
    // ) {
    //   const updateGreenWallet = userData.greenWallet + 11000;
    //   const updatedTotalRewards = userData.totalRewards + 11000;
    //   console.log(
    //     "vip bannya pachi nu wallet: ",
    //     userData.greenWallet,
    //     mobileNumber,
    //     "vip 1"
    //   );
    //   // console.log("user updated to vip 1: ", mobileNumber);;;
    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       role: "vip1",
    //       greenWallet: updateGreenWallet,
    //       totalRewards: updatedTotalRewards,
    //     }
    //   );
    //   // UserWalletHistory
    //   const companyWallet = await CompanyWallet.findOne();
    //   const pointsToAdd = 11000;
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData.fullName,
    //       mobileNumber: userData.mobileNumber,
    //       amount: pointsToAdd,
    //       message: "VIP 1 Amount",
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }

    //   // const userWalletHistory = await UserWalletHistory.findOne();
    //   // // const pointsToAdd = 11000
    //   // if (userWalletHistory) {
    //   //   userWalletHistory.totalBalance -= pointsToAdd;

    //   //   // Add the deduction transaction to debitedHistory
    //   //   userWalletHistory.debitedHistory.push({
    //   //     userName: userData.fullName,
    //   //     mobileNumber: userData.mobileNumber,
    //   //     amount: pointsToAdd,
    //   //     transactionDate: new Date(),
    //   //   });

    //   //   // Save the updated company wallet
    //   //   await userWalletHistory.save();
    //   // }
    // } else if (
    //   minSide >= 150 &&
    //   userRole != "vip2" &&
    //   userRole != "vip3" &&
    //   userRole != "vip4" &&
    //   userRole != "vip5" &&
    //   userRole != "vip6" &&
    //   userRole != "vip7"
    // ) {
    //   const updateGreenWallet = userData.greenWallet + 22000;
    //   const updatedTotalRewards = userData.totalRewards + 22000;
    //   console.log(
    //     "vip bannya pachi nu wallet: ",
    //     userData.greenWallet,
    //     mobileNumber,
    //     "vip 2"
    //   );
    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       role: "vip2",
    //       greenWallet: updateGreenWallet,
    //       totalRewards: updatedTotalRewards,
    //     }
    //   );
    //   const companyWallet = await CompanyWallet.findOne();
    //   const pointsToAdd = 22000;
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData.fullName,
    //       mobileNumber: userData.mobileNumber,
    //       amount: pointsToAdd,
    //       message: "VIP 2 Amount",
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }
    // } else if (
    //   minSide >= 200 &&
    //   userRole != "vip3" &&
    //   userRole != "vip4" &&
    //   userRole != "vip5" &&
    //   userRole != "vip6" &&
    //   userRole != "vip7"
    // ) {
    //   const updateGreenWallet = userData.greenWallet + 44000;
    //   const updatedTotalRewards = userData.totalRewards + 44000;
    //   console.log(
    //     "vip bannya pachi nu wallet: ",
    //     userData.greenWallet,
    //     mobileNumber,
    //     "vip 3"
    //   );
    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       role: "vip3",
    //       greenWallet: updateGreenWallet,
    //       totalRewards: updatedTotalRewards,
    //     }
    //   );
    //   const companyWallet = await CompanyWallet.findOne();
    //   const pointsToAdd = 44000;
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData.fullName,
    //       mobileNumber: userData.mobileNumber,
    //       amount: pointsToAdd,
    //       message: "VIP 3 Amount",
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }
    // } else if (
    //   minSide >= 300 &&
    //   userRole != "vip4" &&
    //   userRole != "vip5" &&
    //   userRole != "vip6" &&
    //   userRole != "vip7"
    // ) {
    //   const updateGreenWallet = userData.greenWallet + 66000;
    //   const updatedTotalRewards = userData.totalRewards + 66000;
    //   console.log(
    //     "vip bannya pachi nu wallet: ",
    //     userData.greenWallet,
    //     mobileNumber,
    //     "vip 4"
    //   );
    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       role: "vip4",
    //       greenWallet: updateGreenWallet,
    //       totalRewards: updatedTotalRewards,
    //     }
    //   );
    //   const companyWallet = await CompanyWallet.findOne();
    //   const pointsToAdd = 66000;
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData.fullName,
    //       mobileNumber: userData.mobileNumber,
    //       amount: pointsToAdd,
    //       message: "VIP 4 Amount",
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }
    // } else if (
    //   minSide >= 400 &&
    //   userRole != "vip5" &&
    //   userRole != "vip6" &&
    //   userRole != "vip7"
    // ) {
    //   const updateGreenWallet = userData.greenWallet + 88000;
    //   const updatedTotalRewards = userData.totalRewards + 88000;
    //   console.log(
    //     "vip bannya pachi nu wallet: ",
    //     userData.greenWallet,
    //     mobileNumber,
    //     "vip 5"
    //   );

    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       role: "vip5",
    //       greenWallet: updateGreenWallet,
    //       totalRewards: updatedTotalRewards,
    //     }
    //   );
    //   const companyWallet = await CompanyWallet.findOne();
    //   const pointsToAdd = 88000;
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData.fullName,
    //       mobileNumber: userData.mobileNumber,
    //       amount: pointsToAdd,
    //       message: "VIP 5 Amount",
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }
    // } else if (minSide >= 500 && userRole != "vip6" && userRole != "vip7") {
    //   const updateGreenWallet = userData.greenWallet + 110000;
    //   const updatedTotalRewards = userData.totalRewards + 110000;
    //   console.log(
    //     "vip bannya pachi nu wallet: ",
    //     userData.greenWallet,
    //     mobileNumber,
    //     "vip 6"
    //   );

    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       role: "vip6",
    //       greenWallet: updateGreenWallet,
    //       totalRewards: updatedTotalRewards,
    //     }
    //   );
    //   const companyWallet = await CompanyWallet.findOne();
    //   const pointsToAdd = 110000;
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData.fullName,
    //       mobileNumber: userData.mobileNumber,
    //       amount: pointsToAdd,
    //       message: "VIP 6 Amount",
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }
    // } else if (minSide >= 1000 && userRole != "vip7") {
    //   const updateGreenWallet = userData.greenWallet + 220000;
    //   const updatedTotalRewards = userData.totalRewards + 220000;
    //   console.log(
    //     "vip bannya pachi nu wallet: ",
    //     userData.greenWallet,
    //     mobileNumber,
    //     "vip 7"
    //   );

    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     {
    //       role: "vip7",
    //       greenWallet: updateGreenWallet,
    //       totalRewards: updatedTotalRewards,
    //     }
    //   );
    //   const companyWallet = await CompanyWallet.findOne();
    //   const pointsToAdd = 220000;
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData.fullName,
    //       mobileNumber: userData.mobileNumber,
    //       amount: pointsToAdd,
    //       message: "VIP 7 Amount",
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }
    // } else {
    //   console.log("role, peisa: ", userRole, userData.greenWallet);
    // }

    // ---------------------------------------------------------------------------------------------------

    // res.json(mainData);
  } catch (error) {
    // res.status(500).json({
    //   statusCode: 500,
    //   message: error.message,
    // });
  }
};

async function countTodayUsers(nodeId, currentDate) {
  if (!nodeId) {
    return 0;
  }

  const nodeData = await UserRegister.findOne({ _id: nodeId }).lean();
  const leftCount = await countTodayUsers(nodeData.leftUser, currentDate);
  const rightCount = await countTodayUsers(nodeData.rightUser, currentDate);

  let count = 0;

  // Check if registration date matches the current date
  const registrationDate = new Date(nodeData.registrationDate);
  const registrationDateFormatted = registrationDate
    .toISOString()
    .split("T")[0]; // Format registration date to YYYY-MM-DD
  const currentDateFormatted = currentDate.toISOString().split("T")[0]; // Format current date to YYYY-MM-DD

  if (registrationDateFormatted === currentDateFormatted) {
    count = 1;
  }

  return count + leftCount + rightCount;
}

async function getAllMobileNumbers() {
  try {
    // Find all users in the database and select only the 'mobileNumber' field
    const users = await UserRegister.find({}, "mobileNumber").lean();

    if (!users) {
      return;
    }

    // Extract mobile numbers from the users
    const mobileNumbers = users.map((user) => user.mobileNumber);

    return mobileNumbers;
  } catch (error) {
    throw error; // You can handle the error as needed in your application
  }
}

async function fetchMobileNumbers() {
  try {
    // const mobileNumbers = [9999999902]; // Replace with your logic to fetch mobile numbers, "mobileNumbers"
    const mobileNumbers = await getAllMobileNumbers(); // Replace with your logic to fetch mobile numbers, "mobileNumbers"
    for (const mobileNumber of mobileNumbers) {
      await pairMoneyDevide(mobileNumber); // a
    }
    // mjNewFunc(1)
  } catch (error) {}
}

// vipUserMoneyDevide(96508);

const pairMoneyDevide = async (mobileNumber) => {
  try {
    console.log("Function called");
    let userData = await UserRegister.findOne({ mobileNumber });

    if (!userData) {
      console.log("User not found: ", mobileNumber);
      return;
    }

    async function countUsers(nodeId) {
      if (!nodeId) {
        return 0;
      }

      const nodeData = await UserRegister.findOne({ _id: nodeId }).lean();
      const [leftCount, rightCount] = await Promise.all([
        countUsers(nodeData.leftUser),
        countUsers(nodeData.rightUser),
      ]);

      return 1 + leftCount + rightCount;
    }

    const [leftCount, rightCount] = await Promise.all([
      countUsers(userData.leftUser),
      countUsers(userData.rightUser),
    ]);

    const totalTeam = leftCount + rightCount;
    const ratioString = `${rightCount} : ${leftCount}`;
    const ratioArray = ratioString.split(" : ");
    const minSide = Math.min(parseInt(ratioArray[0]), parseInt(ratioArray[1]));
    const maxSide = Math.max(parseInt(ratioArray[0]), parseInt(ratioArray[1]));

    let pointsToAddInParentWallet = minSide * 500;
    let { lastUserCount } = userData;

    let companyWallet = await CompanyWallet.findOne();
    if (!companyWallet) {
      companyWallet = new CompanyWallet({ totalBalance: 0 });
      await companyWallet.save();
    }

    const todayDate = new Date();
    const leftCountU = await countTodayUsers(userData.leftUser, todayDate);
    const rightCountU = await countTodayUsers(userData.rightUser, todayDate);
    const minSideToday = Math.min(leftCountU, rightCountU);

    const userRole = userData.role;

    let redWalletMoneyAdd = maxSide - minSide;
    // userData.redWallet = redWalletMoneyAdd * 500;

    let historyPushed = false;
    let companyWalletUpdated = false;
    0;
    userData.redWallet = (maxSide - minSide) * 500;
    userData.save();

    if (minSideToday <= 32) {
      // userData.redWallet = redWalletMoneyAdd * 500;
      // Update user data if conditions met

      if (lastUserCount !== pointsToAddInParentWallet) {
        const moneyAddToWallet = pointsToAddInParentWallet - lastUserCount;

        // userData.lastUserCount = pointsToAddInParentWallet;
        // userData.totalEarnings += moneyAddToWallet;
        // userData.greenWallet += moneyAddToWallet;
        // userData.pairRatio = ratioString;

        const updatedGreenWallet = (userData.greenWallet += moneyAddToWallet);
        const updatedTotalEarnings = (userData.totalEarnings +=
          moneyAddToWallet);
        const updateLastUserCount = (userData.lastUserCount =
          pointsToAddInParentWallet);
        // const updatedRedWallet = userData.redWallet += redWalletMoneyAdd

        const updatedUserData = {
          lastUserCount: updateLastUserCount,
          pairRatio: ratioString,
          pairCount: minSide,
          resetCount: minSide,
          greenWallet: updatedGreenWallet,
          totalEarnings: updatedTotalEarnings,
          // leftCount,
          // rightCount,
          // redWallet: updatedRedWallet,
          usersNeededForBalanced: 0,
        };

        await UserRegister.updateOne({ _id: userData._id }, updatedUserData);

        if (userData.fullName) {
          console.log(
            pointsToAddInParentWallet,
            moneyAddToWallet,
            ratioString,
            userData.fullName
          );
        }

        // if (!historyPushed) {
        companyWallet.debitedHistory.push({
          userName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          amount: moneyAddToWallet,
          transactionDate: new Date(),
          message: `giving money for pair complete to ${userData.fullName}'s wallet`,
        });
        //   historyPushed = true;
        // }

        // if (!companyWalletUpdated) {
        companyWallet.totalBalance -= moneyAddToWallet;
        await companyWallet.save();
        companyWalletUpdated = true;
      }
      // }
    }
    // else{
    //   const moneyAddToWallet = pointsToAddInParentWallet - lastUserCount;

    //   // userData.lastUserCount = pointsToAddInParentWallet;
    //   // userData.totalEarnings += moneyAddToWallet;
    //   // userData.greenWallet += moneyAddToWallet;
    //   // userData.pairRatio = ratioString;

    //   // const updatedRedWallet = userData.redWallet += redWalletMoneyAdd

    //   const updatedUserData = {
    //     pairRatio: ratioString,
    //   };

    //   await UserRegister.updateOne({ _id: userData._id }, updatedUserData);

    //   if (userData.fullName) {
    //     console.log(pointsToAddInParentWallet, moneyAddToWallet, ratioString, userData.fullName)
    //   }
    // }

    // -------------------------------------------------------------------- vip
    // vip1
    setTimeout(async () => {
      if (
        minSide >= 50 &&
        userRole != "vip1" &&
        userRole != "vip2" &&
        userRole != "vip3" &&
        userRole != "vip4" &&
        userRole != "vip5" &&
        userRole != "vip6" &&
        userRole != "vip7"
      ) {
        const updateGreenWallet = userData.greenWallet + 11000;
        const updatedTotalRewards = userData.totalRewards + 11000;
        console.log("11000 Devide", userData.fullName);
        console.log("User Green Wallet", userData.greenWallet);
        console.log("User Red Waller", userData.redWallet);
        // console.log("user updated to vip 1: ", mobileNumber);;;
        // await UserRegister.updateOne(
        //   { _id: userData._id },
        //   {
        //     role: "vip1",
        //     greenWallet: updateGreenWallet,
        //     // greenWallet: updateGreenWallet,
        //     totalRewards: updatedTotalRewards,
        //   }
        // );

        userData.greenWallet += 11000;
        userData.totalRewards += 11000;
        userData.role = "vip3";

        await userData.save();

        // UserWalletHistory
        const companyWallet = await CompanyWallet.findOne();
        const vipLevelMoneyDevide = 11000;
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          // companyWallet.totalBalance -= vipLevelMoneyDevide;
          // Add the deduction transaction to debitedHistory
          //
          // companyWallet.debitedHistory.push({
          //   userName: userData.fullName,
          //   mobileNumber: userData.mobileNumber,
          //   amount: vipLevelMoneyDevide,
          //   transactionDate: new Date(),
          // });
          // Save the updated company wallet
          await companyWallet.save();
        }
        // const userWalletHistory = await UserWalletHistory.findOne();
        // if (userWalletHistory) {
        //   userWalletHistory.totalBalance -= vipLevelMoneyDevide;
        //   // Add the deduction transaction to debitedHistory
        //   userWalletHistory.debitedHistory.push({
        //     userName: userData.fullName,
        //     mobileNumber: userData.mobileNumber,
        //     amount: vipLevelMoneyDevide,
        //     transactionDate: new Date(),
        //   });
        //   // Save the updated company wallet
        //   await userWalletHistory.save();
        // }
      }
      // vip2
      if (
        minSide >= 150 &&
        userRole != "vip2" &&
        userRole != "vip3" &&
        userRole != "vip4" &&
        userRole != "vip5" &&
        userRole != "vip6" &&
        userRole != "vip7"
      ) {
        const updateGreenWallet = userData.greenWallet + 22000;
        const updatedTotalRewards = userData.totalRewards + 22000;
        console.log(
          "vip bannya pachi nu wallet: ",
          userData.greenWallet,
          mobileNumber,
          "vip 2"
        );
        // await UserRegister.updateOne(
        //   { _id: userData._id },
        //   {
        //     role: "vip2",
        //     greenWallet: updateGreenWallet,
        //     totalRewards: updatedTotalRewards,
        //   }
        // );

        userData.greenWallet += 22000;
        userData.totalRewards += 22000;
        userData.role = "vip2";

        await userData.save();

        const companyWallet = await CompanyWallet.findOne();
        const vipLevelMoneyDevide = 22000;
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          // companyWallet.totalBalance -= vipLevelMoneyDevide;
          // Add the deduction transaction to debitedHistory

          // companyWallet.debitedHistory.push({
          //   userName: userData.fullName,
          //   mobileNumber: userData.mobileNumber,
          //   amount: vipLevelMoneyDevide,
          //   transactionDate: new Date(),
          // });
          // Save the updated company wallet
          await companyWallet.save();
        }
      }
      // vip3
      if (
        minSide >= 350 &&
        userRole != "vip3" &&
        userRole != "vip4" &&
        userRole != "vip5" &&
        userRole != "vip6" &&
        userRole != "vip7"
      ) {
        const updateGreenWallet = userData.greenWallet + 44000;
        const updatedTotalRewards = userData.totalRewards + 44000;
        console.log(
          "vip bannya pachi nu wallet: ",
          userData.greenWallet,
          mobileNumber,
          "vip 3"
        );
        // await UserRegister.updateOne(
        //   { _id: userData._id },
        //   {
        //     role: "vip3",
        //     greenWallet: updateGreenWallet,
        //     totalRewards: updatedTotalRewards,
        //   }
        // );

        userData.greenWallet += 44000;
        userData.totalRewards += 44000;
        userData.role = "vip3";

        await userData.save();

        const companyWallet = await CompanyWallet.findOne();
        const vipLevelMoneyDevide = 44000;
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          // companyWallet.totalBalance -= vipLevelMoneyDevide;
          // Add the deduction transaction to debitedHistory

          // companyWallet.debitedHistory.push({
          //   userName: userData.fullName,
          //   mobileNumber: userData.mobileNumber,
          //   amount: vipLevelMoneyDevide,
          //   transactionDate: new Date(),
          // });
          // Save the updated company wallet
          await companyWallet.save();
        }
      }
      // vip4
      if (
        minSide >= 650 &&
        userRole != "vip4" &&
        userRole != "vip5" &&
        userRole != "vip6" &&
        userRole != "vip7"
      ) {
        const updateGreenWallet = userData.greenWallet + 66000;
        const updatedTotalRewards = userData.totalRewards + 66000;
        console.log(
          "vip bannya pachi nu wallet: ",
          userData.greenWallet,
          mobileNumber,
          "vip 4"
        );
        // await UserRegister.updateOne(
        //   { _id: userData._id },
        //   {
        //     role: "vip4",
        //     greenWallet: updateGreenWallet,
        //     totalRewards: updatedTotalRewards,
        //   }
        // );

        userData.greenWallet += 66000;
        userData.totalRewards += 66000;
        userData.role = "vip4";

        await userData.save();

        const companyWallet = await CompanyWallet.findOne();
        const vipLevelMoneyDevide = 66000;
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          // companyWallet.totalBalance -= vipLevelMoneyDevide;
          // Add the deduction transaction to debitedHistory
          //
          // companyWallet.debitedHistory.push({
          //   userName: userData.fullName,
          //   mobileNumber: userData.mobileNumber,
          //   amount: vipLevelMoneyDevide,
          //   transactionDate: new Date(),
          // });
          // Save the updated company wallet
          await companyWallet.save();
        }
      }
      // vip5
      if (
        minSide >= 1050 &&
        userRole != "vip5" &&
        userRole != "vip6" &&
        userRole != "vip7"
      ) {
        const updateGreenWallet = userData.greenWallet + 88000;
        const updatedTotalRewards = userData.totalRewards + 88000;
        console.log(
          "vip bannya pachi nu wallet: ",
          userData.greenWallet,
          mobileNumber,
          "vip 5"
        );
        // await UserRegister.updateOne(
        //   { _id: userData._id },
        //   {
        //     role: "vip5",
        //     greenWallet: updateGreenWallet,
        //     totalRewards: updatedTotalRewards,
        //   }
        // );

        userData.greenWallet += 88000;
        userData.totalRewards += 88000;
        userData.role = "vip5";

        await userData.save();

        const companyWallet = await CompanyWallet.findOne();
        const vipLevelMoneyDevide = 88000;
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          // companyWallet.totalBalance -= vipLevelMoneyDevide;
          // Add the deduction transaction to debitedHistory
          //
          // companyWallet.debitedHistory.push({
          //   userName: userData.fullName,
          //   mobileNumber: userData.mobileNumber,
          //   amount: vipLevelMoneyDevide,
          //   transactionDate: new Date(),
          // });
          // Save the updated company wallet
          await companyWallet.save();
        }
      }
      // vip6
      if (minSide >= 1550 && userRole != "vip6" && userRole != "vip7") {
        const updateGreenWallet = userData.greenWallet + 110000;
        const updatedTotalRewards = userData.totalRewards + 110000;
        console.log(
          "vip bannya pachi nu wallet: ",
          userData.greenWallet,
          mobileNumber,
          "vip 6"
        );
        // await UserRegister.updateOne(
        //   { _id: userData._id },
        //   {
        //     role: "vip6",
        //     greenWallet: updateGreenWallet,
        //     totalRewards: updatedTotalRewards,
        //   }
        // );
        userData.greenWallet += 110000;
        userData.totalRewards += 110000;
        userData.role = "vip6";

        await userData.save();

        const companyWallet = await CompanyWallet.findOne();
        const vipLevelMoneyDevide = 110000;
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          // companyWallet.totalBalance -= vipLevelMoneyDevide;
          // Add the deduction transaction to debitedHistory
          //
          // companyWallet.debitedHistory.push({
          //   userName: userData.fullName,
          //   mobileNumber: userData.mobileNumber,
          //   amount: vipLevelMoneyDevide,
          //   transactionDate: new Date(),
          // });
          // Save the updated company wallet
          await companyWallet.save();
        }
      }
      // vip7
      if (minSide >= 2550 && userRole != "vip7") {
        const updateGreenWallet = userData.greenWallet + 220000;
        const updatedTotalRewards = userData.totalRewards + 220000;
        // await UserRegister.updateOne(
        //   { _id: userData._id },
        //   {
        //     role: "vip7",
        //     greenWallet: updateGreenWallet,
        //     totalRewards: updatedTotalRewards,
        //     lastRoyaltyUpdatedCount: leftCount + rightCount,
        //     pairCount: leftCount + rightCount,
        //   }
        // );

        userData.greenWallet += 220000;
        userData.totalRewards += 220000;
        userData.role = "vip7";
        userData.lastRoyaltyUpdatedCount = leftCount + rightCount;
        userData.pairCount = leftCount + rightCount;

        await userData.save();

        const companyWallet = await CompanyWallet.findOne();
        const vipLevelMoneyDevide = 220000;
        if (companyWallet) {
          // Subtract points from CompanyWallet's total balance
          // companyWallet.totalBalance -= vipLevelMoneyDevide;
          // Add the deduction transaction to debitedHistory
          //
          // companyWallet.debitedHistory.push({
          //   userName: userData.fullName,
          //   mobileNumber: userData.mobileNumber,
          //   amount: vipLevelMoneyDevide,
          //   transactionDate: new Date(),
          // });
          // Save the updated company wallet
          await companyWallet.save();
        }
      }

      const userLeftChildId = userData.leftUser;
      const leftChildData = await UserRegister.findOne({
        _id: userLeftChildId,
      });

      const userRightChildId = userData.rightUser;
      const rightChildData = await UserRegister.findOne({
        _id: userRightChildId,
      });
      // Check if the left child is VIP7 and update the parent accordingly
      if (leftChildData && leftChildData.role === "vip7") {
        console.log(
          leftCount,
          "--------------------------- userData.__v",
          userData.fullName
        );
        await UserRegister.findOneAndUpdate(
          { _id: userData._id },
          { $set: { isLeftUserVip7: true } }
        );
      }

      // Check if the right child is VIP7 and update the parent accordingly
      if (rightChildData && rightChildData.role === "vip7") {
        console.log(
          rightCount,
          "userData.__v ---------------------------------",
          userData.fullName
        );
        await UserRegister.findOneAndUpdate(
          { _id: userData._id },
          { $set: { isRightUserVip7: true } }
        );
      }

      // director money devide
      if (userRole == "vip7") {
        const userLeftChildId = userData.leftUser;
        const leftChildData = await UserRegister.findOne({
          _id: userLeftChildId,
        });

        const userRightChildId = userData.rightUser;
        const righgtChildData = await UserRegister.findOne({
          _id: userRightChildId,
        });

        // ajfskdfjasldkfjdlkfasdjflkdjlkasjdlkasdjfklasjdflkadjlkjdfkldfjakldsj

        if (userData.role == "vip7") {
          // const totalUserCount = leftCount + rightCount;
          // // console.log(totalUserCount, "totalUserCount")

          // if (totalUserCount !== userData.lastRoyaltyUpdatedCount) {
          // let currentGetRoyaltyCount =
          //   totalUserCount - userData.lastRoyaltyUpdatedCount;

          //   const updateGreenWallet = currentGetRoyaltyCount * 100;
          //   const updatedTotalRewards = currentGetRoyaltyCount * 100;

          //   // console.log(
          //   //   updateGreenWallet,
          //   //   currentGetRoyaltyCount,
          //   //   userData.lastRoyaltyUpdatedCount,
          //   //   userData.fullName
          //   // );

          //   // userData.greenWallet+=updateGreenWallet
          //   // userData.totalRewards+=updatedTotalRewards
          //   userData.__v += currentGetRoyaltyCount;
          //   userData.lastRoyaltyUpdatedCount = totalUserCount;

          //   console.log(userData.__v, "userData.__v", userData.fullName);

          //   const today = new Date(); // Current date
          //   const lastDateOfMonth = new Date(
          //     today.getFullYear(),
          //     today.getMonth() + 1,
          //     0
          //   ).getDate(); // Last date of the current month

          //   // Assuming userData.__v is already defined
          //   let userReward = userData.__v * 100;

          //   // Check if it's the last date of the month
          //   if (today.getDate() === today.getDate()) {
          //     // Add the user's reward to greenWallet
          //     userData.greenWallet += userReward;
          //     console.log(
          //       "Reward added to greenWallet:",
          //       userReward,
          //       userData.fullName
          //     );
          //   } else {
          //     console.log("Not the last date of the month. No reward added.");
          //   }

          //   // Update __v based on calculations
          //   userData.__v += currentGetRoyaltyCount;

          //   const companyWallet = await CompanyWallet.findOne();
          //   const royaltyRewardDevide = updateGreenWallet;
          //   if (companyWallet) {
          //     companyWallet.totalBalance -= royaltyRewardDevide;
          //     // Add the deduction transaction to debitedHistory
          //     companyWallet.debitedHistory.push({
          //       userName: userData.fullName,
          //       mobileNumber: userData.mobileNumber,
          //       amount: royaltyRewardDevide,
          //       transactionDate: new Date(),
          //     });
          //     // Save the updated company wallet
          //     await companyWallet.save();
          //   }
          // }

          // if (
          //   userData.isRightUserVip7 == false &&
          //   userData.isLeftUserVip7 == false
          // ) {
          const totalUserCount = leftCount + rightCount;
          if (userData.lastRoyaltyUpdatedCount != totalUserCount) {
            let currentGetRoyaltyCount =
              totalUserCount - userData.lastRoyaltyUpdatedCount;

            console.log(
              totalUserCount,
              userData.lastRoyaltyUpdatedCount,
              userData.fullName
            );

            const __v = (userData.__v += currentGetRoyaltyCount);
            const lastRoyaltyUpdatedCount = totalUserCount;

            await UserRegister.updateOne(
              { _id: userData._id },
              {
                __v,
                lastRoyaltyUpdatedCount,
                lastupdatedleftcount: leftCount,
                lastupdatedrightcount: rightCount,
              }
            );
          }
        }
        // } else if (
        //   userData.isLeftUserVip7 == true &&
        //   userData.isRightUserVip7 == false
        // ) {
        //   const totalUserCount = rightCount;
        //   if (userData.lastupdatedleftcount != totalUserCount) {
        //     let currentGetRoyaltyCount =
        //       totalUserCount - userData.lastupdatedleftcount;

        //     console.log(
        //       totalUserCount,
        //       userData.lastupdatedleftcount,
        //       userData.fullName
        //     );

        //     const __v = (userData.__vLeft += currentGetRoyaltyCount);
        //     const lastRoyaltyUpdatedCount = totalUserCount;
        //     const __vTotal = (userData.__v += currentGetRoyaltyCount);

        //     await UserRegister.updateOne(
        //       { _id: userData._id },
        //       {
        //         __vLeft: __v,
        //         __v: __vTotal,
        //         lastRoyaltyUpdatedCount,
        //         lastupdatedrightcount: rightCount,
        //         lastupdatedleftcount: leftCount,
        //       }
        //     );
        //   }
        // } else if (
        //   userData.isRightUserVip7 == true &&
        //   userData.isLeftUserVip7 == false
        // ) {
        //   const totalUserCount = leftCount;
        //   if (userData.lastupdatedrightcount != totalUserCount) {
        //     let currentGetRoyaltyCount =
        //       totalUserCount - userData.lastupdatedrightcount;

        //     const __v = (userData.__vRight += currentGetRoyaltyCount);
        //     const __vTotal = (userData.__v += currentGetRoyaltyCount);
        //     const lastRoyaltyUpdatedCount = totalUserCount;

        //     await UserRegister.updateOne(
        //       { _id: userData._id },
        //       {
        //         __vRight: __v,
        //         __v: __vTotal,
        //         lastRoyaltyUpdatedCount,
        //         lastupdatedrightcount: rightCount,
        //         lastupdatedleftcount: leftCount,
        //       }
        //     );
        //   }
        // }

        // making user director
        // if (
        //   leftChildData.role === "vip7" &&
        //   righgtChildData.role === "vip7" &&
        //   userRole != "Director"
        // ) {
        //   const updateGreenWallet = userData.greenWallet + 550000; // Director Price
        //   const updatedTotalRewards = userData.totalRewards + 550000; // Director Price  increase in totalRewards

        //   // await UserRegister.updateOne(
        //   //   { _id: userData._id },
        //   //   {
        //   //     role: "Director",
        //   //     greenWallet: updateGreenWallet, // Add  Director Price in user Green Wallet
        //   //     totalRewards: updatedTotalRewards,
        //   //   }
        //   // );

        //   userData.greenWallet += 550000;
        //   userData.totalRewards += 550000;
        //   userData.role = "Director";

        // //  await userData.save();

        //   // // company wallet
        //   // const companyWallet = await CompanyWallet.findOne();
        //   // const vipLevelMoneyDevide = 550000;
        //   // if (companyWallet) {
        //   //   // Subtract points from CompanyWallet's total balance
        //   //   companyWallet.totalBalance -= vipLevelMoneyDevide;
        //   //   // Add the deduction transaction to debitedHistory
        //   //   companyWallet.debitedHistory.push({
        //   //     userName: userData.fullName,
        //   //     mobileNumber: userData.mobileNumber,
        //   //     amount: vipLevelMoneyDevide,
        //   //     transactionDate: new Date(),
        //   //     message: `director reward.`
        //   //   });
        //   //   // Save the updated company wallet
        //   //   await companyWallet.save();
        //   // }
        // }
      }
      // userData.save();
    }, 200);

    await companyWallet.save();
    // await userData.save();

    // fetchMobileNumbersAndRunVIP function to check vip money
  } catch (error) {
    console.log("error in pairMoneyDevide: ", error.message);
  }
};

// pairMoneyDevide(1);
// fetchMobileNumbers();
const creditPointToUser = async (user, points, childName) => {
  try {
    // find user ------------
    // refer by user = a
    const referredByUser = await UserRegister.findOne({
      referralCode: user,
    });

    if (!referredByUser) {
      console.log("credit user not found.");
      return;
    }

    referredByUser.totalEarnings += points;
    referredByUser.greenWallet += points; // 500

    await referredByUser.save();

    // debiting points from company wallet ---------------
    let companyWallet = await CompanyWallet.findOne();
    if (!companyWallet) {
      companyWallet = new CompanyWallet({ totalBalance: 0 });
      await companyWallet.save();
    }
    if (companyWallet) {
      companyWallet.totalBalance -= points;

      companyWallet.debitedHistory.push({
        userName: referredByUser.fullName,
        mobileNumber: referredByUser.mobileNumber,
        amount: points,
        transactionDate: new Date(),
        message: `${childName} direct refer money to ${referredByUser.fullName}'s wallet`,
      });

      // Save the updated company wallet
      await companyWallet.save();
    }
    // await pairMoneyDevide(1);
  } catch (error) {
    console.log("error in creditPointToUser: ", error);
  }
};

const addFakeUsersToDB = async (
  referredBy, // a
  treeId, // a
  side, // b
  childTree, // b
  childRefer // b
) => {
  try {
    // const {
    //   profileImage,
    //   Designation,
    //   gender,
    //   dob,
    //   mobileNumber,
    //   fullName,
    //   email,
    //   adress,
    //   password,
    //   cPassword,
    //   side,
    //   treeId,
    //   referredBy,
    //   adhaar,
    // } = req.body;

    const profileImage =
      "https://www.sparrowgroups.com/CDN/upload/4544e20c4a3-44a0-4124-b7a2-d73fb8bcc999.jpg";
    const Designation = "Developer";
    const mobileNumber = childRefer;
    const gender = "male";
    const dob = "2023/07/18";
    const fullName = `-${UserCount}-`;
    const email = `mj${childRefer}@gmail.com`;
    const adress = "bhavnagar";
    const adhaar = childRefer;
    const password = "Shivam@123";
    const cPassword = "Shivam@123";
    const role = "";

    // Your existing validation and error handling code here
    const parentUser = await UserRegister.findOne({ treeId: treeId });
    if (!parentUser) {
      return;
      // return res.status(401).json({
      //   statusCode: 401,
      //   message: "Parent user not found!",
      // });
    }
    if (parentUser.leftUser && parentUser.rightUser) {
      return;
      // return res.status(402).json({
      //   statusCode: 402,
      //   message:
      //     "Both leftUser and rightUser are already assigned to the parent user. Please use another tree ID.",
      // });
    }
    if (side === "left" && parentUser.leftUser) {
      return;
      // return res.status(403).json({
      //   statusCode: 403,
      //   message: "Left side is already full. Please try the right side.",
      // });
    }
    if (side === "right" && parentUser.rightUser) {
      return;
      // return res.status(405).json({
      //   statusCode: 405,
      //   message: "Right side is already full. Please try the left side.",
      // });
    }
    const referredByUser = await UserRegister.findOne({
      referralCode: referredBy,
    });
    if (!referredByUser) {
      return;
      // return res.status(406).json({ error: "Invalid referral code." });
    }

    const checkMobileNumber = await UserRegister.findOne({
      mobileNumber: mobileNumber,
    });
    if (checkMobileNumber) {
      return;
      // return res.status(407).json({
      //   statusCode: 407,
      //   message: "This Number already in Use!",
      // });
    }

    // const { referralCode } = generateReferralCode(adhaar);
    const referralCode = childRefer; // b
    const newTreeId = childTree; // b
    const mlmPurchaseDate = moment(new Date()).format("DD-MM-YYYY");
    const mlmPurchaseTime = moment(new Date()).format("hh:mm:ss");
    const newUser = new UserRegister({
      profileImage,
      Designation,
      gender,
      dob,
      mobileNumber,
      fullName,
      email,
      adress,
      password,
      cPassword,
      side,
      referralCode,
      treeId: newTreeId,
      level: parentUser.level + 1,
      referredBy: referredByUser._id,
      adhaar,
      mlmPurchaseDate,
      mlmPurchaseTime,
    });

    referredByUser.referralChain.push(newUser._id); // a ni chain ma push b nu id

    const refeererChainCount = referredByUser.referralChain.length;
    const { lastUserCount } = referredByUser;

    let totalEarning = referredByUser.totalEarnings;

    // if (refeererChainCount > 2) {
    //   totalEarning += 500;
    //   referredByUser.greenWallet += 500;
    // } else if (refeererChainCount > 1) {
    //   referredByUser.greenWallet += 1000;
    //   totalEarning += 500;
    //   referredByUser.redWallet -= 500;
    // } else {
    //   referredByUser.redWallet += 500;
    //   totalEarning += 500;
    // }

    // adding referal money to user account...

    await newUser.save(); // b - mlm new user
    if (side === "left") {
      parentUser.leftUser = newUser._id;
    } else if (side === "right") {
      parentUser.rightUser = newUser._id;
    }
    creditPointToUser(referredBy, 500, fullName); // left ane right point add krvanu function

    await parentUser.save();

    // -------------------------------
    // / Update the company wallet's totalBalance
    let companyWallet = await CompanyWallet.findOne();
    if (!companyWallet) {
      companyWallet = new CompanyWallet({ totalBalance: 0 });
      await companyWallet.save();
    }
    companyWallet.totalBalance += 3999;
    // Add the newly registered user's information to creditedHistory
    companyWallet.creditedHistory.push({
      userName: fullName,
      mobileNumber: mobileNumber,
      amount: 3999,
      message: "MLM Purchase Charge",
      transactionDate: new Date(),
    });
    UserCount++;
    await companyWallet.save();

    // after crediting in company wallet
    // pairMoneyDevide(1);

    fetchMobileNumbers();
  } catch (error) {}
};

const addFakeUsers = async () => {
  const allMobiles = await getAllMobileNumbers();

  let userssss = 0;

  let userCount = 0;
  let i = 0;

  const userReferList = [{ referredBy: 1, treeId: 12345 }];
  const delayInSeconds = 3; // Adjust the delay time as needed

  // Addddd
  const addUserWithDelay = async () => {
    console.log("users adding: ", userCount);
    if (userCount >= 127) {
      console.log("Reached Users 32, ");
      return;
    }

    const useThisRefer = userReferList[i];
    // -----------------------------
    setTimeout(() => {
      const leftTreeId = generateTreeId();
      const leftRefer = generateTreeId();
      addFakeUsersToDB(
        useThisRefer.referredBy, // a
        useThisRefer.treeId, // a
        "left", // b
        leftTreeId, // bsss
        leftRefer // b
      );
      userssss++;
      const newReferObjectLeft = {
        referredBy: leftRefer,
        treeId: leftTreeId,
      };
      userReferList.push(newReferObjectLeft);
    }, 2000);
    // ------------------------
    // 3
    setTimeout(() => {
      // Call the function for the right child after the delay
      const rightTreeId = generateTreeId();
      const rightRefer = generateTreeId();
      addFakeUsersToDB(
        useThisRefer.referredBy, // a
        useThisRefer.treeId, //a
        "right", // c
        rightTreeId, // c
        rightRefer //c
      );
      userssss++;
      const newReferObjectRight = {
        referredBy: rightRefer,
        treeId: rightTreeId,
      };
      userCount = userCount + 1;
      userReferList.push(newReferObjectRight);
      i++;

      // Call the next step after another delay
      setTimeout(addUserWithDelay, 6000);
    }, 500);
  };

  // Start the process

  addUserWithDelay();
};

addFakeUsers();

// ---------------------------M Pin--------------------------------------

router.put("/mpin/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const updateData = req.body;

    // Update the user based on the mobile number
    let result = await UserRegister.findOneAndUpdate(
      { mobileNumber }, // Search condition based on mobile number
      updateData, // Data to update
      { new: true } // Return the updated document
    );

    res.json({
      statusCode: 200,
      data: result,
      message: "M-Pin Updated Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/mpincheck/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;

    const data = await UserRegister.findOne({ mobileNumber });

    if (!data) {
      return res.status(202).json({
        statusCode: 202,
        message: "Data not found",
      });
    }

    if (data.mPin !== null) {
      return res.status(200).json({
        statusCode: 200,
        message: "Your M-Pin is Set",
      });
    } else {
      return res.status(201).json({
        statusCode: 201,
        message: "Your M-Pin is Not Set",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/mpinmatch/:mobileNumber/:mPin", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const mPin = req.params.mPin;

    const data = await UserRegister.findOne({ mobileNumber, mPin });

    if (!data) {
      return res.status(202).json({
        statusCode: 202,
        message: "MPIN do not match.",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "MPIN match.",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/data/:mobileNumber", async (req, res) => {
  try {
    // Extract the mobileNumber from the request parameters
    const mobileNumber = req.params.mobileNumber;

    // Make an HTTP request to the PHP API
    const phpApiUrl = `https://connectgoinfoware.com/new_apis/MLM/get_user.php?number=${mobileNumber}`;
    const phpApiResponse = await axios.get(phpApiUrl);

    // Check if the response from the PHP API is successful
    if (phpApiResponse.status === 200) {
      // Parse the data from the PHP API response and extract the "details" array
      const dataFromPhpApi = phpApiResponse.data.details;

      // Modify the key "number" to "mobileNumber"
      dataFromPhpApi[0].mobileNumber = dataFromPhpApi[0].number;
      dataFromPhpApi[0].redWallet = dataFromPhpApi[0].red_wallet;
      dataFromPhpApi[0].greenWallet = dataFromPhpApi[0].green_wallet;
      dataFromPhpApi[0].role = dataFromPhpApi[0].user_leval;
      dataFromPhpApi[0].totalEarnings = dataFromPhpApi[0].total_earn;
      dataFromPhpApi[0].registrationDate = dataFromPhpApi[0].date;

      delete dataFromPhpApi[0].number;
      delete dataFromPhpApi[0].red_wallet;
      delete dataFromPhpApi[0].green_wallet;
      delete dataFromPhpApi[0].user_leval;
      delete dataFromPhpApi[0].total_earn;
      delete dataFromPhpApi[0].date;

      // Return the extracted "details" array as a response to your Node.js API client
      res.status(200).json({
        statusCode: 200,
        message: "Data retrieved successfully from PHP API",
        details: dataFromPhpApi,
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: "Error in retrieving data from PHP API",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
