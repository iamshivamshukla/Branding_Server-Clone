var express = require("express");
var router = express.Router();
var {
  verifyToken,
  hashPassword,
  hashCompare,
  createToken,
} = require("../authentication");
// var Registers = require("../modals/Admin_Register");
var MlmRegister = require("../modals/User_Register");
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
var MlmRegister = require("../modals/MlmRegister");

let mlmCharge = process.env.MlmNewPurchaseCharge;
let clippingAt = process.env.MlmClippingAt;
let fakeusercountdb = process.env.FakeUserAddCount;

// router.post("/register", async (req, res) => {
//   try {
//     const {
//       profileImage,
//       Designation,
//       gender,
//       dob,
//       mobileNumber,
//       fullName,
//       email,
//       adress,
//       password,
//       cPassword,
//       side,
//       treeId,
//       referredBy,
//       adhaar,
//     } = req.body;
//     // Your existing validation and error handling code here
//     const parentUser = await MlmRegister.findOne({ treeId: treeId });
//     if (!parentUser) {
//       return res.status(401).json({
//         statusCode: 401,
//         message: "Parent user not found!",
//       });
//     }
//     if (parentUser.leftUser && parentUser.rightUser) {
//       return res.status(402).json({
//         statusCode: 402,
//         message:
//           "Both leftUser and rightUser are already assigned to the parent user. Please use another tree ID.",
//       });
//     }
//     if (side === "left" && parentUser.leftUser) {
//       return res.status(403).json({
//         statusCode: 403,
//         message: "Left side is already full. Please try the right side.",
//       });
//     }
//     if (side === "right" && parentUser.rightUser) {
//       return res.status(405).json({
//         statusCode: 405,
//         message: "Right side is already full. Please try the left side.",
//       });
//     }
//     const referredByUser = await MlmRegister.findOne({
//       referralCode: referredBy,
//     });
//     if (!referredByUser) {
//       return res.status(406).json({ error: "Invalid referral code." });
//     }

//     const checkMobileNumber = await MlmRegister.findOne({
//       mobileNumber: mobileNumber,
//     });
//     if (checkMobileNumber) {
//       return res.status(407).json({
//         statusCode: 407,
//         message: "This Number already in Use!",
//       });
//     }

//     // const { referralCode } = generateReferralCode(adhaar);
//     const referralCode = mobileNumber;
//     const newTreeId = mobileNumber;
//     const mlmPurchaseDate = moment(new Date()).format("DD-MM-YYYY");
//     const mlmPurchaseTime = moment(new Date()).format("hh:mm:ss");
//     const newUser = new MlmRegister({
//       profileImage,
//       Designation,
//       gender,
//       dob,
//       mobileNumber,
//       fullName,
//       email,
//       adress,
//       password,
//       cPassword,
//       side,
//       referralCode,
//       treeId: newTreeId,
//       level: parentUser.level + 1,
//       referredBy: referredByUser._id,
//       adhaar,
//       mlmPurchaseDate,
//       mlmPurchaseTime,
//     });

//     referredByUser.referralChain.push(newUser._id);

//     const refeererChainCount = referredByUser.referralChain.length;

//     await referredByUser.save();
//     await newUser.save();
//     if (side === "left") {
//       parentUser.leftUser = newUser._id;
//     } else if (side === "right") {
//       parentUser.rightUser = newUser._id;
//     }
//     await parentUser.save();
//     // -------------------------------
//     // / Update the company wallet's totalBalance
//     let companyWallet = await CompanyWallet.findOne();
//     if (!companyWallet) {
//       companyWallet = new CompanyWallet({ totalBalance: 0 });
//       await companyWallet.save();
//     }
//     companyWallet.totalBalance += mlmCharge;
//     // Add the newly registered user's information to creditedHistory
//     companyWallet.creditedHistory.push({
//       userName: fullName,
//       mobileNumber: mobileNumber,
//       amount: mlmCharge,
//       message: "MLM Purchase Charge",
//       transactionDate: new Date(),
//     });
//     await companyWallet.save();
//     res.status(200).json({
//       statusCode: 200,
//       data: newUser,
//       message: "Added successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// get all mobile numbers 
async function getAllMobileNumbers() {
    try {
      // Find all users in the database and select only the 'mobileNumber' field
      const users = await MlmRegister.find({}, 'mobileNumber').lean();
  
      if (!users) {
        return;
      }
  
      // Extract mobile numbers from the users
      const mobileNumbers = users.map(user => user.mobileNumber);
  
      return mobileNumbers;
    } catch (error) {
      throw error; // You can handle the error as needed in your application
    }
  }

//   generate
function generateTreeId() {
    const maxFiveDigitNumber = 9999999999; // Maximum 5-digit number
    const randomSuffix = Math.floor(Math.random() * (maxFiveDigitNumber + 1)); // Generate random number up to 99999
    return randomSuffix;
  }

  let UserCount = 1;
//   adding single user to db
// const addFakeUsersToDB = async (
//     referredBy,
//     treeId,
//     side,
//     childTree,
//     childRefer
//   ) => {
//     try {
  
//       const profileImage =
//         "https://www.sparrowgroups.com/CDN/upload/4544e20c4a3-44a0-4124-b7a2-d73fb8bcc999.jpg";
//       const Designation = "Developer";
//       const mobileNumber = childRefer;
//       const gender = "male";
//       const dob = "2023/07/18";
//       const fullName = `-${UserCount}-`;
//       const email = `mj${childRefer}@gmail.com`;
//       const adress = "bhavnagar";
//       const adhaar = childRefer;
//     //   const role = "V";
  
//       // Your existing validation and error handling code here
//       const parentUser = await MlmRegister.findOne({ treeId: treeId });
//       if (!parentUser) {
//         console.log("Parent user not found! ", referredBy)
//         return;
//         // return res.status(401).json({
//         //   statusCode: 401,
//         //   message: "Parent user not found!",
//         // });
//       }
//       if (parentUser.leftUser && parentUser.rightUser) {
//         console.log("Both leftUser and rightUser are already assigned to the parent user. Please use another tree ID: ", referredBy)
//         return;
//         // return res.status(402).json({
//         //   statusCode: 402,
//         //   message:
//         //     "Both leftUser and rightUser are already assigned to the parent user. Please use another tree ID.",
//         // });
//       }
//       if (side === "left" && parentUser.leftUser) {
//         console.log("Left side is already full. Please try the right side! ", referredBy)
//         return;
//         // return res.status(403).json({
//         //   statusCode: 403,
//         //   message: "Left side is already full. Please try the right side.",
//         // });
//       }
//       if (side === "right" && parentUser.rightUser) {
//         console.log("Right side is already full. Please try the right side! ", referredBy)

//         return;
//         // return res.status(405).json({
//         //   statusCode: 405,
//         //   message: "Right side is already full. Please try the left side.",
//         // });
//       }
//       const referredByUser = await MlmRegister.findOne({
//         referralCode: referredBy,
//       });
//       if (!referredByUser) {
//         console.log("Invalid referral code! ", referredBy)

//         return;
//         // return res.status(406).json({ error: "Invalid referral code." });
//       }
  
//       const checkMobileNumber = await MlmRegister.findOne({
//         mobileNumber: mobileNumber,
//       });
//       if (checkMobileNumber) {
//         console.log("This Number already in Use!: ", referredBy)
//         return;
//         // return res.status(407).json({
//         //   statusCode: 407,
//         //   message: "This Number already in Use!",
//         // });
//       }

//       const referralCode = childRefer;
//       const newTreeId = childTree;
//       const mlmPurchaseDate = moment(new Date()).format("DD-MM-YYYY");
//       const mlmPurchaseTime = moment(new Date()).format("hh:mm:ss");
//       const newUser = new MlmRegister({
//         profileImage,
//         Designation,
//         gender,
//         dob,
//         mobileNumber,
//         fullName,
//         email,
//         adress,
//         side,
//         referralCode,
//         treeId: newTreeId,
//         level: parentUser.level + 1,
//         referredBy: referredByUser._id,
//         adhaar,
//         mlmPurchaseDate,
//         mlmPurchaseTime,
//       });
  
//       referredByUser.referralChain.push(newUser._id);
  
//       const refeererChainCount = referredByUser.referralChain.length;
//       let totalEarning = referredByUser.totalEarnings;
  
//       await referredByUser.save();
//       await newUser.save();
//       if (side === "left") {
//         parentUser.leftUser = newUser._id;
//       } else if (side === "right") {
//         parentUser.rightUser = newUser._id;
//       }
//       await parentUser.save();
//       // -------------------------------
//       // / Update the company wallet's totalBalance
//       let companyWallet = await CompanyWallet.findOne();
//       if (!companyWallet) {
//         companyWallet = new CompanyWallet({ totalBalance: 0 });
//         await companyWallet.save();
//         // return;
//       }
//       companyWallet.totalBalance += mlmCharge;
//       // Add the newly registered user's information to creditedHistory
//       companyWallet.creditedHistory.push({
//         userName: fullName,
//         mobileNumber: mobileNumber,
//         amount: mlmCharge,
//         message: "MLM Purchase Charge",
//         transactionDate: new Date(),
//       });
//       UserCount++;
//       await companyWallet.save();
//     } catch (error) {
//         console.log("errror in fakeuserdb: ", error.message)
//     }
//   };

// user adding for loop to add 
const addFakeUsers = async () => {
  const allMobiles = await getAllMobileNumbers();

  let userssss = 0;
  let userCount = 0;
  let i = 0;
  const userReferList = [{ referredBy: 1, treeId: 12345 }];
  const delayInSeconds = 3; // Adjust the delay time as needed

  // Addddd
  const addUserWithDelay = async () => {
    console.log("users adding: ", userssss);
    if (userssss >= 4) {
      console.log("Reached Users 32, ");
      return;
    }

    const useThisRefer = userReferList[i];
    // -----------------------------
    setTimeout(() => {
      const leftTreeId = generateTreeId();
      const leftRefer = generateTreeId();
      addFakeUsersToDB(
        useThisRefer.referredBy,
        useThisRefer.treeId,
        "left",
        leftTreeId,
        leftRefer
      );
      userssss++;
      const newReferObjectLeft = {
        referredBy: leftRefer,
        treeId: leftTreeId,
      };
      userReferList.push(newReferObjectLeft);
    }, 500);
    // ------------------------
    setTimeout(() => {
      // Call the function for the right child after the delay
      const rightTreeId = generateTreeId();
      const rightRefer = generateTreeId();
      addFakeUsersToDB(
        useThisRefer.referredBy,
        useThisRefer.treeId,
        "right",
        rightTreeId,
        rightRefer
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
      setTimeout(addUserWithDelay, delayInSeconds * 1000);
    }, 500);
  };

  // Start the process
  addUserWithDelay();
};

// addFakeUsers()


module.exports = router;
