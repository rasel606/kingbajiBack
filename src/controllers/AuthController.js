const User = require('../models/User');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');
const ApiService = require('../services/apiService');
const { validateRegistration, validateLogin } = require('../utils/validators');

exports.register = async (req, res) => {
  try {
    const { userId, phone, password, countryCode, referredBy, name } = req.body;
    
    console.log("📝 Registration attempt:", { userId, phone, countryCode, referredBy });

    // Validate input
    const validation = validateRegistration(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0]
      });
    }

    // Check for existing user
    const existingUser = await AuthService.checkExistingUser(userId, phone);
    if (existingUser.exists) {
      return res.status(409).json({
        success: false,
        message: existingUser.message
      });
    }

    // Create user
    const newUser = await UserService.createUser({
      userId,
      phone,
      password,
      countryCode,
      referredBy,
      name
    });

    console.log("✅ User saved to database:", newUser.userId);

    // API Verification
    try {
      const apiSuccess = await ApiService.verifyUserWithRetry(newUser.userId);
      
      if (apiSuccess) {
        newUser.apiVerified = true;
        await newUser.save();
        console.log("✅ API verification successful");
      } else {
        await User.findByIdAndDelete(newUser._id);
        return res.status(400).json({
          success: false,
          message: "API Verification Failed. User not created."
        });
      }
    } catch (apiError) {
      console.error("❌ API verification error:", apiError);
      await User.findByIdAndDelete(newUser._id);
      return res.status(400).json({
        success: false,
        message: "API Verification Failed"
      });
    }

    // Handle referral system
    if (referredBy) {
      await AuthService.handleReferralSystem(newUser, referredBy);
    }

    // Generate token
    const token = newUser.generateAuthToken();

    // Prepare response
    const userResponse = await UserService.getUserProfile(newUser.userId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('💥 Registration Error:', error);
    
    // Clean up if user was created but process failed
    if (req.body.userId) {
      await User.findOneAndDelete({ userId: req.body.userId.toLowerCase() });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;

    console.log("🔐 Login attempt received:", {
      userId,
      timestamp: new Date().toISOString()
    });

    // Validate input
    const validation = validateLogin(req.body);
    console.log("🔍 Login validation result:", validation);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0]
      });
    }

    // Find user
    const user = await AuthService.findUserByIdentifier(userId);
    console.log("🔍 User lookup result:", user ? "User found" : "User not found");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please check your User ID or register first."
      });
    }

    console.log("✅ User found:", user.userId);

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked. Try again in 30 minutes."
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(423).json({
        success: false,
        message: "Account is deactivated. Please contact support."
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log("🔐 Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      // console.log("❌ Invalid password for user:", user.userId);
      // await user.incrementLoginAttempts();

      // const attemptsLeft = 5 - user.loginAttempts;
      return res.status(401).json({
        success: false,
        message: `Incorrect username or password.`
      });
    }

    console.log("✅ Password valid, resetting login attempts");
    
    // Use try-catch for save operations
    // try {
    //   await user.resetLoginAttempts();
    // } catch (saveError) {
    //   console.error("⚠️ Error resetting login attempts:", saveError);
    // }

    // Update login info
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    try {
      await user.updateLoginInfo(clientIp);
    } catch (saveError) {
      console.error("⚠️ Error updating login info:", saveError);
    }

    // Generate token
    const token = user.generateAuthToken();

    console.log("✅ Login successful for user:", user.userId);

    // Get user profile
    const userProfile = await UserService.getUserProfile(user.userId);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userProfile
    });

  } catch (error) {
    console.error("💥 Login error:", error);
    
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



exports.logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    await User.findOneAndUpdate({ userId }, { $unset: { token: 1 } });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("💥 Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfile = await UserService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: userProfile
    });
  } catch (error) {
    console.error("💥 Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during get profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token
    });
  } catch (error) {
    console.error("💥 Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during refresh token",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




exports.checkUserIdAvailability = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ userId: userId.toLowerCase() });

    if (user) {
      return res.status(200).json({ available: false });
    } else {
      return res.status(200).json({ available: true });
    }
  } catch (error) {
    console.error("💥 Check user ID availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during check user ID availability",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.checkPhoneAvailability = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ "phone.number": phone });

    if (user) { // Phone number already exists
      return res.status(200).json({ available: false });
    } else {
      return res.status(200).json({ available: true });
    }
  } catch (error) {
    console.error("💥 Check phone availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during check phone availability",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.verifyAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ userId: userId.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error("💥 Verify account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verify account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ userId: userId.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isVerified = false;
    await user.save();

    res.status(200).json({ success: true, message: "Verification email sent successfully" });
  } catch (error) {
    console.error("💥 Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during resend verification",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ userId: userId.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const token = user.generatePasswordResetToken();
    await user.save();

    res.status(200).json({ success: true, message: "Password reset token sent successfully" });
  } catch (error) {
    console.error("💥 Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during forgot password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("💥 Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during reset password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ userId: userId.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Validate new password
    if (newPassword.length < 6 || newPassword.length > 20) {
      return res.status(400).json({ success: false, message: "Password must be between 6 and 20 characters" });
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must contain at least one letter" });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must contain at least one number" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("💥 Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during change password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};