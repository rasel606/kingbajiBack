const axios = require('axios');
const crypto = require('crypto');
const ThirdPartyProvider = require('../../models/ThirdPartyProvider');
const ProviderGameSession = require('../../models/ProviderGameSession');
const ProviderTransaction = require('../../models/ProviderTransaction');

/**
 * Third-Party Provider API Service
 * সব third-party provider এর সাথে communicate করার জন্য
 */
class ProviderAPIService {
  constructor() {
    this.rateLimitCache = new Map();
  }

  /**
   * Generate Authentication Signature
   * API authentication এর জন্য signature তৈরি করে
   */
  generateSignature(data, secretKey) {
    const sortedData = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', secretKey)
      .update(sortedData)
      .digest('hex');
  }

  /**
   * Check Rate Limit
   * Rate limit check করে
   */
  async checkRateLimit(providerId, timeWindow = 'minute') {
    const provider = await ThirdPartyProvider.findById(providerId);
    if (!provider) throw new Error('Provider not found');

    const cacheKey = `${providerId}_${timeWindow}`;
    const now = Date.now();
    const windowMs = timeWindow === 'minute' ? 60000 : 3600000;

    if (!this.rateLimitCache.has(cacheKey)) {
      this.rateLimitCache.set(cacheKey, { count: 0, resetAt: now + windowMs });
    }

    const rateLimit = this.rateLimitCache.get(cacheKey);

    if (now > rateLimit.resetAt) {
      rateLimit.count = 0;
      rateLimit.resetAt = now + windowMs;
    }

    if (provider.isRateLimitExceeded(rateLimit.count, timeWindow)) {
      throw new Error(`Rate limit exceeded for ${timeWindow}`);
    }

    rateLimit.count += 1;
    return true;
  }

  /**
   * Make API Request
   * Generic API request method
   */
  async makeRequest(provider, endpoint, method = 'POST', data = {}) {
    try {
      await this.checkRateLimit(provider._id);

      const url = `${provider.apiConfig.baseUrl}${endpoint}`;
      const timestamp = Date.now();

      // Add common parameters
      const requestData = {
        ...data,
        operatorCode: provider.apiConfig.operatorCode,
        timestamp,
      };

      // Generate signature
      const signature = this.generateSignature(requestData, provider.apiConfig.secretKey);
      requestData.signature = signature;

      const config = {
        method,
        url,
        data: requestData,
        timeout: provider.apiConfig.timeout,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': provider.apiConfig.apiVersion,
        },
      };

      const startTime = Date.now();
      const response = await axios(config);
      const processingTime = Date.now() - startTime;

      // Log successful request
      console.log(`✅ API Request Success: ${provider.providerCode} - ${endpoint} (${processingTime}ms)`);

      return {
        success: true,
        data: response.data,
        processingTime,
      };
    } catch (error) {
      console.error(`❌ API Request Failed: ${provider.providerCode} - ${endpoint}`, error.message);
      
      return {
        success: false,
        error: {
          message: error.message,
          code: error.response?.data?.code || 'UNKNOWN_ERROR',
          details: error.response?.data,
        },
      };
    }
  }

  /**
   * Create Member
   * Provider এ নতুন member তৈরি করে
   */
  async createMember(providerCode, userData) {
    try {
      const provider = await ThirdPartyProvider.findOne({ 
        providerCode, 
        isActive: true 
      }).select('+apiConfig.secretKey');

      if (!provider) {
        throw new Error(`Provider ${providerCode} not found or inactive`);
      }

      const memberData = {
        userId: userData.userId,
        username: userData.username,
        currency: userData.currency || 'BDT',
        language: userData.language || 'bn',
      };

      const result = await this.makeRequest(
        provider,
        '/api/member/create',
        'POST',
        memberData
      );

      if (result.success) {
        console.log(`✅ Member created: ${userData.username} on ${providerCode}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Create Member Error:', error);
      throw error;
    }
  }

  /**
   * Get Balance
   * User এর balance check করে
   */
  async getBalance(providerCode, userId) {
    try {
      const provider = await ThirdPartyProvider.findOne({ 
        providerCode, 
        isActive: true 
      }).select('+apiConfig.secretKey');

      if (!provider) {
        throw new Error(`Provider ${providerCode} not found`);
      }

      const result = await this.makeRequest(
        provider,
        '/api/member/balance',
        'POST',
        { userId }
      );

      return result;
    } catch (error) {
      console.error('❌ Get Balance Error:', error);
      throw error;
    }
  }

  /**
   * Launch Game
   * Game launch করে এবং session তৈরি করে
   */
  async launchGame(providerCode, userId, gameId, options = {}) {
    try {
      const provider = await ThirdPartyProvider.findOne({ 
        providerCode, 
        isActive: true 
      }).select('+apiConfig.secretKey');

      if (!provider) {
        throw new Error(`Provider ${providerCode} not found`);
      }

      // Generate unique session ID
      const sessionId = `${providerCode}_${userId}_${Date.now()}`;

      const launchData = {
        userId,
        gameId,
        sessionId,
        platform: options.platform || 'WEB',
        language: options.language || 'bn',
        returnUrl: options.returnUrl || '',
      };

      const result = await this.makeRequest(
        provider,
        '/api/game/launch',
        'POST',
        launchData
      );

      if (result.success) {
        // Create game session record
        const session = await ProviderGameSession.create({
          sessionId,
          userId,
          providerId: provider._id,
          providerCode,
          gameId,
          gameName: result.data.gameName || gameId,
          gameType: provider.providerType,
          gameUrl: result.data.gameUrl,
          token: result.data.token,
          initialBalance: result.data.balance || 0,
          currentBalance: result.data.balance || 0,
          deviceInfo: {
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            deviceType: options.deviceType || 'DESKTOP',
            platform: options.platform || 'WEB',
          },
        });

        console.log(`✅ Game launched: ${gameId} for user ${userId}`);

        return {
          success: true,
          data: {
            gameUrl: result.data.gameUrl,
            sessionId: session.sessionId,
            token: result.data.token,
          },
        };
      }

      return result;
    } catch (error) {
      console.error('❌ Launch Game Error:', error);
      throw error;
    }
  }

  /**
   * Process Bet
   * Bet transaction process করে
   */
  async processBet(providerCode, betData) {
    try {
      const provider = await ThirdPartyProvider.findOne({ 
        providerCode, 
        isActive: true 
      }).select('+apiConfig.secretKey');

      if (!provider) {
        throw new Error(`Provider ${providerCode} not found`);
      }

      // Generate transaction ID
      const transactionId = `BET_${providerCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const transaction = await ProviderTransaction.create({
        transactionId,
        providerTransactionId: betData.providerTransactionId,
        userId: betData.userId,
        providerId: provider._id,
        providerCode,
        sessionId: betData.sessionId,
        gameId: betData.gameId,
        gameName: betData.gameName,
        gameType: provider.providerType,
        transactionType: 'BET',
        amount: betData.amount,
        currency: betData.currency || 'BDT',
        balanceBefore: betData.balanceBefore,
        balanceAfter: betData.balanceBefore - betData.amount,
        roundId: betData.roundId,
        status: 'PENDING',
        requestData: betData,
      });

      // Process bet with provider
      const result = await this.makeRequest(
        provider,
        '/api/transaction/bet',
        'POST',
        {
          transactionId,
          userId: betData.userId,
          gameId: betData.gameId,
          amount: betData.amount,
          roundId: betData.roundId,
        }
      );

      if (result.success) {
        await transaction.markAsCompleted();
        
        // Update session
        if (betData.sessionId) {
          const session = await ProviderGameSession.findOne({ sessionId: betData.sessionId });
          if (session) {
            await session.updateBalance(betData.amount, 0);
          }
        }

        // Update provider stats
        await provider.updateStats(betData.amount, 0);
      } else {
        await transaction.markAsFailed(result.error.code, result.error.message);
      }

      return {
        success: result.success,
        transactionId,
        balance: result.data?.balance,
      };
    } catch (error) {
      console.error('❌ Process Bet Error:', error);
      throw error;
    }
  }

  /**
   * Process Win
   * Win transaction process করে
   */
  async processWin(providerCode, winData) {
    try {
      const provider = await ThirdPartyProvider.findOne({ 
        providerCode, 
        isActive: true 
      }).select('+apiConfig.secretKey');

      if (!provider) {
        throw new Error(`Provider ${providerCode} not found`);
      }

      const transactionId = `WIN_${providerCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const transaction = await ProviderTransaction.create({
        transactionId,
        providerTransactionId: winData.providerTransactionId,
        userId: winData.userId,
        providerId: provider._id,
        providerCode,
        sessionId: winData.sessionId,
        gameId: winData.gameId,
        gameName: winData.gameName,
        gameType: provider.providerType,
        transactionType: 'WIN',
        amount: winData.amount,
        currency: winData.currency || 'BDT',
        balanceBefore: winData.balanceBefore,
        balanceAfter: winData.balanceBefore + winData.amount,
        roundId: winData.roundId,
        status: 'PENDING',
        requestData: winData,
      });

      const result = await this.makeRequest(
        provider,
        '/api/transaction/win',
        'POST',
        {
          transactionId,
          userId: winData.userId,
          gameId: winData.gameId,
          amount: winData.amount,
          roundId: winData.roundId,
        }
      );

      if (result.success) {
        await transaction.markAsCompleted();
        
        // Update session
        if (winData.sessionId) {
          const session = await ProviderGameSession.findOne({ sessionId: winData.sessionId });
          if (session) {
            await session.updateBalance(0, winData.amount);
          }
        }

        // Update provider stats
        await provider.updateStats(0, winData.amount);
      } else {
        await transaction.markAsFailed(result.error.code, result.error.message);
      }

      return {
        success: result.success,
        transactionId,
        balance: result.data?.balance,
      };
    } catch (error) {
      console.error('❌ Process Win Error:', error);
      throw error;
    }
  }

  /**
   * End Game Session
   * Game session শেষ করে
   */
  async endGameSession(sessionId) {
    try {
      const session = await ProviderGameSession.findOne({ sessionId });
      
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status === 'ACTIVE') {
        await session.endSession();
        console.log(`✅ Session ended: ${sessionId}`);
      }

      return {
        success: true,
        session: {
          sessionId: session.sessionId,
          duration: session.duration,
          totalBet: session.totalBet,
          totalWin: session.totalWin,
          netProfit: session.netProfit,
        },
      };
    } catch (error) {
      console.error('❌ End Session Error:', error);
      throw error;
    }
  }

  /**
   * Get Game List
   * Provider থেকে game list নিয়ে আসে
   */
  async getGameList(providerCode, options = {}) {
    try {
      const provider = await ThirdPartyProvider.findOne({ 
        providerCode, 
        isActive: true 
      }).select('+apiConfig.secretKey');

      if (!provider) {
        throw new Error(`Provider ${providerCode} not found`);
      }

      const result = await this.makeRequest(
        provider,
        '/api/games/list',
        'POST',
        {
          category: options.category,
          limit: options.limit || 100,
          offset: options.offset || 0,
        }
      );

      return result;
    } catch (error) {
      console.error('❌ Get Game List Error:', error);
      throw error;
    }
  }
}

module.exports = new ProviderAPIService();
