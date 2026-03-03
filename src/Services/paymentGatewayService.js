const User = require("../Models/User");
const WidthralPaymentGateWayTable = require("../Models/WidthralPaymentGateWayTable");
const { getPaymentOwnersWithReferralChain, getReferralLevelsWithGateways } = require("../helpers/paymentHelpers");

exports.GetPaymentMethodsWidthrawUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const gatewayOwnersData = await getPaymentGatewayOwner(user.referredBy);
    if (!gatewayOwnersData.length)
      return res.status(404).json({ message: "No Payment Gateway Owner found" });

    const referredByList = gatewayOwnersData.map(o => o.referralCode);
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const paymentMethods = await WidthralPaymentGateWayTable.find({
      is_active: true,
      referredBy: { $in: referredByList },
      startTotalMinutes: { $lte: currentTotalMinutes },
      endTotalMinutes: { $gte: currentTotalMinutes },
    }).select(
      "gateway_name gateway_Number payment_type image_url start_time end_time is_active minimun_amount maximum_amount"
    );

    const referrals = await getReferralOwner(user);

    return res.status(200).json({
      paymentMethods,
      referralLevels: {
        levelOne: referrals.levelOneUsers.length,
        levelTwo: referrals.levelTwoUsers.length,
        levelThree: referrals.levelThreeUsers.length,
      },
      gatewayMap: {
        levelOneGateways: referrals.levelOneGateways,
        levelTwoGateways: referrals.levelTwoGateways,
        levelThreeGateways: referrals.levelThreeGateways,
      },
    });
  } catch (err) {
    console.error("GetPaymentMethodsWidthrawUser Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
