

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../Utils/AppError');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// ডিভাইস ID জেনারেট করার ফাংশন
const generateDeviceId = (req) => {
  return crypto.createHash('md5')
    .update(req.ip + req.headers['user-agent'])
    .digest('hex');
};

// টোকেন জেনারেট ফাংশন
const generateToken = (email, deviceId) => {
  return jwt.sign({ email, deviceId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// exports.loginUser = async (req, dataModel) => {
//   const { email, password , mobile, userId } = req.body;

//   // ইউজার খুঁজে বের করুন
//   const user = await dataModel.findOne({ $or: [{ email }, { mobile }, { userId }] }).select('+password');
  
//   if (!user) {
//     throw new AppError("User not found", 404);
//   }

//   // পাসওয়ার্ড ভেরিফাই করুন
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   console.log("Password validation result:", isPasswordValid);
  
//   if (!isPasswordValid) {
//     throw new AppError("Invalid password", 401);
//   }

//   // ডিভাইস ID জেনারেট করুন
//   const deviceId = generateDeviceId(req);
//   console.log("Generated device ID:", deviceId);

//   // যদি ইউজার ইতিমধ্যে লগিন থাকে, তাহলে পুরোনো সেশন ইনএকটিভ করুন
//   if (user.isLoggedIn && user.currentSession) {
//     console.log("User already logged in from another device. Invalidating previous session...");
    
//     // এখানে আপনি নোটিফিকেশন সেন্ড করতে পারেন পুরোনো ডিভাইসে
//     // বা লগ আউট ইভেন্ট ট্রিগার করতে পারেন
//   }

//   // নতুন টোকেন জেনারেট করুন
//   const token = generateToken(user.email, deviceId);

//   // ইউজার এর সেশন আপডেট করুন
//   user.currentSession = {
//     token: token,
//     deviceId: deviceId,
//     loginTime: new Date(),
//     userAgent: req.headers['user-agent']
//   };
//   user.isLoggedIn = true;
//   user.lastLogin = new Date();

//   await user.save();

//     const newUser = await dataModel.findOne({ email }).select('-password');
  

//   return {
//     message: "Login successful",
//     data: {
//       user: newUser,
//       token: token,
//       lastLogin: user.lastLogin,
//       deviceId: deviceId
//     },
//     success: true
//   };
// };

// exports.AdminProfile = async (req, dataModel) => {
//   const user = await dataModel.findOne({ email: req.user.email });
  
//   if (!user) {
//     throw new AppError("User not found", 404);
//   }

//   return {
//     message: "Profile retrieved successfully",
//     data: user,
//     success: true
//   };
// };

// সেশন ভেরিফিকেশন মিডলওয়্যার
// exports.verifySession = async (req, dataModel) => {
//   const token = req.cookies?.adminToken || 
//                 req.headers.authorization?.replace('Bearer ', '') ||
//                 req.body.token;

//   if (!token) {
//     throw new AppError('Access denied. No token provided.', 401);
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await dataModel.findOne({ email: decoded.email });
    
//     if (!user) {
//       throw new AppError('User not found', 404);
//     }

//     // চেক করুন যদি ইউজার লগিন অবস্থায় নেই
//     if (!user.isLoggedIn || !user.currentSession) {
//       throw new AppError('Session expired. Please login again.', 401);
//     }

//     // চেক করুন যদি টোকেন এবং ডিভাইস ID মিলে
//     if (user.currentSession.token !== token || 
//         user.currentSession.deviceId !== decoded.deviceId) {
      
//       // সেশন ইনভ্যালিড, রিসেট করুন
//       user.currentSession = null;
//       user.isLoggedIn = false;
//       await user.save();
      
//       throw new AppError('Session expired or invalid. Please login again.', 401);
//     }

//     req.user = user;
//     return true;
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       throw new AppError('Invalid token', 401);
//     } else if (error.name === 'TokenExpiredError') {
//       throw new AppError('Token expired', 401);
//     } else {
//       throw error;
//     }
//   }
// };

// লগআউট সার্ভিস
// exports.logoutUser = async (req, dataModel) => {
//   const user = await dataModel.findOne({ email: req.user.email });
  
//   if (user) {
//     user.currentSession = null;
//     user.isLoggedIn = false;
//     await user.save();
    
//     console.log(`User ${user.email} logged out from device`);
//   }

//   return {
//     message: "Logout successful",
//     success: true
//   };
// };


// // ফোর্স লগআউট সার্ভিস (অ্যাডমিনের জন্য)
// exports.forceLogoutUser = async (userId, dataModel) => {
//   const user = await dataModel.findOne({ userId });
  
//   if (user) {
//     const previousDevice = user.currentSession?.deviceId;
    
//     user.currentSession = null;
//     user.isLoggedIn = false;
//     await user.save();
    
//     console.log(`User ${user.email} force logged out from device: ${previousDevice}`);
    
//     return {
//       message: "User force logged out successfully",
//       previousDevice: previousDevice,
//       success: true
//     };
//   }
  
//   throw new AppError("User not found", 404);
// };

// সকল অ্যাক্টিভ সেশন চেক করার সার্ভিস
// exports.getActiveSessions = async (dataModel) => {
//   const activeUsers = await dataModel.find({ 
//     isLoggedIn: true 
//   }).select('email userId currentSession lastLogin');
  
//   return {
//     message: "Active sessions retrieved",
//     data: activeUsers,
//     count: activeUsers.length,
//     success: true
//   };
// };
// ইউনিভার্সাল লগিন সার্ভিস
exports.loginUser = async (req, dataModel, userType) => {
  const { email, password, twoFactorToken } = req.body;

  // ইউজার খুঁজে বের করুন (পাসওয়ার্ড সহ)
  const user = await dataModel.findOne({ email }).select('+password');
  
  if (!user) {
    throw new AppError(`${userType} not found`, 404);
  }

  // Check if user is active
  if (user.status !== 'Active') {
    throw new AppError(`Your account is ${user.status}. Please contact support.`, 403);
  }

  // Check if account is locked
  if (user.isLocked && user.isLocked()) {
    throw new AppError('Account is temporarily locked due to too many failed login attempts', 423);
  }

  // পাসওয়ার্ড ভেরিফাই করুন
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    if (user.incrementLoginAttempts) {
      await user.incrementLoginAttempts();
    }
    throw new AppError("Invalid password", 401);
  }

  // If 2FA is enabled, require token
  if (user.twoFactorEnabled && !twoFactorToken) {
    return {
      requiresTwoFactor: true,
      message: "Two-factor authentication required",
      success: true
    };
  }

  // Verify 2FA token if provided
  if (user.twoFactorEnabled && twoFactorToken) {
    const twoFactorValid = await verifyTwoFactorLogin(email, twoFactorToken, dataModel, userType);
    if (!twoFactorValid.success) {
      throw new AppError('Invalid two-factor authentication code', 401);
    }
  }

  // Reset login attempts on successful login
  if (user.incrementLoginAttempts) {
    await dataModel.updateOne(
      { _id: user._id }, 
      { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
    );
  }

  // Check IP restriction for SubAdmin
  if (userType === 'SubAdmin' && user.isIPAllowed && !user.isIPAllowed(req.ip)) {
    throw new AppError('Access denied from this IP address', 403);
  }

  // ডিভাইস ID জেনারেট করুন
  const deviceId = generateDeviceId(req);

  // যদি ইউজার ইতিমধ্যে অন্য ডিভাইসে লগিন থাকে
  if (user.isLoggedIn && user.currentSession) {
    console.log(`${userType} already logged in from another device. Invalidating previous session...`);
    
    // লগিন হিস্ট্রি আপডেট করুন
    if (user.updateLogoutHistory) {
      user.updateLogoutHistory(user.currentSession.deviceId);
    }
  }

  // নতুন টোকেন জেনারেট করুন
  const token = generateToken(user.email, deviceId, user.role);

  // ইউজার এর সেশন আপডেট করুন
  user.currentSession = {
    token: token,
    deviceId: deviceId,
    loginTime: new Date(),
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  };
  user.isLoggedIn = true;
  user.lastLogin = new Date();
  user.lastActivity = new Date();
  
  // লগিন হিস্ট্রিতে যোগ করুন
  if (user.addLoginHistory) {
    user.addLoginHistory(deviceId, req.headers['user-agent'], req.ip);
  }

  await user.save();

  // const responseData = {
  //   userId: user.userId,
  //   email: user.email,
  //   firstName: user.firstName,
  //   lastName: user.lastName,
  //   role: user.role,
  //   token: token,
  //   lastLogin: user.lastLogin,
  //   deviceId: deviceId,
  //   twoFactorEnabled: user.twoFactorEnabled
  // };

  // // Add role-specific data
  // if (userType === 'Affiliate') {
  //   responseData.referralCode = user.referralCode;
  //   responseData.balance = user.balance;
  //   responseData.availableBalance = user.availableBalance;
  // }

  // if (userType === 'SubAdmin') {
  //   responseData.permissions = user.permissions;
  //   responseData.accessLevel = user.accessLevel;
  // }
  const newUser = await dataModel.findOne({ email: user.email });

  return {
    message: "Login successful",
    data: {
      user: newUser,
      token: token,
      lastLogin: user.lastLogin,
      deviceId: deviceId
    },
    success: true
  };
};

// ইউনিভার্সাল প্রোফাইল রিট্রিভ সার্ভিস
exports.getUserProfile = async (req, dataModel) => {
  const user = await dataModel.findOne({ email: req.user.email });
  
  if (!user) {
    throw new AppError(`${userType} not found`, 404);
  }

  return {
    message: "Profile retrieved successfully",
    data: user,
    success: true
  };
};

// ইউনিভার্সাল সেশন ভেরিফিকেশন
exports.verifyUserSession = async (req, dataModel, userType) => {
  const token = req.cookies?.[`${userType.toLowerCase()}Token`] || 
                req.headers.authorization?.replace('Bearer ', '') ||
                req.body.token;

  if (!token) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dataModel.findOne({ email: decoded.email });
    
    if (!user) {
      throw new AppError(`${userType} not found`, 404);
    }

    // Check if user is active
    if (user.status !== 'Active') {
      throw new AppError(`Your account is ${user.status}. Please contact support.`, 403);
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      throw new AppError('Password recently changed. Please login again.', 401);
    }

    // Check session validity
    if (!user.isLoggedIn || !user.currentSession) {
      throw new AppError('Session expired. Please login again.', 401);
    }

    // Verify token and device ID
    if (user.currentSession.token !== token || 
        user.currentSession.deviceId !== decoded.deviceId) {
      
      // Session invalid, reset it
      user.currentSession = null;
      user.isLoggedIn = false;
      await user.save();
      
      throw new AppError('Session expired or invalid. Please login again.', 401);
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    req.user = user;
    return true;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    } else {
      throw error;
    }
  }
};

// ইউনিভার্সাল লগআউট সার্ভিস
exports.logoutUser = async (req, dataModel, userType) => {
  const user = await dataModel.findOne({ email: req.user.email });
  
  if (user) {
    // Update login history with logout time
    if (user.updateLogoutHistory && user.currentSession) {
      user.updateLogoutHistory(user.currentSession.deviceId);
    }
    
    user.currentSession = null;
    user.isLoggedIn = false;
    await user.save();
    
    console.log(`${userType} ${user.email} logged out from device`);
  }

  return {
    message: "Logout successful",
    success: true
  };
};

// ফোর্স লগআউট সার্ভিস
exports.forceLogoutUser = async (userId, dataModel, userType) => {
  const user = await dataModel.findOne({ userId });
  
  if (user) {
    const previousDevice = user.currentSession?.deviceId;
    
    // Update login history
    if (user.updateLogoutHistory && user.currentSession) {
      user.updateLogoutHistory(user.currentSession.deviceId);
    }
    
    user.currentSession = null;
    user.isLoggedIn = false;
    await user.save();
    
    console.log(`${userType} ${user.email} force logged out from device: ${previousDevice}`);
    
    return {
      message: `${userType} force logged out successfully`,
      previousDevice: previousDevice,
      success: true
    };
  }
  
  throw new AppError(`${userType} not found`, 404);
};

// সকল অ্যাক্টিভ সেশন চেক করার সার্ভিস
exports.getActiveSessions = async (dataModel, userType) => {
  const activeUsers = await dataModel.find({ 
    isLoggedIn: true 
  }).select('email userId firstName lastName currentSession lastLogin status');
  
  return {
    message: `Active ${userType.toLowerCase()} sessions retrieved`,
    data: activeUsers,
    count: activeUsers.length,
    success: true
  };
};

// পাসওয়ার্ড রিসেট সার্ভিস
exports.requestPasswordReset = async (email, dataModel, userType) => {
  const user = await dataModel.findOne({ email });
  
  if (!user) {
    throw new AppError(`No ${userType.toLowerCase()} found with that email address`, 404);
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  return {
    message: "Password reset token generated",
    resetToken: resetToken,
    success: true
  };
};

// পাসওয়ার্ড আপডেট সার্ভিস
exports.resetUserPassword = async (token, newPassword, dataModel, userType) => {
  const crypto = require('crypto');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await dataModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Invalidate all sessions
  user.currentSession = null;
  user.isLoggedIn = false;

  await user.save();

  return {
    message: "Password reset successfully",
    success: true
  };
};




// 2FA সেটআপ সার্ভিস
exports.setupTwoFactorAuth = async (req, dataModel, userType) => {
  const user = await dataModel.findById(req.user._id);
  
  if (!user) {
    throw new AppError(`${userType} not found`, 404);
  }

  if (user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is already enabled', 400);
  }

  // Generate 2FA secret
  const secret = user.create2FASecret();
  
  // Generate QR code URL
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: encodeURIComponent(`${userType} App (${user.email})`),
    issuer: 'AdminApp',
    encoding: 'base32'
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  await user.save();

  return {
    message: "Two-factor authentication setup initiated",
    data: {
      secret: secret.base32,
      qrCodeUrl: qrCodeUrl,
      otpauthUrl: otpauthUrl,
      backupCodes: user.twoFactorBackupCodes
    },
    success: true
  };
};

// 2FA ভেরিফাই এবং এনেবল সার্ভিস
exports.verifyAndEnableTwoFactor = async (req, token, dataModel, userType) => {
  const user = await dataModel.findById(req.user._id);
  
  if (!user) {
    throw new AppError(`${userType} not found`, 404);
  }

  if (user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is already enabled', 400);
  }

  // Verify token
  const isValid = user.verify2FAToken(token);
  
  if (!isValid) {
    throw new AppError('Invalid authentication code', 400);
  }

  // Enable 2FA
  user.twoFactorEnabled = true;
  await user.save();

  return {
    message: "Two-factor authentication enabled successfully",
    success: true
  };
};

// 2FA ডিসেবল সার্ভিস
exports.disableTwoFactorAuth = async (req, dataModel, userType) => {
  const user = await dataModel.findById(req.user._id);
  
  if (!user) {
    throw new AppError(`${userType} not found`, 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not enabled', 400);
  }

  // Disable 2FA
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorBackupCodes = [];
  
  await user.save();

  return {
    message: "Two-factor authentication disabled successfully",
    success: true
  };
};

// 2FA লগিন ভেরিফিকেশন সার্ভিস
exports.verifyTwoFactorLogin = async (email, token, dataModel, userType) => {
  const user = await dataModel.findOne({ email });
  
  if (!user) {
    throw new AppError(`${userType} not found`, 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not enabled for this account', 400);
  }

  let isValid = false;

  // First try regular token verification
  if (token.length === 6) {
    isValid = user.verify2FAToken(token);
  }

  // If regular token fails, try backup codes
  if (!isValid && token.length === 8) {
    isValid = user.verifyBackupCode(token);
  }

  if (!isValid) {
    throw new AppError('Invalid authentication code', 400);
  }

  await user.save();
  return {
    message: "Two-factor authentication verified successfully",
    success: true
  };
};

// 2FA ব্যাকআপ কোড জেনারেট সার্ভিস
exports.generateNewBackupCodes = async (req, dataModel, userType) => {
  const user = await dataModel.findById(req.user._id);
  
  if (!user) {
    throw new AppError(`${userType} not found`, 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not enabled', 400);
  }

  // Generate new backup codes
  const backupCodes = user.generateBackupCodes();
  await user.save();

  return {
    message: "New backup codes generated successfully",
    data: {
      backupCodes: backupCodes
    },
    success: true
  };
};

