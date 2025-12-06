const User = require('../models/User');



class UserService {
  
  async createUser(userData) {
    const { userId, phone, password, countryCode, referredBy, email, name } = userData;

    // Basic required fields
    const userObject = {
      userId: userId.toLowerCase(),
      phone: [{
        countryCode: countryCode,
        number: phone,
        isDefault: true,
        verified: false
      }],
      countryCode,
      password: password,
      isVerified: { 
        phone: false, 
        email: false // Default false, email থাকলে পরে update করবো
      }
    };

    // Optional fields - only add if provided
    if (name && name.trim() !== '') {
      userObject.name = name.trim();
    }

    // Email দিলে add করবো, না দিলে করবো না
    if (email && email.trim() !== '') {
      userObject.email = email.toLowerCase().trim();
      userObject.isVerified.email = true; // Email দিলে verified consider করবো
    }

    if (referredBy && referredBy.trim() !== '') {
      userObject.referredBy = referredBy.trim();
    }

    console.log('🔄 Creating user with data:', {
      userId: userObject.userId,
      hasEmail: !!userObject.email,
      phone: userObject.phone[0].number
    });

    const newUser = new User(userObject);
    return await newUser.save();
  }

  async getUserProfile(userId) {
    const user = await User.aggregate([
      { $match: { userId: userId } },
      {
        $project: {
          userId: 1,
          name: 1,
          email: 1,
          phone: 1,
          balance: 1,
          referredBy: 1,
          referralCode: 1,
          timestamp: 1,
          birthday: 1,
          countryCode: 1,
          isVerified: 1,
          levelOneReferrals: 1,
          levelTwoReferrals: 1,
          levelThreeReferrals: 1,
          apiVerified: 1,
          role: 1,
          vipPoints: 1,
          cashReward: 1,
          totalBonus: 1,
          lastLoginTime: 1,
          lastLoginIp: 1,
          isActive: 1
        }
      }
    ]);

    return user[0] || null;
  }
}

module.exports = new UserService();