const BettingHistory = require('../Models/BettingHistory');
const Category = require('../Models/Category');
const GameListTable = require('../Models/GameListTable');

// Get betting records summary (grouped by date)
// router.get('/betting-records/summary',
exports.BettingRecordSummary = async (req, res) => {
    try {



        const { userId, dateRange = 'last7days', platform, gameType } = req.query;
        console.log("req.query", gameType);
        // Validate required parameters
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Calculate date range
        const dateFilter = calculateDateRange(dateRange);

        // Build match conditions
        const matchConditions = {
            member: userId,
            start_time: { $gte: dateFilter.start, $lt: dateFilter.end }
        };

        // Add optional filters
        // if (status) matchConditions.status = status;
        if (platform) matchConditions['categoryInfo.p_code'] = { $in: platform.split(',') };
        if (gameType) matchConditions['categoryInfo.category_name'] = { $in: gameType.split(',') };
        console.log("matchConditions", matchConditions);
        // Aggregate betting records
        const records = await BettingHistory.aggregate([
            {
                $match: {
                    member: userId,
                    start_time: { $gte: dateFilter.start, $lt: dateFilter.end }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    let: { gameId: "$game_id" },
                    pipeline: [
                        { $unwind: "$gamelist" },
                        {
                            $match: {
                                $expr: { $eq: ["$gamelist.g_code", "$$gameId"] }
                            }
                        },
                        {
                            $project: {
                                p_code: "$gamelist.p_code",
                                category_name: 1
                            }
                        }
                    ],
                    as: "categoryInfo"
                }
            },
            { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } },
                        platform: "$categoryInfo.p_code",
                        gameType: "$categoryInfo.category_name"
                    },
                    turnover: { $sum: "$bet" }, // Use bet amount as turnover
                    profitLoss: { $sum: { $subtract: ["$payout", "$bet"] } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    platform: "$_id.platform",
                    gameType: "$_id.gameType",
                    turnover: 1,
                    profitLoss: 1,
                    count: 1
                }
            },
            { $sort: { date: -1 } }
        ]);

        // console.log("records", records);
        // const { userId, dateRange = 'last7days' } = req.query;
        // console.log("dateRange", dateRange, "userId", userId);
        // // Validate input
        // if (!userId) {
        //     return res.status(400).json({ error: 'User ID is required' });
        // }

        // // Calculate date range
        // const dateFilter = calculateDateRange(dateRange);
        // console.log("dateFilter", dateFilter);
        // // Aggregate betting records
        // const records = await BettingHistory.aggregate([
        //     {
        //         $match: {
        //             member: userId,
        //             start_time: { $gte: dateFilter.start, $lt: dateFilter.end }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'categories',
        //             let: { gameId: "$game_id" },
        //             pipeline: [
        //                 { $unwind: "$gamelist" },
        //                 { $match: { $expr: { $eq: ["$gamelist.g_code", "$$gameId"] } } },
        //                 {
        //                     $project: {
        //                         p_code: "$gamelist.p_code",
        //                         category_name: 1
        //                     }
        //                 }
        //             ],
        //             as: "categoryInfo"
        //         }
        //     },
        //     { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
        //     {
        //         $lookup: {
        //             from: 'gamelisttables',
        //             localField: "game_id",
        //             foreignField: "g_code",
        //             as: "gameInfo"
        //         }
        //     },
        //     { $unwind: { path: "$gameInfo", preserveNullAndEmptyArrays: true } },
        //     {
        //         $group: {
        //             _id: {
        //                 date: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } },
        //                 platform: "$categoryInfo.p_code",
        //                 gameType: "$categoryInfo.category_name"
        //             },

        //             turnover: { $sum: "$turnover" },
        //             profitLoss: { $sum: { $subtract: ["$payout", "$bet"] } },
        //             totalBet: { $sum: "$bet" },
        //             totalPayout: { $sum: "$payout" }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             date: "$_id.date",
        //             platform: "$_id.platform",
        //             gameType: "$_id.gameType",
        //             turnover: 1,
        //             profitLoss: 1,
        //             totalBet: 1,
        //             totalPayout: 1
        //         }
        //     },
        //     { $sort: { date: -1 } }
        // ]);
        // console.log("records", records);
        res.json(records);
    } catch (error) {
        console.error('Error fetching betting records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get detailed betting records for a specific date/platform/game type
// router.get('/betting-records/detail',
exports.BettingRecordDetails = async (req, res) => {
    try {
        const { userId, date, platform, gameType } = req.query;
        console.log("req.query", req.query);
        // Validate input
        if (!userId || !date) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        const getdDate = calculateDateRange(date);
        // Calculate date range
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        // Get detailed records
        const records = await BettingHistory.aggregate([
            {
                $match: {
                    member: userId,
                    start_time: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    let: { gameId: "$game_id" },
                    pipeline: [
                        { $unwind: "$gamelist" },
                        {
                            $match: {
                                $expr: { $eq: ["$gamelist.g_code", "$$gameId"] },
                                "gamelist.p_code": platform,
                                category_name: gameType
                            }
                        },
                        {
                            $project: {
                                p_code: "$gamelist.p_code",
                                category_name: 1
                            }
                        }
                    ],
                    as: "categoryInfo"
                }
            },
            { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'gamelisttables',
                    localField: "game_id",
                    foreignField: "g_code",
                    as: "gameInfo"
                }
            },
            { $unwind: { path: "$gameInfo", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    ref_no: 1,
                    start_time: 1,
                    game: "$gameInfo.gameName.gameName_enus",
                    turnover: "$bet",
                    profitLoss: { $subtract: ["$payout", "$bet"] },
                    status: 1
                }
            },
            { $sort: { start_time: -1 } }
        ]);

        res.json(records);
    } catch (error) {
        console.error('Error fetching detailed records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Helper function to calculate date ranges
function calculateDateRange(range) {

    console.log("range", range);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
        case 'today':
            return {
                start: today,
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            };
        case 'yesterday':
            return {
                start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
                end: today
            };
        case 'last7days':
        default:
            return {
                start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            };
    }
}

