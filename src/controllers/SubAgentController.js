const { default: axios } = require('axios')
const {
  loginUser,
  getUserProfile,
  verifyUserSession,
  logoutUser,
  forceLogoutUser,
  getActiveSessions,
  requestPasswordReset,
  resetUserPassword } = require('../services/LoginService');
const PaymentGateWayTable = require('../models/PaymentGateWayTable')
const WidthralPaymentGateWayTable = require('../models/WidthralPaymentGateWayTable')
const GetWayControllers = require('../Controllers/GetWayControllers');
const SubAgentModel = require('../models/SubAgentModel')
const AgentModel = require('../models/AgentModel')
const TransactionModel = require('../models/TransactionModel');
const UserController = require('../Controllers/UserController');


const { createUser } = require('../services/CreateService');
const catchAsync = require('../utils/catchAsync');
const CreateGateWayService = require('../services/CreateGateWayService');
const User = require("../models/User");

const AppError = require('../utils/AppError');

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

exports.SubAgentRegister = catchAsync(async (req, res, next) => {
 try {
    console.log("📥 Creating admin with data:", req.body);

    const result = await createUser(req, SubAgentModel, 'Admin');

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
exports.Login = catchAsync(async (req, res, next) => {
  try {
    console.log("📥 Login admin with data:", req.body);

    const result = await loginUser(req, SubAgentModel, 'Agent');
    console.log("📥 Login admin with data after:", result)
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


// Admin logout
exports.Logout = catchAsync(async (req, res, next) => {
  try {
    const result = await logoutUser(req, SubAgentModel, 'Agent');

    // Clear cookies
    res.clearCookie('adminToken');
    res.clearCookie('adminDeviceId');

    res.json({
      message: result.message,
      success: result.success
    });
  } catch (err) {
    next(err);
  }
});

exports.GetProfile = catchAsync(async (req, res, next) => {
  try {
    await verifyUserSession(req, SubAgentModel, 'Agent');
    const result = await getUserProfile(req, SubAgentModel, 'Agent');

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
    const result = await getActiveSessions(req, SubAgentModel, 'Agent');

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
    const result = await forceLogoutUser(userId, SubAgentModel, 'Agent');

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
    const existingAdmin = await SubAgentModel.findOne({
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
  let dataModel = SubAgentModel;
  let result = await requestPasswordReset(req, dataModel);
  res.status(result.status).json({ status: result.status, data: result.data })
})
exports.ResetPasswordUser = catchAsync(async (req, res, next) => {
  let dataModel = SubAgentModel;
  let result = await resetUserPassword(req, dataModel);
  res.status(result.status).json({ status: result.status, data: result.data })
})


exports.GetAllUserList = catchAsync(async (req, res) => {
  try {
    const dataModel = SubAgentModel;
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
exports.GetAllUserList = catchAsync(async (req, res) => {
  try {
    const dataModel = SubAgentModel;
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

exports.GetUserById_detaills = catchAsync(async (req, res) => {
  try {
    const dataModel = User;
    const user = req.user; // Assuming user is available in request


    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userDetails = await UserController.getUserById_detaills(req, res, dataModel, user);
    // Note: GetUserList already sends the response, so we don't need to send again
    // res.status(result.status).json({ status: result.status, data: result.data })
    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: userDetails.data,
    });
  } catch (err) {
    next(err);
  }
});

exports.updateUserProfileById = catchAsync(async (req, res, next) => {
  try {
    const dataModel = User;
    const user = req.user; // Assuming user is available in request
    console.log("updateUserProfileById user:", req.body);
    console.log("updateUserProfileById user:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userDetails = await UserController.updateUserProfileById(req, dataModel, user);
    // Note: GetUserList already sends the response, so we don't need to send again
    // res.status(result.status).json({ status: result.status, data: result.data })
    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: userDetails.data,
    });
  } catch (err) {
    next(err);
  }
});
exports.verifyUserEmail = catchAsync((req, res, next) => {
  try {
    const dataModel = User;
    const user = req.user; // Assuming user is available in request
    console.log("updateUserProfileById user:", req.params.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userDetails = UserController.verifyEmail(req, dataModel, next);
    console.log("updateUserProfileById user:", userDetails);
    // Note: GetUserList already sends the response, so we don't need to send again
    // res.status(result.status).json({ status: result.status, data: result.data })
    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      // data: userDetails.data,
    });
  } catch (err) {
    next(err);
  }
});
exports.verifyUserPhone = catchAsync(async (req, res, next) => {
  try {
    const dataModel = User;
    const user = req.user; // Assuming user is available in request
    console.log("updateUserProfileById user:", req.params.userId);
    console.log("updateUserProfileById user:", req.params.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userDetails = await UserController.verifyPhone(req, dataModel, res);
    console.log("updateUserProfileById user:", userDetails);
    // Note: GetUserList already sends the response, so we don't need to send again
    // res.status(result.status).json({ status: result.status, data: result.data })
    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      // data: userDetails.data,
    });
  } catch (err) {
    next(err);
  }
});

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

exports.getPendingAgentDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const dataModel = TransactionModel; // Your deposit/transaction model
    const ParentUserModel = SubAgentModel;       // Your User model
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
exports.getPendingAgentWidthralTransactions = catchAsync(async (req, res, next) => {
  try {

    const dataModel = TransactionModel; // Your deposit/transaction model
    const ParentUserModel = SubAgentModel;       // Your User model
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
