const Gateway = require("../models/Gateway");
const {
  getUserRoleAndDetails,
  countUserReferrals,
} = require("../utils/referralChainUtils");

/**
 * Gateway Management Controller
 */

/**
 * গেটওয়ে তৈরি করা
 * POST /api/gateway/create
 */
exports.createGateway = async (req, res) => {
  try {
    const {
      ownerId,
      gatewayName,
      gatewayType,
      accountNumber,
      accountName,
      minDeposit,
      maxDeposit,
      minWithdrawal,
      maxWithdrawal,
      configuration,
    } = req.body;

    // Validation
    if (!ownerId || !gatewayName || !gatewayType || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: "সকল প্রয়োজনীয় ফিল্ড প্রদান করুন",
      });
    }

    // Owner এর role verify করা
    const ownerDetails = await getUserRoleAndDetails(ownerId);
    if (!ownerDetails) {
      return res.status(404).json({
        success: false,
        message: "Owner খুঁজে পাওয়া যায়নি",
      });
    }

    // শুধু admin, subAdmin অথবা affiliate গেটওয়ে তৈরি করতে পারবে
    if (!["admin", "subAdmin", "affiliate"].includes(ownerDetails.role)) {
      return res.status(403).json({
        success: false,
        message: "শুধুমাত্র Admin, SubAdmin বা Affiliate গেটওয়ে তৈরি করতে পারবে",
      });
    }

    // Gateway ID তৈরি করা
    const gatewayId = `GW${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Gateway create করা
    const gateway = await Gateway.create({
      gatewayId,
      ownerId,
      ownerRole: ownerDetails.role,
      gatewayName,
      gatewayType,
      accountNumber,
      accountName,
      minDeposit: minDeposit || 100,
      maxDeposit: maxDeposit || 100000,
      minWithdrawal: minWithdrawal || 500,
      maxWithdrawal: maxWithdrawal || 50000,
      configuration: configuration || {},
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "গেটওয়ে সফলভাবে তৈরি হয়েছে",
      data: gateway,
    });
  } catch (error) {
    console.error("Error in createGateway:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে তৈরি করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * গেটওয়ে আপডেট করা
 * PUT /api/gateway/update/:gatewayId
 */
exports.updateGateway = async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const updateData = req.body;

    // Gateway খুঁজে বের করা
    const gateway = await Gateway.findOne({ gatewayId });
    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: "গেটওয়ে পাওয়া যায়নি",
      });
    }

    // আপডেট করা যাবে না এমন ফিল্ড remove করা
    delete updateData.gatewayId;
    delete updateData.ownerId;
    delete updateData.ownerRole;

    // Gateway update করা
    const updatedGateway = await Gateway.findOneAndUpdate(
      { gatewayId },
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "গেটওয়ে সফলভাবে আপডেট হয়েছে",
      data: updatedGateway,
    });
  } catch (error) {
    console.error("Error in updateGateway:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে আপডেট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * গেটওয়ে ডিলিট করা (soft delete)
 * DELETE /api/gateway/delete/:gatewayId
 */
exports.deleteGateway = async (req, res) => {
  try {
    const { gatewayId } = req.params;

    const gateway = await Gateway.findOneAndUpdate(
      { gatewayId },
      {
        $set: {
          isActive: false,
          isDeleted: true,
        },
      },
      { new: true }
    );

    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: "গেটওয়ে পাওয়া যায়নি",
      });
    }

    return res.status(200).json({
      success: true,
      message: "গেটওয়ে সফলভাবে ডিলিট হয়েছে",
    });
  } catch (error) {
    console.error("Error in deleteGateway:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে ডিলিট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * নির্দিষ্ট owner এর সব গেটওয়ে দেখা
 * GET /api/gateway/owner/:ownerId
 */
exports.getGatewaysByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { includeInactive } = req.query;

    const query = { ownerId, isDeleted: false };
    if (!includeInactive) {
      query.isActive = true;
    }

    const gateways = await Gateway.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "গেটওয়ে তালিকা পাওয়া গেছে",
      data: {
        gateways,
        count: gateways.length,
      },
    });
  } catch (error) {
    console.error("Error in getGatewaysByOwner:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে তালিকা পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * সব গেটওয়ে দেখা (admin only)
 * GET /api/gateway/all
 */
exports.getAllGateways = async (req, res) => {
  try {
    const { page = 1, limit = 20, ownerRole, isActive, gatewayType } = req.query;

    const query = { isDeleted: false };

    if (ownerRole) {
      query.ownerRole = ownerRole;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (gatewayType) {
      query.gatewayType = gatewayType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [gateways, total] = await Promise.all([
      Gateway.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Gateway.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "গেটওয়ে তালিকা পাওয়া গেছে",
      data: {
        gateways,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllGateways:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে তালিকা পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * নির্দিষ্ট গেটওয়ে দেখা
 * GET /api/gateway/:gatewayId
 */
exports.getGatewayById = async (req, res) => {
  try {
    const { gatewayId } = req.params;

    const gateway = await Gateway.findOne({ gatewayId, isDeleted: false });

    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: "গেটওয়ে পাওয়া যায়নি",
      });
    }

    return res.status(200).json({
      success: true,
      message: "গেটওয়ে পাওয়া গেছে",
      data: gateway,
    });
  } catch (error) {
    console.error("Error in getGatewayById:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * গেটওয়ে স্ট্যাটিস্টিক্স দেখা
 * GET /api/gateway/:gatewayId/statistics
 */
exports.getGatewayStatistics = async (req, res) => {
  try {
    const { gatewayId } = req.params;

    const gateway = await Gateway.findOne({ gatewayId, isDeleted: false });

    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: "গেটওয়ে পাওয়া যায়নি",
      });
    }

    return res.status(200).json({
      success: true,
      message: "গেটওয়ে স্ট্যাটিস্টিক্স পাওয়া গেছে",
      data: {
        gatewayId: gateway.gatewayId,
        gatewayName: gateway.gatewayName,
        balance: gateway.balance,
        totalDeposits: gateway.totalDeposits,
        totalWithdrawals: gateway.totalWithdrawals,
        statistics: gateway.statistics,
      },
    });
  } catch (error) {
    console.error("Error in getGatewayStatistics:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে স্ট্যাটিস্টিক্স পেতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

/**
 * গেটওয়ে toggle করা (activate/deactivate)
 * PATCH /api/gateway/:gatewayId/toggle
 */
exports.toggleGateway = async (req, res) => {
  try {
    const { gatewayId } = req.params;

    const gateway = await Gateway.findOne({ gatewayId, isDeleted: false });

    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: "গেটওয়ে পাওয়া যায়নি",
      });
    }

    gateway.isActive = !gateway.isActive;
    await gateway.save();

    return res.status(200).json({
      success: true,
      message: `গেটওয়ে ${gateway.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
      data: {
        gatewayId: gateway.gatewayId,
        isActive: gateway.isActive,
      },
    });
  } catch (error) {
    console.error("Error in toggleGateway:", error);
    return res.status(500).json({
      success: false,
      message: "গেটওয়ে টগল করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

module.exports = exports;
