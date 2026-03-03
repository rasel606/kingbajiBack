const { User, AdminModel, SubAdmin, AffiliateModel } = require('../models');

// ট্রানজেকশন আইডি জেনারেটর
const generateTransactionID = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// ইউজার আইডি জেনারেটর
const generateUserId = (role = 'user') => {
  const prefix = role === 'admin' ? 'ADM' : role === 'subadmin' ? 'SUB' : role === 'affiliate' ? 'AFF' : 'USR';
  return prefix + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// রেফারেল কোড জেনারেটর
const generateReferralCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// রেফারেল হায়ারার্কি ম্যানেজমেন্ট
const manageReferralHierarchy = async (userId, referredByCode) => {
  try {
    // রেফারার খুঁজে বের করা
    const referrer = await User.findOne({ referralCode: referredByCode }) ||
                    await AdminModel.findOne({ referralCode: referredByCode }) ||
                    await SubAdmin.findOne({ referralCode: referredByCode }) ||
                    await AffiliateModel.findOne({ referralCode: referredByCode });

    if (!referrer) {
      throw new Error('রেফারার কোড ভুল');
    }

    const newUser = await User.findOne({ userId });

    // রেফারার টাইপ নির্ধারণ
    let referrerType = 'User';
    if (referrer instanceof AdminModel) referrerType = 'Admin';
    else if (referrer instanceof SubAdmin) referrerType = 'SubAdmin';
    else if (referrer instanceof AffiliateModel) referrerType = 'Affiliate';

    // ইউজার আপডেট
    newUser.referredBy = referrer.userId || referrer._id.toString();
    newUser.referredByType = referrerType;
    await newUser.save();

    // লেভেল ১ রেফারেল আপডেট
    if (referrerType === 'User') {
      await User.findByIdAndUpdate(referrer._id, {
        $push: { levelOneReferrals: userId }
      });

      // লেভেল ২ এবং ৩ রেফারেল ম্যানেজমেন্ট
      if (referrer.referredBy) {
        const level2Referrer = await User.findOne({ userId: referrer.referredBy });
        if (level2Referrer) {
          await User.findByIdAndUpdate(level2Referrer._id, {
            $push: { levelTwoReferrals: userId }
          });

          if (level2Referrer.referredBy) {
            const level3Referrer = await User.findOne({ userId: level2Referrer.referredBy });
            if (level3Referrer) {
              await User.findByIdAndUpdate(level3Referrer._id, {
                $push: { levelThreeReferrals: userId }
              });
            }
          }
        }
      }
    }

    return {
      referrerId: referrer.userId || referrer._id.toString(),
      referrerType: referrerType
    };

  } catch (error) {
    throw error;
  }
};

// বোনাস ক্যালকুলেশন
const calculateBonus = (baseAmount, bonusType, bonusConfig) => {
  let bonusAmount = 0;

  switch (bonusType) {
    case 'percentage':
      bonusAmount = (baseAmount * bonusConfig.percentage) / 100;
      if (bonusConfig.maxBonus && bonusAmount > bonusConfig.maxBonus) {
        bonusAmount = bonusConfig.maxBonus;
      }
      break;
    
    case 'fixed':
      bonusAmount = bonusConfig.fixedAmount;
      break;
    
    case 'unlimited':
      bonusAmount = (baseAmount * bonusConfig.percentage) / 100;
      break;
    
    default:
      bonusAmount = 0;
  }

  return Math.round(bonusAmount);
};

// টার্নওভার চেক
const checkTurnoverRequirement = (completedTurnover, requiredTurnover) => {
  return completedTurnover >= requiredTurnover;
};

// পেমেন্ট গেটওয়ে ভেরিফিকেশন
const verifyPaymentGateway = (gatewayData, depositAmount) => {
  if (depositAmount < gatewayData.minimun_amount) {
    throw new Error(`ন্যূনতম ডিপোজিট Amount: ${gatewayData.minimun_amount}`);
  }

  if (depositAmount > gatewayData.maximun_amount) {
    throw new Error(`সর্বোচ্চ ডিপোজিট Amount: ${gatewayData.maximun_amount}`);
  }

  // টাইম চেক
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (gatewayData.start_time && gatewayData.end_time) {
    const startTotal = gatewayData.start_time.hours * 60 + gatewayData.start_time.minutes;
    const endTotal = gatewayData.end_time.hours * 60 + gatewayData.end_time.minutes;
    const currentTotal = currentHour * 60 + currentMinute;

    if (currentTotal < startTotal || currentTotal > endTotal) {
      throw new Error(`এই গেটওয়ে শুধু ${gatewayData.start_time.hours}:${gatewayData.start_time.minutes} থেকে ${gatewayData.end_time.hours}:${gatewayData.end_time.minutes} পর্যন্ত Available`);
    }
  }

  return true;
};

module.exports = {
  generateTransactionID,
  generateUserId,
  generateReferralCode,
  manageReferralHierarchy,
  calculateBonus,
  checkTurnoverRequirement,
  verifyPaymentGateway
};