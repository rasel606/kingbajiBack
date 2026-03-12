const PromoCampaign = require("../models/PromoCampaign");
const PromoClaim = require("../models/PromoClaim");
const {
  ensureVip8Campaign,
  evaluateDepositPromotion,
  creditDueFreeSpins,
} = require("../services/depositPromoService");

exports.seedVip8 = async (req, res) => {
  try {
    const adminUserId = req.user?.userId || "system";
    const campaign = await ensureVip8Campaign(adminUserId);

    return res.status(200).json({
      success: true,
      message: "VIP 8% promo seeded/activated",
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to seed VIP8 promo",
      error: error.message,
    });
  }
};

exports.getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await PromoCampaign.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.evaluate = async (req, res) => {
  try {
    const { userId, depositAmount, promoCode } = req.body;
    if (!userId || !depositAmount || !promoCode) {
      return res.status(400).json({
        success: false,
        message: "userId, depositAmount, promoCode required",
      });
    }

    const result = await evaluateDepositPromotion({ userId, depositAmount, promoCode });

    return res.status(200).json({
      success: true,
      message: "Promotion evaluated",
      data: {
        claimId: result.claim._id,
        campaignCode: result.campaign.code,
        vipLevel: result.claim.vipLevel,
        bonusPercent: result.evaluation.bonusPercent,
        bonusAmount: result.evaluation.bonusAmount,
        freeSpinCount: result.evaluation.freeSpinCount,
        freeSpinCreditAt: result.claim.freeSpinCreditAt,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getClaims = async (req, res) => {
  try {
    const { userId, campaignCode, status, freeSpinStatus, page = 1, limit = 20 } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (campaignCode) query.campaignCode = campaignCode;
    if (status) query.status = status;
    if (freeSpinStatus) query.freeSpinStatus = freeSpinStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      PromoClaim.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PromoClaim.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit) || 1),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.runFreeSpinCreditNow = async (req, res) => {
  try {
    const results = await creditDueFreeSpins(Number(req.body?.limit || 200));

    return res.status(200).json({
      success: true,
      message: "Free spin credit worker executed",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
