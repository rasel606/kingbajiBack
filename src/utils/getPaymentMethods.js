const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
const User = require('../Models/User');
const Affiliate = require('../Models/AffiliateModel');
const SubAdmin = require('../Models/SubAdminModel');
const AdminModel = require('../Models/AdminModel');

async function getPaymentMethodsForUser(userId) {
    // 1️⃣ User খুঁজে বের করা
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');

    let gatewayOwnerId = null;

    // 2️⃣ Determine owner based on referral hierarchy
    if (user.referredBy) {
        // Level 1 referral
        const refUser = await User.findOne({ userId: user.referredBy });
        if (refUser) {
            // Check if refUser is Affiliate
            const affiliate = await Affiliate.findOne({ userId: refUser.userId });
            if (affiliate) {
                // Affiliate under SubAdmin or Admin
                gatewayOwnerId = affiliate.referredBy; // Could be SubAdmin or Admin
            } else {
                // refUser is direct User
                gatewayOwnerId = refUser.referredBy || null; // owner
            }
        } else {
            // Check if referredBy is SubAdmin
            const subAdmin = await SubAdmin.findOne({ SubAdminId: user.referredBy });
            if (subAdmin) gatewayOwnerId = subAdmin.SubAdminId;
            else gatewayOwnerId = null;
        }
    } else {
        // Direct user without referral
        gatewayOwnerId = null; // maybe Admin
    }

    // 3️⃣ Fetch gateway
    let gateways = [];
    if (gatewayOwnerId) {
        gateways = await PaymentGateWayTable.find({
            referredBy: gatewayOwnerId,
            is_active: true
        });
    } else {
        // Fallback: Admin gateways
        gateways = await PaymentGateWayTable.find({
            user_role: 'Admin',
            is_active: true
        });
    }

    return gateways;
}

module.exports = { getPaymentMethodsForUser };
