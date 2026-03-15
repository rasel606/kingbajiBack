


const bcrypt = require('bcryptjs');

const crypto = require("crypto");
const AppError = require('../utils/AppError');
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

const AgentModel = require('../models/AgentModel')
const PaymentGateWayTable = require('../models/PaymentGateWayTable')
const WidthralPaymentGateWayTable = require('../models/WidthralPaymentGateWayTable')
const SubAgentModel = require('../models/SubAgentModel')
const UserModel = require('../models/User')



const { createUser } = require('../services/CreateService');
const catchAsync = require('../utils/catchAsync');
const CreateGateWayService = require('../services/CreateGateWayService');
const UserController = require('../Controllers/UserController');
const GetWayControllers = require('../Controllers/GetWayControllers');
const paymentMethodController = require('../Controllers/paymentMethodController');
const { getUserListServices } = require('../services/getUserListServices');
const { getReferralData } = require('../services/getReferralOwnerService');
const { processTransaction } = require('../services/processTransactionService');
const User = require('../models/User');
const TransactionModel = require('../models/TransactionModel');
const { setMultipleCookies } = require('../services/tokenService');
// const SportsBet = require('../Models/OddSportsTable')
exports.AgentRegister = catchAsync(async (req, res, next) => {
  try {
    console.log("📥 Creating admin with data:", req.body);

    const result = await createUser(req, AgentModel, 'Agent');

    if (result.success) {
      console.log("✅ Admin created successfully", result);
      const getway = await CreateGateWayService(result.data.user);

      // Set cookies using shared utility
      setMultipleCookies(res, {
        adminToken: result.data.token,
        adminDeviceId: result.data.deviceId
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

    const result = await loginUser(req, AgentModel, 'Agent');
    console.log("📥 Login admin with data after:", result)
    // Set cookies using shared utility
    setMultipleCookies(res, {
      adminToken: result.data.token,
      adminDeviceId: result.data.deviceId
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
    const result = await logoutUser(req, AgentModel, 'Agent');

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
    await verifyUserSession(req, AgentModel, 'Agent');
    const result = await getUserProfile(req, AgentModel, 'Agent');

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
    const result = await getActiveSessions(req, AgentModel, 'Agent');

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
    const result = await forceLogoutUser(userId, AgentModel, 'Agent');

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
    const existingAdmin = await AgentModel.findOne({
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
  let dataModel = AgentModel;
  let result = await requestPasswordReset(req.email, dataModel, 'Agent');
  res.status(result.status).json({ status: result.status, data: result.data })
})
exports.ResetPasswordUser = catchAsync(async (req, res, next) => {
  let dataModel = AgentModel;
  let result = await resetUserPassword(req.token, req.newPassword, dataModel, 'Agent');
  res.status(result.status).json({ status: result.status, data: result.data })
})



// exports.Update = async (req, res) => {
//   let dataModel = AgentModel;
//   let result = await CreateService.updateAdminProfile(req, dataModel);
//   res.status(result.status).json({ status: result.status, data: result.data })
// }








exports.GetAllUserList = catchAsync(async (req, res) => {
  try {
    const dataModel = AgentModel;
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

exports.GetAgentList = catchAsync(async (req, res) => {
  try {
    const dataModel = SubAgentModel;
    const parentModel = AgentModel;
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
exports.GetAgentUserById_detaills = catchAsync(async (req, res, next) => {
  try {
    const dataModel = SubAgentModel;
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

exports.GetUserById_detaills = catchAsync(async (req, res, next) => {
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
exports.getListSubAgentUsers = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });

    const result = await UserController.GetDirectDownlineTree(
      AgentModel,       // parent model
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

    const userDetails = await UserController.updateUserProfileById(req, res, dataModel, user);
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
    const ParentUserModel = AgentModel;       // Your User model
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
    const ParentUserModel = AgentModel;       // Your User model
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


exports.getPendingSubAgentDepositTransactions = catchAsync(async (req, res, next) => {
  try {

    const TransactionModel = TransactionModel; // Your deposit/transaction model
    const ParentModel = AgentModel;
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

exports.getPendingSubAgentWidthrowTransactions = catchAsync(async (req, res, next) => {
  try {

    const TransactionModel = TransactionModel; // Your deposit/transaction model
    const ParentModel = AgentModel;
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




exports.getAllTransactions = catchAsync(async (req, res, next) => {
    try {
        const user = req.user;
        const query = {
            status: req.query.status || 0,
            type: req.query.type || 0,
            limit: req.query.limit || 50,
            page: req.query.page || 1,
            userId: req.query.userId || null
        };

        const result = await paymentMethodController.GetParentAndDownlineTransactions(
            AgentModel,      // ParentModel
            SubAgentModel,   // ChildModel
            UserModel,       // SubChildModel
            TransactionModel, // TransactionModel
            user,
            query
        );

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            message: "Pending deposit transactions fetched successfully",
            transactions: result.transactions,
            total: result.total,
            page: result.page,
            limit: result.limit
        });

    } catch (err) {
        next(err);
    }
});

