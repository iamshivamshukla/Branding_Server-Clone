var express = require("express");
var router = express.Router();
var TrendingAndNewsBanner = require("../modals/TrendingAndNewsBanner");
var WalletHistoryAndCount = require("../modals/User_Register");
var moment = require("moment");
var UserRegister = require("../modals/User_Register");
var CompanyWallet = require("../modals/CompanyWallet");

// Wallet Balance
router.get("/wallet/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;

    const data = await UserRegister.findOne({ mobileNumber }).select(
      "redWallet greenWallet totalRewards side mlmPurchaseDate"
    );

    if (!data) {
      return res.status(203).json({
        statusCode: 203,
        message: "Data not found",
      });
    }

    const totalTeam = await UserRegister.countDocuments();
    const rightSideTotalJoining = await UserRegister.countDocuments({
      side: "right",
    });
    const rightSideTodayJoining = await UserRegister.countDocuments({
      side: "right",
      mlmPurchaseDate: moment().format("DD-MM-YYYY"),
    });
    const leftSideTotalJoining = await UserRegister.countDocuments({
      side: "left",
    });
    const leftSideTodayJoining = await UserRegister.countDocuments({
      side: "left",
      mlmPurchaseDate: moment().format("DD-MM-YYYY"),
    });

    res.json({
      statusCode: 200,
      data: {
        redWallet: data.redWallet,
        greenWallet: data.greenWallet,
        totalRewards: data.totalRewards,
        totalTeam,
        rightSideTotalJoining,
        rightSideTodayJoining,
        leftSideTotalJoining,
        leftSideTodayJoining,
      },
      message: "Get Wallet History Successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/paircount/:mobileNumber", async (req, res) => {
  try {
    const mobileNumber = req.params.mobileNumber;
    const userData = await UserRegister.findOne({ mobileNumber }).lean();
    if (!userData) {
      return res.status(203).json({
        statusCode: 203,
        message: "User not found",
      });
    }

    async function countUsers(nodeId) {
      if (!nodeId) {
        return 0;
      }

      const nodeData = await UserRegister.findOne({ _id: nodeId }).lean();
      const leftCount = await countUsers(nodeData?.leftUser);
      const rightCount = await countUsers(nodeData?.rightUser);

      return 1 + leftCount + rightCount;
    }

    const leftCount = await countUsers(userData?.leftUser);
    const rightCount = await countUsers(userData?.rightUser);
    const totalTeam = leftCount + rightCount;
    const ratioString = `${rightCount} : ${leftCount} ratio`;
    const ratioArray = ratioString.split(" : ");
    const minSide = Math.min(parseInt(ratioArray[0]), parseInt(ratioArray[1]));
 
    async function countUserss(nodeId, side) {
      if (!nodeId) {
        return 0;
      }

      const nodeData = await UserRegister.findOne({ _id: nodeId }).lean();
      const leftCount = await countUserss(nodeData?.leftUser, "left");
      const rightCount = await countUserss(nodeData?.rightUser, "right");

      if (
        nodeData?.registrationDate >= todayStart &&
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
      const leftTodayCount = await countUserss(rootUser?.leftUser, "left");
      const rightTodayCount = await countUserss(rootUser?.rightUser, "right");
      await UserRegister.updateOne(
        { _id: rootUser },
        { todayJoinedLeft: leftTodayCount, todayJoinedRight: rightTodayCount }
      );

      console.log("Counts updated in the database.");

      console.log(`Today's Left Users Joined: ${leftTodayCount}`);
      console.log(`Today's Right Users Joined: ${rightTodayCount}`);
    }
    const leftTodayCount = await countUserss(userData?.leftUser, "left");
    const rightTodayCount = await countUserss(userData?.rightUser, "right");
    calculateTodayCounts();

    // const resetCount = userData.resetCount || 0;
    // const pairCount = minSide;
    // const difference = pairCount - resetCount;

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

    //   await UserRegister.updateOne(
    //     { _id: userData._id },
    //     { usersNeededForBalanced },
    //     { redWallet: updatedRedWallet }
    //   );
    // }

    // updatedGreenWallet += pointsToAdd;

    // const currentTime = Date.now();
    // const lastResetTimestamp = userData.lastResetTimestamp || 0;
    // const timeDifferenceHours =
    //   (currentTime - lastResetTimestamp) / (1000 * 60 * 60);

    // let updatedResetCount = minSide;
    // let updatedLastResetTimestamp = lastResetTimestamp;

    // if (timeDifferenceHours >= 24) {
    //   updatedResetCount = 0;
    //   updatedLastResetTimestamp = currentTime;
    // }

    // if (updatedResetCount >= 32) {
    //   updatedResetCount = 32;
    // } else {
    //   updatedResetCount += 1;
    // }

    // await UserRegister.updateOne(
    //   { _id: userData._id },
    //   {
    //     pairRatio: ratioString,
    //     pairCount: minSide,
    //     resetCount: minSide,
    //     greenWallet: updatedGreenWallet,
    //     totalRewards: updatedGreenWallet,
    //     totalEarnings: updatedGreenWallet,
    //     leftCount,
    //     rightCount,
    //     redWallet: updatedRedWallet,
    //     usersNeededForBalanced: 0,
    //   }
    // );

    // if (pointsToAdd > 0) {
    //   const companyWallet = await CompanyWallet.findOne();
    //   if (companyWallet) {
    //     // Subtract points from CompanyWallet's total balance
    //     companyWallet.totalBalance -= pointsToAdd;

    //     // Add the deduction transaction to debitedHistory
    //     companyWallet.debitedHistory.push({
    //       userName: userData?.fullName,
    //       mobileNumber: userData?.mobileNumber,
    //       amount: pointsToAdd,
    //       transactionDate: new Date(),
    //     });

    //     // Save the updated company wallet
    //     await companyWallet.save();
    //   }
    // }

  
    const ParentUserId = userData.referredBy

    const parentUser = await UserRegister.findOne({ _id: ParentUserId }).lean();

    const mainData = {
      statusCode: 200,
      name: userData?.fullName,
      referralId: userData.referralCode,
      treeId: userData.treeId,
      redWallet: userData.redWallet,
      greenWallet: userData.greenWallet,
      // ratio: ratioString,
      // pairCount: minSide,
      // resetCount: minSide,
      // difference,
      // pointsToAdd,
      // usersNeededForBalanced,
      leftCount,
      rightCount,
      leftTodayCount,
      rightTodayCount,
      totalTeam,
      totalEarnings: userData.greenWallet,
      role: userData.role,
      level: userData.level,
      parentUserName: parentUser?.fullName,
      parentUserMobile: parentUser?.mobileNumber
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



// Get Company-Wallet
router.get("/company-wallet", async (req, res) => {
  try {
    var pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 if not provided
    var pageNumber = parseInt(req.query.pageNumber) || 0; // Default to 0 if not provided

    var data = await CompanyWallet.aggregate([
      {
        $skip: pageSize * pageNumber,
      },
      {
        $limit: pageSize,
      },
    ]);

    data = data.map((item) => {
      const { allTransactionHistory, ...rest } = item;
      return rest;
    });

    var count = await CompanyWallet.countDocuments();

    // Optionally reverse the data array
    data.reverse();

    res.json({
      statusCode: 200,
      data: data,
      WalletHistoryCount: count,
      message: "Read All Wallet-History",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});



const today = new Date();  // Current date
const lastDateOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // Last date of the current month

console.log(today.toISOString(), 'today');
console.log(lastDateOfMonth, 'lastDateOfMonth');

module.exports = router;
