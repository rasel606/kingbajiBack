const UserVip = require('../Models/UserVip');
const VipLevel = require('../Models/VipLevel');
const BettingHistory = require('../Models/BettingHistory');
const config = require('../Services/VipConfig');
const { calculateVipLevel } = require('../Healper/vipCalculator');

const VipConfig = {
  vipLevels: {
    bronze: {
      name: 'Bronze',
      monthlyTurnoverRequirement: 0,
      vpConversionRate: 2000,
      loyaltyBonus: 0.01 // 1% of turnover
    },
    silver: {
      name: 'Silver',
      monthlyTurnoverRequirement: 300000,
      vpConversionRate: 1250,
      loyaltyBonus: 0.02 // 2% of turnover
    },
    gold: {
      name: 'Gold',
      monthlyTurnoverRequirement: 800000,
      vpConversionRate: 1000,
      loyaltyBonus: 0.03 // 3% of turnover
    },
    diamond: {
      name: 'Diamond',
      monthlyTurnoverRequirement: 2000000,
      vpConversionRate: 500,
      loyaltyBonus: 0.05 // 5% of turnover
    },
    elite: {
      name: 'Elite',
      monthlyTurnoverRequirement: 5000000,
      vpConversionRate: 400,
      loyaltyBonus: 0.07 // 7% of turnover
    }
  }
};
// Update user VIP status based on betting activity
exports.updateVipStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    // Calculate monthly turnover
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const bettingHistory = await BettingHistory.aggregate([
      { $match: { member: userId, start_time: { $gte: startOfMonth } } },
      { $group: { _id: null, totalTurnover: { $sum: '$turnover' } } }
    ]);
    
    const monthlyTurnover = bettingHistory.length > 0 ? bettingHistory[0].totalTurnover : 0;
    
    // Update user VIP record
    let userVip = await UserVip.findOne({ userId });
    
    if (!userVip) {
      userVip = new UserVip({ userId });
    }
    
    // Update turnover
    userVip.monthlyTurnover = monthlyTurnover;
    userVip.lifetimeTurnover += monthlyTurnover - userVip.lastMonthTurnover;
    
    // Calculate VIP points
    const vipLevels = vipLevels;
    const currentLevel = userVip.currentLevel.toLowerCase();
    const vpConversionRate = vipLevels[currentLevel].vpConversionRate;
    const newVipPoints = monthlyTurnover / vpConversionRate;
    
    userVip.vipPoints = newVipPoints;
    
    // Check for level upgrade
    const newLevel = calculateVipLevel(monthlyTurnover);
    
    if (newLevel !== userVip.currentLevel) {
      userVip.currentLevel = newLevel;
      userVip.lastLevelUpdateDate = now;
    }
    
    await userVip.save();
    res.json(userVip);
    
    // return userVip;
  } catch (error) {
    console.error('Error updating VIP status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user VIP information
exports.getUserVipInfo = async (req, res) => {
    console.log("getUserVipInfo",req.body);
  try {
    const { userId } = req.body;
    console.log("getUserVipInfo userId",userId);
    let userVip = await UserVip.findOne({ userId });
    
    if (!userVip) {
      // Initialize VIP record if it doesn't exist
      userVip = new UserVip({ 
        userId,
        currentLevel: 'Bronze'
      });
      await userVip.save();
    }
    
    const vipLevels = await VipLevel.find({});
    const currentLevelInfo = vipLevels.find(level => level.name === userVip.currentLevel);
    
    res.json( {
      ...userVip.toObject(),
      currentLevelInfo,
      allLevels: vipLevels
    });
  } catch (error) {
    console.error('Error getting VIP info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process loyalty bonus at the end of the month
exports.processLoyaltyBonus = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const userVips = await UserVip.find({ 
      lastLoyaltyBonusDate: { $lt: startOfMonth } 
    });
    
    const vipLevels = vipLevels;
    
    for (const userVip of userVips) {
      const level = userVip.currentLevel.toLowerCase();
      const bonusPercentage = vipLevels[level].loyaltyBonus;
      const bonusAmount = userVip.monthlyTurnover * bonusPercentage;
      
      // Here you would typically create a transaction to credit the bonus
      // For now, we'll just update the record
      userVip.lastLoyaltyBonusDate = now;
      userVip.lastMonthTurnover = userVip.monthlyTurnover;
      userVip.monthlyTurnover = 0;
      
      await userVip.save();
      
      console.log(`Processed ${bonusAmount} loyalty bonus for user ${userVip.userId}`);
    }
    
    return { success: true, processed: userVips.length };
  } catch (error) {
    console.error('Error processing loyalty bonuses:', error);
    throw error;
  }
};



exports.convertVpToMoney = async (userId, vpAmount) => {
  try {
    const userVip = await UserVip.findOne({ userId });
    if (!userVip) {
      throw new Error('VIP account not found');
    }

    if (userVip.vipPoints < vpAmount) {
      throw new Error('Not enough VP points');
    }

    // Calculate money amount based on current level
    const vipLevels = vipLevels;
    const currentLevel = userVip.currentLevel.toLowerCase();
    const conversionRate = vipLevels[currentLevel].vpConversionRate;
    const moneyAmount = vpAmount / conversionRate;

    // Deduct VP points
    userVip.vipPoints -= vpAmount;
    await userVip.save();

    // Here you would typically create a transaction to credit the money
    // For now, we'll just return the conversion details

    // Record the conversion history
    const conversionHistory = new ConversionHistory({
      userId,
      vpAmount,
      moneyAmount,
      conversionRate,
      date: new Date()
    });
    await conversionHistory.save();

    return {
      success: true,
      vpAmount,
      moneyAmount,
      remainingVp: userVip.vipPoints
    };
  } catch (error) {
    console.error('Error converting VP:', error);
    throw error;
  }
};

// Get VP conversion history
exports.getConversionHistory = async (userId) => {
  try {
    return await ConversionHistory.find({ userId })
      .sort({ date: -1 })
      .limit(50);
  } catch (error) {
    console.error('Error getting conversion history:', error);
    throw error;
  }
};