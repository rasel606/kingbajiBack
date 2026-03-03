

const bcrypt = require('bcryptjs');

const crypto = require("crypto");

const SubAdminModel = require('../models/SubAdminModel')
const CreateService = require('../services/CreateService')

const updateOne = require('../services/ProfileUpdateService')
const BetProviderTable = require('../models/BetProviderTable')
const RebateSetting = require("../models/RebateSetting");
const GameTypeTable = require('../models/GameTypeTable')
const GameListTable = require('../models/GameListTable')
const OddSportsTable = require('../models/OddSportsTable')
const Bonus = require('../models/Bonus');
const BettingTable = require('../models/BettingTable')
const bankTable = require('../models/BankTable')
const SportsCategoryTable = require('../models/SportsCategoryTable')
const GameTypeList = require('../models/GameTypeTable')
const { default: axios } = require('axios')
// const { LoginService, loginUser,Profile } = require('../Services/LoginService')
const AffiliateModel = require('../models/AffiliateModel')
const AgentModel = require('../models/AgentModel')
const UserModel = require('../models/User')
const AffiliateCommissionModal = require('../models/AffiliateCommissionModal')
const AffiliateUserEarnings = require('../models/AffiliateUserEarnings');
const { ref } = require('joi');
const VIPConfig = require('../models/VIPConfig');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const TransactionModel = require('../models/TransactionModel');
const notificationController = require('../Controllers/notificationController');


const BettingHistory = require('../models/BettingHistory');

const { loginUser, getUserProfile, verifyUserSession, logoutUser, forceLogoutUser, getActiveSessions, requestPasswordReset, resetUserPassword, AdminProfile } = require('../services/LoginService');
const { getUserListServices } = require('../services/getUserListServices');
const { getReferralData } = require('../services/getReferralOwnerService');
const { processTransaction } = require('../services/processTransactionService');



const CreateGateWayService = require('../services/CreateGateWayService');
const UserController = require('../Controllers/UserController');
const GetWayControllers = require('../Controllers/GetWayControllers');
const paymentMethodController = require('../Controllers/paymentMethodController');
const SubAgentModel = require('../models/SubAgentModel');
// const SportsBet = require('../Models/OddSportsTable')
const { createUser } = require('../services/CreateService');
exports.CreateAdmin = catchAsync(async (req, res, next) => {
 try {
    console.log("📥 Creating admin with data:", req.body);

    const result = await createUser(req, SubAdminModel, 'SubAdmin');

    if (result.success) {
      console.log("✅ Admin created successfully", result);
      const getway = await CreateGateWayService(result.data.user);

      // Set cookies
      res.cookie('adminToken', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.cookie('adminDeviceId', result.data.deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.status(201).json({
        data: result.data,
        message: result.message,
        success: getway.message,
        success: true,
      });
    }
  } catch (err) {
    next(err);
  }
});


exports.AdminLogin = catchAsync(async (req, res, next) => {
  try {
    console.log("📥 Login admin with data:", req.body);

    const result = await loginUser(req, SubAdminModel, 'SubAdmin');
    console.log("📥 Login admin with data after:", result)
    // Set cookies
    res.cookie('subadminToken', result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('subAdminDeviceId', result.data.deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log("✅ Admin login successful for device:", result.data.deviceId);
    res.json({
      data: result.data,
      message: result.message,
      success: result.success
    });
  } catch (err) {
    next(err);
  }
});

// Get active sessions (Admin only)
exports.GetActiveSessions = catchAsync(async (req, res, next) => {
  try {
    const result = await getActiveSessions(req, SubAdminModel, 'SubAdmin');

    res.json({
      data: result.data,
      count: result.count,
      message: result.message,
      success: result.success
    });
  } catch (err) {
    next(err);
  }
});


// Force logout users
exports.ForceLogout = catchAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await forceLogoutUser(userId, SubAdminModel, 'SubAdmin');

    res.json({
      message: result.message,
      previousDevice: result.previousDevice,
      success: result.success
    });
  } catch (err) {
    next(err);
  }
});


// Check if user exists
exports.CheckExists = catchAsync(async (req, res, next) => {
  try {
    const existingAdmin = await SubAdminModel.findOne({
      $or: [
        { email: req.body.email },
        { mobile: req.body.mobile },
        { userId: req.body.userId }
      ]
    });

    if (existingAdmin) {
      return res.status(200).json({
        exists: true,
        message: "Admin already exists with this email, mobile, or userId",
        data: {
          email: existingAdmin.email,
          mobile: existingAdmin.mobile,
          userId: existingAdmin.userId
        }
      });
    }

    res.status(200).json({
      exists: false,
      message: "No admin found with these credentials"
    });
  } catch (error) {
    next(error);
  }
});

exports.RequestPasswordResetUser = catchAsync(async (req, res, next) => {
  let dataModel = SubAdminModel;
  let result = await requestPasswordReset(req, dataModel);
  res.status(result.status).json({ status: result.status, data: result.data })
})
exports.ResetPasswordUser = catchAsync(async (req, res, next) => {
  let dataModel = SubAdminModel;
  let result = await resetUserPassword(req, dataModel);
  res.status(result.status).json({ status: result.status, data: result.data })
})


exports.GetAdminProfile = catchAsync(async (req, res, next) => {
  try {
    await verifyUserSession(req, SubAdminModel, 'SubAdmin');
    const result = await getUserProfile(req, SubAdminModel, 'SubAdmin');

    res.json({
      data: result.data,
      message: result.message,
      success: result.success
    });
  } catch (err) {
    next(err);
  }
});
exports.AdminUpdate = async (req, res) => {
  let dataModel = SubAdminModel;
  let result = await CreateService.updateAdminProfile(req, dataModel);
  res.status(result.status).json({ status: result.status, data: result.data })
}









exports.GetUserList =  catchAsync(async (req, res) => {
  try {
    const dataModel = SubAdminModel;
    const user = req.user; // Assuming user is available in request

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await UserController.GetUserList(req, res, dataModel, user);
    // Note: GetUserList already sends the response, so we don't need to send again

  } catch (err) {
    console.error("GetAllUserList Error:", err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


















// Update admin dashboard






exports.getAdminDashboardStats = async (req, res) => {
  try {
    // --- Date Calculations ---
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // --- Parallel Queries ---
    const [
      totalUsers,
      onlineUsers,
      totalDeposit,
      totalWithdraw,
      totalBalance,
      todayDeposit,
      todayWithdraw,
      thisMonthDeposits,
      lastMonthDeposits,
      thisMonthWithdraws,
      lastMonthWithdraws,
      thisMonthNewUsers,
      lastMonthNewUsers,
      thisMonthBetting,
      lastMonthBetting,
    ] = await Promise.all([
      // Total users
      User.countDocuments({}),

      // Online users (active within last 15 mins)
      User.countDocuments({
        onlinestatus: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
      }),

      // Total deposits
      TransactionModel.aggregate([
        { $match: { type: 0, status: 1 } },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // Total withdrawals
      TransactionModel.aggregate([
        { $match: { type: 1, status: 1 } },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // Total balance
      User.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),

      // Today's deposit
      TransactionModel.aggregate([
        {
          $match: {
            type: 0,
            status: 1,
            updatetime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // Today's withdrawal
      TransactionModel.aggregate([
        {
          $match: {
            type: 1,
            status: 1,
            updatetime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // This month's deposits
      TransactionModel.aggregate([
        { $match: { type: 0, status: 1, updatetime: { $gte: firstDayThisMonth } } },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // Last month's deposits
      TransactionModel.aggregate([
        {
          $match: {
            type: 0,
            status: 1,
            updatetime: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // This month's withdrawals
      TransactionModel.aggregate([
        { $match: { type: 1, status: 1, updatetime: { $gte: firstDayThisMonth } } },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // Last month's withdrawals
      TransactionModel.aggregate([
        {
          $match: {
            type: 1,
            status: 1,
            updatetime: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // This month's new users
      User.countDocuments({ timestamp: { $gte: firstDayThisMonth } }),

      // Last month's new users
      User.countDocuments({
        timestamp: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
      }),

      // This month's betting volume
      BettingHistory.aggregate([
        {
          $match: {
            timestamp: { $gte: firstDayThisMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$base_amount" } } },
      ]),

      // Last month's betting volume
      BettingHistory.aggregate([
        {
          $match: {
            timestamp: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$turnover" } } },
      ]),
    ]);

    // --- Growth Percentages ---
    const calcGrowth = (thisMonth, lastMonth) => {
      if (lastMonth === 0 && thisMonth > 0) return 100; // treat as "100% growth"
      if (lastMonth === 0 && thisMonth === 0) return 0; // no growth
      return ((thisMonth - lastMonth) / lastMonth) * 100;
    };

    const depositGrowth = calcGrowth(thisMonthDeposits[0]?.total || 0, lastMonthDeposits[0]?.total || 0);
    const withdrawGrowth = calcGrowth(thisMonthWithdraws[0]?.total || 0, lastMonthWithdraws[0]?.total || 0);
    const userGrowth = calcGrowth(thisMonthNewUsers, lastMonthNewUsers);
    const bettingGrowth = calcGrowth(thisMonthBetting[0]?.total || 0, lastMonthBetting[0]?.total || 0);

    // --- Response ---
    res.json({
      totalUsers,
      onlineUsers,
      totalDeposit: totalDeposit[0]?.total || 0,
      totalWithdraw: totalWithdraw[0]?.total || 0,
      totalBalance: totalBalance[0]?.total || 0,
      todayDeposit: todayDeposit[0]?.total || 0,
      todayWithdraw: todayWithdraw[0]?.total || 0,

      // Monthly stats
      thisMonthDeposits: thisMonthDeposits[0]?.total || 0,
      lastMonthDeposits: lastMonthDeposits[0]?.total || 0,
      thisMonthWithdraws: thisMonthWithdraws[0]?.total || 0,
      lastMonthWithdraws: lastMonthWithdraws[0]?.total || 0,
      thisMonthNewUsers,
      lastMonthNewUsers,
      thisMonthBetting: thisMonthBetting[0]?.total || 0,
      lastMonthBetting: lastMonthBetting[0]?.total || 0,

      // Growth %
      growth: {
        depositGrowth: depositGrowth.toFixed(2),
        withdrawGrowth: withdrawGrowth.toFixed(2),
        userGrowth: userGrowth.toFixed(2),
        bettingGrowth: bettingGrowth.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};





exports.processTransactionForALL = async (req, res) => {
  try {
    const { userId, action, transactionID } = req.body;
    const referraledUsers = req.user;
    console.log("userId", userId, "action", action, "transactionID", transactionID);
    const result = await processTransaction({
      userId,
      action,
      transactionID,
      referralUser: referraledUsers,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


























/////////////////////////////GetAgentList///////////////////////////////




exports.GetAgentList = catchAsync(async (req, res) => {
  try {
    const dataModel = AgentModel;
    const parentModel = SubAdminModel;
    const user = req.user; // Assuming user is available in request
    const queryParams = req.params
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await UserController.GetFromUserList(parentModel, dataModel, user, queryParams, res);
    // Note: GetUserList already sends the response, so we don't need to send again

  } catch (err) {
    console.error("GetAllUserList Error:", err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


exports.getListAgentUsers = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

    const result = await UserController.GetDirectDownlineTree(
      SubAdminModel,       // parent model
      AgentModel,    // child model
      UserModel,        // sub-child model
      req.user          // logged-in user
    );
    console.log("Full Downline Result:", result.resultChildren);
    // 4️⃣ Response
    return res.json({
      success: true,
      data: result.resultChildren,

    });




  } catch (err) {
    next(err);
  }
});
exports.getPendingAgentDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const TransactionModel = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AgentModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 0,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      TransactionModel,
      user,
      query
    );

    console.log("Pending Deposit Result:", userDetails);

    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
exports.getPendingAgentWidthralTransactions = catchAsync(async (req, res, next) => {
  try {

    const TransactionModel = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AgentModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 1,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      TransactionModel,
      user,
      query
    );
    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
/////////////////////////////GetSubAgentList///////////////////////////////







exports.getSubListAgent = catchAsync(async (req, res) => {
  try {
    const dataModel = SubAgentModel;
    const parentModel = SubAdminModel;
    const user = req.user; // Assuming user is available in request
    const queryParams = req.params
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await UserController.GetFromUserList(parentModel, dataModel, user, queryParams, res);
    // Note: GetUserList already sends the response, so we don't need to send again

  } catch (err) {
    console.error("GetAllUserList Error:", err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
exports.getListSubAgentUsers = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

    const result = await UserController.GetDirectDownlineTree(
      SubAdminModel,       // parent model
      SubAgentModel,    // child model
      UserModel,        // sub-child model
      req.user          // logged-in user
    );
    console.log("Full Downline Result:", result.resultChildren);
    // 4️⃣ Response
    return res.json({
      success: true,
      data: result.resultChildren,

    });




  } catch (err) {
    next(err);
  }
});
exports.getPendingSubAgentDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const Transaction = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = SubAgentModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 0,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      Transaction,
      user,
      query
    );

    console.log("Pending Deposit Result:", userDetails);

    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
exports.getPendingSubAgentWidthralTransactions = catchAsync(async (req, res, next) => {
  try {

    const Transaction = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AgentModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 1,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      Transaction,
      user,
      query
    );
    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});


////////////////////////////// Affiliate Users//////////////////////////////
exports.getListAffiliateUsers = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

    const result = await UserController.GetDirectDownlineTree(
      SubAdminModel,       // parent model
      AffiliateModel,    // child model
      UserModel,        // sub-child model
      req.user          // logged-in user
    );
    console.log("Full Downline Result:", result.resultChildren);
    // 4️⃣ Response
    return res.json({
      success: true,
      data: result.resultChildren,

    });




  } catch (err) {
    next(err);
  }
});

exports.GetAffiliateList = catchAsync(async (req, res) => {
  try {
    const dataModel = AffiliateModel;
    const parentModel = SubAdminModel;
    const user = req.user; // Assuming user is available in request
    const queryParams = req.params
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await UserController.GetFromUserList(parentModel, dataModel, user, queryParams, res);
    // Note: GetUserList already sends the response, so we don't need to send again

  } catch (err) {
    console.error("GetAllUserList Error:", err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
exports.getPendingAffiliateDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const TransactionModel = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AffiliateModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 0,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      TransactionModel,
      user,
      query
    );

    console.log("Pending Deposit Result:", userDetails);

    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
exports.getPendingAffiliateWidthralTransactions = catchAsync(async (req, res, next) => {
  try {

    const TransactionModel = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AffiliateModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 1,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      TransactionModel,
      user,
      query
    );
    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
////////////////////////// Own GetWayList //////////////////////////////////////
exports.getListAgentSubAgentList = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

    const result = await UserController.GetDirectDownlineTree(
      SubAdminModel,       // parent model
      AgentModel,    // child model
      SubAgentModel,        // sub-child model
      req.user          // logged-in user
    );
    console.log("Full Downline Result:", result.resultChildren);
    // 4️⃣ Response
    return res.json({
      success: true,
      data: result.resultChildren,

    });




  } catch (err) {
    next(err);
  }
});


///////////////////////////////Own GetWayList////////////////////////////////////////

exports.DepositGetWayList = catchAsync(async (req, res, next) => {
  try {

    const dataModel = PaymentGateWayTable; // Your deposit/transaction model

    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await GetWayControllers.GetWayList(req, dataModel);
    // Note: GetUserList already sends the response, so we don't need to send again
    console.log("DepositGetWayList result:", result);
    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: result.deposits,
    });
  } catch (err) {
    console.error("GetAllUserList Error:", err);
    next(err);
  }
})
exports.WidthralGetWayList = catchAsync(async (req, res, next) => {
  try {

    const dataModel = WidthralPaymentGateWayTable; // Your deposit/transaction model

    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const result = await GetWayControllers.GetWayList(req, dataModel);
    // Note: GetUserList already sends the response, so we don't need to send again
    console.log("DepositGetWayList result:", result);
    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: result.deposits,
    });
  } catch (err) {
    console.error("GetAllUserList Error:", err);
    next(err);
  }
})
//////////////////////////////////Own DepositTransactions//////////////////////////////////////

exports.getPendingDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const dataModel = TransactionModel; // Your deposit/transaction model
    const ParentUserModel = SubAdminModel;       // Your User model
    const user = req.user;              // Logged in user
console.log("getPendingDepositTransactions",user)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Call the service function (the long function you created earlier)
    const userDetails = await GetWayControllers.getPendingDepositTransactions(
      req,
      res,
      user,
      dataModel,
      ParentUserModel,
      parseInt(0),
    );

    console.log("Pending Deposit Result:", userDetails);

    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
exports.getPendingWidthralTransactions = catchAsync(async (req, res, next) => {
  try {

    const dataModel = TransactionModel; // Your deposit/transaction model
    const ParentUserModel = SubAdminModel;       // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Call the service function (the long function you created earlier)
    const userDetails = await GetWayControllers.getPendingDepositTransactions(
      req,
      res,
      user,
      dataModel,
      ParentUserModel,
      parseInt(1),
    );

    console.log("Pending Deposit Result:", userDetails);

    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
////////////////////////////////////AgentDepositTransactions///////////////////////////////////

exports.getPendingAgentDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const Transaction = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AgentModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 0,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      Transaction,
      user,
      query
    );

    console.log("Pending Deposit Result:", userDetails);

    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});


exports.getPendingAgentWidthralTransactions = catchAsync(async (req, res, next) => {
  try {

    const Transaction = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AgentModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 1,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      Transaction,
      user,
      query
    );
    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
//////////////////////////////////////AffiliateDepositTransactions//////////////////////////////////
exports.getPendingAffiliateDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const Transaction = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AffiliateModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 0,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      Transaction,
      user,
      query
    );

    console.log("Pending Deposit Result:", userDetails);

    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
exports.getPendingAffiliateWidthralTransactions = catchAsync(async (req, res, next) => {
  try {

    const Transaction = TransactionModel; // Your deposit/transaction model
    const ParentModel = SubAdminModel;
    const ChildModel = AgentModel;
    const SubChildModel = UserModel;      // Your User model
    const user = req.user;              // Logged in user

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    const query = {
      status: req.query.status || 0,
      type: req.query.type || 1,
      limit: req.query.limit || 50,
      page: req.query.page || 1,
      userId: req.query.userId || null
    };
    // Call the service function (the long function you created earlier)
    const userDetails = await paymentMethodController.GetDirectDownlineTransactions(
      ParentModel,
      ChildModel,
      SubChildModel,
      Transaction,
      user,
      query
    );
    if (!userDetails.success) {
      return res.status(400).json({
        success: false,
        message: userDetails.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending deposit transactions fetched successfully",
      transactions: userDetails.transactions,
      total: userDetails.total
    });

  } catch (err) {
    next(err);
  }
});
////////////////////////////////////////////////////////////////////////