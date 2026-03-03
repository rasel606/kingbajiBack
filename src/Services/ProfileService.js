const User = require('../models/User');

class ProfileService {
  
  async updateFullName(userId, fullName) {
    try {
      const user = await User.findOne({ userId });
      
      if (!user) {
        throw new Error('ব্যবহারকারী খুঁজে পাওয়া যায়নি');
      }

      // Check if name is already verified
      if (user.isNameVerified) {
        throw new Error('নাম একবার যাচাই করার পর পরিবর্তন করা যাবে না');
      }

      user.name = fullName.trim();
      user.isNameVerified = true;
      user.updatetimestamp = new Date();

      await user.save();

      return {
        success: true,
        name: user.name,
        isNameVerified: user.isNameVerified,
        updatedAt: user.updatetimestamp
      };

    } catch (error) {
      console.error('Profile service - updateFullName error:', error);
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await User.findOne({ userId })
        .select('-password -resetCode -resetExpiry -loginAttempts -lockUntil');

      if (!user) {
        throw new Error('ব্যবহারকারী খুঁজে পাওয়া যায়নি');
      }

      return {
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
      };

    } catch (error) {
      console.error('Profile service - getProfile error:', error);
      throw error;
    }
  }

  async checkNameAvailability(name) {
    try {
      // If you want to check for duplicate names (optional)
      const existingUser = await User.findOne({ 
        name: name.trim(),
        isNameVerified: true 
      });

      return {
        available: !existingUser,
        message: existingUser ? 'এই নামটি ইতিমধ্যে ব্যবহৃত হচ্ছে' : 'নামটি উপলব্ধ'
      };

    } catch (error) {
      console.error('Profile service - checkNameAvailability error:', error);
      throw error;
    }
  }
}



module.exports = new ProfileService();