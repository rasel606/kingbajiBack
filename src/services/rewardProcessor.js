const cron = require('node-cron');
const TurnOverModal = require('../Models/TurnOverModal');

const User = require('../Models/User');
const BettingHistory = require('../Models/BettingHistory');
const ReferralBonus = require('../Models/ReferralBonus');
const UserBonus = require('../Models/UserBonus');



const createTurnoverEntry = async ({
  userId,
  tier,
  turnoverAmount,
  rewardPercent,
  rewardAmount,
  referredbyAgent = null,

  referredbysubAdmin = null,
}) => {
  try {
    await TurnOverModal.create({
      userId,
      tier,
      turnoverAmount,
      rewardPercent,
      rewardAmount,
      referredbyAgent,

      referredbysubAdmin,
    });
    console.log(`✅ Turnover entry created for ${userId} | Tier ${tier}`);
  } catch (err) {
    console.error(`❌ Failed to create turnover for ${userId}:`, err);
  }
};

const tiers = [
  { threshold: 500000, tier1: 0.0020, tier2: 0.0007, tier3: 0.0003 },
  { threshold: 200000, tier1: 0.0015, tier2: 0.0006, tier3: 0.0002 },
  { threshold: 100, tier1: 0.0010, tier2: 0.0005, tier3: 0.0001 },
];

function getRewardPercent(turnover, level) {
  for (const tier of tiers) {
    if (turnover >= tier.threshold) {
      if (level === 1) return tier.tier1;
      if (level === 2) return tier.tier2;
      if (level === 3) return tier.tier3;
    }
  }
  return 0;
}

const getTurnoverSum = async (userIds, start, end) => {
  if (!userIds || userIds.length === 0) return 0;
  const result = await BettingHistory.aggregate([
    {
      $match: {
        member: { $in: userIds },
        start_time: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        totalTurnover: { $sum: "$turnover" }
      }
    }
  ]);
  return result.length > 0 ? result[0].totalTurnover : 0;
};

const rewardProcessor = async () => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setMilliseconds(-1);

    const users = await User.find();

    for (const user of users) {
      const level1Ids = user.levelOneReferrals || [];
      const level2Ids = user.levelTwoReferrals || [];
      const level3Ids = user.levelThreeReferrals || [];

      const level1Turnover = await getTurnoverSum(level1Ids, start, end);
      const level2Turnover = await getTurnoverSum(level2Ids, start, end);
      const level3Turnover = await getTurnoverSum(level3Ids, start, end);

      const level1Percent = getRewardPercent(level1Turnover, 1);
      const level2Percent = getRewardPercent(level2Turnover, 2);
      const level3Percent = getRewardPercent(level3Turnover, 3);

      const level1Reward = level1Turnover * level1Percent;
      const level2Reward = level2Turnover * level2Percent;
      const level3Reward = level3Turnover * level3Percent;
      const totalReward = level1Reward + level2Reward + level3Reward;

      if (totalReward >= 0.01) {
        await createTurnoverEntry({
          userId: user.userId,
          tier: 1,
          turnoverAmount: level1Turnover,
          rewardPercent: level1Percent,
          rewardAmount: level1Reward,
          referredbyAgent: user.referredbyAgent,

          referredbysubAdmin: user.referredbysubAdmin,
        });

        await createTurnoverEntry({
          userId: user.userId,
          tier: 2,
          turnoverAmount: level2Turnover,
          rewardPercent: level2Percent,
          rewardAmount: level2Reward,
          referredbyAgent: user.referredbyAgent,

          referredbysubAdmin: user.referredbysubAdmin,
        });

        await createTurnoverEntry({
          userId: user.userId,
          tier: 3,
          turnoverAmount: level3Turnover,
          rewardPercent: level3Percent,
          rewardAmount: level3Reward,
          referredbyAgent: user.referredbyAgent,

          referredbysubAdmin: user.referredbysubAdmin,
        });

        await ReferralBonus.create([
          {
            userId: user.userId,
            referredUser: null,
            level: 1,
            amount: level1Reward,
            turnover: level1Turnover,
            referredbyAgent: user.referredbyAgent || null,

            referredbysubAdmin: user.referredbysubAdmin || null,
          },
          {
            userId: user.userId,
            referredUser: null,
            level: 2,
            amount: level2Reward,
            turnover: level2Turnover,
            referredbyAgent: user.referredbyAgent || null,

            referredbysubAdmin: user.referredbysubAdmin || null,
          },
          {
            userId: user.userId,
            referredUser: null,
            level: 3,
            amount: level3Reward,
            turnover: level3Turnover,
            referredbyAgent: user.referredbyAgent || null,

            referredbysubAdmin: user.referredbysubAdmin || null,
          }
        ]);

        await UserBonus.create([
          {
          userId: user.userId,
          tier: 1,
          turnoverAmount: level1Turnover,
          rewardPercent: level1Percent,
          rewardAmount: level1Reward,
          bonusId: null,
          amount: level1Reward,
          referredbyAgent: user.referredbyAgent || null,
          bonusType: 'referral',
          turnoverRequirement: level1Reward,
          referredbyAgent: user.referredbyAgent || null,
          referredbysubAdmin: user.referredbysubAdmin || null,
          referredByAffiliate: user.referredByAffiliate || null
        },
        {
          userId: user.userId,
          tier: 2,
          turnoverAmount: level2Turnover,
          rewardPercent: level2Percent,
          rewardAmount: level2Reward,
          bonusId: null,
          amount: level2Reward,
          referredbyAgent: user.referredbyAgent || null,
          bonusType: 'referral',
          turnoverRequirement: level2Reward,
          referredbyAgent: user.referredbyAgent || null,
          referredbysubAdmin: user.referredbysubAdmin || null,
          referredByAffiliate: user.referredByAffiliate || null
        },
        {
          userId: user.userId,
          tier: 3,
          turnoverAmount: level3Turnover,
          rewardPercent: level3Percent,
          rewardAmount: level3Reward,
          bonusId: null,
          amount: level3Reward,
          referredbyAgent: user.referredbyAgent || null,
          bonusType: 'referral',
          turnoverRequirement: level3Reward,
          referredbyAgent: user.referredbyAgent || null,
          referredbysubAdmin: user.referredbysubAdmin || null,
          referredByAffiliate: user.referredByAffiliate || null
        }
        
      ])
        const ReferralBonus = await ReferralBonus.findOne({ userId: user.userId });
        console.log(`✅ Referral bonus created for ${user.userId} | Tier 1: ${level1Reward} | Tier 2: ${level2Reward} | Tier 3: ${level3Reward} | ReferralBonus: ${ReferralBonus._id}`);
        await User.updateOne({ userId: user.userId }, {
          $inc: { cashReward: totalReward }
        });
      }
    }

    console.log("✅ Daily referral cashback calculation completed.");
  } catch (error) {
    console.error("❌ Error in daily cashback job:", error);
  }
};





cron.schedule('* * * * *', async () => {
  console.log("🏅 Running rewardProcessor update...");
  await rewardProcessor();
}); // Run daily at 1:10 UTC

module.exports = rewardProcessor;
