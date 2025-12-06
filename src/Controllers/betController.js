const BettingHistory = require('../models/BettingHistory');
const GameListTable = require('../models/GameListTable');
const BetProviderTable = require('../models/BetProviderTable');
const Category = require('../models/Category');

// ১. নতুন BetData তৈরি (BettingHistory + GameListTable)
exports.createNewBetData = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // প্রথমে BettingHistory ডাটা fetch করি
    const bettingHistoryFilter = { member: userId };
    
    if (startDate && endDate) {
      bettingHistoryFilter.start_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bettingHistories = await BettingHistory.find(bettingHistoryFilter).lean();
console.log(bettingHistories);
    if (bettingHistories.length === 0) {
      return res.json({
        success: true,
        message: 'No betting history found',
        data: []
      });
    }

    // GameListTable থেকে matching গেমস খুঁজি
    const gamePromises = bettingHistories.map(async (bet) => {
      const game = await GameListTable.findOne({
        g_code: bet.game_id,
        p_code: bet.site
      }).lean();
console.log(game);
      if (game) {
        // নতুন ডাটা তৈরি - BettingHistory + GameListTable ডাটা একসাথে
        return {
          ...bet,
          gameData: {
            g_code: game.g_code,
            p_code: game.p_code,
            g_type: game.g_type,
            category_name: game.category_name,
            gameName: game.gameName,
            imgFileName: game.imgFileName,
            brand: game.brand,
            externalgid: game.externalgid,
            is_hot: game.is_hot,
            isFeatured: game.isFeatured
          },
          profitLoss: (bet.payout - bet.bet) // Profit/Loss ক্যালকুলেশন
        };
      }
      return null;
    });

    const newBetData = (await Promise.all(gamePromises)).filter(item => item !== null);

    return res.json({
      success: true,
      count: newBetData.length,
      data: newBetData
    });

  } catch (err) {
    console.error('Error creating new bet data:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ২. ক্যাটেগরি ওয়াইজ প্রোভাইডার সহ ডাটা তৈরি
exports.getCategoryWithUniqueProviders = async (req, res) => {
  try {
    const { category_name } = req.query;

    // ক্যাটেগরি ফিল্টার
    const categoryFilter = { id_active: true };
    if (category_name && category_name !== 'ALL') {
      categoryFilter.category_name = category_name;
    }

    // সব ক্যাটেগরি fetch করি
    const categories = await Category.find(categoryFilter)
      .select('category_name category_code g_type image')
      .lean();

    if (categories.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // BetProviderTable থেকে প্রোভাইডার fetch করি
    const providers = await BetProviderTable.find({ id_active: true })
      .select('name providercode g_type company image_url')
      .lean();

    // ক্যাটেগরি ওয়াইজ প্রোভাইডার ম্যাপ তৈরি
    const result = categories.map(category => {
      const categoryGType = category.g_type;
      
      // প্রোভাইডার ফিল্টার করি যাদের g_type array-তে এই category.g_type আছে
      const matchedProviders = providers.filter(provider => {
        if (!provider.g_type || !Array.isArray(provider.g_type)) return false;
        return provider.g_type.includes(categoryGType);
      });

      // ইউনিক প্রোভাইডার তৈরি
      const uniqueProviders = Array.from(
        new Map(matchedProviders.map(p => [p.providercode, p])).values()
      );

      return {
        category_name: category.category_name,
        category_code: category.category_code,
        g_type: category.g_type,
        image: category.image,
        uniqueProviders: uniqueProviders,
        providerCount: uniqueProviders.length
      };
    });

    return res.json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (err) {
    console.error('Error getting category with providers:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ৩. রিবেট সারাংশ ডাটা (Summary)
exports.getRebateSummary = async (req, res) => {
  try {
    const { userId, category_name, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // প্রথমে নতুন BetData তৈরি করি
    const bettingHistoryFilter = { member: userId };
    
    if (startDate && endDate) {
      bettingHistoryFilter.start_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bettingHistories = await BettingHistory.find(bettingHistoryFilter).lean();

    // GameListTable থেকে matching গেমস
    const gamePromises = bettingHistories.map(async (bet) => {
      const game = await GameListTable.findOne({
        g_code: bet.game_id,
        p_code: bet.product
      }).lean();

      if (game) {
        return {
          ...bet,
          gameData: {
            g_type: game.g_type,
            category_name: game.category_name,
            p_code: game.p_code
          },
          profitLoss: (bet.payout - bet.bet)
        };
      }
      return null;
    });

    const newBetData = (await Promise.all(gamePromises)).filter(item => item !== null);

    // ক্যাটেগরি ফিল্টার
    let filteredBetData = newBetData;
    if (category_name && category_name !== 'ALL') {
      filteredBetData = newBetData.filter(bet => 
        bet.gameData && bet.gameData.category_name === category_name
      );
    }

    // ক্যাটেগরি ওয়াইজ গ্রুপিং
    const categorySummary = {};
    let totalTurnover = 0;
    let totalProfitLoss = 0;
    let totalBet = 0;
    let totalPayout = 0;

    filteredBetData.forEach(bet => {
      const category = bet.gameData ? bet.gameData.category_name : 'Unknown';
      
      if (!categorySummary[category]) {
        categorySummary[category] = {
          category_name: category,
          totalTurnover: 0,
          totalProfitLoss: 0,
          totalBet: 0,
          totalPayout: 0,
          betCount: 0,
          providers: new Set()
        };
      }

      categorySummary[category].totalTurnover += bet.turnover || 0;
      categorySummary[category].totalProfitLoss += (bet.payout - bet.bet) || 0;
      categorySummary[category].totalBet += bet.bet || 0;
      categorySummary[category].totalPayout += bet.payout || 0;
      categorySummary[category].betCount += 1;
      
      if (bet.gameData && bet.gameData.p_code) {
        categorySummary[category].providers.add(bet.gameData.p_code);
      }

      // টোটাল হিসাব
      totalTurnover += bet.turnover || 0;
      totalProfitLoss += (bet.payout - bet.bet) || 0;
      totalBet += bet.bet || 0;
      totalPayout += bet.payout || 0;
    });

    // ক্যাটেগরি ওয়াইজ ডাটা ফরম্যাট
    const categoryWiseData = Object.values(categorySummary).map(cat => ({
      ...cat,
      providers: Array.from(cat.providers),
      averageBet: cat.totalBet / cat.betCount,
      averageProfitLoss: cat.totalProfitLoss / cat.betCount
    }));

    // সোর্স (BetProviderTable) থেকে প্রোভাইডার ডিটেইলস
    const providerCodes = [...new Set(filteredBetData
      .map(bet => bet.gameData?.p_code)
      .filter(code => code)
    )];

    const providers = await BetProviderTable.find({
      providercode: { $in: providerCodes },
      id_active: true
    }).select('name providercode company image_url g_type').lean();

    const response = {
      success: true,
      summary: {
        totalRecords: filteredBetData.length,
        totalTurnover,
        totalProfitLoss,
        totalBet,
        totalPayout,
        averageBet: totalBet / filteredBetData.length,
        averageProfitLoss: totalProfitLoss / filteredBetData.length
      },
      categoryWiseData,
      betDetails: filteredBetData.map(bet => ({
        id: bet.id,
        ref_no: bet.ref_no,
        game_id: bet.game_id,
        product: bet.product,
        category: bet.gameData?.category_name,
        provider: bet.gameData?.p_code,
        bet: bet.bet,
        payout: bet.payout,
        profitLoss: (bet.payout - bet.bet),
        turnover: bet.turnover,
        start_time: bet.start_time,
        status: bet.status
      })),
      availableProviders: providers,
      availableCategories: [...new Set(filteredBetData
        .map(bet => bet.gameData?.category_name)
        .filter(name => name)
      )]
    };

    return res.json(response);

  } catch (err) {
    console.error('Error getting rebate summary:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ৪. ডিটেইলড রিবেট রিপোর্ট
exports.getDetailedRebateReport = async (req, res) => {
  try {
    const { userId, category, provider, startDate, endDate, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // BettingHistory ফিল্টার
    const bettingFilter = { member: userId };
    
    if (startDate && endDate) {
      bettingFilter.start_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // BettingHistory fetch
    const bettingHistories = await BettingHistory.find(bettingFilter)
      .sort({ start_time: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalCount = await BettingHistory.countDocuments(bettingFilter);

    // GameListTable থেকে matching গেমস
    const detailedData = [];
    for (const bet of bettingHistories) {
      const game = await GameListTable.findOne({
        g_code: bet.game_id,
        p_code: bet.product
      }).lean();

      if (game) {
        // ক্যাটেগরি এবং প্রোভাইডার ফিল্টার
        if (category && category !== 'ALL' && game.category_name !== category) {
          continue;
        }
        
        if (provider && provider !== 'ALL' && game.p_code !== provider) {
          continue;
        }

        // BetProviderTable থেকে প্রোভাইডার ডিটেইলস
        const providerDetails = await BetProviderTable.findOne({
          providercode: game.p_code
        }).select('name company image_url').lean();

        detailedData.push({
          bettingDetails: {
            ...bet,
            profitLoss: (bet.payout - bet.bet),
            commission: bet.commission || 0,
            p_share: bet.p_share || 0,
            p_win: bet.p_win || 0
          },
          gameDetails: {
            gameName: game.gameName?.gameName_enus || game.gameNameTrial,
            category_name: game.category_name,
            g_type: game.g_type,
            brand: game.brand,
            imgFileName: game.imgFileName,
            is_hot: game.is_hot,
            isFeatured: game.isFeatured
          },
          providerDetails: providerDetails || { name: 'Unknown', company: 'Unknown' }
        });
      }
    }

    // এগ্রিগেটেড ডাটা
    const aggregatedData = detailedData.reduce((acc, curr) => {
      const category = curr.gameDetails.category_name || 'Unknown';
      const provider = curr.providerDetails.name || 'Unknown';
      
      if (!acc[category]) {
        acc[category] = {
          category_name: category,
          totalTurnover: 0,
          totalProfitLoss: 0,
          totalCommission: 0,
          providerWise: {}
        };
      }

      acc[category].totalTurnover += curr.bettingDetails.turnover || 0;
      acc[category].totalProfitLoss += curr.bettingDetails.profitLoss || 0;
      acc[category].totalCommission += curr.bettingDetails.commission || 0;

      if (!acc[category].providerWise[provider]) {
        acc[category].providerWise[provider] = {
          providerName: provider,
          company: curr.providerDetails.company,
          totalTurnover: 0,
          totalProfitLoss: 0,
          betCount: 0
        };
      }

      acc[category].providerWise[provider].totalTurnover += curr.bettingDetails.turnover || 0;
      acc[category].providerWise[provider].totalProfitLoss += curr.bettingDetails.profitLoss || 0;
      acc[category].providerWise[provider].betCount += 1;

      return acc;
    }, {});

    // ফরম্যাটেড এগ্রিগেটেড ডাটা
    const formattedAggregatedData = Object.values(aggregatedData).map(cat => ({
      ...cat,
      providerWise: Object.values(cat.providerWise)
    }));

    const response = {
      success: true,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalRecords: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPageCount: detailedData.length
      },
      aggregatedSummary: formattedAggregatedData,
      detailedRecords: detailedData,
      filtersApplied: {
        userId,
        category,
        provider,
        startDate,
        endDate
      }
    };

    return res.json(response);

  } catch (err) {
    console.error('Error getting detailed rebate report:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ৫. ইউজারের জন্য রিবেট ড্যাশবোর্ড
exports.getUserRebateDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // সাম্প্রতিক 30 দিনের ডাটা
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // BettingHistory fetch
    const recentBets = await BettingHistory.find({
      member: userId,
      start_time: { $gte: thirtyDaysAgo }
    }).lean();

    // নতুন BetData তৈরি
    const dashboardData = [];
    for (const bet of recentBets) {
      const game = await GameListTable.findOne({
        g_code: bet.game_id,
        p_code: bet.product
      }).lean();

      if (game) {
        const provider = await BetProviderTable.findOne({
          providercode: game.p_code
        }).select('name company').lean();

        dashboardData.push({
          date: bet.start_time,
          gameName: game.gameName?.gameName_enus || game.gameNameTrial,
          category: game.category_name,
          provider: provider?.name || 'Unknown',
          betAmount: bet.bet,
          payout: bet.payout,
          profitLoss: (bet.payout - bet.bet),
          turnover: bet.turnover,
          status: bet.status
        });
      }
    }

    // ডেইলি, ক্যাটেগরি ও প্রোভাইডার ওয়াইজ সামারি
    const dailySummary = {};
    const categorySummary = {};
    const providerSummary = {};

    dashboardData.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      
      // ডেইলি সামারি
      if (!dailySummary[dateStr]) {
        dailySummary[dateStr] = {
          date: dateStr,
          totalBet: 0,
          totalPayout: 0,
          totalProfitLoss: 0,
          totalTurnover: 0,
          betCount: 0
        };
      }
      dailySummary[dateStr].totalBet += item.betAmount;
      dailySummary[dateStr].totalPayout += item.payout;
      dailySummary[dateStr].totalProfitLoss += item.profitLoss;
      dailySummary[dateStr].totalTurnover += item.turnover;
      dailySummary[dateStr].betCount += 1;

      // ক্যাটেগরি সামারি
      const category = item.category || 'Unknown';
      if (!categorySummary[category]) {
        categorySummary[category] = {
          category_name: category,
          totalBet: 0,
          totalProfitLoss: 0,
          totalTurnover: 0,
          betCount: 0
        };
      }
      categorySummary[category].totalBet += item.betAmount;
      categorySummary[category].totalProfitLoss += item.profitLoss;
      categorySummary[category].totalTurnover += item.turnover;
      categorySummary[category].betCount += 1;

      // প্রোভাইডার সামারি
      const provider = item.provider || 'Unknown';
      if (!providerSummary[provider]) {
        providerSummary[provider] = {
          provider_name: provider,
          totalBet: 0,
          totalProfitLoss: 0,
          totalTurnover: 0,
          betCount: 0
        };
      }
      providerSummary[provider].totalBet += item.betAmount;
      providerSummary[provider].totalProfitLoss += item.profitLoss;
      providerSummary[provider].totalTurnover += item.turnover;
      providerSummary[provider].betCount += 1;
    });

    // টোটাল সামারি
    const totalSummary = {
      totalBet: dashboardData.reduce((sum, item) => sum + item.betAmount, 0),
      totalPayout: dashboardData.reduce((sum, item) => sum + item.payout, 0),
      totalProfitLoss: dashboardData.reduce((sum, item) => sum + item.profitLoss, 0),
      totalTurnover: dashboardData.reduce((sum, item) => sum + item.turnover, 0),
      totalBets: dashboardData.length,
      averageDailyBet: dashboardData.reduce((sum, item) => sum + item.betAmount, 0) / 30,
      winRate: (dashboardData.filter(item => item.profitLoss > 0).length / dashboardData.length) * 100
    };

    const response = {
      success: true,
      userId,
      period: 'last_30_days',
      totalSummary,
      dailySummary: Object.values(dailySummary),
      categorySummary: Object.values(categorySummary),
      providerSummary: Object.values(providerSummary),
      recentBets: dashboardData.slice(0, 10), // সর্বশেষ 10টি বেট
      topGames: dashboardData
        .reduce((acc, item) => {
          const game = item.gameName;
          if (!acc[game]) acc[game] = { gameName: game, count: 0, totalBet: 0 };
          acc[game].count += 1;
          acc[game].totalBet += item.betAmount;
          return acc;
        }, {})
    };

    return res.json(response);

  } catch (err) {
    console.error('Error getting user rebate dashboard:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};