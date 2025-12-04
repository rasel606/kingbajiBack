
const express = require('express');

const AppError = require('../Utils/AppError');
const User = require("../Models/User");
const SubAdmin = require('../Models/SubAdminModel');
const AdminModel = require('../Models/AdminModel');
const catchAsync = require('../Utils/catchAsync');

exports.GetRefferralUserList = async (req, res) => {


    try {
        console.log("GetRefferralUserList")
        const { page = 1, limit = 10, userId, email, phone } = req.query;
        const user = req.user

        if (!user) {
            return res.status(400).json({ message: "Data is required" });
        }

        // Check if SubAdmin exists
        const AdminExists = await AdminModel.findOne({ referralCode: user.referralCode });
        console.log("subAdminExists", AdminExists)

        // only user's deposits

        if (!AdminExists) {
            return res.status(404).json({ message: 'SubAdmin not found' });
        }
        const filters = { referredBy: { $in: [null, "1"] } };




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

exports.GetRefferralList = async (req, res, dataModel, childModel) => {


    try {
        console.log("GetRefferralUserList")
        const { page = 1, limit = 10, userId, email, phone } = req.query;
        const user = req.user

        if (!user) {
            return res.status(400).json({ message: "Data is required" });
        }
console.log("user", user.role, user.referralCode);

        let referredByFilter;
        if (user.role === 'Admin') {
            referredByFilter = {
                     referredBy: "1" || null || undefined 
            }
        } else {
            referredByFilter = { referredBy: user.referralCode };
        }
        // Check if SubAdmin exists
        const AdminExists = await dataModel.findOne(referredByFilter);
        // console.log("subAdminExists", AdminExists)

        // only user's deposits

        // if (!AdminExists) {
        //     return res.status(404).json({ message: 'SubAdmin not found' });
        // }
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

        const users = await childModel.find(filters)
            .skip((page - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await childModel.countDocuments(filters);
        // if (users.length === 0) {
        //     return res.status(404).json({ message: 'No users found' });
        // }
        console.log("users", users)

        return {
            success: true,
            page,
            limit,
            total,
            users
        };

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

exports.GetUserList = async (req, res, dataModel, user) => {
    try {
        console.log("GetRefferralUserList", dataModel);
        const { page = 1, limit = 10, userId, email, phone } = req.query;

        if (!user) {
            return res.status(400).json({ message: "User data is required" });
        }
console.log("adminExists", user.referralCode);
 console.log("GetRefferralUserList", dataModel);
        // Check if Admin exists
        const adminExists = await dataModel.findOne({ referralCode: user.referralCode });
        console.log("adminExists", adminExists.referralCode, user.referralCode, adminExists.email);

        if (!adminExists) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Build filters
        const filters = { referredBy: adminExists.referralCode };

        if (userId) {
            filters.userId = userId;
        }
        if (email) {
            filters.email = { $regex: email, $options: 'i' }; // Case-insensitive search
        }
        if (phone) {
            filters['phone.number'] = phone;
        }
        console.log("filters", filters)
        // Get total count for pagination info
        const totalUsers = await User.countDocuments(filters);

        // Fetch users using aggregation
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
                    createdAt: 1 // Added since you're sorting by it
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * Number(limit) },
            { $limit: Number(limit) }
        ]);

        console.log("users", users);

        return res.json({
            success: true,
            data: users,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNext: (page * limit) < totalUsers,
                hasPrev: page > 1
            }
        });

    } catch (err) {
        console.error("GetUserList Error:", err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
// UserController.js
exports.GetFromUserList = async (parentModel, dataModel, user, queryParams, res) => {
    try {
        const { page = 1, limit = 10, userId, email, phone } = queryParams;

        if (!user) return { success: false, message: "User data is required" };

        const parent = await parentModel.findOne({ referralCode: user.referralCode });
        console.log("parent", parent);
        if (!parent) return { success: false, message: "Parent not found" };

        const filters = { referredBy: parent.referralCode };
        if (userId) filters.userId = userId;
        if (email) filters.email = { $regex: email, $options: "i" };
        if (phone) filters["phone.number"] = phone;

        const total = await dataModel.countDocuments(filters);
        console.log("total", total);
        const users = await dataModel.aggregate([
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
                    createdAt: 1 // Added since you're sorting by it
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * Number(limit) },
            { $limit: Number(limit) }
        ]);

        console.log("users", users);

        return res.json({
            success: true,
            data: users,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: (page * limit) < total,
                hasPrev: page > 1
            }
        });

    } catch (err) {
        console.error("GetUserList Error:", err);
        return { success: false, message: "Server error" };
    }
};






// GET /api/users/:userId
exports.getUserById_detaills = async (req, res, dataModel, user) => {


    const { userId } = req.params;
    console.log("getUserById_detaills userId:", userId);

    if (!userId) {
        return next(new AppError("User ID is required", 400));
    }

    // Check if the current user (admin) exists and has a referral code
    if (!req.user) {
        return next(new AppError("Admin authentication required", 401));
    }

    // Find user by userId and ensure they were referred by the current admin
    const userDetails = await dataModel.findOne({ userId: userId }).select(
        "userId name email phone birthday country isVerified balance createdAt referredBy referralCode isActive"
    );

    console.log("getUserById_detaills found:", userDetails);

    if (!userDetails) {
        return next(new AppError("User not found or you don't have permission to access this user", 404));
    }


    return {
        message: "Login successful",
        data: {
            user: userDetails,

        },
        success: true
    };

};





exports.updateUserProfileById = async (req, dataModel, reqUser) => {

    const { userId } = req.params;
    console.log("updateUserProfileById params:", req.body);
    const { name, email, phone, birthday, country } = req.body;
    console.log("updateUserProfileById body:", req.body);

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    // Find user by userId and ensure they were referred by the current agent
    const user = await dataModel.findOne({
        userId: userId,
        // referredBy: req.user.referralCode
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found or you don't have permission to update this user"
        });
    }

    // Update fields if provided and reset verification status when fields change
    if (name !== undefined) {
        user.name = name;
        user.isNameVerified = false; // Reset name verification when name changes
    }

    if (email !== undefined && email !== user.email) {
        user.email = email;
        // Reset email verification when email changes
        user.isVerified.email = false;
    }

    if (birthday !== undefined) {
        user.birthday = new Date(birthday);
        user.isBirthdayVerified = false; // Reset birthday verification when birthday changes
    }

    if (country !== undefined) {
        user.country = country;
    }

    // Handle phone updates carefully
    if (phone !== undefined) {
        if (typeof phone === "string") {
            // Check if phone number is actually changing
            const currentPhone = user.phone && user.phone[0] ? user.phone[0].number : '';
            if (phone !== currentPhone) {
                user.phone = [{
                    number: phone,
                    countryCode: "+88",
                    isDefault: true,
                    verified: false // Reset verification when phone changes
                }];
                user.isVerified.phone = false;
            }
        } else if (Array.isArray(phone)) {
            // For array input, compare if phones are actually different
            const phonesChanged = JSON.stringify(phone) !== JSON.stringify(user.phone);
            if (phonesChanged) {
                user.phone = phone;
                user.isVerified.phone = false; // Reset verification when phones change
            }
        }
    }

    user.updatetimestamp = new Date();
    await user.save();

    return {
        success: true,
        message: "User profile updated successfully",
        data: {
            user: user
        }
    }


};

// Verify Email
exports.verifyEmail = catchAsync(async (req, dataModel, next) => {

    const { userId } = req.params;

    const user = await dataModel.findOne({
        userId: userId,
        // referredBy: req.user.referralCode
    });

    if (!user) {
        return next(new AppError('User not found or access denied', 404));
    }

    // Initialize isVerified object if it doesn't exist
    user.isVerified = user.isVerified || {};
    user.isVerified.email = true;

    await user.save();

    return {
        success: true,
        message: 'Email verified successfully',
        // data: {
        //     isVerified: user.isVerified
        // }
    };

});

// Verify Phone
exports.verifyPhone = catchAsync(async (req, dataModel, next) => {

    const { userId } = req.params;
    console.log("updateUserProfileById user:", req.params.userId, userId);
    const user = await dataModel.findOne({ userId });
    console.log("updateUser user:", user);
    if (!user) {
        return next(new AppError('User not found or access denied', 404));
    }

    // Initialize isVerified object if it doesn't exist
    user.isVerified = user.isVerified || {};
    user.isVerified.phone = true;

    // Also update the phone array verification status
    if (user.phone && user.phone.length > 0) {
        user.phone.forEach(phoneEntry => {
            if (phoneEntry.isDefault) {
                phoneEntry.verified = true;
            }
        });
    }

    await user.save();
    const newUser = await dataModel.findOne({ userId });
    console.log("updateUserProfileById user:", newUser);
    return {
        success: true,
        message: 'Phone verified successfully',
        // data: {
        //      user
        // }
    };
});

// Verify Name
exports.verifyName = catchAsync(async (req, dataModel, next) => {

    const { userId } = req.params;

    const user = await dataModel.findOne({
        userId: userId,
        referredBy: req.user.referralCode
    });

    if (!user) {
        return next(new AppError('User not found or access denied', 404));
    }

    user.isNameVerified = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Name verified successfully',
        data: {
            isNameVerified: user.isNameVerified
        }
    });
    return {
        success: true,
        message: 'Email verified successfully',
        data: {
            isVerified: user.isVerified
        }
    };
});

// Verify Birthday
exports.verifyBirthday = catchAsync(async (req, dataModel, next) => {

    const { userId } = req.params;

    const user = await dataModel.findOne({
        userId: userId,
        referredBy: req.user.referralCode
    });

    if (!user) {
        return next(new AppError('User not found or access denied', 404));
    }

    user.isBirthdayVerified = true;
    await user.save();

    return {
        success: true,
        message: 'Email verified successfully',
        data: {
            isVerified: user.isVerified
        }
    }
});






exports.updateProfile = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { firstName, lastName, birthday, phone, whatsapp } = req.body;

    const user = await dataModel.findOneAndUpdate(
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



//////////////dwonline////////////

// exports.buildDownlineTree = async (model, referralCode) => {
//     const downline = await model.find({ referredBy: referralCode });
//     const tree = [];

//     for (const node of downline) {
//         const children = await buildDownlineTree(model, node.referralCode);
//         tree.push({
//             id: node._id,
//             name: node.name,
//             referralCode: node.referralCode,
//             referredBy: node.referredBy,
//             role: node.role,
//             children
//         });
//     }

//     return tree; // reusable, no response sent
// };



exports.GetNewFromUserList = async (parentModel, dataModel, user, queryParams, res) => {
    try {
        const { page = 1, limit = 10, userId, email, phone } = queryParams;

        if (!user) return { success: false, message: "User data is required" };

        const parent = await parentModel.findOne({ referralCode: user.referralCode || null });
        console.log("parent", parent);
        if (!parent) return { success: false, message: "Parent not found" };

        const filters = { referredBy: parent.referralCode };
        if (userId) filters.userId = userId;
        if (email) filters.email = { $regex: email, $options: "i" };
        if (phone) filters["phone.number"] = phone;

        const total = await dataModel.countDocuments(filters);
        console.log("total", total);
        const users = await dataModel.aggregate([
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
                    role: 1,
                    createdAt: 1 // Added since you're sorting by it
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * Number(limit) },
            { $limit: Number(limit) }
        ]);

        // console.log("users", users);

        return {
            success: true,
            data: users,

        }

    } catch (err) {
        console.error("GetUserList Error:", err);
        return { success: false, message: "Server error" };
    }
};

exports.GetDownlineList = async (parentModel, dataModel, user, queryParams) => {
    try {
        const { page = 1, limit = 10, userId, email, phone } = queryParams;

        if (!user) return { success: false, message: "User data is required" };

        const parent = await parentModel.findOne({ referralCode: user.referralCode });
        if (!parent) return { success: false, message: "Parent not found" };

        const filters = { referredBy: parent.referralCode };

        if (userId) filters.userId = userId;
        if (email) filters.email = { $regex: email, $options: "i" };
        if (phone) filters["phone.number"] = phone;

        const total = await dataModel.countDocuments(filters);

        const users = await dataModel.aggregate([
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
                    role: 1,
                    createdAt: 1
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * Number(limit) },
            { $limit: Number(limit) }
        ]);

        return {
            success: true,
            total,
            currentPage: Number(page),
            data: users
        };

    } catch (err) {
        console.error("GetDownlineList Error:", err);
        return { success: false, message: "Server error" };
    }
};

exports.GetFullDownlineTree = async (parentModel, childModel, subChildModel, user) => {
    try {
        if (!user) return { success: false, message: "User not found" };

        // GET PARENT
        const parent = await parentModel.findOne({ referralCode: user.referralCode });
        if (!parent) return { success: false, message: "Parent not found" };

        // STEP 01: Get Child list (Ex: SubAgent)
        const children = await buildDownlineTree(childModel, parent.referralCode);

        // STEP 02: For each Child → attach sub-child users (Ex: Users)
        for (const child of children) {
            child.users = await buildDownlineTree(subChildModel, child.referralCode);
        }

        return {
            success: true,

            parent: {
                id: parent._id,
                userId: parent.userId,
                name: parent.name,
                role: parent.role,
                referralCode: parent.referralCode
            },

            children // includes children + their users
        };

    } catch (error) {
        console.error("GetFullDownlineTree Error", error);
        return { success: false, message: "Server error" };
    }
};


exports.GetDirectDownlineTree = async (parentModel, childModel, subChildModel, user) => {
    try {

        console.log("user", user.userId, user.role, user.referralCode);

        let referredByFilter;
        if (user.role === 'Admin') {
            referredByFilter = {
                $or: [
                    { referredBy: "1" }, // root admin referral code
                    { referredBy: null },
                    { referredBy: undefined }
                ]
            };
        } else {
            referredByFilter = { referredBy: user.referralCode };
        }

        // Find parent
        const parent = await parentModel.findOne(referredByFilter);
        console.log("parent", parent);
        if (!parent) return { success: false, message: "Parent not found" };
        let referredByFilterNew;
        if (parent.role === 'Admin') {
            referredByFilterNew = "1" || null || undefined



        } else {
            referredByFilterNew =  parent.referralCode
        }
        // STEP 01: Get Child list (Ex: SubAgent)

        const children = await buildDownlineTree(childModel, referredByFilterNew);
        // STEP 02: Attach ONLY direct child.users
        const resultChildren = [];

        for (const child of children) {
            const directUsers = await subChildModel.find({ referredBy: child.referralCode });
            directUsers.forEach(u => {
                resultChildren.push({
                    id: u._id,
                    userId: u.userId,
                    name: u.name,
                    referralCode: u.referralCode,
                    role: u.role,
                    email: u.email,
                    phone: u.phone,
                    balance: u.balance,
                    isVerified: u.isVerified,
                    isActive: u.isActive,
                    createdAt: u.createdAt,
                    last_game_id: u.last_game_id,
                    last_login: u.last_login
                });
            });
        }

        return {
            success: true,

            // parent: {
            //     id: parent._id,
            //     userId: parent.userId,
            //     name: parent.name,
            //     role: parent.role,
            //     referralCode: parent.referralCode
            // },

            resultChildren
        };

    } catch (error) {
        console.error("GetFullDownlineTree Error", error);
        return { success: false, message: "Server error" };
    }
};


const buildDownlineTree = async (model, referralCode) => {
    const downline = await model.find({ referredBy: referralCode });

    const result = [];

    for (const node of downline) {
        const children = await buildDownlineTree(model, node.referralCode);

        result.push({
            _id: node._id,
            userId: node.userId,
            name: node.name,
            email: node.email,
            phone: node.phone,
            referralCode: node.referralCode,
            referredBy: node.referredBy,
            balance: node.balance,
            role: node.role,
            createdAt: node.createdAt,
            children
        });
    }

    return result;
};
