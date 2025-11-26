// controllers/paymentMethodController.js

const { getPaymentMethodsForUser } = require('../Utils/getPaymentMethods');

const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
const User = require('../Models/User');
const { 
    getPaymentMethodsForAllLevels, 
    getPaymentMethodsByLevel,
    getReferralOwner,
    getUserWithReferralLevels
} = require('../Utils/paymentMethodUtils');

// Get payment methods for deposit (user perspective)
exports.GetPaymentMethodsUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ userId });
        console.log("User Found:", user);
        if (!user) return res.status(404).json({ message: "User not found" });

        const gatewayOwnersData = await getUserWithReferralLevels(user.referredBy);
        console.log("Gateway Owners Data:", gatewayOwnersData);
        if (!gatewayOwnersData.length) {
            return res.status(404).json({ message: "No Payment Gateway Owner found" });
        }

        const referredByList = gatewayOwnersData.map(o => o.referralCode);
        console.log("Referred By List:", referredByList);
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        const paymentMethods = await PaymentGateWayTable.find({
            is_active: true,
            referredBy: { $in: referredByList },
            startTotalMinutes: { $lte: currentTotalMinutes },
            endTotalMinutes: { $gte: currentTotalMinutes },
        }).select(
            "gateway_name gateway_Number payment_type image_url start_time end_time is_active minimun_amount maximum_amount referredBy"
        );
        console.log("Payment Methods Found:", paymentMethods);
        // Add owner info to each payment method
        const paymentMethodsWithOwner = paymentMethods.map(method => {
            const owner = gatewayOwnersData.find(owner => owner.referralCode === method.referredBy);
            return {
                ...method.toObject(),
                ownerName: owner?.name || 'Unknown',
                ownerLevel: owner?.level || 0
            };
        });
console.log("Payment Methods with Owner:", paymentMethodsWithOwner);
        const referrals = await getReferralOwner(user);

        return res.status(200).json({
            success: true,
            paymentMethods: paymentMethodsWithOwner,
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
            gatewayOwners: gatewayOwnersData.map(owner => ({
                name: owner.name,
                level: owner.level,
                referralCode: owner.referralCode
            }))
        });
    } catch (err) {
        console.error("GetPaymentMethodsUser Error:", err);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

// Get payment methods for admin/referral view
exports.GetPaymentMethodsForAllLevels = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const paymentMethods = await getPaymentMethodsForAllLevels(user);

        return res.status(200).json({
            success: true,
            data: paymentMethods
        });
    } catch (error) {
        console.error("GetPaymentMethodsForAllLevels Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get payment methods by specific levels
exports.GetPaymentMethodsByLevel = async (req, res) => {
    try {
        const { userId, levels } = req.body;

        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const levelArray = Array.isArray(levels) ? levels : [1, 2, 3];
        const paymentMethods = await getPaymentMethodsByLevel(user, levelArray);

        return res.status(200).json({
            success: true,
            data: paymentMethods
        });
    } catch (error) {
        console.error("GetPaymentMethodsByLevel Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get referral network statistics
exports.GetReferralNetworkStats = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const referrals = await getReferralOwner(user);
        const paymentMethods = await getPaymentMethodsForAllLevels(user);

        // Calculate statistics
        const stats = {
            totalReferrals: referrals.levelOneUsers.length + referrals.levelTwoUsers.length + referrals.levelThreeUsers.length,
            totalGateways: referrals.levelOneGateways + referrals.levelTwoGateways + referrals.levelThreeGateways,
            levelOne: {
                users: referrals.levelOneUsers.length,
                gateways: referrals.levelOneGateways,
                activePaymentMethods: paymentMethods.levelOne.reduce((acc, curr) => acc + curr.paymentMethods.length, 0)
            },
            levelTwo: {
                users: referrals.levelTwoUsers.length,
                gateways: referrals.levelTwoGateways,
                activePaymentMethods: paymentMethods.levelTwo.reduce((acc, curr) => acc + curr.paymentMethods.length, 0)
            },
            levelThree: {
                users: referrals.levelThreeUsers.length,
                gateways: referrals.levelThreeGateways,
                activePaymentMethods: paymentMethods.levelThree.reduce((acc, curr) => acc + curr.paymentMethods.length, 0)
            }
        };

        return res.status(200).json({
            success: true,
            stats,
            referralNetwork: referrals
        });
    } catch (error) {
        console.error("GetReferralNetworkStats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.GetDirectDepositOwners = async (req, res) => {
    try {
        const { userId } = req.body;
console.log("Received userId:", userId);
        const user = await User.findOne({ userId });
        console.log("Found user:", user);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get only direct referrals (level 1)
        const levelOneUsers = await User.find({ referredBy: user.referralCode });
        console.log("Level one users:", levelOneUsers);
        if (!levelOneUsers.length) {
            return res.status(404).json({ message: "No direct referral payment gateway owners found" });
        }

        const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
console.log("Level one referral codes:", levelOneReferralCodes);
        const paymentMethods = await PaymentGateWayTable.find({
            is_active: true,
            referredBy: { $in: levelOneReferralCodes },
            startTotalMinutes: { $lte: currentTotalMinutes },
            endTotalMinutes: { $gte: currentTotalMinutes },
        }).select(
            "gateway_name gateway_Number payment_type image_url start_time end_time is_active minimun_amount maximum_amount referredBy startTotalMinutes endTotalMinutes"
        );
        console.log("Payment methods found:", paymentMethods);
        if (!paymentMethods.length) {
            return res.status(404).json({ message: "No active payment methods found for direct referral owners" });
        }
        // Add owner info
        const paymentMethodsWithOwner = paymentMethods.map(method => {
            const owner = levelOneUsers.find(owner => owner.referralCode === method.referredBy);
            return {
                ...method.toObject(),
                ownerName: owner?.name || 'Unknown',
                ownerLevel: 1,
                ownerUserId: owner?.userId
            };
        });

        return res.status(200).json({
            success: true,
            paymentMethods: paymentMethodsWithOwner,
            levelOneUsers: levelOneUsers.map(user => ({
                name: user.name,
                userId: user.userId,
                referralCode: user.referralCode
            }))
        });
    } catch (error) {
        console.error("GetDirectDepositOwners Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.getPaymentMethodsController = async (req, res) =>{
    try {
        const user = req.user;
        console.log("Received userId:", req.user);
        if (!user.userId) return res.status(400).json({ error: "UserId required" });

        const gateways = await getPaymentMethodsForUser(user.userId);
        res.status(200).json({ success: true, gateways });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}
