// services/paymentService.js
const SubAdmin = require('../models/SubAdminModel');
const Affiliate = require('../models/AffiliateModel');
const Admin = require('../models/AdminModel');
const Commission = require('../models/AffiliateCommissionModal');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');


class PaymentService {
  static async getReferralOwner(referralCode) {
    try {
      // Check SubAdmin
      const subAdmin = await SubAdmin.findOne({ referralCode });
      if (subAdmin) return { owner: subAdmin, role: 'subadmin' };

      // Check Affiliate
      const affiliate = await Affiliate.findOne({ referralCode });
      if (affiliate) {
        let subAdmin = null;
        if (affiliate.referredBy) {
          subAdmin = await SubAdmin.findOne({ referralCode: affiliate.referredBy });
        }
        return { owner: affiliate, subAdmin, role: 'affiliate' };
      }

      // Check Admin
      const admin = await Admin.findOne({ referredCode: null });
      if (admin) return { owner: admin, role: 'admin' };

      return null;
    } catch (error) {
      console.error('Error in getReferralOwner:', error);
      throw error;
    }
  }

  static async getPaymentGatewayOwner(referralCode) {
    try {
      const referralData = await this.getReferralOwner(referralCode);
      if (!referralData) throw new Error('Invalid referral code');

      if (referralData.role === 'affiliate') {
        if (!referralData.subAdmin) throw new Error('Affiliate not assigned to SubAdmin');
        return referralData.subAdmin;
      }

      return referralData.owner;
    } catch (error) {
      console.error('Error in getPaymentGatewayOwner:', error);
      throw error;
    }
  }

  static async validateGatewayBalance(referralCode, amount) {
    try {
      const referralData = await this.getReferralOwner(referralCode);
      if (!referralData) return false;

      let gatewayOwner = referralData.owner;
      if (referralData.role === 'affiliate' && referralData.subAdmin) {
        gatewayOwner = referralData.subAdmin;
      }

      return gatewayOwner.balance >= amount;
    } catch (error) {
      console.error('Error in validateGatewayBalance:', error);
      return false;
    }
  }

  static async handleAffiliateBonusCut(referralCode, bonusAmount, transaction) {
    try {
      const referralData = await this.getReferralOwner(referralCode);
      if (!referralData || referralData.role !== 'affiliate') return null;

      const affiliate = referralData.owner;
      const affiliateCutPercentage = 10; // 10% of bonus amount
      const affiliateCutAmount = Math.floor((bonusAmount * affiliateCutPercentage) / 100);

      if (affiliateCutAmount > 0) {
        affiliate.balance += affiliateCutAmount;
        affiliate.totalEarnings += affiliateCutAmount;
        await affiliate.save();

        await Commission.create({
          affiliateId: affiliate._id,
          referralCode: affiliate.referralCode,
          transactionId: transaction.transactionID,
          userId: transaction.userId,
          amount: bonusAmount,
          commissionAmount: affiliateCutAmount,
          commissionPercentage: affiliateCutPercentage,
          type: 'bonus_cut',
          status: 'completed',
          description: `Bonus cut from user ${transaction.userId} deposit bonus`
        });

        return {
          affiliateCode: affiliate.referralCode,
          cutAmount: affiliateCutAmount,
          percentage: affiliateCutPercentage
        };
      }

      return null;
    } catch (error) {
      console.error('Error in handleAffiliateBonusCut:', error);
      return null;
    }
  }

  static async processAffiliateCommission(userId, amount, transactionType, transactionId) {
    try {
      const user = await User.findOne({ userId });
      if (!user || !user.referredBy) return null;

      const affiliate = await Affiliate.findOne({ referralCode: user.referredBy });
      if (!affiliate) return null;

      let commissionRate = 0;
      let commissionAmount = 0;

      // Different commission rates based on transaction type
      switch (transactionType) {
        case 'deposit':
          commissionRate = 0.05; // 5% of deposit amount
          commissionAmount = amount * commissionRate;
          break;
        case 'bet':
          commissionRate = 0.01; // 1% of bet amount
          commissionAmount = amount * commissionRate;
          break;
        case 'net_loss':
          commissionRate = affiliate.commissionRate; // Use affiliate's standard rate
          commissionAmount = amount * commissionRate;
          break;
        default:
          return null;
      }

      if (commissionAmount > 0) {
        affiliate.availableEarnings += commissionAmount;
        await affiliate.save();

        await Commission.create({
          affiliateId: affiliate._id,
          referralCode: affiliate.referralCode,
          transactionId,
          userId: user.userId,
          amount,
          commissionAmount,
          commissionPercentage: commissionRate * 100,
          type: transactionType,
          status: 'pending',
          description: `Commission from user ${user.userId} ${transactionType}`
        });

        return {
          affiliateCode: affiliate.referralCode,
          commissionAmount,
          percentage: commissionRate * 100
        };
      }

      return null;
    } catch (error) {
      console.error('Error in processAffiliateCommission:', error);
      return null;
    }
  }
}

module.exports = PaymentService;