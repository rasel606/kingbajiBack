const AdminModel = require('../models/AdminModel');
const SubAdminModel = require('../models/SubAdminModel');
const AffiliateModel = require('../models/AffiliateModel');
const AgentModel = require('../models/AgentModel');

/**
 * Find referral owner by referral code
 * Checks SubAdmin -> Affiliate -> Agent -> Admin in order
 * @param {string} referralCode - Referral code to lookup
 * @returns {Promise<Object|null>} Owner object with role, or null if not found
 */
const findReferralOwner = async (referralCode) => {
  if (!referralCode) {
    const admin = await AdminModel.findOne();
    return admin ? { owner: admin, role: 'admin' } : null;
  }

  // Check SubAdmin first
  const subAdmin = await SubAdminModel.findOne({ referralCode });
  if (subAdmin) {
    return { owner: subAdmin, role: 'subadmin' };
  }

  // Check Affiliate
  const affiliate = await AffiliateModel.findOne({ referralCode });
  if (affiliate) {
    return { owner: affiliate, role: 'affiliate' };
  }

  // Check Agent
  const agent = await AgentModel.findOne({ referralCode });
  if (agent) {
    return { owner: agent, role: 'agent' };
  }

  // Default to Admin
  const admin = await AdminModel.findOne();
  return admin ? { owner: admin, role: 'admin' } : null;
};

/**
 * Get payment owners with referral chain (for transaction processing)
 * Used to determine who gets payment gateway access
 * @param {string} referralCode - Referral code
 * @returns {Promise<Array>} Array of owners in hierarchy
 */
const getPaymentOwnersWithReferralChain = async (referralCode) => {
  // 1. SubAdmin directly
  const subAdmin = await SubAdminModel.findOne({ referralCode });
  if (subAdmin) {
    return [subAdmin];
  }

  // 2. Affiliate path
  const affiliate = await AffiliateModel.findOne({ referralCode });
  if (affiliate) {
    const owners = [];

    // Affiliate referredBy => SubAdmin
    if (affiliate.referredBy) {
      const subAdminFromAffiliate = await SubAdminModel.findOne({ 
        referralCode: affiliate.referredBy 
      });
      if (subAdminFromAffiliate) owners.push(subAdminFromAffiliate);
    }

    // Always push Admin fallback
    const admin = await AdminModel.findOne();
    if (admin) owners.push(admin);

    return owners;
  }

  // 3. Admin fallback
  const admin = await AdminModel.findOne();
  return admin ? [admin] : [];
};

/**
 * Check if user exists by various identifiers
 * @param {Object} criteria - Search criteria { userId, email, phone }
 * @param {Object} model - Mongoose model to search in
 * @returns {Promise<Object|null>} Found user or null
 */
const findUserByIdentifier = async (criteria, model) => {
  const { userId, email, phone } = criteria;
  const searchConditions = [];

  if (userId) searchConditions.push({ userId: userId.toLowerCase() });
  if (email) searchConditions.push({ email: email.toLowerCase() });
  if (phone) searchConditions.push({ 'phone.number': phone });

  if (searchConditions.length === 0) return null;

  return await model.findOne({ $or: searchConditions });
};

module.exports = {
  findReferralOwner,
  getPaymentOwnersWithReferralChain,
  findUserByIdentifier
};
