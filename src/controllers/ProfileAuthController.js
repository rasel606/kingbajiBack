// controllers/ProfileAuthController.js
const User = require('../models/User');
const Affiliate = require('../models/AffiliateModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// =============================================
// GET USER PROFILE
// =============================================

exports.getProfile = catchAsync(async (req, res, next) => {
  console.log('DEBUG getProfile - req.user:', req.user ? {_id: req.user._id, userId: req.user.userId, email: req.user.email, role: req.user.role} : 'undefined');
  
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }
  
  const userId = req.user.userId || req.user._id;
  const role = req.user.role;

  console.log('DEBUG getProfile - userId:', userId, 'role:', role);

  let user;

  if (role === 'affiliate') {
    user = await Affiliate.findById(userId).select('-password');
  } else {
    user = await User.findById(userId).select('-password');
  }

  if (!user) {
    return next(new AppError('User profile not found', 404));
  }

  console.log('DEBUG getProfile - user found:', user.email);

  res.status(200).json({
    status: 'success',
    data: {
      id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      avatar: user.avatar || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      username: user.username || '',
      status: user.status || '',
      createdAt: user.createdAt || '',
      lastLogin: user.lastLogin || '',
      lastPasswordChange: user.lastPasswordChange || '',
      kycStatus: user.kycStatus || '',
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false
    }
  });
});

// =============================================
// UPDATE USER PROFILE
// =============================================

exports.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const role = req.user.role;
  const {
    firstName,
    lastName,
    phoneNumber,
    address,
    city,
    country,
    avatar,
    dateOfBirth,
    gender
  } = req.body;

  // Prepare update data
  const updateData = {};

  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (country !== undefined) updateData.country = country;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
  if (gender !== undefined) updateData.gender = gender;

  updateData.updatedAt = new Date();

  let user;

  if (role === 'affiliate') {
    user = await Affiliate.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  } else {
    user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      address: user.address,
      city: user.city,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender
    }
  });
});

// =============================================
// CHANGE PASSWORD
// =============================================

exports.changePassword = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const role = req.user.role;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate required fields
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if new password matches confirmation
  if (newPassword !== confirmPassword) {
    return next(new AppError('New passwords do not match', 400));
  }

  // Check password length
  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  let user;

  if (role === 'affiliate') {
    user = await Affiliate.findById(userId);
  } else {
    user = await User.findById(userId);
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify current password
  const passwordMatch = await user.matchPassword(currentPassword);

  if (!passwordMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  user.lastPasswordChange = new Date();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

// =============================================
// LOGOUT
// =============================================

exports.logout = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;

  // Clear session/token if needed (typically handled by frontend)
  // You could optionally invalidate tokens here if using a token blacklist

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// =============================================
// GET PROFILE STATS
// =============================================

exports.getProfileStats = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const role = req.user.role;

  if (role === 'affiliate') {
    const user = await Affiliate.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        totalEarnings: user.totalEarnings || 0,
        totalCommission: user.totalCommission || 0,
        activeLinks: user.activeLinks || 0,
        totalReferrals: user.totalReferrals || 0,
        withdrawalBalance: user.withdrawalBalance || 0,
        status: user.status,
        approvedDate: user.approvedAt,
        lastLogin: user.lastLogin
      }
    });
  } else {
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        balance: user.balance || 0,
        totalDeposits: user.totalDeposits || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
        kycStatus: user.kycStatus,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  }
});

// =============================================
// DELETE ACCOUNT
// =============================================

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const role = req.user.role;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Password is required to delete account', 400));
  }

  let user;

  if (role === 'affiliate') {
    user = await Affiliate.findById(userId);
  } else {
    user = await User.findById(userId);
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify password
  const passwordMatch = await user.matchPassword(password);

  if (!passwordMatch) {
    return next(new AppError('Password is incorrect', 401));
  }

  // Soft delete - mark as deleted instead of actually deleting
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully'
  });
});

// =============================================
// UPDATE PROFILE PICTURE
// =============================================

exports.updateProfilePicture = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const role = req.user.role;
  const { avatar } = req.body;

  if (!avatar) {
    return next(new AppError('Avatar URL is required', 400));
  }

  let user;

  if (role === 'affiliate') {
    user = await Affiliate.findByIdAndUpdate(
      userId,
      { avatar, updatedAt: new Date() },
      { new: true }
    ).select('-password');
  } else {
    user = await User.findByIdAndUpdate(
      userId,
      { avatar, updatedAt: new Date() },
      { new: true }
    ).select('-password');
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile picture updated successfully',
    data: { avatar: user.avatar }
  });
});

// =============================================
// GET ACCOUNT SECURITY INFO
// =============================================

exports.getSecurityInfo = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user._id;
  const role = req.user.role;

  let user;

  if (role === 'affiliate') {
    user = await Affiliate.findById(userId).select('phoneVerified emailVerified lastPasswordChange twoFactorEnabled');
  } else {
    user = await User.findById(userId).select('phoneVerified emailVerified lastPasswordChange twoFactorEnabled');
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      phoneVerified: user.phoneVerified || false,
      emailVerified: user.emailVerified || false,
      lastPasswordChange: user.lastPasswordChange,
      twoFactorEnabled: user.twoFactorEnabled || false
    }
  });
});
