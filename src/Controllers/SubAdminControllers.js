
// // const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
// // const Transaction = require('../Models/TransactionModel');
// // const User = require('../Models/User');
// // const SubAdmin = require('../Models/SubAdminModel');
// // const bcrypt = require('bcryptjs');
// // const jwt = require("jsonwebtoken");
// // const axios = require("axios");
// // const TransactionModel = require('../Models/TransactionModel');
// // const notificationController = require('../Controllers/notificationController');
// // const generateReferralCode = require('../Services/generateReferralCode');
// // const WidthralPaymentGateWayTable = require('../Models/WidthralPaymentGateWayTable');
// // const Bonus = require('../Models/Bonus');
// // const UserBonus = require('../Models/UserBonus');
// // const BettingHistory = require('../Models/BettingHistory');
// // const AffiliateModel = require('../Models/AffiliateModel');
// // const AdminModel = require('../Models/AdminModel');
// // const PaymentService = require('../Services/paymentService');
// // const catchAsync = require('../utils/catchAsync');









// // exports.getDashboardDepositReports = async (req, res) => {
// //     try {
// //         const { 
// //             userId, 
// //             amount, 
// //             gateway_name, 
// //             status, 
// //             referredBy, 
// //             startDate, 
// //             endDate,
// //             reportType = 'all', // 'rejected', 'approved', 'totals', or 'all'
// //             includeTotals = true
// //         } = req.body;

// //         console.log('Dashboard request:', { userId, amount, gateway_name, status, referredBy, startDate, endDate, reportType });

// //         // Validate required field
// //         if (!referredBy) {
// //             return res.status(400).json({ message: 'referredBy is required' });
// //         }

// //         // Find the SubAdmin user
// //         const SubAdminuser = await SubAdmin.findOne({ referralCode: referredBy });
// //         if (!SubAdminuser) {
// //             return res.status(404).json({ message: 'User not found' });
// //         }

// //         // Build base query
// //         let query = { referredBy: SubAdminuser.referralCode, type: 0 };

// //         // Apply filters
// //         if (userId) {
// //             query.userId = userId;
// //         }
// //         if (amount) {
// //             query.base_amount = { $gte: parseFloat(amount) };
// //         }
// //         if (gateway_name) {
// //             query.gateway_name = gateway_name;
// //         }
// //         if (status !== undefined && !isNaN(status) && status !== "") {
// //             query.status = parseInt(status);
// //         }

// //         // Date range filter
// //         if (startDate && endDate) {
// //             query.datetime = {
// //                 $gte: new Date(startDate),
// //                 $lte: new Date(endDate),
// //             };
// //         } else if (startDate) {
// //             query.datetime = { $gte: new Date(startDate) };
// //         }

// //         const responseData = {};

// //         // Handle different report types
// //         if (reportType === 'all' || reportType === 'rejected' || reportType === 'approved') {
// //             let statusFilter;

// //             if (reportType === 'rejected') {
// //                 statusFilter = 2;
// //             } else if (reportType === 'approved') {
// //                 statusFilter = 1;
// //             }

// //             // If specific status is requested, apply it to the query
// //             if (statusFilter !== undefined) {
// //                 query.status = statusFilter;
// //             }

// //             // Get transactions
// //             const transactions = await Transaction.find(query).sort({ datetime: -1 });
// //             responseData.transactions = transactions;

// //             // Get total amount if requested
// //             if (includeTotals) {
// //                 const totalDeposit = await Transaction.aggregate([
// //                     { $match: query },
// //                     { $group: { _id: null, total: { $sum: "$base_amount" } } }
// //                 ]);

// //                 responseData.total = totalDeposit[0] ? totalDeposit[0].total : 0;
// //             }
// //         }

// //         // Get time-based totals if requested
// //         if (includeTotals && (reportType === 'all' || reportType === 'totals')) {
// //             const now = new Date();
// //             const lastDay = new Date(now);
// //             lastDay.setDate(now.getDate() - 1);

// //             const last7Days = new Date(now);
// //             last7Days.setDate(now.getDate() - 7);

// //             const last30Days = new Date(now);
// //             last30Days.setDate(now.getDate() - 30);

// //             // Base match for totals (only approved transactions)
// //             const baseMatch = {
// //                 referredBy: SubAdminuser.referralCode,
// //                 type: 0,
// //                 status: 1, // Only approved transactions for totals
// //                 datetime: { $gte: last30Days }
// //             };

// //             // Apply additional filters if provided
// //             if (userId) baseMatch.userId = userId;
// //             if (gateway_name) baseMatch.gateway_name = gateway_name;
// //             if (amount) baseMatch.base_amount = { $gte: parseFloat(amount) };

// //             const results = await Transaction.aggregate([
// //                 {
// //                     $match: baseMatch
// //                 },
// //                 {
// //                     $project: {
// //                         base_amount: 1,
// //                         datetime: 1,
// //                         period: {
// //                             $cond: {
// //                                 if: { $gte: ["$datetime", lastDay] },
// //                                 then: "lastDay",
// //                                 else: {
// //                                     $cond: {
// //                                         if: { $gte: ["$datetime", last7Days] },
// //                                         then: "last7Days",
// //                                         else: "last30Days"
// //                                     }
// //                                 }
// //                             }
// //                         }
// //                     }
// //                 },
// //                 {
// //                     $group: {
// //                         _id: "$period",
// //                         totalAmount: { $sum: "$base_amount" },
// //                     },
// //                 },
// //             ]);

// //             // Initialize summary
// //             let summary = {
// //                 lastDay: 0,
// //                 last7Days: 0,
// //                 last30Days: 0
// //             };

// //             results.forEach(item => {
// //                 summary[item._id] = item.totalAmount;
// //             });

// //             responseData.timeBasedTotals = summary;
// //         }

// //         // Get overall statistics if reportType is 'all'
// //         if (reportType === 'all') {
// //             const approvedCount = await Transaction.countDocuments({
// //                 referredBy: SubAdminuser.referralCode,
// //                 type: 0,
// //                 status: 1
// //             });

// //             const rejectedCount = await Transaction.countDocuments({
// //                 referredBy: SubAdminuser.referralCode,
// //                 type: 0,
// //                 status: 2
// //             });

// //             const pendingCount = await Transaction.countDocuments({
// //                 referredBy: SubAdminuser.referralCode,
// //                 type: 0,
// //                 status: 0
// //             });

// //             responseData.statistics = {
// //                 approved: approvedCount,
// //                 rejected: rejectedCount,
// //                 pending: pendingCount,
// //                 total: approvedCount + rejectedCount + pendingCount
// //             };
// //         }

// //         res.json({
// //             success: true,
// //             data: responseData,
// //             filters: {
// //                 userId,
// //                 amount,
// //                 gateway_name,
// //                 status,
// //                 referredBy,
// //                 startDate,
// //                 endDate
// //             }
// //         });

// //     } catch (error) {
// //         console.error("Error in dashboard deposit reports:", error);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Server error",
// //             error: error.message 
// //         });
// //     }
// // };




// const express = require('express');
// const router = express.Router();
// const Transaction = require('../Models/TransactionModel');
// const SubAdmin = require('../Models/SubAdminModel');
// const User = require('../Models/User');
// const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
// const WidthralPaymentGateWayTable = require('../Models/WidthralPaymentGateWayTable');
// const AdminModel = require('../Models/AdminModel');
// // Consolidated dashboard data endpoint
// exports.getDashboardData = async (req, res) => {
//   try {
//     const user = req.user; // Assuming auth middleware adds user to req
//     const { startDate, endDate } = req.query;


//     console.log(user.referralCode)

//     if (!user.referralCode) {
//       return res.status(400).json({ success: false, message: 'Referral code is required' });
//     }

//     // Check if SubAdmin exists
//     const subAdmin = await SubAdmin.findOne({ referralCode: user.referralCode });
//     if (!subAdmin) {
//       return res.status(404).json({ success: false, message: 'SubAdmin not found' });
//     }

//     // Calculate date ranges
//     const now = new Date();
//     const lastDay = new Date(now);
//     lastDay.setDate(now.getDate() - 1);

//     const last7Days = new Date(now);
//     last7Days.setDate(now.getDate() - 7);

//     const last30Days = new Date(now);
//     last30Days.setDate(now.getDate() - 30);

//     // Set default date range if not provided
//     const queryStartDate = startDate ? new Date(startDate) : last30Days;
//     const queryEndDate = endDate ? new Date(endDate) : now;

//     // Get all users referred by this subadmin
//     const usersReferred = await User.find({ referredBy: subAdmin.referralCode });
//     const userIds = usersReferred.map(user => user.userId);
//     console.log("userIds", userIds)
//     // Get total users count
//     const totalUsers = usersReferred.length;
//     console.log("totalUsers", totalUsers)
//     // Get online users
//     const onlineUsers = await User.countDocuments({
//       referredBy: subAdmin.referralCode,
//       isActive: true
//     });

//     // Get deposit and withdrawal summaries
//     const [depositSummary, withdrawSummary, totalDeposit, totalWithdraw, chartData] = await Promise.all([
//       // Deposit summary by period
//       Transaction.aggregate([
//         {
//           $match: {
//             referredBy: subAdmin.referralCode,
//             type: 0,
//             status: 1,
//             datetime: { $gte: last30Days }
//           }
//         },
//         {
//           $project: {
//             base_amount: 1,
//             period: {
//               $cond: {
//                 if: { $gte: ["$datetime", lastDay] },
//                 then: "lastDay",
//                 else: {
//                   $cond: {
//                     if: { $gte: ["$datetime", last7Days] },
//                     then: "last7Days",
//                     else: "last30Days"
//                   }
//                 }
//               }
//             }
//           }
//         },
//         {
//           $group: {
//             _id: "$period",
//             totalAmount: { $sum: "$base_amount" }
//           }
//         }
//       ]),

//       // Withdraw summary by period
//       Transaction.aggregate([
//         {
//           $match: {
//             referredBy: subAdmin.referralCode,
//             type: 1,
//             status: 1,
//             datetime: { $gte: last30Days }
//           }
//         },
//         {
//           $project: {
//             base_amount: 1,
//             period: {
//               $cond: {
//                 if: { $gte: ["$datetime", lastDay] },
//                 then: "lastDay",
//                 else: {
//                   $cond: {
//                     if: { $gte: ["$datetime", last7Days] },
//                     then: "last7Days",
//                     else: "last30Days"
//                   }
//                 }
//               }
//             }
//           }
//         },
//         {
//           $group: {
//             _id: "$period",
//             totalAmount: { $sum: "$base_amount" }
//           }
//         }
//       ]),

//       // Total deposit amount
//       Transaction.aggregate([
//         {
//           $match: {
//             referredBy: subAdmin.referralCode,
//             type: 0,
//             status: 1
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$base_amount" }
//           }
//         }
//       ]),

//       // Total withdrawal amount
//       Transaction.aggregate([
//         {
//           $match: {
//             referredBy: subAdmin.referralCode,
//             type: 1,
//             status: 1
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$base_amount" }
//           }
//         }
//       ]),

//       // Chart data for the selected date range
//       Transaction.aggregate([
//         {
//           $match: {
//             referredBy: subAdmin.referralCode,
//             type: 0,
//             status: 1,
//             datetime: {
//               $gte: queryStartDate,
//               $lte: queryEndDate
//             }
//           }
//         },
//         {
//           $group: {
//             _id: {
//               $dateToString: {
//                 format: "%Y-%m-%d",
//                 date: "$datetime"
//               }
//             },
//             total: { $sum: "$base_amount" }
//           }
//         },
//         {
//           $sort: { _id: 1 }
//         }
//       ])
//     ]);

//     // Format deposit summary
//     const formattedDepositSummary = {
//       lastDay: 0,
//       last7Days: 0,
//       last30Days: 0
//     };

//     depositSummary.forEach(item => {
//       formattedDepositSummary[item._id] = item.totalAmount;
//     });

//     // Format withdraw summary
//     const formattedWithdrawSummary = {
//       lastDay: 0,
//       last7Days: 0,
//       last30Days: 0
//     };

//     withdrawSummary.forEach(item => {
//       formattedWithdrawSummary[item._id] = item.totalAmount;
//     });

//     // Calculate total balance
//     const totalBalance = usersReferred.reduce((sum, user) => sum + (user.balance || 0), 0);
//     console.log("totalBalance", totalBalance)
//     // Response data
//     const response = {
//       success: true,
//       data: {
//         widgets: {
//           totalUsers,
//           onlineUsers,
//           totalBalance: totalBalance.toFixed(2),
//           totalDeposit: totalDeposit.length > 0 ? totalDeposit[0].total.toFixed(2) : "0.00",
//           totalWithdraw: totalWithdraw.length > 0 ? totalWithdraw[0].total.toFixed(2) : "0.00"
//         },

//         progress: [
//           {
//             title: 'Total Users',
//             value: `${totalUsers} Users`,
//             percent: Math.min((totalUsers / 1000) * 100, 100),
//             color: 'success'
//           },
//           {
//             title: 'Online Users',
//             value: `${onlineUsers} Users`,
//             percent: Math.min((onlineUsers / totalUsers) * 100, 100) || 0,
//             color: 'info'
//           },
//           {
//             title: 'Total Deposit',
//             value: `$${totalDeposit.length > 0 ? totalDeposit[0].total.toFixed(2) : "0.00"}`,
//             percent: Math.min((totalDeposit.length > 0 ? totalDeposit[0].total / 10000 * 100 : 0), 100),
//             color: 'warning'
//           },
//           {
//             title: 'Total Withdraw',
//             value: `$${totalWithdraw.length > 0 ? totalWithdraw[0].total.toFixed(2) : "0.00"}`,
//             percent: Math.min((totalWithdraw.length > 0 ? totalWithdraw[0].total / 5000 * 100 : 0), 100),
//             color: 'danger'
//           },
//           {
//             title: 'Total Balance',
//             value: `$${totalBalance.toFixed(2)}`,
//             percent: Math.min((totalBalance / 2000) * 100, 100),
//             color: 'primary'
//           }
//         ],

//         depositSummary: formattedDepositSummary,
//         withdrawSummary: formattedWithdrawSummary,

//         chartData: chartData.map(item => ({
//           _id: item._id,
//           total: item.total
//         }))
//       }
//     };

//     console.log("response", response)

//     res.json(response);
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


// exports.GetSubAdminList = async (req, res) => {


//   try {


//     const { page = 1, limit = 10, userId, email, phone } = req.query;

//     const user = req.user
//     console.log("GetALLSubAdminList", user);
//     if (!user) {
//       return res.status(400).json({ message: "Data is required" });
//     }

//     // Check if SubAdmin exists
//     const subAdminExists = await SubAdmin.findOne({ email: user.email });
//     console.log("subAdminExists", subAdminExists)

//     // only user's deposits

//     if (!subAdminExists) {
//       return res.status(404).json({ message: 'SubAdmin not found' });
//     }
//     const filters = {};



//     // Only apply filters if provided
//     if (userId) {
//       filters.userId = userId;
//     }
//     if (email) {
//       filters.email = email;
//     }
//     // if (phone) {
//     //     filters.phone[0].number = phone;
//     // }

//     // Fetch users using aggregation
//     const users = await SubAdmin.find(filters).select('userId name phone balance referredBy referralCode email country countryCode isVerified timestamp isActive birthday last_game_id')
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//     console.log(users)

//     // const users = await sub.aggregate([
//     //     { $match: filters },
//     //     { $sort: { createdAt: -1 } },
//     //     { $skip: (page - 1) * Number(limit) },
//     //     { $limit: Number(limit) },
//     // ]);

//     // if (users.length === 0) {
//     //     return res.status(404).json({ message: 'No users found' });
//     // }
//     console.log("users", users)

//     return res.json(users);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.GetSubAdminAffiliateList = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, userId, email } = req.query;
//     const user = req.user;

//     console.log("GetALLSubAdminList", user);
//     if (!user) {
//       return res.status(400).json({ message: "Data is required" });
//     }

//     // Verify requesting SubAdmin
//     const subAdminExists = await SubAdmin.findOne({});
//     if (!subAdminExists) {
//       return res.status(404).json({ message: "SubAdmin not found" });
//     }

//     const filters = {};
//     if (userId) filters.userId = userId;
//     if (email) filters.email = email;

//     // Fetch sub-admins with pagination
//     const subAdmins = await SubAdmin.find({ referredBy: subAdminExists.referralCode })
//       .select(
//         "userId name phone balance referredBy referralCode email country countryCode isVerified timestamp isActive birthday last_game_id"
//       )
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//     console.log("subAdmins", subAdmins)
//     // Fetch affiliates for each sub-admin (parallel for performance)
//     const results = await Promise.all(
//       subAdmins.map(async (sub) => {
//         const affiliates = await AffiliateModal.find({ referredBy: sub.referralCode, ...filters })
//           .select(
//             "userId name phone balance referredBy referralCode email country countryCode isVerified timestamp isActive birthday last_game_id"
//           )
//           .sort({ createdAt: -1 });
//         console.log("affiliates", affiliates)
//         return {
//           ...sub.toObject(),
//           affiliates, // add referred users
//           affiliateCount: affiliates.length, // optional: count for quick display
//         };
//       })
//     );

//     return res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// exports.GetSubAdminAffiliateList = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, userId, email } = req.query;
//     const user = req.user;

//     console.log("GetALLSubAdminList", user);
//     if (!user) {
//       return res.status(400).json({ message: "Data is required" });
//     }

//     // Verify requesting SubAdmin
//     const subAdminExists = await SubAdmin.findOne({ email: user.email });
//     if (!subAdminExists) {
//       return res.status(404).json({ message: "SubAdmin not found" });
//     }

//     const filters = {};
//     if (userId) filters.userId = userId;
//     if (email) filters.email = email;

//     // Fetch sub-admins with pagination
//     const subAdmins = await SubAdmin.find({ referredBy: subAdminExists.referralCode })
//       .select(
//         "userId name phone balance referredBy referralCode email country countryCode isVerified timestamp isActive birthday last_game_id"
//       )
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//     console.log("subAdmins", subAdmins)
//     // Fetch affiliates for each sub-admin (parallel for performance)
//     const results = await Promise.all(
//       subAdmins.map(async (sub) => {
//         const affiliates = await AffiliateModal.find({ referredBy: sub.referralCode, ...filters })
//           .select(
//             "userId name phone balance referredBy referralCode email country countryCode isVerified timestamp isActive birthday last_game_id"
//           )
//           .sort({ createdAt: -1 });
//         console.log("affiliates", affiliates)
//         return {
//           ...sub.toObject(),
//           affiliates, // add referred users
//           affiliateCount: affiliates.length, // optional: count for quick display
//         };
//       })
//     );

//     return res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// exports.getUsersForSubAdmin = async (req, res) => {
//   try {
//     const { referredBy, userId, email, phone } = req.body;

//     // Check if SubAdmin exists
//     const subAdmin = await SubAdmin.findOne({ referralCode: referredBy });
//     if (!subAdmin) {
//       return res.status(404).json({ message: 'SubAdmin not found' });
//     }

//     let query = { referredBy: subAdmin.referralCode };

//     // Apply filters if provided
//     if (userId) {
//       query.userId = userId;
//     }
//     if (email) {
//       query.email = email;
//     }
//     if (phone) {
//       query['phone.number'] = phone;
//     }

//     // Fetch users
//     const users = await User.find(query).select(
//       'userId name phone balance referredBy referralCode email country countryCode isVerified timestamp isActive birthday last_game_id'
//     ).sort({ timestamp: -1 });

//     res.json({ success: true, data: users });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.getApprovedDepositTransactions = async (req, res) => {
//   try {
//     const { referredBy, userId, amount, gateway_name, startDate, endDate } = req.body;
//     const user = req.user
//     const subAdmin = await SubAdmin.findOne({ referralCode: user.referralCode });
//     const subAdminForUser = await SubAdmin.findOne({ referralCode: referredBy });
//     if (!subAdmin || !subAdminForUser || subAdminForUser.referralCode !== referredBy) {
//       return res.status(404).json({ message: 'SubAdmin not found' });
//     }

//     let query = { referredBy: subAdmin.referralCode, type: 0, status: 1 };

//     // Apply filters
//     if (userId) query.userId = userId;
//     if (amount) query.base_amount = { $gte: parseFloat(amount) };
//     if (gateway_name) query.gateway_name = gateway_name;
//     if (startDate && endDate) {
//       query.datetime = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     } else if (startDate) {
//       query.datetime = { $gte: new Date(startDate) };
//     }

//     const transactions = await Transaction.find(query).sort({ datetime: -1 });
//     const totalAggregate = await Transaction.aggregate([
//       { $match: query },
//       { $group: { _id: null, total: { $sum: "$base_amount" } } }
//     ]);

//     const total = totalAggregate.length > 0 ? totalAggregate[0].total : 0;

//     res.json({ success: true, data: { transactions, total } });
//   } catch (error) {
//     console.error("Error fetching approved deposit transactions:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
// // Controllers/SubAdminControllers.js










// exports.subAdminGetWayList = async (req, res) => {
//   console.log(req.body);

//   try {
//     const user = req.user; // comes from your auth middleware
//     const { page = 1, limit = 10, gateway_name, startDate, endDate } = req.query;
//     console.log("gateway_name", gateway_name, startDate, endDate);
//     // Filters

//     const filters = { email: user.email }; // only user's deposits
//     if (gateway_name) filters.gateway_name = gateway_name;
//     if (startDate || endDate) filters.createdAt = {};
//     if (startDate) filters.createdAt.$gte = new Date(startDate);
//     if (endDate) filters.createdAt.$lte = new Date(endDate);

//     const totalCount = await PaymentGateWayTable.countDocuments(filters);

//     const totalAmountAggregate = await PaymentGateWayTable.aggregate([
//       { $match: filters },
//       { $group: { _id: null, total: { $sum: '$amount' } } },
//     ]);

//     console.log("totalAmountAggregate", totalAmountAggregate);
//     const totalAmount = totalAmountAggregate[0]?.total || 0;

//     const deposits = await PaymentGateWayTable.find(filters)
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//     console.log("deposits", deposits);
//     res.json({
//       transactions: deposits,
//       total: {
//         count: totalCount,
//         total: totalAmount,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
// exports.WidthrawalGetWayList = async (req, res) => {
//   console.log(req.body);

//   try {
//     const user = req.user; // comes from your auth middleware
//     const { page = 1, limit = 10, gateway_name, startDate, endDate } = req.query;
//     console.log("gateway_name", gateway_name, startDate, endDate);
//     // Filters

//     const filters = { email: user.email }; // only user's deposits
//     if (gateway_name) filters.gateway_name = gateway_name;
//     if (startDate || endDate) filters.createdAt = {};
//     if (startDate) filters.createdAt.$gte = new Date(startDate);
//     if (endDate) filters.createdAt.$lte = new Date(endDate);

//     const totalCount = await WidthralPaymentGateWayTable.countDocuments(filters);

//     const totalAmountAggregate = await WidthralPaymentGateWayTable.aggregate([
//       { $match: filters },
//       { $group: { _id: null, total: { $sum: '$amount' } } },
//     ]);

//     console.log("totalAmountAggregate", totalAmountAggregate);
//     const totalAmount = totalAmountAggregate[0]?.total || 0;

//     const deposits = await PaymentGateWayTable.find(filters)
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//     console.log("deposits", deposits);
//     res.json({
//       transactions: deposits,
//       total: {
//         count: totalCount,
//         total: totalAmount,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


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
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

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
// const SportsBet = require('../Models/OddSportsTable')
exports.CreateAdmin = catchAsync(async (req, res, next) => {
  try {
    console.log(req.body)
    let dataModel = SubAdmin;
    let data = req.body
    const result = await CreateService.createUser(req, dataModel);
    console.log(result)
    res.json({ data: result.data, message: result.message, success: result.success });
  } catch (err) {
    next(err);
  }
});
exports.AdminLogin = catchAsync(async (req, res, next) => {
  try {
    const result = await loginUser(req, SubAdmin);
    console.log(result)
    res.json({ data: result.data, message: result.message, success: result.success });
  } catch (err) {
    next(err);
  }
});




exports.GetAdminProfile = catchAsync(async (req, res, next) => {
  let dataModel = SubAdmin;
  let result = await AdminProfile(req, dataModel);
  res.json({ data: result.data, message: result.message, success: result.success });
});
exports.AdminUpdate = async (req, res) => {
  let dataModel = SubAdmin;
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
exports.getPendingDepositTransactions = async (req, res) => {
  try {
    const { userId, amount, gateway_name, status, startDate, endDate } = req.query;
    console.log("Pending deposit transactions query:", req.query);
    // Get the authenticated user's referral code
    const user = req.user;
    console.log("user", user);
    // if (!referredBy) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: 'Referral code not found for this user' 
    //   });
    // }

    const SubAdminuser = await AdminModel.findOne({ referralCode: user.referralCode });
    if (!SubAdminuser) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }
    console.log("SubAdminuser", SubAdminuser);
    let query = {type: 0, status: 0 };
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

    const transactions = await Transaction.find({ ...query, type: parseInt(0), status: parseInt(0) }).sort({ datetime: -1 });
    console.log("transactions", transactions);
    const totalDeposit = await Transaction.aggregate([
      { $match: query },
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
}
exports.getPendingWidthrawalTransactions = async (req, res) => {
  try {
    const { userId, amount, gateway_name, status, startDate, endDate } = req.query;
    console.log("Pending deposit transactions query:", req.query);
    // Get the authenticated user's referral code
    const user = req.user;
    console.log("user", user);
    // if (!referredBy) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: 'Referral code not found for this user' 
    //   });
    // }

    const SubAdminuser = await AdminModel.findOne({ referralCode: user.referralCode });
    if (!SubAdminuser) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }
    console.log("SubAdminuser", SubAdminuser);
    let query = {  type: 1, status: 0 };
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

    const transactions = await Transaction.find(query).sort({ datetime: -1 });
    console.log("transactions", transactions);
    const totalDeposit = await Transaction.aggregate([
      { $match: query },
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
}

exports.getRejectedDepositTransactions = async (req, res) => {
  try {
    const { referredBy, userId, amount, gateway_name, startDate, endDate, status = 0 } = req.query;

    const subAdmin = await SubAdmin.findOne({ referralCode: referredBy });
    if (!subAdmin) {
      return res.status(404).json({ message: 'SubAdmin not found' });
    }

    let query = { referredBy: subAdmin.referralCode, type: 0, status: 2 };

    // Apply filters
    if (userId) query.userId = userId;
    if (amount) query.base_amount = { $gte: parseFloat(amount) };
    if (gateway_name) query.gateway_name = gateway_name;
    if (startDate && endDate) {
      query.datetime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.datetime = { $gte: new Date(startDate) };
    }

    const transactions = await Transaction.find(query).sort({ datetime: -1 });
    const totalAggregate = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$base_amount" } } }
    ]);

    const total = totalAggregate.length > 0 ? totalAggregate[0].total : 0;

    res.json({ success: true, data: { transactions, total } });
  } catch (error) {
    console.error("Error fetching rejected deposit transactions:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

    const transactions = await Transaction.find(query).sort({ datetime: -1 });
    const totalAggregate = await Transaction.aggregate([
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

    const transactions = await Transaction.find(query).sort({ datetime: -1 });
    const totalAggregate = await Transaction.aggregate([
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

    // Find and update transaction
    const transaction = await Transaction.findOneAndUpdate(
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
    const results = await Transaction.aggregate([
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
