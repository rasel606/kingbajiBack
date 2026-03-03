const bcrypt = require('bcryptjs');

const crypto = require("crypto");

const AdminModel = require('../Models/AdminModel')
const CreateService = require('../Services/CreateService')

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
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const TransactionModel = require('../Models/TransactionModel');
const notificationController = require('../Controllers/notificationController');
const SubAdmin = require('../Models/SubAdminModel');
const Category = require('../Models/Category');
const SocialLink = require('../Models/SocialLink');
const BettingHistory = require('../Models/BettingHistory');
const { loginUser } = require('../Services/LoginService');
const { AdminProfile } = require('../Services/LoginService');
const { getUserListServices } = require('../Services/getUserListServices');
const { getReferralData } = require('../Services/getReferralOwnerService');
const { processTransaction } = require('../Services/processTransactionService');


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
