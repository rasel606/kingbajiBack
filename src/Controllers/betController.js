const BettingHistory = require("../models/BettingHistory");
const GameListTable = require("../models/GameListTable");
const BetProviderTable = require("../models/BetProviderTable");
const Category = require("../models/Category");
const ErrorResponse = require("../utils/AppError");
const asyncHandler = require("../utils/catchAsync");
const dateUtils = require("../utils/dateUtils");
const transformUtils = require("../utils/transformUtils");
const User = require("../models/User");
// ১. নতুন BetData তৈরি (BettingHistory + GameListTable)
exports.createNewBetData = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // প্রথমে BettingHistory ডাটা fetch করি
    const bettingHistoryFilter = { member: userId };

    if (startDate && endDate) {
      bettingHistoryFilter.start_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bettingHistories = await BettingHistory.find(
      bettingHistoryFilter
    ).lean();
    console.log(bettingHistories);
    if (bettingHistories.length === 0) {
      return res.json({
        success: true,
        message: "No betting history found",
        data: [],
      });
    }

    // GameListTable থেকে matching গেমস খুঁজি
    const gamePromises = bettingHistories.map(async (bet) => {
      const game = await GameListTable.findOne({
        g_code: bet.game_id,
        p_code: bet.site,
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
            isFeatured: game.isFeatured,
          },
          profitLoss: bet.payout - bet.bet, // Profit/Loss ক্যালকুলেশন
        };
      }
      return null;
    });

    const newBetData = (await Promise.all(gamePromises)).filter(
      (item) => item !== null
    );

    return res.json({
      success: true,
      count: newBetData.length,
      data: newBetData,
    });
  } catch (err) {
    console.error("Error creating new bet data:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ২. ক্যাটেগরি ওয়াইজ প্রোভাইডার সহ ডাটা তৈরি
exports.getCategoryWithUniqueProviders = async (req, res) => {
  try {
    const { category_name } = req.query;

    // ক্যাটেগরি ফিল্টার
    const categoryFilter = { id_active: true };
    if (category_name && category_name !== "ALL") {
      categoryFilter.category_name = category_name;
    }

    // সব ক্যাটেগরি fetch করি
    const categories = await Category.find(categoryFilter)
      .select("category_name category_code g_type image")
      .lean();

    if (categories.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // BetProviderTable থেকে প্রোভাইডার fetch করি
    const providers = await BetProviderTable.find({ id_active: true })
      .select("name providercode g_type company image_url")
      .lean();

    // ক্যাটেগরি ওয়াইজ প্রোভাইডার ম্যাপ তৈরি
    const result = categories.map((category) => {
      const categoryGType = category.g_type;

      // প্রোভাইডার ফিল্টার করি যাদের g_type array-তে এই category.g_type আছে
      const matchedProviders = providers.filter((provider) => {
        if (!provider.g_type || !Array.isArray(provider.g_type)) return false;
        return provider.g_type.includes(categoryGType);
      });

      // ইউনিক প্রোভাইডার তৈরি
      const uniqueProviders = Array.from(
        new Map(matchedProviders.map((p) => [p.providercode, p])).values()
      );

      return {
        category_name: category.category_name,
        category_code: category.category_code,
        g_type: category.g_type,
        image: category.image,
        uniqueProviders: uniqueProviders,
        providerCount: uniqueProviders.length,
      };
    });

    return res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Error getting category with providers:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
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
        error: "User ID is required",
      });
    }

    // প্রথমে নতুন BetData তৈরি করি
    const bettingHistoryFilter = { member: userId };

    if (startDate && endDate) {
      bettingHistoryFilter.start_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bettingHistories = await BettingHistory.find(
      bettingHistoryFilter
    ).lean();

    // GameListTable থেকে matching গেমস
    const gamePromises = bettingHistories.map(async (bet) => {
      const game = await GameListTable.findOne({
        g_code: bet.game_id,
        p_code: bet.product,
      }).lean();

      if (game) {
        return {
          ...bet,
          gameData: {
            g_type: game.g_type,
            category_name: game.category_name,
            p_code: game.p_code,
          },
          profitLoss: bet.payout - bet.bet,
        };
      }
      return null;
    });

    const newBetData = (await Promise.all(gamePromises)).filter(
      (item) => item !== null
    );

    // ক্যাটেগরি ফিল্টার
    let filteredBetData = newBetData;
    if (category_name && category_name !== "ALL") {
      filteredBetData = newBetData.filter(
        (bet) => bet.gameData && bet.gameData.category_name === category_name
      );
    }

    // ক্যাটেগরি ওয়াইজ গ্রুপিং
    const categorySummary = {};
    let totalTurnover = 0;
    let totalProfitLoss = 0;
    let totalBet = 0;
    let totalPayout = 0;

    filteredBetData.forEach((bet) => {
      const category = bet.gameData ? bet.gameData.category_name : "Unknown";

      if (!categorySummary[category]) {
        categorySummary[category] = {
          category_name: category,
          totalTurnover: 0,
          totalProfitLoss: 0,
          totalBet: 0,
          totalPayout: 0,
          betCount: 0,
          providers: new Set(),
        };
      }

      categorySummary[category].totalTurnover += bet.turnover || 0;
      categorySummary[category].totalProfitLoss += bet.payout - bet.bet || 0;
      categorySummary[category].totalBet += bet.bet || 0;
      categorySummary[category].totalPayout += bet.payout || 0;
      categorySummary[category].betCount += 1;

      if (bet.gameData && bet.gameData.p_code) {
        categorySummary[category].providers.add(bet.gameData.p_code);
      }

      // টোটাল হিসাব
      totalTurnover += bet.turnover || 0;
      totalProfitLoss += bet.payout - bet.bet || 0;
      totalBet += bet.bet || 0;
      totalPayout += bet.payout || 0;
    });

    // ক্যাটেগরি ওয়াইজ ডাটা ফরম্যাট
    const categoryWiseData = Object.values(categorySummary).map((cat) => ({
      ...cat,
      providers: Array.from(cat.providers),
      averageBet: cat.totalBet / cat.betCount,
      averageProfitLoss: cat.totalProfitLoss / cat.betCount,
    }));

    // সোর্স (BetProviderTable) থেকে প্রোভাইডার ডিটেইলস
    const providerCodes = [
      ...new Set(
        filteredBetData
          .map((bet) => bet.gameData?.p_code)
          .filter((code) => code)
      ),
    ];

    const providers = await BetProviderTable.find({
      providercode: { $in: providerCodes },
      id_active: true,
    })
      .select("name providercode company image_url g_type")
      .lean();

    const response = {
      success: true,
      summary: {
        totalRecords: filteredBetData.length,
        totalTurnover,
        totalProfitLoss,
        totalBet,
        totalPayout,
        averageBet: totalBet / filteredBetData.length,
        averageProfitLoss: totalProfitLoss / filteredBetData.length,
      },
      categoryWiseData,
      betDetails: filteredBetData.map((bet) => ({
        id: bet.id,
        ref_no: bet.ref_no,
        game_id: bet.game_id,
        product: bet.product,
        category: bet.gameData?.category_name,
        provider: bet.gameData?.p_code,
        bet: bet.bet,
        payout: bet.payout,
        profitLoss: bet.payout - bet.bet,
        turnover: bet.turnover,
        start_time: bet.start_time,
        status: bet.status,
      })),
      availableProviders: providers,
      availableCategories: [
        ...new Set(
          filteredBetData
            .map((bet) => bet.gameData?.category_name)
            .filter((name) => name)
        ),
      ],
    };

    return res.json(response);
  } catch (err) {
    console.error("Error getting rebate summary:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ৪. ডিটেইলড রিবেট রিপোর্ট
exports.getDetailedRebateReport = async (req, res) => {
  try {
    const {
      userId,
      category,
      provider,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // BettingHistory ফিল্টার
    const bettingFilter = { member: userId };

    if (startDate && endDate) {
      bettingFilter.start_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
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
        p_code: bet.product,
      }).lean();

      if (game) {
        // ক্যাটেগরি এবং প্রোভাইডার ফিল্টার
        if (category && category !== "ALL" && game.category_name !== category) {
          continue;
        }

        if (provider && provider !== "ALL" && game.p_code !== provider) {
          continue;
        }

        // BetProviderTable থেকে প্রোভাইডার ডিটেইলস
        const providerDetails = await BetProviderTable.findOne({
          providercode: game.p_code,
        })
          .select("name company image_url")
          .lean();

        detailedData.push({
          bettingDetails: {
            ...bet,
            profitLoss: bet.payout - bet.bet,
            commission: bet.commission || 0,
            p_share: bet.p_share || 0,
            p_win: bet.p_win || 0,
          },
          gameDetails: {
            gameName: game.gameName?.gameName_enus || game.gameNameTrial,
            category_name: game.category_name,
            g_type: game.g_type,
            brand: game.brand,
            imgFileName: game.imgFileName,
            is_hot: game.is_hot,
            isFeatured: game.isFeatured,
          },
          providerDetails: providerDetails || {
            name: "Unknown",
            company: "Unknown",
          },
        });
      }
    }

    // এগ্রিগেটেড ডাটা
    const aggregatedData = detailedData.reduce((acc, curr) => {
      const category = curr.gameDetails.category_name || "Unknown";
      const provider = curr.providerDetails.name || "Unknown";

      if (!acc[category]) {
        acc[category] = {
          category_name: category,
          totalTurnover: 0,
          totalProfitLoss: 0,
          totalCommission: 0,
          providerWise: {},
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
          betCount: 0,
        };
      }

      acc[category].providerWise[provider].totalTurnover +=
        curr.bettingDetails.turnover || 0;
      acc[category].providerWise[provider].totalProfitLoss +=
        curr.bettingDetails.profitLoss || 0;
      acc[category].providerWise[provider].betCount += 1;

      return acc;
    }, {});

    // ফরম্যাটেড এগ্রিগেটেড ডাটা
    const formattedAggregatedData = Object.values(aggregatedData).map(
      (cat) => ({
        ...cat,
        providerWise: Object.values(cat.providerWise),
      })
    );

    const response = {
      success: true,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalRecords: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPageCount: detailedData.length,
      },
      aggregatedSummary: formattedAggregatedData,
      detailedRecords: detailedData,
      filtersApplied: {
        userId,
        category,
        provider,
        startDate,
        endDate,
      },
    };

    return res.json(response);
  } catch (err) {
    console.error("Error getting detailed rebate report:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
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
        error: "User ID is required",
      });
    }

    // সাম্প্রতিক 30 দিনের ডাটা
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // BettingHistory fetch
    const recentBets = await BettingHistory.find({
      member: userId,
      start_time: { $gte: thirtyDaysAgo },
    }).lean();

    // নতুন BetData তৈরি
    const dashboardData = [];
    for (const bet of recentBets) {
      const game = await GameListTable.findOne({
        g_code: bet.game_id,
        p_code: bet.product,
      }).lean();

      if (game) {
        const provider = await BetProviderTable.findOne({
          providercode: game.p_code,
        })
          .select("name company")
          .lean();

        dashboardData.push({
          date: bet.start_time,
          gameName: game.gameName?.gameName_enus || game.gameNameTrial,
          category: game.category_name,
          provider: provider?.name || "Unknown",
          betAmount: bet.bet,
          payout: bet.payout,
          profitLoss: bet.payout - bet.bet,
          turnover: bet.turnover,
          status: bet.status,
        });
      }
    }

    // ডেইলি, ক্যাটেগরি ও প্রোভাইডার ওয়াইজ সামারি
    const dailySummary = {};
    const categorySummary = {};
    const providerSummary = {};

    dashboardData.forEach((item) => {
      const dateStr = item.date.toISOString().split("T")[0];

      // ডেইলি সামারি
      if (!dailySummary[dateStr]) {
        dailySummary[dateStr] = {
          date: dateStr,
          totalBet: 0,
          totalPayout: 0,
          totalProfitLoss: 0,
          totalTurnover: 0,
          betCount: 0,
        };
      }
      dailySummary[dateStr].totalBet += item.betAmount;
      dailySummary[dateStr].totalPayout += item.payout;
      dailySummary[dateStr].totalProfitLoss += item.profitLoss;
      dailySummary[dateStr].totalTurnover += item.turnover;
      dailySummary[dateStr].betCount += 1;

      // ক্যাটেগরি সামারি
      const category = item.category || "Unknown";
      if (!categorySummary[category]) {
        categorySummary[category] = {
          category_name: category,
          totalBet: 0,
          totalProfitLoss: 0,
          totalTurnover: 0,
          betCount: 0,
        };
      }
      categorySummary[category].totalBet += item.betAmount;
      categorySummary[category].totalProfitLoss += item.profitLoss;
      categorySummary[category].totalTurnover += item.turnover;
      categorySummary[category].betCount += 1;

      // প্রোভাইডার সামারি
      const provider = item.provider || "Unknown";
      if (!providerSummary[provider]) {
        providerSummary[provider] = {
          provider_name: provider,
          totalBet: 0,
          totalProfitLoss: 0,
          totalTurnover: 0,
          betCount: 0,
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
      totalProfitLoss: dashboardData.reduce(
        (sum, item) => sum + item.profitLoss,
        0
      ),
      totalTurnover: dashboardData.reduce(
        (sum, item) => sum + item.turnover,
        0
      ),
      totalBets: dashboardData.length,
      averageDailyBet:
        dashboardData.reduce((sum, item) => sum + item.betAmount, 0) / 30,
      winRate:
        (dashboardData.filter((item) => item.profitLoss > 0).length /
          dashboardData.length) *
        100,
    };

    const response = {
      success: true,
      userId,
      period: "last_30_days",
      totalSummary,
      dailySummary: Object.values(dailySummary),
      categorySummary: Object.values(categorySummary),
      providerSummary: Object.values(providerSummary),
      recentBets: dashboardData.slice(0, 10), // সর্বশেষ 10টি বেট
      topGames: dashboardData.reduce((acc, item) => {
        const game = item.gameName;
        if (!acc[game]) acc[game] = { gameName: game, count: 0, totalBet: 0 };
        acc[game].count += 1;
        acc[game].totalBet += item.betAmount;
        return acc;
      }, {}),
    };

    return res.json(response);
  } catch (err) {
    console.error("Error getting user rebate dashboard:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getBettingRecords = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20000,
    settlement = "settled",
    dateOption = "today",
    platforms = "",
    gameTypes = "",
    sortBy = "start_time",
    sortOrder = "desc",
    search = "",
    status,
    minBet,
    maxBet,
    minPayout,
    maxPayout,
    userId
  } = req.query;
  console.log("req.query", {
    platforms,
    gameTypes,
    sortBy,
    sortOrder,
    search,
    status,
    minBet,
    maxBet,
    minPayout,
    maxPayout,
  });

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Calculate date range
  const dateRange = dateUtils.getDateRange(dateOption);
  // const userId = req.user.id;
  const user = await User.findOne({userId}).lean();
  console.log("user", user.userId);
  // Build match pipeline
  const matchStage = {
    // start_time: {
    //   $gte: new Date(dateRange.from),
    //   $lte: new Date(dateRange.to)
    // }
  };

  // Settlement filter
  // if (settlement === 'settled') {
  //   matchStage.status = 1;
  // } else if (settlement === 'unsettled') {
  //   matchStage.status = { $in: [0, 2] };
  // }
  matchStage.member = user.userId;

  // Additional filters
  // if (status) {
  //   matchStage.status = parseInt(status);
  // }

  // if (platforms) {
  //   const platformArray = platforms.split(",");
  //   matchStage.provider_code = { $in: platformArray };
  // }

  // if (gameTypes) {
  //   const gameTypeArray = gameTypes.split(",");
  //   matchStage.game_type = { $in: gameTypeArray };
  // }

  // // Bet amount filters
  // if (minBet || maxBet) {
  //   matchStage.bet = {};
  //   if (minBet) matchStage.bet.$gte = parseFloat(minBet);
  //   if (maxBet) matchStage.bet.$lte = parseFloat(maxBet);
  // }

  // // Payout filters
  // if (minPayout || maxPayout) {
  //   matchStage.payout = {};
  //   if (minPayout) matchStage.payout.$gte = parseFloat(minPayout);
  //   if (maxPayout) matchStage.payout.$lte = parseFloat(maxPayout);
  // }

  // // Search functionality
  // if (search) {
  //   matchStage.$or = [
  //     { ref_no: { $regex: search, $options: "i" } },
  //     { game_id: { $regex: search, $options: "i" } },
  //     { bet_detail: { $regex: search, $options: "i" } },
  //   ];
  // }
  console.log(await BettingHistory.findOne({ member: user.userId }));

  // Build aggregation pipeline
  const result = await BettingHistory.aggregate([
    { $match: matchStage },

    // // Lookup game details
    // {
    //   $lookup: {
    //     from: "gamelisttables",
    //     let: { site: "$provider_code", gameId: "$g_code" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $or: [
    //               {
    //                 $and: [
    //                   { $eq: ["$p_code", "$$site"] },
    //                   { $eq: ["$g_code", "$$gameId"] },
    //                 ],
    //               },
    //               { $eq: ["$p_code", "$$site"] },
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           g_code: 1,
    //           p_code: 1,
    //           gameName: 1,
    //           imgFileName: 1,
    //           category_name: 1,
    //           g_type: 1,
    //         },
    //       },
    //     ],
    //     as: "game",
    //   },
    // },
    // { $unwind: { path: "$game", preserveNullAndEmptyArrays: true } },

    // // Lookup provider
    // {
    //   $lookup: {
    //     from: "betprovidertables",
    //     let: { p_code: "$site" },
    //     pipeline: [
    //       { $match: { $expr: { $eq: ["$providercode", "$$p_code"] } } },
    //       { $project: { providercode: 1, company: 1, name: 1, image_url: 1 } },
    //     ],
    //     as: "provider",
    //   },
    // },
    // { $unwind: { path: "$provider", preserveNullAndEmptyArrays: true } },

    // // Lookup category
    // {
    //   $lookup: {
    //     from: "categories",
    //     let: { category_Name: "$game.category_name" },
    //     pipeline: [
    //       { $match: { $expr: { $eq: ["$category_name", "$$category_Name"] } } },
    //       { $project: { category_name: 1, g_type: 1, image: 1 } },
    //     ],
    //     as: "category",
    //   },
    // },
    // { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

    // // Add calculated fields
    // {
    //   $addFields: {
    //     profitLoss: {
    //       $subtract: [
    //         { $ifNull: ["$payout", 0] },
    //         {
    //           $add: [{ $ifNull: ["$bet", 0] }, { $ifNull: ["$commission", 0] }],
    //         },
    //       ],
    //     },
    //     platform: "$provider.company",
    //     gameType: "$category.category_name",
    //     date: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } },
    //   },
    // },

    // // Sort
    // { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },

    // // Facet for pagination and total count
    // {
    //   $facet: {
    //     metadata: [
    //       { $count: "total" },
    //       { $addFields: { page: parseInt(page), limit: parseInt(limit) } },
    //     ],
    //     data: [
    //       { $skip: (parseInt(page) - 1) * parseInt(limit) },
    //       { $limit: parseInt(limit) },
    //       {
    //         $project: {
    //           _id: 1,
    //           ref_no: 1,
    //           start_time: 1,
    //           turnover: 1,
    //           bet: 1,
    //           payout: 1,
    //           commission: 1,
    //           profitLoss: 1,
    //           status: 1,
    //           settlement_status: 1,
    //           platform: 1,
    //           gameType: 1,
    //           game_id: 1,
    //           product: 1,
    //           currency: 1,
    //         },
    //       },
    //     ],
    //   },
    // },

    // // Unwind metadata
    // { $unwind: { path: "$metadata", preserveNullAndEmptyArrays: true } },
  ]);
  // console.log("pipeline", pipeline);
  // const result = await BettingHistory.aggregate(pipeline);
  console.log("result", result);
  // Transform data for frontend
  const transformedData = transformUtils.transformBettingRecords(
    result[0]?.data || []
  );
  console.log("transformedData", transformedData);
  res.status(200).json({
    success: true,
    count: transformedData.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result[0]?.metadata?.total || 0,
      pages: Math.ceil((result[0]?.metadata?.total || 0) / parseInt(limit)),
    },
    data: transformedData,
  });
});

/**
 * @desc    Get betting summary statistics
 * @route   GET /api/v1/betting/summary
 * @access  Private
 */
exports.getBettingSummary = asyncHandler(async (req, res, next) => {
  const {
    dateOption = "last7days",
    platforms = "",
    gameTypes = "",
  } = req.query;
  const user = req.user;

  const dateRange = dateUtils.getDateRange(dateOption);

  const matchStage = {
    member: user.member_id || user.id,
    start_time: {
      $gte: new Date(dateRange.from),
      $lte: new Date(dateRange.to),
    },
  };

  if (platforms) {
    const platformArray = platforms.split(",");
    matchStage.provider_code = { $in: platformArray };
  }

  if (gameTypes) {
    const gameTypeArray = gameTypes.split(",");
    matchStage.game_type = { $in: gameTypeArray };
  }

  const pipeline = [
    { $match: matchStage },

    // Group and calculate totals
    {
      $group: {
        _id: null,
        totalBets: { $sum: 1 },
        totalTurnover: { $sum: "$turnover" },
        totalBetAmount: { $sum: "$bet" },
        totalPayout: { $sum: "$payout" },
        totalCommission: { $sum: "$commission" },
        totalProfitLoss: {
          $sum: {
            $subtract: ["$payout", { $add: ["$bet", "$commission"] }],
          },
        },
        settledBets: {
          $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] },
        },
        pendingBets: {
          $sum: { $cond: [{ $eq: ["$status", 0] }, 1, 0] },
        },
        wonBets: {
          $sum: { $cond: [{ $eq: ["$settlement_status", "won"] }, 1, 0] },
        },
        lostBets: {
          $sum: { $cond: [{ $eq: ["$settlement_status", "lost"] }, 1, 0] },
        },
      },
    },

    // Add additional calculations
    {
      $addFields: {
        winRate: {
          $cond: [
            { $gt: ["$totalBets", 0] },
            { $multiply: [{ $divide: ["$wonBets", "$totalBets"] }, 100] },
            0,
          ],
        },
        averageBet: {
          $cond: [
            { $gt: ["$totalBets", 0] },
            { $divide: ["$totalBetAmount", "$totalBets"] },
            0,
          ],
        },
        payoutRatio: {
          $cond: [
            { $gt: ["$totalBetAmount", 0] },
            {
              $multiply: [
                { $divide: ["$totalPayout", "$totalBetAmount"] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
  ];

  const summary = await BettingHistory.aggregate(pipeline);

  res.status(200).json({
    success: true,
    data: summary[0] || {
      totalBets: 0,
      totalTurnover: 0,
      totalBetAmount: 0,
      totalPayout: 0,
      totalCommission: 0,
      totalProfitLoss: 0,
      settledBets: 0,
      pendingBets: 0,
      wonBets: 0,
      lostBets: 0,
      winRate: 0,
      averageBet: 0,
      payoutRatio: 0,
    },
  });
});

/**
 * @desc    Get betting records grouped by date
 * @route   GET /api/v1/betting/records-grouped
 * @access  Private
 */

exports.getDateRange = (option) => {
  const now = new Date();
  let from;

  switch (option) {
    case "today":
      from = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "yesterday":
      from = new Date(now.setHours(0, 0, 0, 0));
      from.setDate(from.getDate() - 1);
      break;
    case "last7days":
    default:
      from = new Date();
      from.setDate(from.getDate() - 7);
  }

  return { from, to: new Date() };
};

exports.featuredGame = asyncHandler(async (req, res) => {
  try {
    const games = await GameListTable.find({ is_featured: true }).lean();
    res.status(200).json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


exports.createFeaturedGame = asyncHandler(async (req, res) => {
  try {
    const { game_Id } = req.params;

    // প্রথমে সব গেমের is_featured false করে দেই
    await GameListTable.findOne({ g_code: game_Id });
    // তারপর যেগুলো আইডি এসেছে সেগুলোর is_featured true করে দেই
    await GameListTable.findOneAndUpdate(
      { g_code: { $in: game_Id } },
      { is_featured: true }
    );
    res.status(200).json({
      success: true,
      message: "Featured games updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
})

exports.getDateRange = (option) => {
  const now = new Date();
  let from;

  switch (option) {
    case "today":
      from = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "last7days":
      from = new Date(now.setHours(0, 0, 0, 0));
      from.setDate(from.getDate() - 7);
      break;
    default:
      from = new Date();
      from.setDate(from.getDate() - 7);
  }

  return { from, to: new Date() };
};

// exports.getBettingRecordsGrouped = asyncHandler(async (req, res) => {
//   const {
//     page = 1,
//     limit = 20,
//     dateOption = "last7days",
//     platforms = "",
//     gameTypes = "",
//     sortBy = "start_time",
//     sortOrder = "desc",
//     search = "",
//     status,
//     minBet,
//     maxBet,
//     minPayout,
//     maxPayout,
//   } = req.query;
//   const userId = req.user.userId
//   // 1️⃣ Verify user
//   const user = await User.findOne({ userId }).lean();
//   if (!user) return res.status(404).json({ success: false, message: "User not found" });

//   // 2️⃣ Date range
//   const dateRange = dateUtils.getDateRange(dateOption);

//   // 3️⃣ Match stage for BettingHistory
//   const matchStage = {
//     member: user.userId,
//     start_time: { $gte: new Date(dateRange.from), $lte: new Date(dateRange.to) },
//   };

//   if (status) matchStage.status = parseInt(status);
//   if (platforms) {
//     const platformArray = platforms.split(",").filter(p => p.trim() !== "");
//     if (platformArray.length > 0) {
//       matchStage.site = { $in: platformArray };
//     }
//   }

//   if (minBet || maxBet) {
//     matchStage.bet = {};
//     if (minBet) matchStage.bet.$gte = parseFloat(minBet);
//     if (maxBet) matchStage.bet.$lte = parseFloat(maxBet);
//   }

//   if (minPayout || maxPayout) {
//     matchStage.payout = {};
//     if (minPayout) matchStage.payout.$gte = parseFloat(minPayout);
//     if (maxPayout) matchStage.payout.$lte = parseFloat(maxPayout);
//   }

//   if (search) {
//     matchStage.$or = [
//       { ref_no: { $regex: search, $options: "i" } },
//       { game_id: { $regex: search, $options: "i" } },
//       { bet_detail: { $regex: search, $options: "i" } },
//     ];
//   }

//   // 4️⃣ Main Aggregation Pipeline - FIXED
//   const pipeline = [
//     // Step 1: Match betting history records
//     { $match: matchStage },

//     // Step 2: Lookup GameListTable using site (p_code)
//     {
//       $lookup: {
//         from: "gamelisttables",
//         let: { siteCode: "$site" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$p_code", "$$siteCode"] },
//                   { $eq: ["$is_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "gameDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$gameDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 3: Create newGameObject
//     {
//       $addFields: {
//         newGameObject: {
//           $cond: {
//             if: { $ne: ["$gameDetails", null] },
//             then: {
//               g_code: "$gameDetails.g_code",
//               g_type: "$gameDetails.g_type",
//               gameName: "$gameDetails.gameName",
//               imgFileName: "$gameDetails.imgFileName",
//               category_name: "$gameDetails.category_name",
//               brand: "$gameDetails.brand"
//             },
//             else: {
//               g_code: "$game_id",
//               g_type: "Unknown",
//               gameName: { gameName_enus: "Unknown Game" },
//               imgFileName: null,
//               category_name: null,
//               brand: null
//             }
//           }
//         }
//       }
//     },

//     // Step 4: Lookup BetProviderTable using site (providercode)
//     {
//       $lookup: {
//         from: "betprovidertables",
//         let: { siteCode: "$site" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$providercode", "$$siteCode"] },
//                   { $eq: ["$id_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "providerDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$providerDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 5: FIXED - Lookup Categories using provider's g_type array
//     {
//       $lookup: {
//         from: "categories",
//         let: { 
//           providerGTypes: { 
//             $cond: {
//               if: { $isArray: "$providerDetails.g_type" },
//               then: "$providerDetails.g_type",
//               else: { $ifNull: [{ $split: ["$providerDetails.g_type", ","] }, []] }
//             }
//           } 
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { 
//                     $or: [
//                       { $in: ["$g_type", "$$providerGTypes"] },
//                       { $in: ["$$providerGTypes", ["$g_type"]] }
//                     ]
//                   },
//                   { $eq: ["$id_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "categoryDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$categoryDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 6: Add profitLoss calculation for each record
//     {
//       $addFields: {
//         profitLoss: {
//           $subtract: [
//             { $ifNull: ["$payout", 0] },
//             { $add: [{ $ifNull: ["$bet", 0] }, { $ifNull: ["$commission", 0] }] }
//           ]
//         }
//       }
//     },

//     // Step 7: Group by newGameObject (g_type + game combination)
//     {
//       $group: {
//         _id: {
//           g_code: "$newGameObject.g_code",
//           g_type: "$newGameObject.g_type",
//           gameName: "$newGameObject.gameName",
//           category_name: "$newGameObject.category_name"
//         },
//         providerCode: { $first: "$site" },
//         providerDetails: { $first: "$providerDetails" },
//         categoryDetails: { $first: "$categoryDetails" },
//         // records: { $push: "$$ROOT" },
//         totalTurnover: { $sum: "$turnover" },
//         totalBet: { $sum: "$bet" },
//         totalPayout: { $sum: "$payout" },
//         totalCommission: { $sum: { $ifNull: ["$commission", 0] } },
//         totalProfitLoss: { $sum: "$profitLoss" }
//       }
//     },

//     // Step 8: Determine final category
//     {
//       $addFields: {
//         gameCategory: {
//           $cond: {
//             if: { $ne: ["$categoryDetails", null] },
//             then: "$categoryDetails.category_name",
//             else: {
//               $cond: {
//                 if: { $ne: ["$_id.category_name", null] },
//                 then: "$_id.category_name",
//                 else: "Uncategorized"
//               }
//             }
//           }
//         }
//       }
//     },

//     // Step 9: Group by Category
//     {
//       $group: {
//         _id: "$gameCategory",
//         games: {
//           $push: {
//             gameCode: "$_id.g_code",
//             gameType: "$_id.g_type",
//             gameName: "$_id.gameName",
//             providerCode: "$providerCode",
//             providerName: { $ifNull: ["$providerDetails.name", "Unknown Provider"] },
//             providerCompany: { $ifNull: ["$providerDetails.company", "Unknown"] },
//             totalTurnover: "$totalTurnover",
//             totalBet: "$totalBet",
//             totalPayout: "$totalPayout",
//             totalProfitLoss: "$totalProfitLoss"
//           }
//         },
//         categoryTurnover: { $sum: "$totalTurnover" },
//         categoryBet: { $sum: "$totalBet" },
//         categoryPayout: { $sum: "$totalPayout" },
//         categoryProfitLoss: { $sum: "$totalProfitLoss" }
//       }
//     },

//     // Step 10: Group providers within each category
//     {
//       $addFields: {
//         providers: {
//           $reduce: {
//             input: "$games",
//             initialValue: [],
//             in: {
//               $let: {
//                 vars: {
//                   existingProviderIndex: {
//                     $indexOfArray: ["$$value.providerCode", "$$this.providerCode"]
//                   }
//                 },
//                 in: {
//                   $cond: {
//                     if: { $ne: ["$$existingProviderIndex", -1] },
//                     then: {
//                       $map: {
//                         input: { $range: [0, { $size: "$$value" }] },
//                         as: "idx",
//                         in: {
//                           $cond: {
//                             if: { $eq: ["$$idx", "$$existingProviderIndex"] },
//                             then: {
//                               $mergeObjects: [
//                                 { $arrayElemAt: ["$$value", "$$idx"] },
//                                 {
//                                   games: {
//                                     $concatArrays: [
//                                       { $arrayElemAt: ["$$value", "$$idx"] }.games,
//                                       [{
//                                         gameCode: "$$this.gameCode",
//                                         gameType: "$$this.gameType",
//                                         gameName: "$$this.gameName",
//                                         totalTurnover: "$$this.totalTurnover",
//                                         totalBet: "$$this.totalBet",
//                                         totalPayout: "$$this.totalPayout",
//                                         totalProfitLoss: "$$this.totalProfitLoss"
//                                       }]
//                                     ]
//                                   }
//                                 }
//                               ]
//                             },
//                             else: { $arrayElemAt: ["$$value", "$$idx"] }
//                           }
//                         }
//                       }
//                     },
//                     else: {
//                       $concatArrays: [
//                         "$$value",
//                         [{
//                           providerCode: "$$this.providerCode",
//                           providerName: "$$this.providerName",
//                           providerCompany: "$$this.providerCompany",
//                           games: [{
//                             gameCode: "$$this.gameCode",
//                             gameType: "$$this.gameType",
//                             gameName: "$$this.gameName",
//                             totalTurnover: "$$this.totalTurnover",
//                             totalBet: "$$this.totalBet",
//                             totalPayout: "$$this.totalPayout",
//                             totalProfitLoss: "$$this.totalProfitLoss"
//                           }]
//                         }]
//                       ]
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     },

//     // Step 11: Calculate provider stats
//     {
//       $addFields: {
//         providers: {
//           $map: {
//             input: "$providers",
//             as: "provider",
//             in: {
//               providerCode: "$$provider.providerCode",
//               providerName: "$$provider.providerName",
//               providerCompany: "$$provider.providerCompany",
//               games: "$$provider.games",
//               providerStats: {
//                 turnover: { $sum: "$$provider.games.totalTurnover" },
//                 bet: { $sum: "$$provider.games.totalBet" },
//                 payout: { $sum: "$$provider.games.totalPayout" },
//                 profitLoss: { $sum: "$$provider.games.totalProfitLoss" }
//               }
//             }
//           }
//         }
//       }
//     },

//     // Step 12: Final projection
//     {
//       $project: {
//         _id: 0,
//         category: "$_id",
//         categoryTurnover: 1,
//         categoryBet: 1,
//         categoryPayout: 1,
//         categoryProfitLoss: 1,
//         providers: 1,
//         date: { $literal: null }
//       }
//     },

//     // Step 13: Sort
//     {
//       $sort: { category: sortOrder === "desc" ? -1 : 1 }
//     },

//     // Step 14: Pagination
//     {
//       $facet: {
//         metadata: [{ $count: "total" }],
//         data: [
//           { $skip: (parseInt(page) - 1) * parseInt(limit) },
//           { $limit: parseInt(limit) }
//         ]
//       }
//     }
//   ];

//   try {
//     // 5️⃣ Execute aggregation
//     const result = await BettingHistory.aggregate(pipeline).allowDiskUse(true);

//     // 6️⃣ Prepare response
//     const data = result[0].data;
//     const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

//     res.status(200).json({
//       success: true,
//       count: total,
//       totalPages: Math.ceil(total / parseInt(limit)),
//       currentPage: parseInt(page),
//       data: data
//     });
//   } catch (error) {
//     console.error("Aggregation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching betting records",
//       error: error.message
//     });
//   }
// });
/**
 * @desc    Get betting record by ID
 * @route   GET /api/v1/betting/records/:id
 * @access  Private
 */
// exports.getBettingRecordsGrouped = asyncHandler(async (req, res) => {
//   const {
//     page = 1,
//     limit = 20,
//     dateOption = "last7days",
//     platforms = "",
//     gameTypes = "",
//     sortBy = "start_time",
//     sortOrder = "desc",
//     search = "",
//     status,
//     minBet,
//     maxBet,
//     minPayout,
//     maxPayout,
//   } = req.query;
//   const userId = req.user.userId;

//   // 1️⃣ Verify user
//   const user = await User.findOne({ userId }).lean();
//   if (!user) return res.status(404).json({ success: false, message: "User not found" });

//   // 2️⃣ Date range
//   const dateRange = dateUtils.getDateRange(dateOption);

//   // 3️⃣ Match stage for BettingHistory
//   const matchStage = {
//     member: user.userId,
//     start_time: { $gte: new Date(dateRange.from), $lte: new Date(dateRange.to) },
//   };

//   if (status) matchStage.status = parseInt(status);
//   if (platforms) {
//     const platformArray = platforms.split(",").filter(p => p.trim() !== "");
//     if (platformArray.length > 0) {
//       matchStage.site = { $in: platformArray };
//     }
//   }

//   if (minBet || maxBet) {
//     matchStage.bet = {};
//     if (minBet) matchStage.bet.$gte = parseFloat(minBet);
//     if (maxBet) matchStage.bet.$lte = parseFloat(maxBet);
//   }

//   if (minPayout || maxPayout) {
//     matchStage.payout = {};
//     if (minPayout) matchStage.payout.$gte = parseFloat(minPayout);
//     if (maxPayout) matchStage.payout.$lte = parseFloat(maxPayout);
//   }

//   if (search) {
//     matchStage.$or = [
//       { ref_no: { $regex: search, $options: "i" } },
//       { game_id: { $regex: search, $options: "i" } },
//       { bet_detail: { $regex: search, $options: "i" } },
//     ];
//   }

//   // 4️⃣ Main Aggregation Pipeline - Grouped by Date
//   const pipeline = [
//     // Step 1: Match betting history records
//     { $match: matchStage },

//     // Step 2: Format date for grouping (YYYY-MM-DD)
//     {
//       $addFields: {
//         dateGroup: {
//           $dateToString: {
//             format: "%Y-%m-%d",
//             date: "$start_time",
//             timezone: "Asia/Singapore" // Adjust timezone as needed
//           }
//         }
//       }
//     },

//     // Step 3: Lookup GameListTable using site (p_code)
//     {
//       $lookup: {
//         from: "gamelisttables",
//         let: { siteCode: "$site" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$p_code", "$$siteCode"] },
//                   { $eq: ["$is_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "gameDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$gameDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 4: Create newGameObject
//     {
//       $addFields: {
//         newGameObject: {
//           $cond: {
//             if: { $ne: ["$gameDetails", null] },
//             then: {
//               g_code: "$gameDetails.g_code",
//               g_type: "$gameDetails.g_type",
//               gameName: "$gameDetails.gameName",
//               imgFileName: "$gameDetails.imgFileName",
//               category_name: "$gameDetails.category_name",
//               brand: "$gameDetails.brand"
//             },
//             else: {
//               g_code: "$game_id",
//               g_type: "Unknown",
//               gameName: { gameName_enus: "Unknown Game" },
//               imgFileName: null,
//               category_name: null,
//               brand: null
//             }
//           }
//         }
//       }
//     },

//     // Step 5: Lookup BetProviderTable using site (providercode)
//     {
//       $lookup: {
//         from: "betprovidertables",
//         let: { siteCode: "$site" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$providercode", "$$siteCode"] },
//                   { $eq: ["$id_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "providerDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$providerDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 6: Lookup Categories using provider's g_type array
//     {
//       $lookup: {
//         from: "categories",
//         let: { 
//           providerGTypes: { 
//             $cond: {
//               if: { $isArray: "$providerDetails.g_type" },
//               then: "$providerDetails.g_type",
//               else: { $ifNull: [{ $split: ["$providerDetails.g_type", ","] }, []] }
//             }
//           } 
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { 
//                     $or: [
//                       { $in: ["$g_type", "$$providerGTypes"] },
//                       { $in: ["$$providerGTypes", ["$g_type"]] }
//                     ]
//                   },
//                   { $eq: ["$id_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "categoryDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$categoryDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 7: Add profitLoss calculation for each record
//     {
//       $addFields: {
//         profitLoss: {
//           $subtract: [
//             { $ifNull: ["$payout", 0] },
//             { $add: [{ $ifNull: ["$bet", 0] }, { $ifNull: ["$commission", 0] }] }
//           ]
//         }
//       }
//     },

//     // Step 8: Group by Date first
//     {
//       $group: {
//         _id: "$dateGroup",
//         date: { $first: "$dateGroup" },
//         totalRecords: { $sum: 1 },
//         totalTurnover: { $sum: "$turnover" },
//         totalBet: { $sum: "$bet" },
//         totalPayout: { $sum: "$payout" },
//         totalCommission: { $sum: { $ifNull: ["$commission", 0] } },
//         totalProfitLoss: { $sum: "$profitLoss" },
//         // records: { $push: "$$ROOT" }
//       }
//     },

//     // Step 9: Group by Category within each date
//     {
//       $unwind: "$records"
//     },
//     {
//       $group: {
//         _id: {
//           date: "$_id",
//           gameCategory: {
//             $cond: {
//               if: { $ne: ["$records.categoryDetails", null] },
//               then: "$records.categoryDetails.category_name",
//               else: {
//                 $cond: {
//                   if: { $ne: ["$records.newGameObject.category_name", null] },
//                   then: "$records.newGameObject.category_name",
//                   else: "Uncategorized"
//                 }
//               }
//             }
//           }
//         },
//         date: { $first: "$date" },
//         category: { $first: "$_id.gameCategory" },
//         records: { $push: "$records" },
//         categoryTurnover: { $sum: "$records.turnover" },
//         categoryBet: { $sum: "$records.bet" },
//         categoryPayout: { $sum: "$records.payout" },
//         categoryProfitLoss: { $sum: "$records.profitLoss" }
//       }
//     },

//     // Step 10: Group by Game within each category-date group
//     {
//       $unwind: "$records"
//     },
//     {
//       $group: {
//         _id: {
//           date: "$_id.date",
//           category: "$_id.gameCategory",
//           gameCode: "$records.newGameObject.g_code",
//           gameType: "$records.newGameObject.g_type",
//           gameName: "$records.newGameObject.gameName",
//           providerCode: "$records.site",
//           providerDetails: "$records.providerDetails"
//         },
//         date: { $first: "$date" },
//         category: { $first: "$category" },
//         gameTurnover: { $sum: "$records.turnover" },
//         gameBet: { $sum: "$records.bet" },
//         gamePayout: { $sum: "$records.payout" },
//         gameProfitLoss: { $sum: "$records.profitLoss" },
//         recordCount: { $sum: 1 },
//         // records: { $push: "$records" }
//       }
//     },

//     // Step 11: Group by Provider within each category-date group
//     {
//       $group: {
//         _id: {
//           date: "$_id.date",
//           category: "$_id.category",
//           providerCode: "$_id.providerCode",
//           providerDetails: "$_id.providerDetails"
//         },
//         date: { $first: "$date" },
//         category: { $first: "$category" },
//         providerCode: { $first: "$_id.providerCode" },
//         providerName: { 
//           $first: { 
//             $ifNull: [
//               { $ifNull: ["$_id.providerDetails.name", "$_id.providerDetails.providerName"] }, 
//               "Unknown Provider"
//             ] 
//           } 
//         },
//         providerCompany: { 
//           $first: { 
//             $ifNull: ["$_id.providerDetails.company", "Unknown"] 
//           } 
//         },
//         providerTurnover: { $sum: "$gameTurnover" },
//         providerBet: { $sum: "$gameBet" },
//         providerPayout: { $sum: "$gamePayout" },
//         providerProfitLoss: { $sum: "$gameProfitLoss" },
//         games: {
//           $push: {
//             gameCode: "$_id.gameCode",
//             gameType: "$_id.gameType",
//             gameName: "$_id.gameName",
//             gameTurnover: "$gameTurnover",
//             gameBet: "$gameBet",
//             gamePayout: "$gamePayout",
//             gameProfitLoss: "$gameProfitLoss",
//             recordCount: "$recordCount"
//           }
//         }
//       }
//     },

//     // Step 12: Group by Category within each date
//     {
//       $group: {
//         _id: {
//           date: "$_id.date",
//           category: "$_id.category"
//         },
//         date: { $first: "$date" },
//         category: { $first: "$category" },
//         categoryTurnover: { $sum: "$providerTurnover" },
//         categoryBet: { $sum: "$providerBet" },
//         categoryPayout: { $sum: "$providerPayout" },
//         categoryProfitLoss: { $sum: "$providerProfitLoss" },
//         providers: {
//           $push: {
//             providerCode: "$providerCode",
//             providerName: "$providerName",
//             providerCompany: "$providerCompany",
//             providerTurnover: "$providerTurnover",
//             providerBet: "$providerBet",
//             providerPayout: "$providerPayout",
//             providerProfitLoss: "$providerProfitLoss",
//             games: "$games"
//           }
//         }
//       }
//     },

//     // Step 13: Group by Date (final structure)
//     {
//       $group: {
//         _id: "$_id.date",
//         date: { $first: "$date" },
//         dateTurnover: { $sum: "$categoryTurnover" },
//         dateBet: { $sum: "$categoryBet" },
//         datePayout: { $sum: "$categoryPayout" },
//         dateProfitLoss: { $sum: "$categoryProfitLoss" },
//         categories: {
//           $push: {
//             category: "$category",
//             categoryTurnover: "$categoryTurnover",
//             categoryBet: "$categoryBet",
//             categoryPayout: "$categoryPayout",
//             categoryProfitLoss: "$categoryProfitLoss",
//             providers: "$providers"
//           }
//         }
//       }
//     },

//     // Step 14: Final projection
//     {
//       $project: {
//         _id: 0,
//         date: 1,
//         dateTurnover: 1,
//         dateBet: 1,
//         datePayout: 1,
//         dateProfitLoss: 1,
//         categories: 1
//       }
//     },

//     // Step 15: Sort by date
//     {
//       $sort: { 
//         date: sortOrder === "desc" ? -1 : 1 
//       }
//     },

//     // Step 16: Pagination
//     {
//       $facet: {
//         metadata: [{ $count: "total" }],
//         data: [
//           { $skip: (parseInt(page) - 1) * parseInt(limit) },
//           { $limit: parseInt(limit) }
//         ]
//       }
//     }
//   ];

//   try {
//     // 5️⃣ Execute aggregation
//     const result = await BettingHistory.aggregate(pipeline).allowDiskUse(true);

//     // 6️⃣ Prepare response
//     const data = result[0].data;
//     const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

//     res.status(200).json({
//       success: true,
//       count: total,
//       totalPages: Math.ceil(total / parseInt(limit)),
//       currentPage: parseInt(page),
//       data: data
//     });
//   } catch (error) {
//     console.error("Aggregation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching betting records",
//       error: error.message
//     });
//   }
// });

// exports.getBettingRecordsGrouped = asyncHandler(async (req, res) => {
//   const {
//     page = 1,
//     limit = 20,
//     dateOption = "last7days",
//     platforms = "",
//     gameTypes = "",
//     sortBy = "start_time",
//     sortOrder = "desc",
//     search = "",
//     status,
//     minBet,
//     maxBet,
//     minPayout,
//     maxPayout,
//   } = req.query;
//   const userId = req.user.userId
//   // 1️⃣ Verify user
//   const user = await User.findOne({ userId }).lean();
//   if (!user) return res.status(404).json({ success: false, message: "User not found" });

//   // 2️⃣ Date range
//   const dateRange = dateUtils.getDateRange(dateOption);

//   // 3️⃣ Match stage for BettingHistory
//   const matchStage = {
//     member: user.userId,
//     start_time: { $gte: new Date(dateRange.from), $lte: new Date(dateRange.to) },
//   };

//   if (status) matchStage.status = parseInt(status);
//   if (platforms) {
//     const platformArray = platforms.split(",").filter(p => p.trim() !== "");
//     if (platformArray.length > 0) {
//       matchStage.site = { $in: platformArray };
//     }
//   }

//   if (minBet || maxBet) {
//     matchStage.bet = {};
//     if (minBet) matchStage.bet.$gte = parseFloat(minBet);
//     if (maxBet) matchStage.bet.$lte = parseFloat(maxBet);
//   }

//   if (minPayout || maxPayout) {
//     matchStage.payout = {};
//     if (minPayout) matchStage.payout.$gte = parseFloat(minPayout);
//     if (maxPayout) matchStage.payout.$lte = parseFloat(maxPayout);
//   }

//   if (search) {
//     matchStage.$or = [
//       { ref_no: { $regex: search, $options: "i" } },
//       { game_id: { $regex: search, $options: "i" } },
//       { bet_detail: { $regex: search, $options: "i" } },
//     ];
//   }

//   // 4️⃣ Main Aggregation Pipeline - FIXED with Date Grouping
//   const pipeline = [
//     // Step 1: Match betting history records
//     { $match: matchStage },

//     // Step 2: Extract date part for grouping
//     {
//       $addFields: {
//         betDate: {
//           $dateToString: {
//             format: "%Y-%m-%d",
//             date: "$start_time"
//           }
//         }
//       }
//     },

//     // Step 3: Lookup GameListTable using site (p_code)
//     {
//       $lookup: {
//         from: "gamelisttables",
//         let: { siteCode: "$site" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$p_code", "$$siteCode"] },
//                   { $eq: ["$is_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "gameDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$gameDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 4: Create newGameObject
//     {
//       $addFields: {
//         newGameObject: {
//           $cond: {
//             if: { $ne: ["$gameDetails", null] },
//             then: {
//               g_code: "$gameDetails.g_code",
//               g_type: "$gameDetails.g_type",
//               gameName: "$gameDetails.gameName",
//               imgFileName: "$gameDetails.imgFileName",
//               category_name: "$gameDetails.category_name",
//               brand: "$gameDetails.brand"
//             },
//             else: {
//               g_code: "$game_id",
//               g_type: "Unknown",
//               gameName: { gameName_enus: "Unknown Game" },
//               imgFileName: null,
//               category_name: null,
//               brand: null
//             }
//           }
//         }
//       }
//     },

//     // Step 5: Lookup BetProviderTable using site (providercode)
//     {
//       $lookup: {
//         from: "betprovidertables",
//         let: { siteCode: "$site" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$providercode", "$$siteCode"] },
//                   { $eq: ["$id_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "providerDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$providerDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 6: FIXED - Lookup Categories using provider's g_type array
//     {
//       $lookup: {
//         from: "categories",
//         let: { 
//           providerGTypes: { 
//             $cond: {
//               if: { $isArray: "$providerDetails.g_type" },
//               then: "$providerDetails.g_type",
//               else: { $ifNull: [{ $split: ["$providerDetails.g_type", ","] }, []] }
//             }
//           } 
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { 
//                     $or: [
//                       { $in: ["$g_type", "$$providerGTypes"] },
//                       { $in: ["$$providerGTypes", ["$g_type"]] }
//                     ]
//                   },
//                   { $eq: ["$id_active", true] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "categoryDetails"
//       }
//     },
//     {
//       $unwind: {
//         path: "$categoryDetails",
//         preserveNullAndEmptyArrays: true
//       }
//     },

//     // Step 7: Add profitLoss calculation for each record
//     {
//       $addFields: {
//         profitLoss: {
//           $subtract: [
//             { $ifNull: ["$payout", 0] },
//             { $add: [{ $ifNull: ["$bet", 0] }, { $ifNull: ["$commission", 0] }] }
//           ]
//         }
//       }
//     },

//     // Step 8: Group by date first, then by newGameObject
//     {
//       $group: {
//         _id: {
//           date: "$betDate",
//           g_code: "$newGameObject.g_code",
//           g_type: "$newGameObject.g_type",
//           gameName: "$newGameObject.gameName",
//           category_name: "$newGameObject.category_name"
//         },
//         providerCode: { $first: "$site" },
//         providerDetails: { $first: "$providerDetails" },
//         categoryDetails: { $first: "$categoryDetails" },
//         totalTurnover: { $sum: "$turnover" },
//         totalBet: { $sum: "$bet" },
//         totalPayout: { $sum: "$payout" },
//         totalCommission: { $sum: { $ifNull: ["$commission", 0] } },
//         totalProfitLoss: { $sum: "$profitLoss" }
//       }
//     },

//     // Step 9: Determine final category
//     {
//       $addFields: {
//         gameCategory: {
//           $cond: {
//             if: { $ne: ["$categoryDetails", null] },
//             then: "$categoryDetails.category_name",
//             else: {
//               $cond: {
//                 if: { $ne: ["$_id.category_name", null] },
//                 then: "$_id.category_name",
//                 else: "Uncategorized"
//               }
//             }
//           }
//         }
//       }
//     },

//     // Step 10: Group by Date first, then by Category
//     {
//       $group: {
//         _id: {
//           date: "$_id.date",
//           category: "$gameCategory"
//         },
//         games: {
//           $push: {
//             gameCode: "$_id.g_code",
//             gameType: "$_id.g_type",
//             gameName: "$_id.gameName",
//             providerCode: "$providerCode",
//             providerName: { $ifNull: ["$providerDetails.name", "Unknown Provider"] },
//             providerCompany: { $ifNull: ["$providerDetails.company", "Unknown"] },
//             totalTurnover: "$totalTurnover",
//             totalBet: "$totalBet",
//             totalPayout: "$totalPayout",
//             totalProfitLoss: "$totalProfitLoss"
//           }
//         },
//         categoryTurnover: { $sum: "$totalTurnover" },
//         categoryBet: { $sum: "$totalBet" },
//         categoryPayout: { $sum: "$totalPayout" },
//         categoryProfitLoss: { $sum: "$totalProfitLoss" }
//       }
//     },

//     // Step 11: Group providers within each category for each date
//     // {
//     //   $addFields: {
//     //     providers: {
//     //       $reduce: {
//     //         input: "$games",
//     //         initialValue: [],
//     //         in: {
//     //           $let: {
//     //             vars: {
//     //               existingProviderIndex: {
//     //                 $indexOfArray: ["$$value.providerCode", "$$this.providerCode"]
//     //               }
//     //             },
//     //             in: {
//     //               $cond: {
//     //                 if: { $ne: ["$$existingProviderIndex", -1] },
//     //                 then: {
//     //                   $map: {
//     //                     input: { $range: [0, { $size: "$$value" }] },
//     //                     as: "idx",
//     //                     in: {
//     //                       $cond: {
//     //                         if: { $eq: ["$$idx", "$$existingProviderIndex"] },
//     //                         then: {
//     //                           $mergeObjects: [
//     //                             { $arrayElemAt: ["$$value", "$$idx"] },
//     //                             {
//     //                               games: {
//     //                                 $concatArrays: [
//     //                                   { $arrayElemAt: ["$$value", "$$idx"] }.games,
//     //                                   [{
//     //                                     gameCode: "$$this.gameCode",
//     //                                     gameType: "$$this.gameType",
//     //                                     gameName: "$$this.gameName",
//     //                                     totalTurnover: "$$this.totalTurnover",
//     //                                     totalBet: "$$this.totalBet",
//     //                                     totalPayout: "$$this.totalPayout",
//     //                                     totalProfitLoss: "$$this.totalProfitLoss"
//     //                                   }]
//     //                                 ]
//     //                               }
//     //                             }
//     //                           ]
//     //                         },
//     //                         else: { $arrayElemAt: ["$$value", "$$idx"] }
//     //                       }
//     //                     }
//     //                   }
//     //                 },
//     //                 else: {
//     //                   $concatArrays: [
//     //                     "$$value",
//     //                     [{
//     //                       providerCode: "$$this.providerCode",
//     //                       providerName: "$$this.providerName",
//     //                       providerCompany: "$$this.providerCompany",
//     //                       games: [{
//     //                         gameCode: "$$this.gameCode",
//     //                         gameType: "$$this.gameType",
//     //                         gameName: "$$this.gameName",
//     //                         totalTurnover: "$$this.totalTurnover",
//     //                         totalBet: "$$this.totalBet",
//     //                         totalPayout: "$$this.totalPayout",
//     //                         totalProfitLoss: "$$this.totalProfitLoss"
//     //                       }]
//     //                     }]
//     //                   ]
//     //                 }
//     //               }
//     //             }
//     //           }
//     //         }
//     //       }
//     //     }
//     //   }
//     // },

//     // // Step 12: Calculate provider stats
//     // {
//     //   $addFields: {
//     //     providers: {
//     //       $map: {
//     //         input: "$providers",
//     //         as: "provider",
//     //         in: {
//     //           providerCode: "$$provider.providerCode",
//     //           providerName: "$$provider.providerName",
//     //           providerCompany: "$$provider.providerCompany",
//     //           games: "$$provider.games",
//     //           providerStats: {
//     //             turnover: { $sum: "$$provider.games.totalTurnover" },
//     //             bet: { $sum: "$$provider.games.totalBet" },
//     //             payout: { $sum: "$$provider.games.totalPayout" },
//     //             profitLoss: { $sum: "$$provider.games.totalProfitLoss" }
//     //           }
//     //         }
//     //       }
//     //     }
//     //   }
//     // },

//     // Step 13: Group by Date for final structure
//     {
//       $group: {
//         _id: "$_id.date",
//         categories: {
//           $push: {
//             category: "$_id.category",
//             categoryTurnover: "$categoryTurnover",
//             categoryBet: "$categoryBet",
//             categoryPayout: "$categoryPayout",
//             categoryProfitLoss: "$categoryProfitLoss",
//             providers: "$providers"
//           }
//         },
//         dateTurnover: { $sum: "$categoryTurnover" },
//         dateBet: { $sum: "$categoryBet" },
//         datePayout: { $sum: "$categoryPayout" },
//         dateProfitLoss: { $sum: "$categoryProfitLoss" }
//       }
//     },

//     // Step 14: Final projection
//     {
//       $project: {
//         _id: 0,
//         date: "$_id",
//         dateTurnover: 1,
//         dateBet: 1,
//         datePayout: 1,
//         dateProfitLoss: 1,
//         categories: 1
//       }
//     },

//     // Step 15: Sort by date
//     {
//       $sort: { date: sortOrder === "desc" ? -1 : 1 }
//     },

//     // Step 16: Pagination
//     {
//       $facet: {
//         metadata: [{ $count: "total" }],
//         data: [
//           { $skip: (parseInt(page) - 1) * parseInt(limit) },
//           { $limit: parseInt(limit) }
//         ]
//       }
//     }
//   ];

//   try {
//     // 5️⃣ Execute aggregation
//     const result = await BettingHistory.aggregate(pipeline).allowDiskUse(true);

//     // 6️⃣ Prepare response
//     const data = result[0].data;
//     const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

//     res.status(200).json({
//       success: true,
//       count: total,
//       totalPages: Math.ceil(total / parseInt(limit)),
//       currentPage: parseInt(page),
//       data: data
//     });
//   } catch (error) {
//     console.error("Aggregation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching betting records",
//       error: error.message
//     });
//   }
// });
// exports.getBettingRecordById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const user = req.user;

//   const pipeline = [
//     {
//       $match: {
//         $or: [{ id }, { ref_no: id }],
//         member: user.member_id || user.id,
//       },
//     },

//     // Extensive lookups for detailed view
//     {
//       $lookup: {
//         from: "gamelisttables",
//         let: { product: "$product", gameId: "$game_id" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $or: [
//                   {
//                     $and: [
//                       { $eq: ["$p_code", "$$product"] },
//                       { $eq: ["$g_code", "$$gameId"] },
//                     ],
//                   },
//                   { $eq: ["$p_code", "$$product"] },
//                 ],
//               },
//             },
//           },
//         ],
//         as: "game",
//       },
//     },
//     { $unwind: { path: "$game", preserveNullAndEmptyArrays: true } },

//     {
//       $lookup: {
//         from: "betprovidertables",
//         localField: "product",
//         foreignField: "providercode",
//         as: "provider",
//       },
//     },
//     { $unwind: { path: "$provider", preserveNullAndEmptyArrays: true } },

//     {
//       $lookup: {
//         from: "categories",
//         localField: "game.category_name",
//         foreignField: "category_name",
//         as: "category",
//       },
//     },
//     { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

//     // Add calculated fields
//     {
//       $addFields: {
//         profitLoss: {
//           $subtract: [
//             { $ifNull: ["$payout", 0] },
//             {
//               $add: [{ $ifNull: ["$bet", 0] }, { $ifNull: ["$commission", 0] }],
//             },
//           ],
//         },
//         netAmount: {
//           $subtract: ["$payout", "$commission"],
//         },
//       },
//     },
//   ];

//   const record = await BettingHistory.aggregate(pipeline);

//   if (!record || record.length === 0) {
//     return next(
//       new ErrorResponse(`Betting record not found with id: ${id}`, 404)
//     );
//   }

//   res.status(200).json({
//     success: true,
//     data: record[0],
//   });
// });
exports.getBettingRecordsGrouped = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    dateOption = "last7days",
    platforms = "",
    gameTypes = "",
    sortBy = "start_time",
    sortOrder = "desc",
    search = "",
    status,
    minBet,
    maxBet,
    minPayout,
    maxPayout,
    product // new query param
  } = req.query;

  const userId = req.user.userId;

  const user = await User.findOne({ userId }).lean();
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const dateRange = dateUtils.getDateRange(dateOption);

  // const matchStage = {
  //   member: user.userId || user.userId.toUpperCase(),
  //   start_time: { $gte: new Date(dateRange.from), $lte: new Date(dateRange.to) },
  // };


  const matchStage = {
  member: {
    $in: [
      user.userId,
      user.userId.toUpperCase(),
      user.userId.toLowerCase(),
    ],
  },
  start_time: {
    $gte: new Date(dateRange.from),
    $lte: new Date(dateRange.to),
  },
};

  // if (status) matchStage.status = parseInt(status);
  if (platforms) {
    const platformArray = platforms.split(",").filter(p => p.trim() !== "");
    if (platformArray.length > 0) matchStage.site = { $in: platformArray };
  }
  if (minBet || maxBet) {
    matchStage.bet = {};
    if (minBet) matchStage.bet.$gte = parseFloat(minBet);
    if (maxBet) matchStage.bet.$lte = parseFloat(maxBet);
  }
  if (minPayout || maxPayout) {
    matchStage.payout = {};
    if (minPayout) matchStage.payout.$gte = parseFloat(minPayout);
    if (maxPayout) matchStage.payout.$lte = parseFloat(maxPayout);
  }
  if (search) {
    matchStage.$or = [
      { ref_no: { $regex: search, $options: "i" } },
      { game_id: { $regex: search, $options: "i" } },
      { bet_detail: { $regex: search, $options: "i" } },
    ];
  }

  const pipeline = [
    { $match: matchStage },

    // Lookup provider
    {
      $lookup: {
        from: "betprovidertables",
        localField: "site",
        foreignField: "providercode",
        as: "providerDetails"
      }
    },
    { $addFields: { provider: { $arrayElemAt: ["$providerDetails", 0] } } },
  ];

  // ✅ Conditional logic: skip gamelist lookup for sb/lc
  if (!["sb", "lc"].includes(product)) {
    pipeline.push(
      {
        $lookup: {
          from: "gamelisttables",
          localField: "site",
          foreignField: "p_code",
          as: "gameDetails"
        }
      },
      {
        $addFields: {
          game: { $arrayElemAt: ["$gameDetails", 0] },
          newGameObject: {
            $cond: {
              if: { $ne: [{ $arrayElemAt: ["$gameDetails", 0] }, null] },
              then: {
                g_code: { $arrayElemAt: ["$gameDetails.g_code", 0] },
                g_type: { $arrayElemAt: ["$gameDetails.g_type", 0] },
                gameName: { $arrayElemAt: ["$gameDetails.gameName", 0] },
                imgFileName: { $arrayElemAt: ["$gameDetails.imgFileName", 0] },
                category_name: { $arrayElemAt: ["$gameDetails.category_name", 0] },
                brand: { $arrayElemAt: ["$gameDetails.brand", 0] }
              },
              else: {
                g_code: "$game_id",
                g_type: "Unknown",
                gameName: { gameName_enus: "Unknown Game" },
                imgFileName: null,
                category_name: null,
                brand: null
              }
            }
          }
        }
      }
    );
  } else {
    // sb/lc জন্য শুধু category_name provider থেকে নেবে
    pipeline.push({
      $addFields: {
        newGameObject: {
          g_code: "$game_id",
          g_type: "Unknown",
          gameName: { gameName_enus: "Unknown Game" },
          imgFileName: null,
          category_name: "$provider.category_name",
          brand: null
        }
      }
    });
  }

  // Lookup category (provider g_type অনুযায়ী)
  pipeline.push(
    {
      $lookup: {
        from: "categories",
        let: {
          providerGTypes: {
            $cond: {
              if: { $isArray: "$provider.g_type" },
              then: "$provider.g_type",
              else: { $ifNull: [{ $split: ["$provider.g_type", ","] }, []] }
            }
          }
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $or: [{ $in: ["$g_type", "$$providerGTypes"] }, { $in: ["$$providerGTypes", ["$g_type"]] }] },
                  { $eq: ["$id_active", true] }
                ]
              }
            }
          }
        ],
        as: "categoryDetails"
      }
    },
    { $addFields: { category: { $arrayElemAt: ["$categoryDetails.category_name", 0] } } },

    // Profit/Loss
    {
      $addFields: {
        profitLoss: { $subtract: [{ $ifNull: ["$payout", 0] }, { $add: [{ $ifNull: ["$bet", 0] }, { $ifNull: ["$commission", 0] }] }] },
        formattedDate: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } }
      }
    },

    // Group by date & category
    {
      $group: {
        _id: {
          date: "$formattedDate",
          category: "$category",
          providerCode: "$site",
          providerName: { $ifNull: ["$provider.name", "Unknown Provider"] }
        },
        totalTurnover: { $sum: "$turnover" },
        totalBet: { $sum: "$bet" },
        totalPayout: { $sum: "$payout" },
        totalProfitLoss: { $sum: "$profitLoss" },
        games: {
          $push: {
            gameCode: "$newGameObject.g_code",
            gameType: "$newGameObject.g_type",
            gameName: "$newGameObject.gameName",
            providerCode: "$site",
            providerName: { $ifNull: ["$provider.name", "Unknown Provider"] },
            totalTurnover: "$turnover",
            totalBet: "$bet",
            totalPayout: "$payout",
            totalProfitLoss: "$profitLoss"
          }
        }
      }
    },

    {
      $group: {
        _id: "$_id.date",
        records: {
          $push: {
            gameType: "$_id.category",
            providerCode: "$_id.providerCode",
            platform: "$_id.providerName",
            turnover: "$totalTurnover",
            totalBet: "$totalBet",
            totalPayout: "$totalPayout",
            profitLoss: "$totalProfitLoss",
            games: "$games"
          }
        }
      }
    },


    // Final projection
    // {
    //   $project: {
    //     _id: 0,
    //     date: "$_id.date",
    //     category: "$_id.category",
    //     providerCode: "$_id.providerCode",
    //     providerName: "$_id.providerName",
    //     totalTurnover: 1,
    //     totalBet: 1,
    //     totalPayout: 1,
    //     totalProfitLoss: 1,
    //     // games: 1
    //   }
    // },

    { $sort: { date: sortOrder === "desc" ? -1 : 1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: (parseInt(page) - 1) * parseInt(limit) }, { $limit: parseInt(limit) }]
      }
    }
  );

  try {
    const result = await BettingHistory.aggregate(pipeline).allowDiskUse(true);
    const data = result[0].data;
    console.log(data);
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    res.status(200).json({
      success: true,
      count: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: data
    });
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ success: false, message: "Error fetching betting records", error: error.message });
  }
});



/**
 * @desc    Export betting records to CSV
 * @route   GET /api/v1/betting/export
 * @access  Private
 */
exports.exportBettingRecords = asyncHandler(async (req, res, next) => {
  const { dateOption = "last7days", format = "csv" } = req.query;
  const user = req.user;

  const dateRange = dateUtils.getDateRange(dateOption);

  const records = await BettingHistory.find({
    member: user.member_id || user.id,
    start_time: {
      $gte: new Date(dateRange.from),
      $lte: new Date(dateRange.to),
    },
  })
    .sort({ start_time: -1 })
    .lean();

  // Transform records for export
  const exportData = records.map((record) => ({
    "Reference No": record.ref_no,
    Date: new Date(record.start_time).toLocaleString(),
    Platform: record.product,
    "Game ID": record.game_id,
    "Bet Amount": record.bet,
    Turnover: record.turnover,
    Payout: record.payout,
    Commission: record.commission,
    "Profit/Loss": record.payout - record.bet - record.commission,
    Status: record.status === 1 ? "Settled" : "Pending",
    Settlement: record.settlement_status,
  }));

  if (format === "json") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=betting-records-${Date.now()}.json`
    );
    res.send(JSON.stringify(exportData, null, 2));
  } else {
    // Convert to CSV
    const csv = require("csv-stringify");
    const stringifier = csv.stringify({ header: true });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=betting-records-${Date.now()}.csv`
    );

    stringifier.pipe(res);
    exportData.forEach((row) => stringifier.write(row));
    stringifier.end();
  }
});




