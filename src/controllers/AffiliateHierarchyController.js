
const AffiliateModel = require('../models/AffiliateModel');

// Get Upline
exports.getUpline = async (req, res) => {
  try {
    const affiliateId = req.user?._id || req.user?.id;
    if (!affiliateId) return res.status(400).json({ message: 'Affiliate ID not found in request.' });

    const affiliate = await AffiliateModel.findById(affiliateId).populate('hierarchy.upline');
    if (!affiliate || !affiliate.hierarchy.upline) {
      return res.status(404).json({ message: 'Upline not found.' });
    }
    const upline = affiliate.hierarchy.upline;
    res.json({
      _id: upline._id,
      fullName: upline.fullName || `${upline.firstName} ${upline.lastName}`,
      level: upline.tier,
      joinDate: upline.createdAt,
      email: upline.email,
      phone: upline.phone,
      referralCode: upline.referralCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upline.', error: error.message });
  }
};

// Helper to recursively build downline tree
async function buildDownlineTree(affiliate) {
  await affiliate.populate('hierarchy.downlines');
  const children = await Promise.all(
    (affiliate.hierarchy.downlines || []).map(async (downline) => {
      return await buildDownlineTree(downline);
    })
  );
  return {
    _id: affiliate._id,
    fullName: affiliate.fullName || `${affiliate.firstName} ${affiliate.lastName}`,
    level: affiliate.tier,
    joinDate: affiliate.createdAt,
    email: affiliate.email,
    phone: affiliate.phone,
    referralCode: affiliate.referralCode,
    children
  };
}

// Get Downline
exports.getDownline = async (req, res) => {
  try {
    const affiliateId = req.user?._id || req.user?.id;
    if (!affiliateId) return res.status(400).json({ message: 'Affiliate ID not found in request.' });

    const affiliate = await AffiliateModel.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found.' });
    }
    const downlineTree = await buildDownlineTree(affiliate);
    res.json(downlineTree);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching downline.', error: error.message });
  }
};
