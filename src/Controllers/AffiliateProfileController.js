// controllers/profileController.js
const User = require('../models/User');
const Affiliate = require('../models/AffiliateModel');
const AffiliateEarnings = require('../models/AffiliateUserEarnings');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { getPeriodDates } = require('../utils/periodUtils');

// Get user profile
exports.getProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  console.log(userId);
  const user = await Affiliate.findOne({ userId });
  const affiliate = await Affiliate.findOne({ userId });
  
  if (!user || !affiliate) {
    return next(new AppError('Profile not found', 404));
  }

  // Get current period commission data
  const { currentPeriodStart } = getPeriodDates();
  const currentCommission = await AffiliateEarnings.findOne({
    affiliateId: affiliate._id,
    period: currentPeriodStart
  });

  const profileData = {
    user: {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dateOfBirth,
      lastWithdrawalTime: user.lastWithdrawalTime,
      status: user.status,
      approvedDate: user.approvedAt,
      lastLogin: user.lastLogin,
      referralCode: user.referralCode
    },
    contactInfo: {
     phone: affiliate.phoneNumber || '',
      email: affiliate.email,
      whatsapp: affiliate.whatsapp || '',
      callingCode: affiliate.callingCode,
    },
    earnings: currentCommission?.breakdown || {
      ggr: 0,
      jackpotCost: 0,
      deduction: 0,
      turnover: 0,
      bonus: 0,
      recycleBalance: 0,
      cancelFee: 0,
      vipCashBonus: 0,
      revenueAdjustment: 0,
      referralCommission: 0,
      paymentFee: 0,
      negativeProfit: 0,
      netProfit: 0,
      commissionPercent: affiliate.commissionRate * 100,
      potentialAmount: currentCommission?.finalCommission || 0
    },
    commission: {
      pending: affiliate.pendingCommission,
      available: affiliate.availableCommission,
      processing: 0
    }
  };

  res.status(200).json({
    success: true,
    data: profileData
  });
});


exports.updateProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { firstName, lastName, dateOfBirth, phone, whatsapp } = req.body;

  const user = await User.findOneAndUpdate(
    { userId },
    { firstName, lastName, dateOfBirth, phone, whatsapp },
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


// Update profile
const verificationCodes = new Map();

exports.requestVerificationCode = catchAsync(async (req, res, next) => {
  const { contactType, content } = req.body;
  const { userId } = req.user;
  
  // Generate verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store verification code with expiration (5 minutes)
  const codeData = {
    code: verificationCode,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    userId,
    contactType,
    content
  };
  
  verificationCodes.set(`${userId}-${contactType}`, codeData);
   if (contactType === 'email') {
      await sendVerificationEmail(contactValue, code);
    } else if (contactType === 'phone') {
      await sendVerificationSMS(contactValue, code);
    }

  // In production, you would integrate with SMS/email service here
  console.log(`Verification code for ${content}: ${verificationCode}`);
  
  res.status(200).json({
    success: true,
    message: 'Verification code sent',
    code: verificationCode // Remove this in production
  });
});

exports.verifyContact = catchAsync(async (req, res, next) => {
  const { contactType, code } = req.body;
  const { userId } = req.user;
  
  const storedCode = verificationCodes.get(`${userId}-${contactType}`);
  
  if (!storedCode) {
    return next(new AppError('No verification code found', 400));
  }
  
  if (Date.now() > storedCode.expiresAt) {
    verificationCodes.delete(`${userId}-${contactType}`);
    return next(new AppError('Verification code expired', 400));
  }
  
  if (storedCode.code !== code) {
    return next(new AppError('Invalid verification code', 400));
  }
  
  // Code is valid - update user verification status
  const user = await User.findOneAndUpdate(
    { userId },
    { 
      isVerified: true,
      [`${contactType}Verified`]: true 
    },
    { new: true }
  );
  
  // Remove used code
  verificationCodes.delete(`${userId}-${contactType}`);
  
  res.status(200).json({
    success: true,
    message: 'Contact verified successfully'
  });
});



exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Affiliate.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};