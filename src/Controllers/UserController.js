
const express = require('express');


const User = require("../Models/User");
const SubAdmin = require('../Models/SubAdminModel');
const AdminModel = require('../Models/AdminModel');
const catchAsync = require('../utils/catchAsync');

exports.GetRefferralUserList = async (req, res) => {


    try {

        const { page = 1, limit = 10, userId, email, phone } = req.body;
        const user = req.user

        if (!user) {
            return res.status(400).json({ message: "Data is required" });
        }

        // Check if SubAdmin exists
        const AdminExists = await AdminModel.findOne({ referralCode: user.referralCode });
        console.log("subAdminExists", AdminExists)

        // only user's deposits

        if (!subAdminExists) {
            return res.status(404).json({ message: 'SubAdmin not found' });
        }
        const filters = { referredBy: AdminExists.referralCode };



        // Only apply filters if provided
        if (userId) {
            filters.userId = userId;
        }
        if (email) {
            filters.email = email;
        }
        // if (phone) {
        //     filters.phone[0].number = phone;
        // }

        // Fetch users using aggregation
        // const users = await User.find(filters)
        //     .skip((page - 1) * limit)
        //     .limit(Number(limit))
        //     .sort({ createdAt: -1 });
        // console.log(users)

        const users = await User.aggregate([
            { $match: filters },

            {
                $project: {
                    userId: 1,
                    name: 1,
                    phone: 1,
                    balance: 1,
                    referredBy: 1,
                    referralCode: 1,
                    email: 1,
                    country: 1,
                    countryCode: 1,
                    isVerified: 1,
                    timestamp: 1,
                    isActive: 1,
                    birthday: 1,
                    last_game_id: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * Number(limit) },
            { $limit: Number(limit) },
        ]);

        // if (users.length === 0) {
        //     return res.status(404).json({ message: 'No users found' });
        // }
        console.log("users", users)

        return res.json(users);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};




exports.updateProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { firstName, lastName, birthday, phone, whatsapp } = req.body;

  const user = await User.findOneAndUpdate(
    { userId },
    { firstName, lastName, dateOfBirth, phone },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// exports.GetSubAdminList = async (req, res) => {


//     try {

//         const { page = 1, limit = 10, userId, email, phone } = req.body;
//         const user = req.user

//         if (!user) {
//             return res.status(400).json({ message: "Data is required" });
//         }

//         // Check if SubAdmin exists
//         const subAdminExists = await AdminModel.findOne({ email: user.email });
//         console.log("subAdminExists", subAdminExists)

//         // only user's deposits

//         if (!subAdminExists) {
//             return res.status(404).json({ message: 'SubAdmin not found' });
//         }
//         const filters = {};



//         // Only apply filters if provided
//         if (userId) {
//             filters.userId = userId;
//         }
//         if (email) {
//             filters.email = email;
//         }
//         // if (phone) {
//         //     filters.phone[0].number = phone;
//         // }

//         // Fetch users using aggregation
//         // const users = await User.find(filters)
//         //     .skip((page - 1) * limit)
//         //     .limit(Number(limit))
//         //     .sort({ createdAt: -1 });
//         // console.log(users)

//         const users = await sub.aggregate([
//             { $match: filters },

//             {
//                 $project: {
//                     userId: 1,
//                     name: 1,
//                     phone: 1,
//                     balance: 1,
//                     referredBy: 1,
//                     referralCode: 1,
//                     email: 1,
//                     country: 1,
//                     countryCode: 1,
//                     isVerified: 1,
//                     timestamp: 1,
//                     isActive: 1,
//                     birthday: 1,
//                     last_game_id: 1,
//                 },
//             },
//             { $sort: { createdAt: -1 } },
//             { $skip: (page - 1) * Number(limit) },
//             { $limit: Number(limit) },
//         ]);

//         // if (users.length === 0) {
//         //     return res.status(404).json({ message: 'No users found' });
//         // }
//         console.log("users", users)

//         return res.json(users);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// };




// exports.GetAllUser_For_Sub_Admin = async (req, res) => {


//     try {
//         console.log(req.body);
//         const { referralCode, userId, email, phone } = req.body;
//         console.log(referralCode);
//         if (!referralCode) {
//             return res.status(400).json({ message: "Referral code is required" });
//         }
//         console.log(req.body.referralCode);
//         // Check if SubAdmin exists
//         const subAdminExists = await SubAdmin.findOne({ referralCode: referralCode });
//         console.log(subAdminExists)
//         if (!subAdminExists) {
//             return res.status(404).json({ message: 'SubAdmin not found' });
//         }

//         let query = { referredBy: subAdminExists.referralCode };

//         // Only apply filters if provided
//         if (userId) {
//             query.userId = userId;
//         }
//         if (email) {
//             query.email = email;
//         }
//         if (phone) {
//             query.phone[0].number = phone;
//         }

//         // Fetch users using aggregation
//         const users = await User.aggregate([
//             // First, match the referralByCode
//             {
//                 $match: { referredBy: subAdminExists.referralCode }
//             },

//             {
//                 $match: query
//             },
//         ]);
//         console.log(users)
//         // if (users.length === 0) {
//         //     return res.status(404).json({ message: 'No users found' });
//         // }

//         return res.json(users);

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };