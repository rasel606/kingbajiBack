const BonusConfiguration = require('../../models/BonusConfiguration');
const UserBonusInstance = require('../../models/UserBonusInstance');
const User = require('../../models/User');
const BettingHistory = require('../../models/BettingHistory');
const ProviderTransaction = require('../../models/ProviderTransaction');

/**
 * Bonus Processing Service
 * সব ধরনের bonus processing এর জন্য
 */
class BonusProcessingService {
  
  /**
   * Process Deposit Bonus
   * ডিপোজিট বোনাস প্রসেস করে
   */
  async processDepositBonus(userId, depositAmount, depositTransactionId, bonusType = 'FIRST_DEPOSIT') {
    try {
      console.log(`🎁 Processing ${bonusType} for user ${userId}, amount: ${depositAmount}`);

      // Find applicable bonus configuration
      const bonusConfig = await BonusConfiguration.findOne({
        bonusType,
        isActive: true,
        'eligibility.minDepositAmount': { $lte: depositAmount },
      }).sort({ priority: -1 });

      if (!bonusConfig) {
        console.log('❌ No applicable bonus found');
        return { success: false, message: 'No applicable bonus found' };
      }

      // Get user details
      const user = await User.findOne({ userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Check eligibility
      const eligibilityCheck = bonusConfig.isEligible(user, depositAmount);
      if (!eligibilityCheck.eligible) {
        console.log(`❌ User not eligible: ${eligibilityCheck.reason}`);
        return { success: false, message: eligibilityCheck.reason };
      }

      // Check claim limits
      const canClaim = await this.checkClaimLimits(userId, bonusConfig);
      if (!canClaim.allowed) {
        console.log(`❌ Claim limit exceeded: ${canClaim.reason}`);
        return { success: false, message: canClaim.reason };
      }

      // Calculate bonus amount
      const bonusAmount = bonusConfig.calculateBonusAmount(depositAmount);

      // Calculate wagering requirement
      const wageringRequired = bonusConfig.wageringRequirements.includeDeposit
        ? (depositAmount + bonusAmount) * bonusConfig.wageringRequirements.multiplier
        : bonusAmount * bonusConfig.wageringRequirements.multiplier;

      // Calculate expiry date
      const expiryDate = new Date();
      if (bonusConfig.timeRestrictions.validityDays) {
        expiryDate.setDate(expiryDate.getDate() + bonusConfig.timeRestrictions.validityDays);
      } else if (bonusConfig.timeRestrictions.validityHours) {
        expiryDate.setHours(expiryDate.getHours() + bonusConfig.timeRestrictions.validityHours);
      }

      // Create bonus instance
      const instanceId = `BONUS_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const bonusInstance = await UserBonusInstance.create({
        instanceId,
        userId,
        bonusConfigId: bonusConfig._id,
        bonusId: bonusConfig.bonusId,
        bonusType: bonusConfig.bonusType,
        bonusAmount,
        relatedTransactionId: depositTransactionId,
        depositAmount,
        wageringRequired,
        expiryDate,
        status: bonusConfig.requiresClaim ? 'PENDING' : 'ACTIVE',
        activatedAt: bonusConfig.requiresClaim ? null : new Date(),
      });

      // Update bonus configuration stats
      await bonusConfig.updateStats('awarded', bonusAmount);

      console.log(`✅ Bonus created: ${instanceId}, Amount: ${bonusAmount}, Wagering: ${wageringRequired}`);

      return {
        success: true,
        bonus: {
          instanceId: bonusInstance.instanceId,
          bonusAmount,
          wageringRequired,
          expiryDate,
          status: bonusInstance.status,
        },
      };
    } catch (error) {
      console.error('❌ Process Deposit Bonus Error:', error);
      throw error;
    }
  }

  /**
   * Process Cashback Bonus
   * ক্যাশব্যাক বোনাস প্রসেস করে
   */
  async processCashbackBonus(userId, startDate, endDate) {
    try {
      console.log(`💰 Processing Cashback for user ${userId}`);

      // Find cashback configuration
      const bonusConfig = await BonusConfiguration.findOne({
        bonusType: 'CASHBACK',
        isActive: true,
      });

      if (!bonusConfig) {
        return { success: false, message: 'Cashback bonus not configured' };
      }

      // Calculate total loss
      const transactions = await ProviderTransaction.aggregate([
        {
          $match: {
            userId,
            status: 'COMPLETED',
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalBet: {
              $sum: { $cond: [{ $eq: ['$transactionType', 'BET'] }, '$amount', 0] },
            },
            totalWin: {
              $sum: { $cond: [{ $eq: ['$transactionType', 'WIN'] }, '$amount', 0] },
            },
          },
        },
      ]);

      if (!transactions.length) {
        return { success: false, message: 'No transactions found' };
      }

      const totalLoss = transactions[0].totalBet - transactions[0].totalWin;

      if (totalLoss <= 0) {
        return { success: false, message: 'No loss to cashback' };
      }

      // Calculate cashback amount
      const cashbackPercentage = bonusConfig.specialConditions.cashbackPercentage || 10;
      const cashbackAmount = (totalLoss * cashbackPercentage) / 100;

      // Apply min/max limits
      let finalCashback = cashbackAmount;
      if (bonusConfig.amountConfig.minBonusAmount && finalCashback < bonusConfig.amountConfig.minBonusAmount) {
        finalCashback = bonusConfig.amountConfig.minBonusAmount;
      }
      if (bonusConfig.amountConfig.maxBonusAmount && finalCashback > bonusConfig.amountConfig.maxBonusAmount) {
        finalCashback = bonusConfig.amountConfig.maxBonusAmount;
      }

      // Create bonus instance
      const instanceId = `CASHBACK_${userId}_${Date.now()}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (bonusConfig.timeRestrictions.validityDays || 7));

      const bonusInstance = await UserBonusInstance.create({
        instanceId,
        userId,
        bonusConfigId: bonusConfig._id,
        bonusId: bonusConfig.bonusId,
        bonusType: 'CASHBACK',
        bonusAmount: finalCashback,
        wageringRequired: finalCashback * bonusConfig.wageringRequirements.multiplier,
        expiryDate,
        status: 'ACTIVE',
        activatedAt: new Date(),
        metadata: {
          totalLoss,
          cashbackPercentage,
          period: { startDate, endDate },
        },
      });

      await bonusConfig.updateStats('awarded', finalCashback);

      console.log(`✅ Cashback created: ${finalCashback} (${cashbackPercentage}% of ${totalLoss} loss)`);

      return {
        success: true,
        bonus: {
          instanceId: bonusInstance.instanceId,
          cashbackAmount: finalCashback,
          totalLoss,
          percentage: cashbackPercentage,
        },
      };
    } catch (error) {
      console.error('❌ Process Cashback Error:', error);
      throw error;
    }
  }

  /**
   * Process Rebate Bonus
   * রিবেট বোনাস প্রসেস করে (turnover এর উপর ভিত্তি করে)
   */
  async processRebateBonus(userId, startDate, endDate) {
    try {
      console.log(`🔄 Processing Rebate for user ${userId}`);

      const bonusConfig = await BonusConfiguration.findOne({
        bonusType: 'REBATE',
        isActive: true,
      });

      if (!bonusConfig) {
        return { success: false, message: 'Rebate bonus not configured' };
      }

      // Calculate total turnover
      const transactions = await ProviderTransaction.aggregate([
        {
          $match: {
            userId,
            transactionType: 'BET',
            status: 'COMPLETED',
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalTurnover: { $sum: '$amount' },
            betCount: { $sum: 1 },
          },
        },
      ]);

      if (!transactions.length || transactions[0].totalTurnover === 0) {
        return { success: false, message: 'No turnover found' };
      }

      const totalTurnover = transactions[0].totalTurnover;
      const rebatePercentage = bonusConfig.specialConditions.rebatePercentage || 0.5;
      const rebateAmount = (totalTurnover * rebatePercentage) / 100;

      // Apply limits
      let finalRebate = rebateAmount;
      if (bonusConfig.amountConfig.minBonusAmount && finalRebate < bonusConfig.amountConfig.minBonusAmount) {
        return { success: false, message: 'Rebate amount below minimum' };
      }
      if (bonusConfig.amountConfig.maxBonusAmount && finalRebate > bonusConfig.amountConfig.maxBonusAmount) {
        finalRebate = bonusConfig.amountConfig.maxBonusAmount;
      }

      // Create bonus instance
      const instanceId = `REBATE_${userId}_${Date.now()}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (bonusConfig.timeRestrictions.validityDays || 7));

      const bonusInstance = await UserBonusInstance.create({
        instanceId,
        userId,
        bonusConfigId: bonusConfig._id,
        bonusId: bonusConfig.bonusId,
        bonusType: 'REBATE',
        bonusAmount: finalRebate,
        wageringRequired: finalRebate * bonusConfig.wageringRequirements.multiplier,
        expiryDate,
        status: 'ACTIVE',
        activatedAt: new Date(),
        metadata: {
          totalTurnover,
          rebatePercentage,
          betCount: transactions[0].betCount,
          period: { startDate, endDate },
        },
      });

      await bonusConfig.updateStats('awarded', finalRebate);

      console.log(`✅ Rebate created: ${finalRebate} (${rebatePercentage}% of ${totalTurnover} turnover)`);

      return {
        success: true,
        bonus: {
          instanceId: bonusInstance.instanceId,
          rebateAmount: finalRebate,
          totalTurnover,
          percentage: rebatePercentage,
        },
      };
    } catch (error) {
      console.error('❌ Process Rebate Error:', error);
      throw error;
    }
  }

  /**
   * Process Referral Bonus
   * রেফারেল বোনাস প্রসেস করে
   */
  async processReferralBonus(referrerId, refereeId, refereeDepositAmount) {
    try {
      console.log(`👥 Processing Referral Bonus: ${referrerId} referred ${refereeId}`);

      const bonusConfig = await BonusConfiguration.findOne({
        bonusType: 'REFERRAL_BONUS',
        isActive: true,
      });

      if (!bonusConfig) {
        return { success: false, message: 'Referral bonus not configured' };
      }

      const results = [];

      // Referrer Bonus
      if (bonusConfig.specialConditions.referrerBonus) {
        const referrerBonusAmount = bonusConfig.specialConditions.referrerBonus;
        const instanceId = `REF_REFERRER_${referrerId}_${Date.now()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const referrerBonus = await UserBonusInstance.create({
          instanceId,
          userId: referrerId,
          bonusConfigId: bonusConfig._id,
          bonusId: bonusConfig.bonusId,
          bonusType: 'REFERRAL_BONUS',
          bonusAmount: referrerBonusAmount,
          wageringRequired: referrerBonusAmount * bonusConfig.wageringRequirements.multiplier,
          expiryDate,
          status: 'ACTIVE',
          activatedAt: new Date(),
          metadata: {
            refereeId,
            refereeDepositAmount,
            role: 'referrer',
          },
        });

        results.push({
          type: 'referrer',
          instanceId: referrerBonus.instanceId,
          amount: referrerBonusAmount,
        });
      }

      // Referee Bonus
      if (bonusConfig.specialConditions.refereeBonus) {
        const refereeBonusAmount = bonusConfig.specialConditions.refereeBonus;
        const instanceId = `REF_REFEREE_${refereeId}_${Date.now()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const refereeBonus = await UserBonusInstance.create({
          instanceId,
          userId: refereeId,
          bonusConfigId: bonusConfig._id,
          bonusId: bonusConfig.bonusId,
          bonusType: 'REFERRAL_BONUS',
          bonusAmount: refereeBonusAmount,
          wageringRequired: refereeBonusAmount * bonusConfig.wageringRequirements.multiplier,
          expiryDate,
          status: 'ACTIVE',
          activatedAt: new Date(),
          metadata: {
            referrerId,
            role: 'referee',
          },
        });

        results.push({
          type: 'referee',
          instanceId: refereeBonus.instanceId,
          amount: refereeBonusAmount,
        });
      }

      console.log(`✅ Referral bonuses created:`, results);

      return {
        success: true,
        bonuses: results,
      };
    } catch (error) {
      console.error('❌ Process Referral Bonus Error:', error);
      throw error;
    }
  }

  /**
   * Update Wagering Progress
   * Wagering progress update করে যখন user bet করে
   */
  async updateWageringProgress(userId, betAmount, gameType, gameId) {
    try {
      // Get all active bonuses for user
      const activeBonuses = await UserBonusInstance.find({
        userId,
        status: { $in: ['ACTIVE', 'WAGERING'] },
        expiryDate: { $gt: new Date() },
      });

      if (!activeBonuses.length) {
        return { success: true, message: 'No active bonuses' };
      }

      const updates = [];

      for (const bonus of activeBonuses) {
        // Check if game is allowed
        const bonusConfig = await BonusConfiguration.findById(bonus.bonusConfigId);
        
        if (bonusConfig) {
          const allowedGames = bonusConfig.wageringRequirements.allowedGames;
          if (allowedGames && allowedGames.length > 0 && !allowedGames.includes(gameId)) {
            continue; // Skip this bonus
          }

          // Add wagering
          await bonus.addWagering(betAmount, gameType);

          updates.push({
            instanceId: bonus.instanceId,
            wageringCompleted: bonus.wageringCompleted,
            wageringProgress: bonus.wageringProgress,
            status: bonus.status,
          });

          // Check if completed
          if (bonus.status === 'COMPLETED') {
            await bonusConfig.updateStats('completed');
            console.log(`✅ Bonus completed: ${bonus.instanceId}`);
          }
        }
      }

      return {
        success: true,
        updates,
      };
    } catch (error) {
      console.error('❌ Update Wagering Progress Error:', error);
      throw error;
    }
  }

  /**
   * Check Claim Limits
   * User কতবার bonus claim করতে পারবে তা check করে
   */
  async checkClaimLimits(userId, bonusConfig) {
    try {
      const { claimLimits } = bonusConfig;

      // Check total claims per user
      if (claimLimits.maxClaimsPerUser) {
        const totalClaims = await UserBonusInstance.countDocuments({
          userId,
          bonusConfigId: bonusConfig._id,
        });

        if (totalClaims >= claimLimits.maxClaimsPerUser) {
          return { allowed: false, reason: 'Maximum claims per user reached' };
        }
      }

      // Check daily claims
      if (claimLimits.maxClaimsPerDay) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dailyClaims = await UserBonusInstance.countDocuments({
          userId,
          bonusConfigId: bonusConfig._id,
          claimedAt: { $gte: today },
        });

        if (dailyClaims >= claimLimits.maxClaimsPerDay) {
          return { allowed: false, reason: 'Maximum daily claims reached' };
        }
      }

      // Check cooldown
      if (claimLimits.cooldownHours) {
        const cooldownDate = new Date();
        cooldownDate.setHours(cooldownDate.getHours() - claimLimits.cooldownHours);

        const recentClaim = await UserBonusInstance.findOne({
          userId,
          bonusConfigId: bonusConfig._id,
          claimedAt: { $gte: cooldownDate },
        });

        if (recentClaim) {
          return { allowed: false, reason: 'Cooldown period not elapsed' };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('❌ Check Claim Limits Error:', error);
      return { allowed: false, reason: 'Error checking limits' };
    }
  }

  /**
   * Claim Bonus
   * User bonus claim করে
   */
  async claimBonus(userId, instanceId) {
    try {
      const bonus = await UserBonusInstance.findOne({ instanceId, userId });

      if (!bonus) {
        return { success: false, message: 'Bonus not found' };
      }

      if (bonus.status !== 'PENDING') {
        return { success: false, message: 'Bonus already claimed or not claimable' };
      }

      await bonus.activate();

      console.log(`✅ Bonus claimed: ${instanceId}`);

      return {
        success: true,
        bonus: {
          instanceId: bonus.instanceId,
          bonusAmount: bonus.bonusAmount,
          wageringRequired: bonus.wageringRequired,
          expiryDate: bonus.expiryDate,
        },
      };
    } catch (error) {
      console.error('❌ Claim Bonus Error:', error);
      throw error;
    }
  }

  /**
   * Expire Old Bonuses
   * পুরনো expired bonuses update করে
   */
  async expireOldBonuses() {
    try {
      const expiredBonuses = await UserBonusInstance.find({
        status: { $in: ['ACTIVE', 'WAGERING', 'PENDING'] },
        expiryDate: { $lt: new Date() },
      });

      let count = 0;
      for (const bonus of expiredBonuses) {
        await bonus.checkExpiry();
        count++;
      }

      console.log(`✅ Expired ${count} bonuses`);

      return { success: true, count };
    } catch (error) {
      console.error('❌ Expire Bonuses Error:', error);
      throw error;
    }
  }
}

module.exports = new BonusProcessingService();
