const Commission = require('../Models/AffiliateUserEarnings');
const AffiliateModel = require('../Models/AffiliateModel');
const { getPeriodDates } = require('../Utils/periodUtils');

class CommissionService {
  async getCommissions(affiliateId, filters = {}) {
    const {
      startTime,
      endTime,
      currencyTypeId,
      page = 1,
      limit = 10
    } = filters;

    const currencyMap = {
      8: 'BDT',
      // Add more currency mappings as needed
    };
    
    const currency = currencyMap[currencyTypeId] || 'BDT';

    const query = { affiliateId };
    
    if (startTime && endTime) {
      query.periodStart = { $gte: new Date(startTime) };
      query.periodEnd = { $lte: new Date(endTime) };
    }
    
    if (currency) {
      query.currency = currency;
    }

    const skip = (page - 1) * limit;
    
    const commissions = await Commission.find(query)
      .sort({ periodStart: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Commission.countDocuments(query);
    
    return {
      commissions: commissions.map((commission, index) => ({
        index: skip + index + 1,
        startDate: commission.periodStart.toISOString().split('T')[0],
        currency: commission.currency,
        netProfit: commission.netProfit.toFixed(2),
        commission: commission.commissionAmount.toFixed(2),
        period: `${commission.periodStart.toISOString().split('T')[0]} to ${commission.periodEnd.toISOString().split('T')[0]}`,
        status: commission.status,
        action: commission._id
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getDownlineCommissions(affiliateId, filters = {}) {
    const {
      startTime,
      endTime,
      currencyTypeId,
      page = 1,
      limit = 10
    } = filters;

    const currencyMap = {
      8: 'BDT',
      // Add more currency mappings as needed
    };
    
    const currency = currencyMap[currencyTypeId] || 'BDT';

    // Find all affiliates in the downline hierarchy
    const downlineAffiliates = await AffiliateModel.find({
      $or: [
        { referredBy: affiliateId },
        // { hierarchy: { $regex: new RegExp(affiliateId, 'i') } }
      ]
    });

    const downlineIds = downlineAffiliates.map(aff => aff._id);

    const query = { affiliateId: { $in: downlineIds } };
    
    if (startTime && endTime) {
      query.periodStart = { $gte: new Date(startTime) };
      query.periodEnd = { $lte: new Date(endTime) };
    }
    
    if (currency) {
      query.currency = currency;
    }

    const skip = (page - 1) * limit;
    
    const commissions = await Commission.find(query)
      .populate('affiliateId', 'hierarchy referralCode')
      .sort({ periodStart: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Commission.countDocuments(query);
    
    return {
      commissions: commissions.map((commission, index) => ({
        index: skip + index + 1,
        startDate: commission.periodStart.toISOString().split('T')[0],
        hierarchy: commission.affiliateId.hierarchy,
        currency: commission.currency,
        netProfit: commission.netProfit.toFixed(2),
        percentage: (commission.commissionRate * 100).toFixed(2),
        commission: commission.commissionAmount.toFixed(2),
        period: `${commission.periodStart.toISOString().split('T')[0]} to ${commission.periodEnd.toISOString().split('T')[0]}`,
        status: commission.status
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getCommissionDetails(commissionId) {
    const commission = await Commission.findById(commissionId).populate('affiliateId');
    
    if (!commission) {
      throw new Error('Commission not found');
    }
    
    return {
      period: `${commission.periodStart.toISOString().split('T')[0]} to ${commission.periodEnd.toISOString().split('T')[0]}`,
      currency: commission.currency,
      netProfit: commission.netProfit.toFixed(2),
      commissionRate: (commission.commissionRate * 100).toFixed(2),
      commissionAmount: commission.commissionAmount.toFixed(2),
      status: commission.status,
      details: commission.details
    };
  }
}

module.exports = new CommissionService();