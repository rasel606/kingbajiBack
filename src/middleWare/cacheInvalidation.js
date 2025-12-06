const AffiliateEarningsService = require('../Services/AffiliateEarningsService');
const AffiliateRevenueService = require('../Services/AffiliateRevenueService');

const cacheInvalidationMiddleware = (req, res, next) => {
  // Store the original send method
  const originalSend = res.send;
  
  // Override the send method
  res.send = function(body) {
    // Check if this request modified data that should invalidate cache
    if (req.method !== 'GET' && req.user) {
      const affiliateId = req.user.userId;
      
      // Invalidate cache for this affiliate
      setTimeout(async () => {
        try {
          await AffiliateEarningsService.invalidateEarningsCache(affiliateId);
          await AffiliateRevenueService.invalidateRevenueCache(affiliateId);
          console.log('Cache invalidated due to data modification by affiliate:', affiliateId);
        } catch (error) {
          console.error('Error in cache invalidation middleware:', error);
        }
      }, 100); // Small delay to ensure the operation completes
    }
    
    // Call the original send method
    originalSend.call(this, body);
  };
  
  next();
};

module.exports = cacheInvalidationMiddleware;