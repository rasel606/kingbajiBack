// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const AffiliateModel = require('../Models/AffiliateModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const SubAdmin = require('../Models/SubAdminModel');
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// Register new user
// exports.register = catchAsync(async (req, res, next) => {
//   const { username, email, password, firstName, lastName, dateOfBirth, referredBy } = req.body;

//   // Check if user exists
//   const existingUser = await Affiliate.findOne({
//     $or: [{ email }, { username: username }]
//   });

//   if (existingUser) {
//     return next(new AppError('User already exists with this email or username', 400));
//   }


//   if (referredBy) {
//     const referringAffiliate = await SubAdmin.findOne({ referralCode: referredBy });
//     if (referringAffiliate) {
//       // Update affiliate's player count
//       await SubAdmin.findByIdAndUpdate(referringAffiliate._id, {
//         $inc: { Affiliate: 1 }
//       });
//     }
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//   // Create affiliate profile if not already exists
//   const user = await Affiliate.create({

//     userId: username,
//     email,
//     password: hashedPassword,
//     firstName,
//     lastName,
//     dateOfBirth,
//     referredBy: referredBy || null,
//     referralCode
//   });

//   // Create user


//   // If user was referred by someone, check if referrer is an affiliate


//   res.status(201).json({
//     success: true,
//     data: {
//       userId: user.userId,
//       username: user.username,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       referralCode: user.referralCode,
//       token: generateToken(user.userId),
//     }
//   });
// });

// Login user
// exports.login = catchAsync(async (req, res, next) => {
//   const { userId, password } = req.body;
//   console.log(req.body);
//   // Check if username and password exist
//   if (!userId || !password) {
//     return next(new AppError('Please provide username and password', 400));
//   }
//   console.log(" console.log(req.body);", req.body);
//   // Find user
//   // const user = await Affiliate.findOne({
//   //   $or: [{ userId }, { userId: userId }]
//   // }).select('+password');
//   // console.log(user);
//   // const isPasswordValid = await user.comparePassword(password);
//   // if (!isPasswordValid) {
//   //   return next(new AppError('Incorrect password', 401));
//   // }
//   // const isPasswordValid = await bcrypt.compare(password, Affiliate.password);
//   //     if (!isPasswordValid) {
//   //       return res.status(401).json({ message: "Invalid password" });
//   //     }

//   // Update last login

//   const user = await Affiliate.findOne({ userId }).select('+password');
//   if (!user) throw new AppError('User not found', 404);

//   const isPasswordValid = await user.comparePassword(password); // instance method
//   if (!isPasswordValid) throw new AppError('Incorrect password', 401);

//   user.lastLogin = new Date();
//   await user.save();

//   res.json({
//     success: true,
//     data: {
//       userId: user.userId,
//       username: user.username,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       token: generateToken(user.userId),
//     }
//   });
// });


// Register new user
exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password, firstName, lastName, dateOfBirth, referredBy } = req.body;

  // Check if user exists
  const existingUser = await AffiliateModel.findOne({
    $or: [{ email }, { userId: username }]
  });

  if (existingUser) {
    return next(new AppError('User already exists with this email or username', 400));
  }

  // Handle referral
  if (referredBy) {
    const referringAffiliate = await SubAdmin.findOne({ referralCode: referredBy });
    if (referringAffiliate) {
      // Increment affiliate's player count
      await SubAdmin.findByIdAndUpdate(referringAffiliate._id, {
        $inc: { Affiliate: 1 }
      });
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate unique referral code
  const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Create affiliate user
  const user = await AffiliateModel.create({
    userId: username,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    dateOfBirth,
    referredBy: referredBy || null,
    referralCode
  });

  // Respond with user data and token
  res.status(201).json({
    success: true,
    data: {
      userId: user.userId,
      username: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      token: generateToken(user.userId),
    }
  });
});


// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { userId, password } = req.body;
console.log(req.body);
  // Check if username and password exist
  if (!userId || !password) {
    return next(new AppError('Please provide username and password', 400));
  }

  // Find user and include password explicitly
  const user = await AffiliateModel.findOne({ userId }).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
console.log(user);
  // Ensure password exists in DB
  // if (!user.password) {
  //   return next(new AppError('Password not set for this user', 500));
  // }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError('Incorrect password', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Respond with user data and token
  res.status(200).json({
    success: true,
    data: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      token: generateToken(user.userId),
    },
    message: 'Login successful'
  });

  console.log({
    success: true,
    data: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      token: generateToken(user.userId),
    },
    message: 'Login successful'
  });
});


// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  console.log(req.user);
  const user = await AffiliateModel.findOne({ userId: req.user.userId }).select('-password');
if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.json({
    success: true,
    data: user
  });
});

// Change password
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await  AffiliateModel.findOne({ userId: req.user.userId }).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});