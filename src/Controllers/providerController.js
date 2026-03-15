const ProviderAPIService = require('../services/thirdParty/ProviderAPIService');
const ThirdPartyProvider = require('../models/ThirdPartyProvider');
const ProviderGameSession = require('../models/ProviderGameSession');
const ProviderTransaction = require('../models/ProviderTransaction');

/**
 * Provider Controller
 * Third-party provider এর সব operations handle করে
 */
class ProviderController {
  
  /**
   * Get All Providers
   * সব active provider এর list
   */
  async getAllProviders(req, res) {
    try {
      const { type, isActive = true } = req.query;
      
      const query = {};
      if (type) query.providerType = type;
      if (isActive !== undefined) query.isActive = isActive === 'true';
      
      const providers = await ThirdPartyProvider.find(query)
        .select('-apiConfig.secretKey -webhookConfig.secret')
        .sort({ providerName: 1 });
      
      res.status(200).json({
        success: true,
        count: providers.length,
        data: providers,
      });
    } catch (error) {
      console.error('❌ Get Providers Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch providers',
        error: error.message,
      });
    }
  }
  
  /**
   * Create Member
   * Provider এ নতুন member তৈরি করে
   */
  async createMember(req, res) {
    try {
      const { providerCode, userId, username, currency, language } = req.body;
      
      if (!providerCode || !userId || !username) {
        return res.status(400).json({
          success: false,
          message: 'Provider code, user ID, and username are required',
        });
      }
      
      const result = await ProviderAPIService.createMember(providerCode, {
        userId,
        username,
        currency: currency || 'BDT',
        language: language || 'bn',
      });
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Member created successfully',
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to create member',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('❌ Create Member Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
  
  /**
   * Get Balance
   * User এর provider balance check করে
   */
  async getBalance(req, res) {
    try {
      const { providerCode, userId } = req.params;
      
      const result = await ProviderAPIService.getBalance(providerCode, userId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            balance: result.data.balance,
            currency: result.data.currency || 'BDT',
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to get balance',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('❌ Get Balance Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
  
  /**
   * Launch Game
   * Game launch করে
   */
  async launchGame(req, res) {
    try {
      const { providerCode, gameId } = req.params;
      const userId = req.user?.userId || req.body.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }
      
      const options = {
        platform: req.body.platform || 'WEB',
        language: req.body.language || 'bn',
        returnUrl: req.body.returnUrl || '',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceType: req.body.deviceType || 'DESKTOP',
      };
      
      const result = await ProviderAPIService.launchGame(
        providerCode,
        userId,
        gameId,
        options
      );
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Game launched successfully',
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to launch game',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('❌ Launch Game Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
  
  /**
   * Get User Sessions
   * User এর সব game session
   */
  async getUserSessions(req, res) {
    try {
      const { userId } = req.params;
      const { status, limit = 20, skip = 0 } = req.query;
      
      const query = { userId };
      if (status) query.status = status;
      
      const sessions = await ProviderGameSession.find(query)
        .sort({ startTime: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .populate('providerId', 'providerName providerCode');
      
      const total = await ProviderGameSession.countDocuments(query);
      
      res.status(200).json({
        success: true,
        count: sessions.length,
        total,
        data: sessions,
      });
    } catch (error) {
      console.error('❌ Get Sessions Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sessions',
        error: error.message,
      });
    }
  }
  
  /**
   * Get User Transactions
   * User এর সব transaction
   */
  async getUserTransactions(req, res) {
    try {
      const { userId } = req.params;
      const { 
        transactionType, 
        startDate, 
        endDate,
        limit = 50, 
        skip = 0 
      } = req.query;
      
      const options = {
        limit: parseInt(limit),
        skip: parseInt(skip),
      };
      
      if (transactionType) options.transactionType = transactionType;
      if (startDate && endDate) {
        options.startDate = new Date(startDate);
        options.endDate = new Date(endDate);
      }
      
      const transactions = await ProviderTransaction.getUserTransactions(userId, options);
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      console.error('❌ Get Transactions Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message,
      });
    }
  }
  
  /**
   * Get Transaction Stats
   * User এর transaction statistics
   */
  async getTransactionStats(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }
      
      const stats = await ProviderTransaction.getTransactionStats(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ Get Stats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message,
      });
    }
  }
  
  /**
   * End Game Session
   * Game session শেষ করে
   */
  async endSession(req, res) {
    try {
      const { sessionId } = req.params;
      
      const result = await ProviderAPIService.endGameSession(sessionId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Session ended successfully',
          data: result.session,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to end session',
        });
      }
    } catch (error) {
      console.error('❌ End Session Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
  
  /**
   * Get Game List
   * Provider থেকে game list
   */
  async getGameList(req, res) {
    try {
      const { providerCode } = req.params;
      const { category, limit = 100, offset = 0 } = req.query;

      const result = await ProviderAPIService.getGameList(providerCode, {
        category,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to fetch game list',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('❌ Get Game List Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Get Provider By ID
   * Specific provider details
   */
  async getProviderById(req, res) {
    try {
      const { id } = req.params;

      const provider = await ThirdPartyProvider.findById(id)
        .select('-apiConfig.secretKey -webhookConfig.secret');

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found',
        });
      }

      res.status(200).json({
        success: true,
        data: provider,
      });
    } catch (error) {
      console.error('❌ Get Provider Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch provider',
        error: error.message,
      });
    }
  }

  /**
   * Create Provider
   * New provider তৈরি করে
   */
  async createProvider(req, res) {
    try {
      const providerData = req.body;

      const provider = await ThirdPartyProvider.create(providerData);

      res.status(201).json({
        success: true,
        message: 'Provider created successfully',
        data: provider,
      });
    } catch (error) {
      console.error('❌ Create Provider Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create provider',
        error: error.message,
      });
    }
  }

  /**
   * Update Provider
   * Provider update করে
   */
  async updateProvider(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const provider = await ThirdPartyProvider.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-apiConfig.secretKey -webhookConfig.secret');

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Provider updated successfully',
        data: provider,
      });
    } catch (error) {
      console.error('❌ Update Provider Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update provider',
        error: error.message,
      });
    }
  }

  /**
   * Delete Provider
   * Provider delete করে
   */
  async deleteProvider(req, res) {
    try {
      const { id } = req.params;

      const provider = await ThirdPartyProvider.findByIdAndDelete(id);

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Provider deleted successfully',
      });
    } catch (error) {
      console.error('❌ Delete Provider Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete provider',
        error: error.message,
      });
    }
  }
}

module.exports = new ProviderController();
