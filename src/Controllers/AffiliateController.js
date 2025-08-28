const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
// const AffiliateModel = require("../Models/AffiliateModel");
const User = require("../Models/User");
const asyncHandler = require('express-async-handler');
// const sendEmail = require("../Services/sendEmail");
const TurnOverModal = require("../Models/TurnOverModal");
const { promisify } = require('util');
  const generateReferralCode = require('../Services/generateReferralCode');
const Verification = require('../Models/Verification');
const AffiliateModel = require('../Models/AffiliateModel');

const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";
const signToken = id => {

  console.log(id)
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
 const cookieOptions = {
  expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'
};

  
  res.cookie('jwt', token, cookieOptions);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// 🔧 Register Affiliate
exports.registerAffiliate = async (req, res, next) => {
  
  try {
    const {
      userId, password, firstName, lastName, dateOfBirth, currencyType,
      phoneNumber, email, contactType, otherCallingCode, contactTypeValue, referredBy
    } = req.body;
console.log("registerAffiliate",req.body);
    const existingUser = await AffiliateModel.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this username or email'
      });
    }

    let referralCode;
referralCode = generateReferralCode();



    const newUser = await AffiliateModel.create({
      userId, password, firstName, lastName, dateOfBirth, currencyType,
      phoneNumber, email, contactType, otherCallingCode, contactTypeValue, referredBy,
      referralCode
    });

    // 🔑 Generate Email Token (Optional for future verification)
    const verificationToken = crypto.randomBytes(20).toString('hex');
    newUser.verificationToken = verificationToken;
    await newUser.save({ validateBeforeSave: false });

    // You can enable email logic here
    // const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;
    // await sendEmail({...})

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// 🔑 Login
exports.Affiliate_login = async (req, res, next) => {
    try {
        const { userId, password } = req.body;
        console.log("login token user",userId)
        // 1) Check if userId and password exist
        if (!userId || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide userId and password'
            });
        }
        
        // 2) Check if user exists and password is correct
        const user = await AffiliateModel.findOne({ userId }).select('+password');
        console.log(" user",user)
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect userId or password'
            });
        }
        // console.log(user)
        // 3) If everything ok, send token to client
        const token = signToken(user._id); // Implement JWT or your auth token
        console.log("token",token)
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};






exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there

    console.log("protect - Affiliate------------2", req.headers.authorization);
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }
    console.log("token",token)
    // 2) Verification token
    const decoded = await jwt.verify(token,JWT_SECRET);
    console.log("decoded---------------1",decoded);
    // 3) Check if user still exists
    const currentUser = await AffiliateModel.findById(decoded.id) || await AffiliateModel.findById(decoded.id);
console.log("currentUser-------1",currentUser);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.'
      });
    }
   
    
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
     console.log("currentUser  req.user.id",req.user._id)
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.sendVerification = asyncHandler(async (req, res) => {
  const { contactType, contactValue } = req.body;
  const userId = req.user._id;

  // Generate random 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // Expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const user = await AffiliateModel.findOne({ userId })
  // Create verification record
  const verification = await Verification.create({
    userId:user.userId,
    contactType,
    contactValue,
    code,
    expiresAt
  });

  // Send code via email or SMS
  if (contactType === 'email') {
    await sendVerificationEmail(contactValue, code);
  } else {
    await sendVerificationSMS(contactValue, code);
  }

  res.json({ message: 'Verification code sent' });
});



exports.verifyCode = asyncHandler(async (req, res) => {
  const { contactType, contactValue, code } = req.body;
  const userId = req.user._id;

  // Find verification record
  const verification = await Verification.findOne({
    userId,
    contactType,
    contactValue,
    code
  });

  if (!verification || verification.expiresAt < new Date()) {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }

  // Mark as verified
  verification.verified = true;
  verification.verifiedAt = new Date();
  await verification.save();

  // Update user's verified status
  const user = await  AffiliateModel.findById(userId);
  if (contactType === 'email') {
    user.isVerified = true;
  } else if (contactType === 'phone') {
    user.phoneVerified = true;
  }
  await user.save();

  res.json({ message: 'Verification successful' });
});


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};





exports.getProfile = async (req, res) => {

  console.log("user get",req.body)
  try {
    const user = await AffiliateModel.find(req.body.user);
    
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
 
    const getUser = user[0]

    
    res.status(200).json({
      status: 'success',
      data: {
        user : getUser
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};




exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await AffiliateModel.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { firstName, lastName, dob, email, phone, whatsapp } = req.body;

  // Email update check
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const emailExists = await AffiliateModel.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    user.email = email.toLowerCase();
    user.isVerified = false;
  }

  // Phone update check
  if (phone && phone !== user.phone) {
    const phoneExists = await AffiliateModel.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }
    user.phone = phone;
    user.phoneVerified = false;
  }

  if (typeof firstName === 'string') user.firstName = firstName;
  if (typeof lastName === 'string') user.lastName = lastName;
  if (dob) user.dob = dob;
  if (typeof whatsapp === 'string') user.whatsapp = whatsapp;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    userId: updatedUser.userId,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    whatsapp: updatedUser.whatsapp,
    dob: updatedUser.dob,
    status: updatedUser.status,
    isVerified: updatedUser.isVerified,
    phoneVerified: updatedUser.phoneVerified,
  });
});


const updatePassword = asyncHandler(async (req, res) => {
  const user = await AffiliateModel.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { currentPassword, newPassword } = req.body;

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});




 exports.addBankAccount = asyncHandler(async (req, res) => {
  const user = await AffiliateModel.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { bankName, accountNumber, accountName, branch, isDefault } = req.body;

  if (!bankName || !accountNumber || !accountName || !branch) {
    res.status(400);
    throw new Error('All bank details are required');
  }

  const exists = user.bankAccounts.find(acc => acc.accountNumber === accountNumber);
  if (exists) {
    res.status(400);
    throw new Error('Bank account already exists');
  }

  if (isDefault) {
    user.bankAccounts = user.bankAccounts.map(account => ({
      ...account.toObject(),
      isDefault: false
    }));
  }

  user.bankAccounts.push({
    bankName,
    accountNumber,
    accountName,
    branch,
    isDefault: !!isDefault
  });

  await user.save();
  res.status(201).json(user.bankAccounts);
});
// exports.getProfile = async (req, res) => {

//   console.log("user get",req.body)
//   try {
//     const user = await AffiliateModel.find(req.body.user);
    
//     if (!user) {
//       return res.status(404).json({ status: 'fail', message: 'User not found' });
//     }
 
//     const getUser = user[0]

    
//     res.status(200).json({
//       status: 'success',
//       data: {
//         user : getUser
//       }
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };


// exports.updateProfile = async (req, res) => {
//   try {
//     const { firstName, lastName, dob, contactInfo } = req.body;
    
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { firstName, lastName, dob, contactInfo },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user
//       }
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// exports.updatePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
    
//     const user = await User.findById(req.user._id).select('+password');
    
//     if (!(await user.comparePassword(currentPassword))) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'Your current password is wrong.'
//       });
//     }

//     user.password = newPassword;
//     await user.save();

//     res.status(200).json({
//       status: 'success',
//       message: 'Password updated successfully!'
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };






// 🚪 Logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

// // 🤖 Generate Captcha (basic)
// exports.generateCaptcha = (req, res) => {
//   const captchaText = Math.floor(1000 + Math.random() * 9000).toString();
//   const captchaImg = `/captcha/af?${Date.now()}`;

//   res.status(200).json({
//     status: 'success',
//     data: { captchaText, captchaImg }
//   });
// };








// const sendVerificationEmail = async (user, req, res) => {
//   const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${user.verificationToken}`;

//   const message = `Please verify your email by clicking on this link:\n\n${verificationUrl}`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Affiliate Account Email Verification',
//       message,
//     });
//   } catch (error) {
//     user.verificationToken = undefined;
//     await user.save({ validateBeforeSave: false });

//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to send verification email, try again later',
//     });
//   }
// };

// // 1️⃣ Email verification route handler
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const user = await AffiliateModel.findOne({ verificationToken: token });

//     if (!user) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid or expired verification token',
//       });
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     await user.save({ validateBeforeSave: false });

//     res.status(200).json({
//       status: 'success',
//       message: 'Email verified successfully',
//     });
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };

// // 2️⃣ Request Password Reset
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await AffiliateModel.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'No user found with that email',
//       });
//     }

//     // const rawToken = crypto.randomBytes(20).toString('hex');
//     // user.verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     await user.save({ validateBeforeSave: false });

//     const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/reset-password/${resetToken}`;

//     const message = `You requested a password reset. Use this link within 10 minutes:\n\n${resetUrl}`;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: 'Password Reset Request',
//         message,
//       });

//       res.status(200).json({
//         status: 'success',
//         message: 'Password reset email sent',
//       });
//     } catch (err) {
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return res.status(500).json({
//         status: 'error',
//         message: 'Could not send email. Try again later',
//       });
//     }
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };

// // 3️⃣ Reset password with token
// exports.resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     const user = await AffiliateModel.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Token is invalid or has expired'
//       });
//     }

//     user.password = password; // will be hashed in pre-save middleware
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;

//     await user.save();

//     createSendToken(user, 200, res);
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };



const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});




// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    const affiliateId = req.user._id;
    
    // Check available balance
    const affiliate = await AffiliateModel.findById(affiliateId);
    if (affiliate.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }
    
    // Check minimum withdrawal amount
    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        error: 'Minimum withdrawal amount is 1000 BDT'
      });
    }
    
    // Create withdrawal request
    const withdrawal = new AffiliateWithdrawal({
      affiliateId,
      amount,
      bankDetails
    });
    
    await withdrawal.save();
    
    // Update affiliate balance (hold the amount)
    affiliate.availableBalance -= amount;
    affiliate.withdrawnAmount += amount;
    await affiliate.save();
    
    res.status(201).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

//////////////////////////////////////////// getAffiliateDeposits //////////////////////////////////

// // এফিলিয়েট ইউজারদের ডিপোজিট ডাটা বের করা
// // app.get("/affiliate/deposits/:affiliateId", 
//   exports.getAffiliateDeposits = async (req, res) => {
//   try {
//     const affiliateId = req.params.affiliateId;
//     const now = new Date();
//     const last7Days = new Date(now);
//     last7Days.setDate(last7Days.getDate() - 7);

//     const prev7Days = new Date(last7Days);
//     prev7Days.setDate(prev7Days.getDate() - 7);

//     // প্রথম লেভেলের ইউজার খোঁজা
//     const users = await User.find({ referrerId: affiliateId }).select("_id");
//     const userIds = users.map((user) => userId);

//     // ট্রান্সজেকশন অ্যাগ্রিগেশন
//     const deposits = await Transaction.aggregate([
//       {
//         $match: {
//           userId: { $in: userIds },
//           type: "deposit",
//           createdAt: { $gte: prev7Days },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             period: {
//               $cond: [{ $gte: ["$createdAt", last7Days] }, "last_7_days", "prev_7_days"],
//             },
//           },
//           totalDeposit: { $sum: "$amount" },
//         },
//       },
//     ]);

//     // রেসপন্স ফরম্যাটিং
//     let result = { last_7_days: 0, prev_7_days: 0 };
//     deposits.forEach((dep) => {
//       result[dep._id.period] = dep.totalDeposit;
//     });

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

//////////////////////////////////////////////////// getAffiliateUsersStats //////////////////////////////////

// // app.get("/affiliate/users/stats/:affiliateId", 
// exports.getAffiliateUsersStats = async (req, res) => {
//   try {
//     const { affiliateId } = req.params;
    
//     // তারিখের সীমা সেট করা
//     const today = moment().startOf("day").toDate();
//     const yesterday = moment().subtract(1, "days").startOf("day").toDate();
//     const last7Days = moment().subtract(7, "days").startOf("day").toDate();
//     const prev7Days = moment().subtract(14, "days").startOf("day").toDate();
//     const startOfMonth = moment().startOf("month").toDate();
//     const startOfLastMonth = moment().subtract(1, "months").startOf("month").toDate();
//     const endOfLastMonth = moment().subtract(1, "months").endOf("month").toDate();

//     // MongoDB Aggregation Pipeline
//     const stats = await User.aggregate([
//       {
//         $match: { affiliateId: new mongoose.Types.ObjectId(affiliateId) },
//       },
//       {
//         $group: {
//           _id: null,
//           today: { $sum: { $cond: [{ $gte: ["$createdAt", today] }, 1, 0] } },
//           yesterday: { $sum: { $cond: [{ $gte: ["$createdAt", yesterday], $lt: ["$createdAt", today] }, 1, 0] } },
//           last7Days: { $sum: { $cond: [{ $gte: ["$createdAt", last7Days] }, 1, 0] } },
//           prev7Days: { $sum: { $cond: [{ $gte: ["$createdAt", prev7Days], $lt: ["$createdAt", last7Days] }, 1, 0] } },
//           thisMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0] } },
//           lastMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfLastMonth], $lt: ["$createdAt", endOfLastMonth] }, 1, 0] } },
//         },
//       },
//     ]);

//     res.json(stats[0] || {
//       today: 0,
//       yesterday: 0,
//       last7Days: 0,
//       prev7Days: 0,
//       thisMonth: 0,
//       lastMonth: 0,
//     });

//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }



// ///////////////////////////////////////// getAffiliateFirstDeposits //////////////////////////////////////////////


// // router.get('/affiliate-deposits/:affiliateId', 
  
//   exports.getAffiliateFirstDeposits = async (req, res) => {
//   try {
//     const { affiliateId } = req.params;
//     const today = moment().startOf('day');
//     const yesterday = moment().subtract(1, 'days').startOf('day');
//     const last7Days = moment().subtract(7, 'days').startOf('day');
//     const prev7Days = moment().subtract(14, 'days').startOf('day');
//     const startOfMonth = moment().startOf('month');
//     const startOfLastMonth = moment().subtract(1, 'months').startOf('month');
//     const endOfLastMonth = moment().subtract(1, 'months').endOf('month');

//     const pipeline = [
//       { $match: { affiliateId } },
//       { $sort: { createdAt: 1 } },
//       { $group: { _id: "$userId", firstDeposit: { $first: "$createdAt" }, amount: { $first: "$amount" } } }
//     ];

//     const firstDeposits = await Transaction.aggregate(pipeline);

//     const result = {
//       today: firstDeposits.filter(d => moment(d.firstDeposit).isSame(today, 'day')),
//       yesterday: firstDeposits.filter(d => moment(d.firstDeposit).isSame(yesterday, 'day')),
//       last7Days: firstDeposits.filter(d => moment(d.firstDeposit).isBetween(last7Days, today, 'day', '[]')),
//       prev7Days: firstDeposits.filter(d => moment(d.firstDeposit).isBetween(prev7Days, last7Days, 'day', '[]')),
//       thisMonth: firstDeposits.filter(d => moment(d.firstDeposit).isSameOrAfter(startOfMonth)),
//       lastMonth: firstDeposits.filter(d => moment(d.firstDeposit).isBetween(startOfLastMonth, endOfLastMonth, 'day', '[]'))
//     };

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }



// ////////////////////////////////////////////////// getAffiliateWithdrawals //////////////////////////////////////////////

// // app.get("/affiliate/withdrawals/:affiliateId", 
//   exports.getAffiliateWithdrawals = async (req, res) => {
//   try {
//     const { affiliateId } = req.params;
//     const now = new Date();
    
//     const startOfToday = new Date(now.setHours(0, 0, 0, 0));
//     const startOfYesterday = new Date(new Date().setDate(new Date().getDate() - 1));
//     const startOf7DaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
//     const startOfPrevious7Days = new Date(new Date().setDate(new Date().getDate() - 14));
//     const startOfMonth = new Date(new Date().setDate(1));
//     const startOfLastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1, 1));
//     const endOfLastMonth = new Date(new Date().setDate(0));

//     const withdrawals = await Transaction.aggregate([
//       {
//         $match: { 
//           affiliateId: new mongoose.Types.ObjectId(affiliateId), 
//           type: "withdraw"
//         }
//       },
//       {
//         $group: {
//           _id: {
//             $cond: [
//               { $gte: ["$createdAt", startOfToday] }, "today",
//               { $gte: ["$createdAt", startOfYesterday] }, "yesterday",
//               { $gte: ["$createdAt", startOf7DaysAgo] }, "last_7_days",
//               { $gte: ["$createdAt", startOfPrevious7Days] }, "previous_7_days",
//               { $gte: ["$createdAt", startOfMonth] }, "this_month",
//               { $gte: ["$createdAt", startOfLastMonth], $lte: ["$createdAt", endOfLastMonth] }, "last_month",
//               "older"
//             ]
//           },
//           totalAmount: { $sum: "$amount" },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     res.json(withdrawals);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }


// //////////////////////////////////////////// getAffiliateBonuses //////////////////////////////////////////


// // app.get('/affiliate/bonuses', 
  
//   exports.getAffiliateBonuses = async (req, res) => {
//   const affiliateUserId = req.query.affiliateUserId; // এফিলিয়েটরের userId
//   const firstUsersLimit = 10; // প্রথম ১০ জন ইউজার

//   try {
//     // প্রথম কয়েকটি ইউজার খুঁজে বের করা
//     const users = await User.find({ affiliateId: affiliateUserId }).limit(firstUsersLimit);

//     // প্রতিটি ইউজারের জন্য বোনাস হিসাব করা
//     const bonuses = await Promise.all(users.map(async (user) => {
//       const userBonuses = await Bonus.aggregate([
//         { $match: { userId: userId } },
//         {
//           $project: {
//             userId: 1,
//             amount: 1,
//             date: 1,
//             todayBonus: {
//               $cond: [
//                 { $gte: [{ $subtract: [new Date(), '$date'] }, 86400000] }, // 1 দিন
//                 '$amount',
//                 0
//               ]
//             },
//             yesterdayBonus: {
//               $cond: [
//                 { $gte: [{ $subtract: [new Date(), '$date'] }, 172800000] }, // 2 দিন
//                 '$amount',
//                 0
//               ]
//             },
//             last7DaysBonus: {
//               $cond: [
//                 { $gte: [{ $subtract: [new Date(), '$date'] }, 604800000] }, // 7 দিন
//                 '$amount',
//                 0
//               ]
//             },
//             thisMonthBonus: {
//               $cond: [
//                 { $gte: [{ $month: '$date' }, moment().month() + 1] },
//                 '$amount',
//                 0
//               ]
//             },
//             lastMonthBonus: {
//               $cond: [
//                 { $gte: [{ $month: '$date' }, moment().month()] },
//                 '$amount',
//                 0
//               ]
//             },
//           }
//         }
//       ]);

//       return {
//         userId: userId,
//         bonuses: userBonuses,
//       };
//     }));

//     res.json(bonuses);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching bonuses');
//   }
// }




// ////////////////////////////////////////////// getAffiliateRefferalBonuses //////////////////////////////////////////

// const calculateCommissions = async (affiliateId) => {
//   const todayStart = getStartOfDay(new Date());
//   const yesterdayStart = getStartOfDay(moment().subtract(1, 'day').toDate());
//   const last7DaysStart = getStartOfDay(moment().subtract(7, 'days').toDate());
//   const prev7DaysStart = getStartOfDay(moment().subtract(14, 'days').toDate());
//   const thisMonthStart = getStartOfMonth(new Date());
//   const lastMonthStart = getStartOfPreviousMonth(new Date());

//   const pipeline = [
//     {
//       $match: {
//         referredBy: mongoose.Types.ObjectId(affiliateId),
//       }
//     },
//     {
//       $unwind: '$commissionHistory'
//     },
//     {
//       $project: {
//         userId: 1,
//         commissionHistory: 1,
//         isToday: { $gte: ['$commissionHistory.date', todayStart] },
//         isYesterday: { $and: [{ $gte: ['$commissionHistory.date', yesterdayStart] }, { $lt: ['$commissionHistory.date', todayStart] }] },
//         isLast7Days: { $gte: ['$commissionHistory.date', last7DaysStart] },
//         isPrev7Days: { $and: [{ $gte: ['$commissionHistory.date', prev7DaysStart] }, { $lt: ['$commissionHistory.date', last7DaysStart] }] },
//         isThisMonth: { $gte: ['$commissionHistory.date', thisMonthStart] },
//         isLastMonth: { $and: [{ $gte: ['$commissionHistory.date', lastMonthStart] }, { $lt: ['$commissionHistory.date', thisMonthStart] }] }
//       }
//     },
//     {
//       $group: {
//         _id: '$userId',
//         totalCommissionToday: { $sum: { $cond: [{ $eq: ['$isToday', true] }, '$commissionHistory.commission', 0] } },
//         totalCommissionYesterday: { $sum: { $cond: [{ $eq: ['$isYesterday', true] }, '$commissionHistory.commission', 0] } },
//         totalCommissionLast7Days: { $sum: { $cond: [{ $eq: ['$isLast7Days', true] }, '$commissionHistory.commission', 0] } },
//         totalCommissionPrev7Days: { $sum: { $cond: [{ $eq: ['$isPrev7Days', true] }, '$commissionHistory.commission', 0] } },
//         totalCommissionThisMonth: { $sum: { $cond: [{ $eq: ['$isThisMonth', true] }, '$commissionHistory.commission', 0] } },
//         totalCommissionLastMonth: { $sum: { $cond: [{ $eq: ['$isLastMonth', true] }, '$commissionHistory.commission', 0] } }
//       }
//     }
//   ];

//   const commissions = await User.aggregate(pipeline);
//   return commissions;
// };

// // app.get('/affiliate/commissions/:affiliateId', 
  
//   exports.getAffiliateCommissions = async (req, res) => {
//   const { affiliateId } = req.params;
//   try {
//     const commissions = await calculateCommissions(affiliateId);
//     res.json(commissions);
//   } catch (err) {
//     res.status(500).json({ error: 'Error calculating commissions' });
//   }
// }


// ///////////////////////////////////////  Turnover Controller  /////////////////////////////////////////

// const getDateRange = (range) => {
//   const today = new Date();
//   let startDate;
//   switch (range) {
//     case 'today':
//       startDate = new Date(today.setHours(0, 0, 0, 0));
//       break;
//     case 'yesterday':
//       startDate = new Date(today.setDate(today.getDate() - 1));
//       startDate.setHours(0, 0, 0, 0);
//       break;
//     case 'last7':
//       startDate = new Date(today.setDate(today.getDate() - 7));
//       break;
//     case 'prev7':
//       startDate = new Date(today.setDate(today.getDate() - 14));
//       startDate.setDate(startDate.getDate() + 7);
//       break;
//     case 'thisMonth':
//       startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//       break;
//     case 'lastMonth':
//       startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//       break;
//     default:
//       startDate = new Date(today.setFullYear(today.getFullYear() - 1)); // Default to last year
//   }
//   return startDate;
// };

// // Get turnover data for a specific range
// // router.get('/turnover/:range', 
  
//   exports.getTurnoverData = async (req, res) => {
//   const { range } = req.params;
//   const startDate = getDateRange(range);

//   try {
//     const turnovers = await TurnOverModal.aggregate([
//       {
//         $match: {
//           date: { $gte: startDate },
//         },
//       },
//       {
//         $group: {
//           _id: '$userId',
//           totalTurnover: { $sum: '$turnoverAmount' },
//         },
//       },
//     ]);

//     res.json(turnovers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }

