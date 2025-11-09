const User = require('../Models/User');
const { validateFullName } = require('../utils/validators');

exports.updateFullName = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user.userId;
console.log('💡 Received request to update full name:', { userId, fullName });
    console.log(`🔄 Updating full name for user: ${userId}`, { fullName });

    // Validate input
    if (!fullName || typeof fullName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'দয়া করে আপনার সম্পূর্ণ নাম লিখুন'
      });
    }

    const validation = validateFullName(fullName);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0]
      });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি'
      });
    }

    // Check if name is already verified (if you have such restriction)
    if (user.isNameVerified) {
      return res.status(400).json({
        success: false,
        message: 'নাম একবার যাচাই করার পর পরিবর্তন করা যাবে না'
      });
    }

    // Update full name
    user.name = fullName.trim();
    user.isNameVerified = true; // Mark as verified
    user.updatetimestamp = new Date();

    await user.save();

    console.log(`✅ Full name updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'নাম সফলভাবে আপডেট হয়েছে',
      data: {
        name: user.name,
        isNameVerified: user.isNameVerified,
        updatedAt: user.updatetimestamp
      }
    });

  } catch (error) {
    console.error('💥 Update full name error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'এই নামটি ইতিমধ্যে ব্যবহৃত হচ্ছে'
      });
    }

    res.status(500).json({
      success: false,
      message: 'সার্ভার ত্রুটি হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ userId }).select('-password -resetCode -resetExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        isNameVerified: user.isNameVerified,
        isVerified: user.isVerified,
        balance: user.balance,
        referralCode: user.referralCode,
        vipPoints: user.vipPoints,
        birthday: user.birthday,
        lastLoginTime: user.lastLoginTime,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('💥 Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার ত্রুটি হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    console.log(`🔄 Updating basic info for user: ${userId}`, updates);

    const allowedUpdates = ['birthday', 'country'];
    const updatesToApply = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key) && updates[key] !== undefined) {
        updatesToApply[key] = updates[key];
      }
    });

    if (Object.keys(updatesToApply).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'আপডেট করার জন্য বৈধ ফিল্ড প্রদান করুন'
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি'
      });
    }

    Object.assign(user, updatesToApply);
    user.updatetimestamp = new Date();
    await user.save();

    console.log(`✅ Basic info updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
      data: updatesToApply
    });

  } catch (error) {
    console.error('💥 Update basic info error:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার ত্রুটি হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



exports.updateBirthday = async (req, res) => {
  try {
    const { birthday } = req.body;
    const userId = req.user.userId;

    console.log(`🔄 Updating birthday for user: ${userId}`, { birthday });

    // Validate input
    if (!birthday) {
      return res.status(400).json({
        success: false,
        message: 'দয়া করে আপনার জন্মদিন নির্বাচন করুন'
      });
    }

    const validation = validateBirthday(birthday);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0]
      });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি'
      });
    }

    // Check if birthday is already verified
    if (user.isBirthdayVerified) {
      return res.status(400).json({
        success: false,
        message: 'জন্মদিন একবার যাচাই করার পর পরিবর্তন করা যাবে না'
      });
    }

    // Update birthday
    user.birthday = new Date(birthday);
    user.isBirthdayVerified = true;
    user.updatetimestamp = new Date();

    await user.save();

    console.log(`✅ Birthday updated for user: ${userId}`);

    res.json({
      success: true,
      message: 'জন্মদিন সফলভাবে আপডেট হয়েছে',
      data: {
        birthday: user.birthday,
        isBirthdayVerified: user.isBirthdayVerified,
        updatedAt: user.updatetimestamp
      }
    });

  } catch (error) {
    console.error('💥 Update birthday error:', error);
    
    res.status(500).json({
      success: false,
      message: 'সার্ভার ত্রুটি হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    console.log(`🔄 Changing password for user: ${userId}`);

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'বর্তমান এবং নতুন পাসওয়ার্ড প্রদান করুন'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.errors[0]
      });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'বর্তমান পাসওয়ার্ড সঠিক নয়'
      });
    }

    // Check if new password is same as current password
    const isSameAsCurrent = await user.comparePassword(newPassword);
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: 'নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের মতোই'
      });
    }

    // Update password
    user.password = newPassword;
    user.updatetimestamp = new Date();
    
    // Reset login attempts and lock status
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    console.log(`✅ Password changed successfully for user: ${userId}`);

    res.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে'
    });

  } catch (error) {
    console.error('💥 Change password error:', error);
    
    res.status(500).json({
      success: false,
      message: 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};