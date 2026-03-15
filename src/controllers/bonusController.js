const BonusProcessingService = require('../services/bonus/BonusProcessingService');
const BonusConfiguration = require('../models/BonusConfiguration');
const UserBonusInstance = require('../models/UserBonusInstance');

/**
 * Bonus Controller
 * সব bonus operations handle করে
 */
class BonusController {
  
  /**
   * Get Available Bonuses
   * User এর জন্য available bonuses
   */
  async getAvailableBonuses(req, res) {
    try {
      const { category, bonusType } = req.query;
      
      const query = { isActive: true };
      if (category) query.category = category;
      if (bonusType) query.bonusType = bonusType;
      
      const bonuses = await BonusConfiguration.find(query)
        .sort({ priority: -1 })
        .select('-stats -metadata');
      
      res.status(200).json({
        success: true,
        count: bonuses.length,
        data: bonuses,
      });
    } catch (error) {
      console.error('❌ Get Available Bonuses Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bonuses',
        error: error.message,
      });
    }
  }
  
  /**
   * Get User Active Bonuses
   * User এর active bonuses
   */
  async getUserActiveBonuses(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      
      const bonuses = await UserBonusInstance.getUserActiveBonuses(userId);
      
      res.status(200).json({
        success: true,
        count: bonuses.length,
        data: bonuses,
      });
    } catch (error) {
      console.error('❌ Get Active Bonuses Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active bonuses',
        error: error.message,
      });
    }
  }
  
  /**
   * Get User Bonus History
   * User এর bonus history
   */
  async getUserBonusHistory(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { status, limit = 50, skip = 0 } = req.query;
      
      const options = {
        limit: parseInt(limit),
        skip: parseInt(skip),
      };
      if (status) options.status = status;
      
      const bonuses = await UserBonusInstance.getUserBonusHistory(userId, options);
      
      res.status(200).json({
        success: true,
        count: bonuses.length,
        data: bonuses,
      });
    } catch (error) {
      console.error('❌ Get Bonus History Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bonus history',
        error: error.message,
      });
    }
  }
  
  /**
   * Process Deposit Bonus
   * Deposit bonus process করে
   */
  async processDepositBonus(req, res) {
    try {
      const { userId, depositAmount, transactionId, bonusType } = req.body;
      
      if (!userId || !depositAmount || !transactionId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, deposit amount, and transaction ID are required',
        });
      }
      
      const result = await BonusProcessingService.processDepositBonus(
        userId,
        depositAmount,
        transactionId,
        bonusType || 'FIRST_DEPOSIT'
      );
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Deposit bonus processed successfully',
          data: result.bonus,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('❌ Process Deposit Bonus Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process deposit bonus',
        error: error.message,
      });
    }
  }
  
  /**
   * Process Cashback
   * Cashback bonus process করে
   */
  async processCashback(req, res) {
    try {
      const userId = req.user?.userId || req.body.userId;
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }
      
      const result = await BonusProcessingService.processCashbackBonus(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Cashback processed successfully',
          data: result.bonus,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('❌ Process Cashback Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process cashback',
        error: error.message,
      });
    }
  }
  
  /**
   * Process Rebate
   * Rebate bonus process করে
   */
  async processRebate(req, res) {
    try {
      const userId = req.user?.userId || req.body.userId;
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }
      
      const result = await BonusProcessingService.processRebateBonus(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Rebate processed successfully',
          data: result.bonus,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('❌ Process Rebate Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process rebate',
        error: error.message,
      });
    }
  }
  
  /**
   * Claim Bonus
   * User bonus claim করে
   */
  async claimBonus(req, res) {
    try {
      const userId = req.user?.userId || req.body.userId;
      const { instanceId } = req.params;
      
      const result = await BonusProcessingService.claimBonus(userId, instanceId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Bonus claimed successfully',
          data: result.bonus,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('❌ Claim Bonus Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to claim bonus',
        error: error.message,
      });
    }
  }
  
  /**
   * Get Bonus Stats
   * User এর bonus statistics
   */
  async getBonusStats(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }
      
      const stats = await UserBonusInstance.getUserBonusStats(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ Get Bonus Stats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bonus statistics',
        error: error.message,
      });
    }
  }
  
  /**
   * Cancel Bonus
   * Bonus cancel করে
   */
  async cancelBonus(req, res) {
    try {
      const userId = req.user?.userId || req.body.userId;
      const { instanceId } = req.params;
      const { reason } = req.body;
      
      const bonus = await UserBonusInstance.findOne({ instanceId, userId });
      
      if (!bonus) {
        return res.status(404).json({
          success: false,
          message: 'Bonus not found',
        });
      }
      
      await bonus.cancel(reason || 'User requested cancellation', userId);
      
      res.status(200).json({
        success: true,
        message: 'Bonus cancelled successfully',
      });
    } catch (error) {
      console.error('❌ Cancel Bonus Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel bonus',
        error: error.message,
      });
    }
  }
}

module.exports = new BonusController();
