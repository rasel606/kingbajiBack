const UserVip = require('../Models/UserVip');
const VipLevel = require('../Models/VipLevel');
const VipPointTransaction = require('../Models/VipPointTransaction');
const LoyaltyBonusLog = require('../Models/LoyaltyBonusLog');
const BettingHistory = require('../Models/BettingHistory');
const User = require('../Models/User');
const logger = require('../utils/logger');

// Get qualifying VIP level based on turnover
const getQualifyingLevel = async (turnover) => {
  try {
    const levels = await VipLevel.find({ isInvitationOnly: false })
      .sort({ levelOrder: -1 }); // Highest first

    for (const level of levels) {
      if (turnover >= level.monthlyTurnoverRequirement) {
        return level;
      }
    }

    // Return lowest level if no match
    return await VipLevel.findOne({ isInvitationOnly: false })
      .sort({ levelOrder: 1 })
      .limit(1);
  } catch (error) {
    logger.error(`getQualifyingLevel error: ${error.message}`);
    throw error;
  }
};

// Calculate daily VIP points
exports.calculateDailyVipPoints = async () => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfDay = new Date(yesterday);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);

    logger.info(`Calculating VIP points for ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    // Aggregate daily turnover per user
    const betsByUser = await BettingHistory.aggregate([
      {
        $match: {
          start_time: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: '$member',
          dailyTurnover: { $sum: '$turnover' }
        }
      }
    ]);

    logger.info(`Found ${betsByUser.length} users with betting activity`);

    let processedCount = 0;
    let skippedCount = 0;

    for (const userBet of betsByUser) {
      const userId = userBet._id;
      const turnover = userBet.dailyTurnover;

      try {
        // Get or create UserVip
        let userVip = await UserVip.findOne({ userId });

        if (!userVip) {
          userVip = new UserVip({ userId, currentLevel: 'Bronze' });
          logger.info(`Created new VIP record for ${userId}`);
        }

        // Skip if no turnover
        if (turnover <= 0) {
          skippedCount++;
          continue;
        }

        // Get current VIP level details
        const currentLevel = await VipLevel.findOne({ name: userVip.currentLevel });
        if (!currentLevel) {
          logger.warn(`VIP level not found: ${userVip.currentLevel} for user ${userId}`);
          skippedCount++;
          continue;
        }

        // Calculate VIP points
        const vpEarned = turnover / currentLevel.vpConversionRate;
        const previousPoints = userVip.vipPoints;

        // Update user VIP status
        userVip.monthlyTurnover += turnover;
        userVip.lifetimeTurnover += turnover;
        userVip.vipPoints += vpEarned;
        userVip.updatedAt = new Date();

        // Check for level upgrade (if not manual)
        if (!userVip.isLevelManual) {
          const qualifyingLevel = await getQualifyingLevel(userVip.monthlyTurnover);

          if (qualifyingLevel && qualifyingLevel.levelOrder > currentLevel.levelOrder) {
            logger.info(`User ${userId} upgraded from ${userVip.currentLevel} to ${qualifyingLevel.name}`);
            userVip.currentLevel = qualifyingLevel.name;
            userVip.lastLevelUpdateDate = new Date();
          }
        }

        await userVip.save();

        // Log transaction
        // await VipPointTransaction.create({
        //   userId,
        //   type: 'earned',
        //   amount: vpEarned,
        //   description: `VIP points from ${turnover.toFixed(2)} turnover`,
        //   date: new Date(),
        //   balanceAfter: userVip.vipPoints
        // });

        processedCount++;
      } catch (error) {
        logger.error(`Error processing user ${userId}: ${error.message}`);
        skippedCount++;
      }
    }

    return {
      success: true,
      message: `VIP points calculated for ${processedCount} users, skipped ${skippedCount} users`,
      processed: processedCount,
      skipped: skippedCount
    };
  } catch (error) {
    logger.error(`calculateDailyVipPoints error: ${error.message}`);
    throw error;
  }
};

// Process monthly VIP bonuses
exports.processMonthlyVipBonuses = async () => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    logger.info(`Processing monthly VIP bonuses for ${previousMonth.toISOString().slice(0, 7)}`);

    const allUserVips = await UserVip.find();
    logger.info(`Processing ${allUserVips.length} VIP records`);

    let processedCount = 0;
    let skippedCount = 0;
    let bonusAmount = 0;

    for (const userVip of allUserVips) {
      try {
        const lastMonthTurnover = userVip.monthlyTurnover;

        // Reset monthly turnover
        userVip.lastMonthTurnover = lastMonthTurnover;
        userVip.monthlyTurnover = 0;

        // Get current VIP level
        const currentLevel = await VipLevel.findOne({ name: userVip.currentLevel });
        if (!currentLevel) {
          logger.warn(`VIP level not found: ${userVip.currentLevel} for user ${userVip.userId}`);
          skippedCount++;
          continue;
        }

        // Calculate loyalty bonus
        const loyaltyBonus = lastMonthTurnover * (currentLevel.loyaltyBonusPercentage / 100);

        // Apply bonus if eligible
        // if (loyaltyBonus > 0) {
        //   const user = await User.findOne({ userId: userVip.userId });
        //   if (user) {
        //     user.balance += loyaltyBonus;
        //     user.totalBonus += loyaltyBonus;
        //     await user.save();

        //     // Create bonus log
        //     await LoyaltyBonusLog.create({
        //       userId: userVip.userId,
        //       amount: loyaltyBonus,
        //       vipLevel: currentLevel.name,
        //       forMonth: previousMonth,
        //       awardedAt: now
        //     });

        //     bonusAmount += loyaltyBonus;
        //     logger.info(`Awarded ${loyaltyBonus.toFixed(2)} to ${userVip.userId}`);
        //   }
        // }

        // Update level for new month (if not manual)
        if (!userVip.isLevelManual) {
          const qualifyingLevel = await getQualifyingLevel(lastMonthTurnover);
          if (qualifyingLevel && qualifyingLevel.name !== userVip.currentLevel) {
            logger.info(`User ${userVip.userId} set to ${qualifyingLevel.name} for new month`);
            userVip.currentLevel = qualifyingLevel.name;
            userVip.lastLevelUpdateDate = now;
          }
        }

        // Update dates
        userVip.lastLoyaltyBonusDate = now;
        await userVip.save();

        processedCount++;
      } catch (error) {
        logger.error(`Error processing VIP for ${userVip.userId}: ${error.message}`);
        skippedCount++;
      }
    }

    return {
      success: true,
      message: `Monthly VIP processing completed: ${processedCount} processed, ${skippedCount} skipped`,
      usersProcessed: processedCount,
      usersSkipped: skippedCount,
      totalBonusAwarded: bonusAmount
    };
  } catch (error) {
    logger.error(`processMonthlyVipBonuses error: ${error.message}`);
    throw error;
  }
};

// Manual VIP adjustment
// exports.adjustVipPoints = async (userId, amount, description) => {
//   try {
//     const userVip = await UserVip.findOne({ userId });
//     if (!userVip) {
//       throw new Error('User VIP record not found');
//     }

//     const previousPoints = userVip.vipPoints;
//     userVip.vipPoints += amount;

//     if (userVip.vipPoints < 0) {
//       throw new Error('VIP points cannot be negative');
//     }

//     await userVip.save();

//     await VipPointTransaction.create({
//       userId,
//       type: 'adjustment',
//       amount,
//       description: description || 'Manual adjustment',
//       date: new Date(),
//       balanceAfter: userVip.vipPoints
//     });

//     return userVip;
//   } catch (error) {
//     logger.error(`adjustVipPoints error for ${userId}: ${error.message}`);
//     throw error;
//   }
// };

exports.convertVipPoints = async (userId, conversionVipPoints) => {
  try {
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');

    const userVip = await UserVip.findOne({ userId: user.userId });
    if (!userVip) throw new Error('User VIP record not found');

    const vipLevel = await VipLevel.findOne({ name: userVip.currentLevel });
    if (!vipLevel) throw new Error('VIP level configuration not found');

    if (userVip.vipPoints < vipLevel.minConversionVP || userVip.vipPoints < conversionVipPoints) {
      throw new Error(`আপনার ন্যূনতম ${vipLevel.minConversionVP} VP থাকতে হবে`);
    }

    // Conversion Calculation
    const conversionAmount = conversionVipPoints * vipLevel.vpToMoneyRatio;

    // Update VIP Points
    const previousPoints = userVip.vipPoints;
    userVip.vipPoints -= conversionVipPoints;
    await userVip.save();

    // Update user balance
    await User.updateOne(
      { userId },
      {
        $inc: {
          balance: conversionAmount,
          totalBonus: conversionAmount,
           vipPoints: conversionVipPoints,
           
        },
        $set: {
          lestAmountConverted: conversionAmount,
           currentLevel: vipLevel.name,
          updatetimestamp: new Date()
        }
      }
    );

    // VIP Point Transaction Record
    await VipPointTransaction.create({
      userId,
      type: 'conversion',
      amount: -conversionVipPoints,
      description: `Converted ${conversionVipPoints} VP to ৳${conversionAmount.toFixed(2)}`,
      date: new Date(),
      balanceAfter: userVip.vipPoints
    });

    // Affiliate Commission Deduction (if referred)
    if (user.referredBy) {
      const affiliate = await AffiliateModel.findOne({ referralCode: user.referredBy });
      if (affiliate) {
        const deductionAmount = conversionAmount * (affiliate.settings.platformFee / 100);

        await AffiliateModel.updateOne(
          { _id: affiliate._id },
          {
            $inc: {
              balance: -deductionAmount,
              totalCommission: -deductionAmount,
              availableBalance: -deductionAmount
            }
          }
        );

        await AffiliateEarnings.updateOne(
          { affiliateId: affiliate._id, period: moment().startOf('month').toDate() },
          {
            $inc: {
              totalBonus: conversionAmount,
              totalDeduction: deductionAmount,
              netProfit: -deductionAmount,
              finalCommission: -deductionAmount
            }
          },
          { upsert: true }
        );
      }
    }

    return {
      conversionAmount: conversionAmount,
      pointsConverted: conversionVipPoints,
      remainingPoints: userVip.vipPoints
    };
  } catch (error) {
    console.error(`convertVipPoints error for ${userId}: ${error.message}`);
    throw error;
  }
};
// Update VIP level manually
exports.updateVipLevel = async (userId, newLevel, isManual = true) => {
  try {
    const levelExists = await VipLevel.findOne({ name: newLevel });
    if (!levelExists) {
      throw new Error('Invalid VIP level');
    }

    const userVip = await UserVip.findOne({ userId });
    if (!userVip) {
      throw new Error('User VIP record not found');
    }

    userVip.currentLevel = newLevel;
    userVip.isLevelManual = isManual;
    userVip.lastLevelUpdateDate = new Date();
    await userVip.save();

    return userVip;
  } catch (error) {
    logger.error(`updateVipLevel error for ${userId}: ${error.message}`);
    throw error;
  }
};

// Get user VIP status
exports.getUserVipStatus = async (userId) => {
  try {
    let userVip = await UserVip.findOne({ userId });

    if (!userVip) {
      // Create new VIP record if doesn't exist
      userVip = new UserVip({ userId, currentLevel: 'Bronze' });
      await userVip.save();
      logger.info(`Created new VIP record for ${userId}`);
    }

    return userVip;
  } catch (error) {
    logger.error(`getUserVipStatus error for ${userId}: ${error.message}`);
    throw error;
  }
};

// Get VIP level details
exports.getVipLevels = async () => {
  try {
    return await VipLevel.find().sort({ levelOrder: 1 });
  } catch (error) {
    logger.error(`getVipLevels error: ${error.message}`);
    throw error;
  }
};