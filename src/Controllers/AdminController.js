const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const AdminModel = require('../Models/AdminModel')
const SubAdminModel = require('../Models/SubAdminModel')

const SubAgentModel = require('../Models/SubAgentModel')

const CreateService = require('../Services/CreateService')
const PaymentGateWayTable = require("../Models/PaymentGateWayTable");
const WidthralPaymentGateWayTable = require("../Models/WidthralPaymentGateWayTable");

const updateOne = require('../Services/ProfileUpdateService')
const BetProviderTable = require('../Models/BetProviderTable')
const RebateSetting = require("../Models/RebateSetting");
const GameTypeTable = require('../Models/GameTypeTable')
const GameListTable = require('../Models/GameListTable')
const OddSportsTable = require('../Models/OddSportsTable')
const Bonus = require('../Models/Bonus');
const BettingTable = require('../Models/BettingTable')
const bankTable = require('../Models/BankTable')
const SportsCategoryTable = require('../Models/SportsCategoryTable')
const GameTypeList = require('../Models/GameTypeTable')
const { default: axios } = require('axios')
// const { LoginService, loginUser,Profile } = require('../Services/LoginService')
const AffiliateModel = require('../Models/AffiliateModel')
const AgentModel = require('../Models/AgentModel')
const UserModel = require('../Models/User')
const AffiliateCommissionModal = require('../Models/AffiliateCommissionModal')
const AffiliateUserEarnings = require('../Models/AffiliateUserEarnings');
const { ref } = require('joi');
const VIPConfig = require('../Models/VIPConfig');
const VipPointTransaction = require('../Models/VipPointTransaction');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

const TransactionModel = require('../Models/TransactionModel');
const notificationController = require('../Controllers/notificationController');
const SubAdmin = require('../Models/SubAdminModel');
const Category = require('../Models/Category');
const SocialLink = require('../Models/SocialLink');
const BettingHistory = require('../Models/BettingHistory');
const {
  loginUser,
  getUserProfile,
  verifyUserSession,
  logoutUser,
  forceLogoutUser,
  getActiveSessions,
  requestPasswordReset,
  resetUserPassword } = require('../Services/LoginService');

const { AdminProfile } = require('../Services/LoginService');
const { getUserListServices } = require('../Services/getUserListServices');
const { getReferralData } = require('../Services/getReferralOwnerService');
const { processTransaction } = require('../Services/processTransactionService');
const CreateGateWayService = require('../Services/CreateGateWayService');

const { createUser } = require('../Services/CreateService');

























exports.CreateAdmin = catchAsync(async (req, res, next) => {
  try {
    console.log("📥 Creating admin with data:", req.body);

    const result = await createUser(req, AdminModel, 'Admin');

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

// Check if admin exists endpoint
// exports.CheckAdminExists = catchAsync(async (req, res, next) => {
//   try {
//     const existingAdmin = await AdminModel.findOne({
//       $or: [
//         { email: req.body.email },
//         { mobile: req.body.mobile },
//         { userId: req.body.userId }
//       ]
//     });

//     if (existingAdmin) {
//       return res.status(200).json({
//         exists: true,
//         message: "Admin already exists with this email, mobile, or userId",
//         data: {
//           email: existingAdmin.email,
//           mobile: existingAdmin.mobile,
//           userId: existingAdmin.userId
//         }
//       });
//     }

//     res.status(200).json({
//       exists: false,
//       message: "No admin found with these credentials"
//     });
//   } catch (error) {
//     next(error);
//   }
// });


// Admin login
exports.AdminLogin = catchAsync(async (req, res, next) => {
  try {
    console.log("📥 Login admin with data:", req.body);

    const result = await loginUser(req, AdminModel, 'Admin');
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
exports.AdminLogout = catchAsync(async (req, res, next) => {
  try {
    const result = await logoutUser(req, AdminModel, 'Admin');

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

exports.GetAdminProfile = catchAsync(async (req, res, next) => {
  try {
    await verifyUserSession(req, AdminModel, 'Admin');
    const result = await getUserProfile(req, AdminModel, 'Admin');

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
exports.GetActiveAdminSessions = catchAsync(async (req, res, next) => {
  try {
    const result = await getActiveSessions(AdminModel, 'Admin');

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
exports.ForceLogoutAdmin = catchAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await forceLogoutUser(userId, AdminModel, 'Admin');

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
exports.CheckAdminExists = catchAsync(async (req, res, next) => {
  try {
    const existingAdmin = await AdminModel.findOne({
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





exports.AdminUpdate = async (req, res) => {
  let dataModel = AdminModel;
  let result = await CreateService.updateAdminProfile(req, dataModel);
  res.status(result.status).json({ status: result.status, data: result.data })
}




exports.GetSubAdminList = async (req, res) => {


  try {

    let dataModel = SubAdmin;
    let result = await getUserListServices(req, dataModel);
    res.json({ data: result.data, message: result.message, success: result.success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.GetSubAdminAffiliateList = async (req, res) => {
  try {

    let dataModel = AffiliateModel;
    let result = await getUserListServices(req, dataModel);
    res.json({ data: result.data, message: result.message, success: result.success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.GetAgentList = async (req, res) => {
  try {

    let dataModel = AgentModel;
    let result = await getUserListServices(req, dataModel);
    res.json({ data: result.data, message: result.message, success: result.success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.GetUserList = async (req, res) => {
  try {

    let dataModel = UserModel;
    let result = await getUserListServices(req, dataModel);
    res.json({ data: result.data, message: result.message, success: result.success });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


















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
      UserModel.countDocuments({}),

      // Online users (active within last 15 mins)
      UserModel.countDocuments({
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
      UserModel.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),

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
      UserModel.countDocuments({ timestamp: { $gte: firstDayThisMonth } }),

      // Last month's new users
      UserModel.countDocuments({
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















// Update provider status










exports.UpdateStatusGame = async (req, res) => {
  const { id, status } = req.body;

  try {
    const result = await GameListTable.findByIdAndUpdate(id, {
      is_active: status !== 'true',
    });

    if (result) {
      return res.json({ message: 'Update successful' });
    }
    res.status(404).json({ error: 'Game not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}







exports.UpdateBetProvider = async (req, res) => {
  const { id, ...data } = req.body;

  try {
    if (req.file) {
      // Upload image to ImgBB
      const formData = new FormData();
      formData.append('image', req.file.buffer, req.file.originalname);

      const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          key: 'YOUR_IMGBB_API_KEY', // Replace with your ImgBB API key
        },
      });

      // Get the URL of the uploaded image
      data.image_url = response.data.data.url;
    }

    if (id) {
      const existingProvider = await BetProvider.findById(id);
      if (existingProvider && existingProvider.image_url) {
        // Here we no longer need to delete old image from local storage
        // ImgBB handles the image storage online
        const updatedProvider = await BetProvider.findByIdAndUpdate(id, data, { new: true });
        return res.json(updatedProvider);
      }
      const updatedProvider = await BetProvider.findByIdAndUpdate(id, data, { new: true });
      return res.json(updatedProvider);
    } else {
      const newProvider = new BetProvider(data);
      await newProvider.save();
      res.status(201).json(newProvider);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete BetProvider by ID




// ImageBB API Key
const imageBBApiKey = '800eab0b73b143dad5c3e09753360fe5';

// Function to upload image to ImageBB
async function uploadImageToImageBB(imagePath) {
  const formData = new FormData();
  formData.append('image', imagePath);


  try {
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      params: {
        key: imageBBApiKey
      }
    });
    return response.data.data.url; // Returning the image URL
  } catch (error) {
    console.error('Error uploading image to ImageBB:', error);
    throw error;
  }
}

// Endpoint to get sports categories and betting data
exports.GetSportsCategories = async (req, res) => {
  try {
    const result = await BettingTable.aggregate([
      {
        $match: { is_active: true },
      },
      {
        $lookup: {
          from: 'sportscategorytables', // collection name in lowercase
          localField: 'category_id',
          foreignField: '_id',
          as: 'category_details',
        },
      },
      {
        $unwind: '$category_details',
      },
      {
        $project: {
          category_name: '$category_details.name',
          c_id: '$category_details._id',
          betting_data: '$$ROOT',
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
}
// Endpoint to create a new sports category (with image upload)
exports.Category_Add = async (req, res) => {
  const { name, staff_id, id_active, image } = req.body;

  try {
    // const imageUrl = await uploadImageToImageBB(image); // Upload image to ImageBB

    const newCategory = new SportsCategoryTable({
      name,
      // staff_id,
      // id_active,
      // image: imageUrl,
    });

    await newCategory.save();
    res.status(201).json({ message: 'Sports category created successfully', category: newCategory });
  } catch (error) {
    console.error('Error creating sports category:', error);
    res.status(500).json({ error: 'An error occurred while creating the sports category.' });
  }
}






// Get casino data function
exports.GetCasinoData = async (req, res) => {
  try {
    const result = await CasinoItemTable.aggregate([
      {
        $lookup: {
          from: 'casino_category_tables',
          localField: 'categoryId',
          foreignField: 'c_id',
          as: 'category_details'
        }
      },
      {
        $unwind: '$category_details'
      },
      {
        $project: {
          'category_details': 1,
          'deposit_user_id': 1,
          'sub2': 1,
          'sub_category_item': 1,
          'image': 1,
          'casinoItem_url': 1,
        }
      }
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
}






// Get list of active sports
// router.get('/sports',
exports.GetActiveSports = async (req, res) => {
  try {
    const sports = await GameTypeList.find({ is_active: true });
    res.json(sports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get casino items

//router.get('/casino',
exports.GetCasino = async (req, res) => {
  try {
    const casinos = await BetProviderTable.find();
    res.json(casinos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}





exports.UpdateSportsBettingCategory = async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  try {
    const bet = await BettingTable.findById(id);
    if (!bet) return res.status(404).json({ return: false, message: 'Bet not found' });

    bet.category_id = category;
    await bet.save();

    res.json({ return: true, message: 'Bet updated' });
  } catch (error) {
    res.status(500).json({ return: false, message: error.message });
  }
}

exports.GateAllGames = async (req, res) => {
  try {
    const games = await GameListTable.find({ is_active: true, is_hot: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







exports.getAdminList = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = "{}", sort = "{}" } = req.query;
    const filterObj = JSON.parse(filter);
    const sortObj = JSON.parse(sort);

    const result = await getReferralData("admin", filterObj, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortObj,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 SubAdmin List
exports.getSubAdminList = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = "{}", sort = "{}" } = req.query;
    const filterObj = JSON.parse(filter);
    const sortObj = JSON.parse(sort);

    const result = await getReferralData("subAdmin", filterObj, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortObj,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Affiliate List
exports.getAffiliateList = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = "{}", sort = "{}" } = req.query;
    const filterObj = JSON.parse(filter);
    const sortObj = JSON.parse(sort);

    const result = await getReferralData("affiliate", filterObj, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortObj,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 User List
exports.getUserList = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = "{}", sort = "{}" } = req.query;
    const filterObj = JSON.parse(filter);
    const sortObj = JSON.parse(sort);

    const result = await getReferralData("user", filterObj, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortObj,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// exports.processTransactionForALL = async (req, res) => {
//   try {
//     const { userId, action, transactionID } = req.body;
//     const referraledUsers = req.user;

//     const result = await processTransaction({
//       userId,
//       action,
//       transactionID,
//       referralUser: referraledUsers,
//     });

//     return res.status(200).json({ message: "Transaction processed", ...result });
//   } catch (error) {
//     console.error("Transaction Error:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

exports.processTransactionForALL = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, action, transactionID } = req.body;
    const referraledUsers = req.user;
    console.log("userId", userId, "action", action, "transactionID", transactionID);
    const result = await processTransaction({
      userId,
      action,
      transactionID,
      referralUser: referraledUsers,
    });
    console.log(result)
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};




exports.getTransactionList = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;
    const user = req.user;
    const role = user.role.toLowerCase();
    let filter = {};
    // role-wise filtering
    switch (role) {
      case "admin":
        break; // admin sees all
      case "subAdmin":
        filter = { subAdminId: req.user?.referralCode };
        break;
      case "affiliate":
        filter = { affiliateId: req.user?.referralCode };
        break;
      case "user":
        filter = { userId: req.user?.referralCode };
        break;
      default:
        throw new Error("Invalid role");
    }

    const total = await TransactionModel.countDocuments(filter);
    const transactions = await TransactionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json({ success: true, data: transactions, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// exports.approveDepositAdmin = async (req, res) => {
//   try {
//       const { userId, referralCode, status, transactionID } = req.body;

//       // Find the user
//       const user = await User.findOne({ userId });
//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }
//       const SubAdminuser = await SubAdmin.findOne({ referralCode: referralCode });
//       if (!user) return res.status(404).json({ message: 'User not found' });
//       console.log(user);
//       // Find the transaction
//       const transaction = await TransactionModel.findOne({ userId, type, referredbyCode: SubAdminuser.referralCode, transactionID });
//       if (!transaction) return res.status(404).json({ message: "Transaction not found" });
//       console.log(transaction);

//       // Find the transaction
//       // const transaction = await Transaction.findOne({ userId, transactionID });
//       // if (!transaction) {
//       //     return res.status(404).json({ message: "Transaction not found" });
//       // }

//       // Check if the transaction status is "Hold" (0)
//       if (transaction.status !== 0) {
//           return res.status(400).json({ message: "Transaction already processed" });
//       }

//       // If the transaction is being approved, update the user's balance and bonus
//       if (transaction.status === 0) {
//           const bonusAmount = (transaction.amount * 0.30) / 100;
//           user.balance += transaction.amount + bonusAmount;
//           user.bonus += bonusAmount;
//           await user.save();
//       }

//       // Update the transaction status to "Accepted" (1)
//       transaction.status = 1;
//       await transaction.save();

//       res.status(200).json({ message: "Deposit approved", user });
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// };


exports.AffiliateModeladmin = async (req, res) => {
  try {
    const affiliates = await AffiliateModel.find({});
    res.json(affiliates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.affiliate_get_commissionSettings = async (req, res) => {
  try {
    const affiliates = await AffiliateModel.find({}, "userId email settings.commissionRate settings.platformFee");
    res.status(200).json(affiliates);
  } catch (error) {
    console.error("Error fetching commission settings:", error);
    res.status(500).json({ message: "Failed to fetch commission settings" });
  }
};

// Update Commission Settings
exports.updateCommissionSettings = async (req, res) => {
  try {
    const { affiliateId, commissionRate, platformFee } = req.body;

    const updatedAffiliate = await AffiliateModel.findByIdAndUpdate(
      affiliateId,
      {
        $set: {
          "settings.commissionRate": commissionRate,
          "settings.platformFee": platformFee,
        },
      },
      { new: true }
    );

    if (!updatedAffiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    const updatedAffiliateCommission = await AffiliateCommissionModal.findByIdAndUpdate(
      affiliateId,
      {
        $set: {
          "commissionRate": commissionRate,
          "platformFee": platformFee,
        },
      },
      { new: true }
    );
    const updatedAffiliateUserEarningsCommission = await AffiliateUserEarnings.findByIdAndUpdate(
      affiliateId,
      {
        $set: {
          "commissionRate": commissionRate,
          "platformFee": platformFee,
        },
      },
      { new: true }
    );

    res.status(200).json({ message: "Commission settings updated", updatedAffiliate });
  } catch (error) {
    console.error("Error updating commission settings:", error);
    res.status(500).json({ message: "Failed to update commission settings" });
  }
};


// exports.GetAgentAdmin = async (req, res) => {
//   try {
//       const affiliates = await AgentModel.find({});
//       res.json(affiliates);
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// };




//////////////////////////////////////////////////////////////

// Admin - Get All Users
// router.get("/admin/users", async (req, res) => {
//   try {
//       const users = await User.find();
//       res.status(200).json(users);
//   } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//   }
// });





///////////////////////////////////
// Admin - Get All Transactions
// router.get("/admin/transactions", async (req, res) => {
//   try {
//       const transactions = await Transaction.find().populate("user_id");
//       res.status(200).json(transactions);
//   } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//   }
// });


exports.getBonuses = async (req, res) => {
  try {
    const bonuses = await Bonus.find().sort({ createdAt: -1 });
    res.json(bonuses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bonuses", error });
  }
};

exports.createBonus = async (req, res) => {
  try {
    console.log("createBonus called ✅", req.body);

    // ✅ Sanitize + Convert Types
    const bonusData = {
      name: req.body.name,
      description: req.body.description,
      bonusType: req.body.bonusType,
      img: req.body.img || null,
      percentage: req.body.percentage ? Number(req.body.percentage) : null,
      fixedAmount: req.body.fixedAmount ? Number(req.body.fixedAmount) : null,
      minDeposit: req.body.minDeposit ? Number(req.body.minDeposit) : null,
      maxBonus: req.body.maxBonus ? Number(req.body.maxBonus) : null,
      minTurnover: req.body.minTurnover ? Number(req.body.minTurnover) : null,
      maxTurnover: req.body.maxTurnover ? Number(req.body.maxTurnover) : null,
      wageringRequirement: req.body.wageringRequirement
        ? Number(req.body.wageringRequirement)
        : null,
      validDays: req.body.validDays ? Number(req.body.validDays) : null,
      eligibleGames: req.body.eligibleGames || [],
      isActive: req.body.isActive ?? true,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bonus = new Bonus(bonusData);
    const savedBonus = await bonus.save();



    if (req.body.bonusType === "vip") {
      // Find existing config or create new
      let vipConfig = await VIPConfig.findOne();
      if (!vipConfig) {
        vipConfig = new VIPConfig({
          levels: {
            bronze: { monthlyTurnoverRequirement: 0, vpConversionRate: 5000, loyaltyBonus: 0.01 },
            silver: { monthlyTurnoverRequirement: 0, vpConversionRate: 1250, loyaltyBonus: 0.02 },
            gold: { monthlyTurnoverRequirement: 0, vpConversionRate: 1000, loyaltyBonus: 0.03 },
            diamond: { monthlyTurnoverRequirement: 0, vpConversionRate: 500, loyaltyBonus: 0.05 },
            elite: { monthlyTurnoverRequirement: 0, vpConversionRate: 400, loyaltyBonus: 0.07 },
          }
        });
      }

      // Example: Update elite level turnover & bonus from the request (you can customize)
      vipConfig.levels.elite.monthlyTurnoverRequirement = req.body.eliteTurnover || vipConfig.levels.elite.monthlyTurnoverRequirement;
      vipConfig.levels.elite.loyaltyBonus = req.body.eliteLoyaltyBonus || vipConfig.levels.elite.loyaltyBonus;
      vipConfig.levels.elite.vpConversionRate = req.body.eliteVPConversionRate || vipConfig.levels.elite.vpConversionRate;

      vipConfig.updatedAt = new Date();
      await vipConfig.save();
      console.log("VIP Config updated ✅");
    }

    console.log("Saved Bonus:", savedBonus);
    res.status(201).json(savedBonus);
  } catch (error) {
    console.error("Error creating bonus:", error);
    res.status(400).json({
      message: "Failed to create bonus",
      error: error.message,
    });
  }
};


exports.updateBonus = async (req, res) => {
  try {
    console.log("updateBonus", req.body);
    console.log("updateBonus", req.params.bonusId);
    const updatedBonus = await Bonus.findByIdAndUpdate(req.params.bonusId, req.body, {
      new: true,
    });
    console.log("updatedBonus in controller", updatedBonus);
    if (!updatedBonus)
      return res.status(404).json({ message: "Bonus not found" });
    res.json(updatedBonus);
  } catch (error) {
    res.status(400).json({ message: "Failed to update bonus", error });
  }
};

exports.deleteBonus = async (req, res) => {
  try {
    const deletedBonus = await Bonus.findByIdAndDelete(req.params.bonusId);
    if (!deletedBonus)
      return res.status(404).json({ message: "Bonus not found" });
    res.json({ message: "Bonus deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete bonus", error });
  }
};



exports.getUsersByReferral = async (req, res) => {
  try {

    console.log("getUsersByReferral called");
    const users = await User.find({});
    console.log("users", users);
    const filteredUsers = users.filter(u => u.referredBy !== null);
    const uniqueUsers = new Set(filteredUsers.map(u => u.referredBy));
    const AffiliateUser = await AffiliateUser.find({ referralCode: { $in: Array.from(uniqueUsers) } });
    res.json(filteredUsers);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.getUsersByReferral = async (req, res) => {
//   try {
//     console.log("getUsersByReferral called");

//     const { page = 1, limit = 10, search = "" } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Get exact MongoDB collection names
//     const userCollection = User.collection.name;           // "users"
//     const affiliateCollection = AffiliateModel.collection.name; // "affiliatemodels"

//     // Build search filter
//     const matchFilter = {
//       referredBy: { $ne: null },
//       $or: [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { "phone.number": { $regex: search, $options: "i" } }
//       ]
//     };

//     // Aggregation pipeline
//     const pipeline = [
//       { $match: matchFilter },

//       // Lookup affiliate info
//       {
//         $lookup: {
//           from: affiliateCollection,
//           localField: "referredBy",
//           foreignField: "referralCode",
//           as: "affiliateInfo"
//         }
//       },
//       { $unwind: { path: "$affiliateInfo", preserveNullAndEmptyArrays: true } },

//       // Lookup referred user info
//       {
//         $lookup: {
//           from: userCollection,
//           localField: "referredBy",
//           foreignField: "referralCode",
//           as: "referredUserInfo"
//         }
//       },
//       { $unwind: { path: "$referredUserInfo", preserveNullAndEmptyArrays: true } },

//       // Count how many users this user referred
//       {
//         $lookup: {
//           from: userCollection,
//           localField: "referralCode",
//           foreignField: "referredBy",
//           as: "referrals"
//         }
//       },
//       {
//         $addFields: {
//           referralCount: { $size: "$referrals" }
//         }
//       },
//       { $project: { referrals: 0 } }, // remove raw array

//       // Sort by referralCount descending
//       { $sort: { referralCount: -1 } },

//       // Pagination
//       { $skip: skip },
//       { $limit: parseInt(limit) }
//     ];

//     // Execute aggregation
//     const enrichedUsers = await User.aggregate(pipeline);

//     // Total count for pagination
//     const totalUsers = await User.countDocuments(matchFilter);
//     const totalPages = Math.ceil(totalUsers / parseInt(limit));

//     res.json({
//       status: true,
//       message: "Users by referral fetched successfully",
//       data: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalUsers,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//         enrichedUsers
//       }
//     });

//   } catch (err) {
//     console.error("Error in getUsersByReferral (aggregation):", err);
//     res.status(500).json({ status: false, message: err.message });
//   }
// };



exports.changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    console.log(userId, password);
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password.password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ success: false, message: "Server error while changing password" });
  }
};




// Update user profile by userId
exports.updateUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("updateUserProfileById", req.params);
    const { name, email, phone, birthday, country } = req.body;
    console.log("updateUserProfileById", req.body);
    console.log("updateUserProfileById", req.params);
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findOne({ userId: userId, referredBy: req.user.referralCode });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (birthday) user.birthday = new Date(birthday);
    if (country) user.country = country;

    if (phone) {
      if (typeof phone === "string") {
        user.phone = [{
          number: phone,
          countryCode: "+88", // default or from frontend
          isDefault: true,
          verified: user.isVerified?.phone || false
        }];
      } else {
        user.phone = phone;
      }
    }



    user.updatetimestamp = new Date();

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 
// const User = require('../Models/User');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError'); // If you have custom error handling

// // Verify Email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId: userId, referredBy: req.user.referralCode }); // removed referredBy filter
  if (!user) return next(new AppError('User not found', 404));

  user.isVerified = user.isVerified || {};
  user.isVerified.email = true;

  if (user.email) {
    user.email.isVerified = true;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully',
    isVerified: user.isVerified,
  });
});

// Verify Phone
exports.verifyPhone = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId: userId, referredBy: req.user.referralCode });
  if (!user) return next(new AppError('User not found', 404));

  // Update phone verification
  user.isVerified = user.isVerified || {};
  user.isVerified.phone = true;
  user.phone.isVerified = true;

  if (user.phone) {
    user.phone.isVerified = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Phone verified successfully',
    isVerified: user.isVerified,
  });
});





// GET /api/users/:userId
exports.getUserById_detaills = catchAsync(async (req, res, next) => {

  try {
    console.log("getUserById_detaills", req.params);
    const { userId } = req.params;
    console.log("getUserById_detaills", userId);
    if (!userId) {
      return next(new AppError("User ID is required", 400));
    }

    const user = await User.findOne({ userId: userId, referredBy: req.user.referralCode }).select(
      "userId name email phone birthday country isVerified"
    );
    console.log("getUserById_detaills", user);


    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: user,
    });
  } catch (error) {
    next(new AppError("User not found", 404));
  }
});















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
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};




exports.getTransactionList = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;
    const user = req.user;
    const role = user.role.toLowerCase();
    let filter = {};
    // role-wise filtering
    switch (role) {
      case "admin":
        break; // admin sees all
      case "subAdmin":
        filter = { subAdminId: req.user?.referralCode };
        break;
      case "affiliate":
        filter = { affiliateId: req.user?.referralCode };
        break;
      case "user":
        filter = { userId: req.user?.referralCode };
        break;
      default:
        throw new Error("Invalid role");
    }

    const total = await TransactionModel.countDocuments(filter);
    const transactions = await TransactionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json({ success: true, data: transactions, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getPendingDepositTransactions = async (req, res) => {
  try {
    const { userId, amount, gateway_name, status, startDate, endDate } = req.query;
    console.log("Pending deposit transactions query:", req.query);
    
    // Get the authenticated user's referral code
    const user = req.user;
    console.log("user", user);
    
    const ParentUser = await AdminModel.findOne({ email: user.email }) || 
                       await SubAdminModel.findOne({ email: user.email }) ||
                       await AgentModel.findOne({ email: user.email }) ||
                       await SubAgentModel.findOne({ email: user.email });
    
    // console.log("getPendingDepositTransactions -----=========user", ParentUser);
    
    // if (!ParentUser) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'User not found'
    //   });
   // }
    
    console.log("getPendingDepositTransactions -----=========user", ParentUser.role);
    
    let query = {};
    console.log("query", query);
    
    // Add optional filters
    if (userId) query.userId = userId;
    if (amount) query.base_amount = { $gte: parseFloat(amount) };
    if (gateway_name) query.gateway_name = gateway_name;
    if (status !== undefined && !isNaN(status) && status !== "") {
      query.status = parseInt(status);
    }

    // Date filtering
    if (startDate && endDate) {
      query.datetime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.datetime = { $gte: new Date(startDate) };
    }

    // Handle referredBy based on user role
    let referredByFilter = {};
    
    if (ParentUser.role === 'Admin') {
      // If user is Admin, get transactions with referredBy as null or undefined
      referredByFilter = { 
        $or: [
          { referredBy: null },
          // { referredBy: { $exists: false } }
        ]
      };
    } else {
      // For other roles, use their referral code
      referredByFilter = { referredBy: ParentUser.referralCode };
    }
console.log("referredByFilter", referredByFilter);
    const transactions = await TransactionModel.find({ 
      ...referredByFilter,
      ...query, 
      type: parseInt(0), 
      status: parseInt(1),
    }).sort({ datetime: -1 });
    
    console.log("transactions", transactions);
    
    const totalDeposit = await TransactionModel.aggregate([
      { 
        $match: { 
          ...query, 
          type: parseInt(1), 
          status: parseInt(0),
          ...referredByFilter 
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const total = totalDeposit.length > 0 ? totalDeposit[0].total : 0;

    res.json({
      success: true,
      transactions,
      total
    });
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
exports.getPendingWidthrawalTransactions = async (req, res) => {
  try {
    const { userId, amount, gateway_name, status, startDate, endDate } = req.query;
    // console.log("Pending deposit transactions query:", req.query);
    
    // Get the authenticated user's referral code
    const user = req.user;
    console.log("user", user.email,user.role);
    
    const ParentUser = await AdminModel.findOne({ email: user.email }) || 
                       await SubAdminModel.findOne({ email: user.email }) ||
                       await AgentModel.findOne({ email: user.email }) ||
                       await SubAgentModel.findOne({ email: user.email });
    
    // console.log("getPendingDepositTransactions -----=========user", ParentUser);
    
    // if (!ParentUser) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'User not found'
    //   });
    // }
    
    console.log("getPendingDepositTransactions -----=========ParentUser.role", ParentUser.role);
    
    let query = {};
    console.log("query", query);
    
    // Add optional filters
    if (userId) query.userId = userId;
    if (amount) query.base_amount = { $gte: parseFloat(amount) };
    if (gateway_name) query.gateway_name = gateway_name;
    if (status !== undefined && !isNaN(status) && status !== "") {
      query.status = parseInt(status);
    }

    // Date filtering
    if (startDate && endDate) {
      query.datetime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.datetime = { $gte: new Date(startDate) };
    }

    // Handle referredBy based on user role
    let referredByFilter = {};
    
    if (ParentUser.role === 'Admin') {
      // If user is Admin, get transactions with referredBy as null or undefined
      referredByFilter = { 
        $or: [
          { referredBy: null },
          { referredBy: { $exists: false } }
        ]
      };
    } else {
      // For other roles, use their referral code
      referredByFilter = { referredBy: ParentUser.referralCode };
    }

    const transactions = await TransactionModel.find({ 
      ...query, 
      type: parseInt(1), 
      status: parseInt(0),
      ...referredByFilter 
    }).sort({ datetime: -1 });
    
    console.log("transactions", transactions);
    
    const totalDeposit = await TransactionModel.aggregate([
      { 
        $match: { 
          ...query, 
          type: parseInt(1), 
          status: parseInt(0),
          ...referredByFilter 
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const total = totalDeposit.length > 0 ? totalDeposit[0].total : 0;

    res.json({
      success: true,
      transactions,
      total
    });
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
exports.getApprovedWithdrawalTransactions = async (req, res) => {
  try {
    const { referredBy, userId, amount, gateway_name, startDate, endDate, status = 0 } = req.query;

    const subAdmin = await SubAdmin.findOne({ referralCode: referredBy });
    if (!subAdmin) {
      return res.status(404).json({ message: 'SubAdmin not found' });
    }

    let query = { referredBy: subAdmin.referralCode, type: 1, status: 1 };

    // Apply filters
    if (userId) query.userId = userId;
    if (amount) query.base_amount = { $gte: parseFloat(amount) };
    if (gateway_name) query.gateway_name = gateway_name;
    if (startDate && endDate) {
      query.datetime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.datetime = { $gte: new Date(startDate) };
    }

    const transactions = await TransactionModel.find(query).sort({ datetime: -1 });
    const totalAggregate = await TransactionModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$base_amount" } } }
    ]);

    const total = totalAggregate.length > 0 ? totalAggregate[0].total : 0;

    res.json({ success: true, data: { transactions, total } });
  } catch (error) {
    console.error("Error fetching approved withdrawal transactions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRejectedWithdrawalTransactions = async (req, res) => {
  try {
    const { referredBy, userId, amount, gateway_name, startDate, endDate, status = 0 } = req.query;

    const subAdmin = await SubAdmin.findOne({ referralCode: referredBy });
    if (!subAdmin) {
      return res.status(404).json({ message: 'SubAdmin not found' });
    }

    let query = { referredBy: subAdmin.referralCode, type: 1, status: 2 };

    // Apply filters
    if (userId) query.userId = userId;
    if (amount) query.base_amount = { $gte: parseFloat(amount) };
    if (gateway_name) query.gateway_name = gateway_name;
    if (startDate && endDate) {
      query.datetime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.datetime = { $gte: new Date(startDate) };
    }

    const transactions = await TransactionModel.find(query).sort({ datetime: -1 });
    const totalAggregate = await TransactionModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$base_amount" } } }
    ]);

    const total = totalAggregate.length > 0 ? totalAggregate[0].total : 0;

    res.json({ success: true, data: { transactions, total } });
  } catch (error) {
    console.error("Error fetching rejected withdrawal transactions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDepositTotals = async (req, res) => {
  try {
    const userByReferralCode = req.referralCode

    // Get date ranges
    const now = new Date();
    const lastDay = new Date(now);
    lastDay.setDate(now.getDate() - 1);

    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);

    // Aggregate query
    const results = await Transaction.aggregate([
      {
        $match: {
          referredBy: userByReferralCode,
          type: 0,
          status: 1,
          datetime: { $gte: last30Days },
        },
      },
      {
        $project: {
          base_amount: 1,
          period: {
            $cond: {
              if: { $gte: ["$datetime", lastDay] },
              then: "lastDay",
              else: {
                $cond: {
                  if: { $gte: ["$datetime", last7Days] },
                  then: "last7Days",
                  else: "last30Days"
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$period",
          totalAmount: { $sum: "$base_amount" },
        },
      },
    ]);

    // Initialize summary
    let summary = {
      lastDay: 0,
      last7Days: 0,
      last30Days: 0
    };

    results.forEach(item => {
      summary[item._id] = item.totalAmount;
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};







exports.updateDepositStatus = async (req, res) => {
  try {
    const { transactionId } = req.query;
    const { status, userId } = req.body;
    console.log("updateDepositStatus", transactionId, userId, status)
    // Find and update transaction
    const transaction = await TransactionModel.findOneAndUpdate(
      { transactionID: transactionId, userId },
      { status: parseInt(status) },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: `Deposit ${transactionId} updated to ${status === 1 ? "Approved" : "Rejected"}`,
      transaction
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}


exports.getWithdrawalTotals = async (req, res) => {
  try {
    const { referralCode } = req.query;

    // Get date ranges
    const now = new Date();
    const lastDay = new Date(now);
    lastDay.setDate(now.getDate() - 1);

    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);

    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);

    // Aggregate query
    const results = await TransactionModel.aggregate([
      {
        $match: {
          referredBy: referralCode,
          type: 1,
          status: 1,
          datetime: { $gte: last30Days },
        },
      },
      {
        $project: {
          base_amount: 1,
          period: {
            $cond: {
              if: { $gte: ["$datetime", lastDay] },
              then: "lastDay",
              else: {
                $cond: {
                  if: { $gte: ["$datetime", last7Days] },
                  then: "last7Days",
                  else: "last30Days"
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$period",
          totalAmount: { $sum: "$base_amount" },
        },
      },
    ]);

    // Initialize summary
    let summary = {
      lastDay: 0,
      last7Days: 0,
      last30Days: 0
    };

    results.forEach(item => {
      summary[item._id] = item.totalAmount;
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransactionReport = async (req, res) => {
  try {
    const { referralCode, type, status, userId, amount, gateway_name, startDate, endDate } = req.query;

    // Check if SubAdmin exists
    const subAdmin = await SubAdmin.findOne({ referralCode });
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: 'SubAdmin not found' });
    }

    let query = { referredBy: subAdmin.referralCode };

    // Apply filters
    if (type !== undefined) query.type = parseInt(type);
    if (status !== undefined) query.status = parseInt(status);
    if (userId) query.userId = userId;
    if (amount) query.base_amount = { $gte: parseFloat(amount) };
    if (gateway_name) query.gateway_name = gateway_name;
    if (startDate && endDate) {
      query.datetime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.datetime = { $gte: new Date(startDate) };
    }

    // Get transactions
    const transactions = await Transaction.find(query).sort({ datetime: -1 });

    // Calculate total amount
    const totalAggregate = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$base_amount" } } }
    ]);

    const total = totalAggregate.length > 0 ? totalAggregate[0].total : 0;

    res.json({ success: true, data: { transactions, total } });
  } catch (error) {
    console.error("Error fetching transaction report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




exports.subAdminGetWayList = async (req, res) => {
  console.log(req.body);

  try {
    const user = req.user; // comes from your auth middleware
    const { page = 1, limit = 10, gateway_name, startDate, endDate } = req.query;
    console.log("gateway_name", gateway_name, startDate, endDate);
    // Filters

    const filters = { email: user.email }; // only user's deposits
    if (gateway_name) filters.gateway_name = gateway_name;
    if (startDate || endDate) filters.createdAt = {};
    if (startDate) filters.createdAt.$gte = new Date(startDate);
    if (endDate) filters.createdAt.$lte = new Date(endDate);

    const totalCount = await PaymentGateWayTable.countDocuments(filters);

    const totalAmountAggregate = await PaymentGateWayTable.aggregate([
      { $match: filters },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    console.log("totalAmountAggregate", totalAmountAggregate);
    const totalAmount = totalAmountAggregate[0]?.total || 0;

    const deposits = await PaymentGateWayTable.find(filters)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    console.log("deposits", deposits);
    res.json({
      transactions: deposits,
      total: {
        count: totalCount,
        total: totalAmount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.WidthrawalGetWayList = async (req, res) => {
  console.log(req.body);

  try {
    const user = req.user; // comes from your auth middleware
    const { page = 1, limit = 10, gateway_name, startDate, endDate } = req.query;
    console.log("gateway_name", gateway_name, startDate, endDate);
    // Filters

    const filters = { email: user.email }; // only user's deposits
    if (gateway_name) filters.gateway_name = gateway_name;
    if (startDate || endDate) filters.createdAt = {};
    if (startDate) filters.createdAt.$gte = new Date(startDate);
    if (endDate) filters.createdAt.$lte = new Date(endDate);

    const totalCount = await WidthralPaymentGateWayTable.countDocuments(filters);

    const totalAmountAggregate = await WidthralPaymentGateWayTable.aggregate([
      { $match: filters },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    console.log("totalAmountAggregate", totalAmountAggregate);
    const totalAmount = totalAmountAggregate[0]?.total || 0;

    const deposits = await PaymentGateWayTable.find(filters)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    console.log("deposits", deposits);
    res.json({
      transactions: deposits,
      total: {
        count: totalCount,
        total: totalAmount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};






exports.getCategoriesWithProvidersAndGames = async (req, res) => {
  try {

    console.log("getCategoriesWithProvidersAndGames");
    const categories = await Category.find({ id_active: true });

    const result = await Promise.all(
      categories.map(async (category) => {
        const providers = await BetProviderTable.find({
          g_type: category.g_type,
          id_active: true,
        });
        console.log("providers", providers);

        const providersWithGames = await Promise.all(
          providers.map(async (provider) => {
            const games = await GameListTable.find({
              g_code: { $in: provider.gamelist.map((g) => g.g_code) },
              is_active: true,
            });


            console.log("games", games);

            return {
              _id: provider._id,
              name: provider.name,
              p_code: provider.providercode,
              g_type: provider.g_type,
              games,
            };
          })
        );

        return {
          _id: category._id,
          category_name: category.category_name,
          category_code: category.category_code,
          g_type: category.g_type,
          gamelist: providersWithGames,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to load categories", error: err.message });
  }
};






/**
 * Create or update a user's social links.
 * If a record exists for the user, update it; otherwise, create a new one.
 */



exports.getSocialLinks = async (req, res) => {
  try {


    console.log("getSocialLinks", req.user);
    const newSubAdmin = req.user;
    console.log("getSocialLinks", newSubAdmin);

    const socialLinks = await SocialLink.findOne({ referredBy: newSubAdmin.referralCode, email: newSubAdmin.email });
    console.log(socialLinks);
    res.send(socialLinks || {});
  } catch (error) {
    res.status(500).send('Server error');
  }
}

exports.updateAndCreateSocialLinks = async (req, res) => {
  try {
    const { telegram, facebook, email, referredBy } = req.body;
    const userId = req.user._id; // assuming you're using auth middleware and have req.user

    // Find existing record
    let socialLink = await SocialLink.findOne({ user: userId });

    if (socialLink) {
      // --- Update existing record ---
      socialLink.telegram = telegram || socialLink.telegram;
      socialLink.facebook = facebook || socialLink.facebook;
      socialLink.email = email || socialLink.email;
      // socialLink.referredBy = referredBy || socialLink.referredBy;

      await socialLink.save();
      return res.status(200).json({
        success: true,
        message: "Social links updated successfully",
        data: socialLink,
      });
    } else {
      // --- Create new record ---
      const newSocialLink = await SocialLink.create({
        user: userId,
        telegram,
        facebook,
        email,
        referredBy: user.referralCode,
      });

      return res.status(201).json({
        success: true,
        message: "Social links created successfully",
        data: newSocialLink,
      });
    }
  } catch (error) {
    console.error("Error in updateAndCreateSocialLinks:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating/creating social links",
      error: error.message,
    });
  }
};
