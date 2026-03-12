# Quick Setup Guide - Referral & Bonus System

## Installation Steps

### 1. Models are Created ✅
- `src/models/Gateway.js`
- `src/models/ReferralChain.js`
- `src/models/BonusTransaction.js`

### 2. Controllers are Created ✅
- `src/controllers/DepositBonusController.js`
- `src/controllers/GatewayController.js`
- `src/controllers/ReferralManagementController.js`

### 3. Services & Utils are Created ✅
- `src/services/bonusCalculationService.js`
- `src/utils/referralChainUtils.js`

### 4. Routes are Created ✅
- `src/router/depositBonusRoutes.js`
- `src/router/gatewayRoutes.js`

---

## Integration with app.js

Add these lines to your `app.js` file:

```javascript
// Import new routes (add after existing route imports)
const depositBonusRoutes = require('./src/router/depositBonusRoutes');
const gatewayRoutes = require('./src/router/gatewayRoutes');

// If referralRoutes.js already exists, update it, otherwise use:
// const referralRoutes = require('./src/router/referralManagementRoutes');
// Or create a new file as shown below

// Register routes (add after existing app.use() statements)
app.use('/api/deposit-bonus', depositBonusRoutes);
app.use('/api/gateway', gatewayRoutes);
// app.use('/api/referral', referralRoutes);  // If you create referral routes
```

---

## Create Missing Routes File (if needed)

If `src/router/referralRoutes.js` doesn't exist or needs to be updated, create it:

**File: `src/router/referralRoutes.js`**

```javascript
const express = require("express");
const router = express.Router();
const referralController = require("../controllers/ReferralManagementController");

// Referral Query Routes
router.get("/my-referrals", referralController.getMyReferrals);
router.get("/tree", referralController.getReferralTree);
router.get("/performance", referralController.getReferralPerformance);
router.get("/leaderboard", referralController.getReferralLeaderboard);

// Referral Action Routes
router.post("/register-with-code", referralController.registerWithReferralCode);
router.post("/rebuild-all", referralController.rebuildAllReferralChains);

module.exports = router;
```

Then add to `app.js`:
```javascript
const referralRoutes = require('./src/router/referralRoutes');
app.use('/api/referral', referralRoutes);
```

---

## Testing the System

### 1. Start your backend server:
```bash
npm start
# or
npm run start-dev
```

### 2. Test Gateway Creation (Postman/Thunder Client):

```http
POST http://localhost:5000/api/gateway/create
Content-Type: application/json

{
  "ownerId": "admin1",
  "gatewayName": "Admin bKash Account",
  "gatewayType": "bKash",
  "accountNumber": "01700000000",
  "accountName": "Admin Main Account",
  "minDeposit": 100,
  "maxDeposit": 100000
}
```

### 3. Test Referral Chain Creation:

```http
POST http://localhost:5000/api/referral/register-with-code
Content-Type: application/json

{
  "userId": "user123",
  "referralCode": "REF001"
}
```

### 4. Test Deposit with Bonus:

```http
POST http://localhost:5000/api/deposit-bonus/create
Content-Type: application/json

{
  "userId": "user123",
  "amount": 1000,
  "gatewayId": "GW1234567890",
  "paymentMethod": "bKash"
}
```

### 5. Check Referral Chain:

```http
GET http://localhost:5000/api/deposit-bonus/referral-chain?userId=user123
```

### 6. Check Bonus Statistics:

```http
GET http://localhost:5000/api/deposit-bonus/bonus-statistics?userId=user123
```

---

## Database Initialization

Run this script to initialize referral chains for existing users:

```javascript
// scripts/initReferralChains.js
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { createOrUpdateReferralChain } = require('../src/utils/referralChainUtils');

async function initializeReferralChains() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'your_mongodb_connection_string');
    
    const users = await User.find({}).select('userId');
    console.log(`Found ${users.length} users`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        await createOrUpdateReferralChain(user.userId);
        successCount++;
        console.log(`✓ Created chain for ${user.userId}`);
      } catch (error) {
        failCount++;
        console.error(`✗ Failed for ${user.userId}:`, error.message);
      }
    }
    
    console.log(`\nComplete! Success: ${successCount}, Failed: ${failCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initializeReferralChains();
```

Run with:
```bash
node scripts/initReferralChains.js
```

---

## Environment Variables (Optional)

Add to `.env` if you want to configure bonus percentages:

```env
# Bonus Configuration
DEPOSIT_BONUS_DEFAULT=10
DEPOSIT_BONUS_FIRST=20
DEPOSIT_BONUS_VIP=15

# Referral Bonus - Admin
ADMIN_DIRECT_BONUS=5
ADMIN_LEVEL1_BONUS=3
ADMIN_LEVEL2_BONUS=2
ADMIN_LEVEL3_BONUS=1

# Referral Bonus - Affiliate
AFFILIATE_DIRECT_BONUS=7
AFFILIATE_LEVEL1_BONUS=4
AFFILIATE_LEVEL2_BONUS=3
AFFILIATE_LEVEL3_BONUS=2
```

Then update `bonusCalculationService.js` to use these:

```javascript
const BONUS_CONFIG = {
  depositBonus: {
    default: parseInt(process.env.DEPOSIT_BONUS_DEFAULT) || 10,
    firstDeposit: parseInt(process.env.DEPOSIT_BONUS_FIRST) || 20,
    vip: parseInt(process.env.DEPOSIT_BONUS_VIP) || 15,
  },
  // ... etc
};
```

---

## Common Issues & Solutions

### Issue 1: "User not found in referral chain"
**Solution**: Run the referral chain rebuild:
```http
POST http://localhost:5000/api/referral/rebuild-all
```

### Issue 2: "Insufficient balance for bonus"
**Solution**: Make sure the bonus deduction owner (affiliate/subadmin/admin) has sufficient balance.

### Issue 3: "Gateway not found"
**Solution**: Create a gateway for the admin/subadmin first before users can deposit.

---

## API Authentication (Add Later)

For production, add authentication middleware:

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};

module.exports = authMiddleware;
```

Then add to routes:
```javascript
const auth = require('../middleware/auth');

router.post('/create', auth, depositBonusController.createDepositWithBonus);
```

---

## Next Steps

1. ✅ All models created
2. ✅ All controllers created
3. ✅ All services created
4. ⏳ Add routes to app.js
5. ⏳ Test all endpoints
6. ⏳ Add authentication
7. ⏳ Deploy to production

---

## Support & Documentation

- Full Documentation: `REFERRAL_BONUS_SYSTEM_DOCUMENTATION.md`
- Models: `src/models/`
- Controllers: `src/controllers/`
- Services: `src/services/`
- Utils: `src/utils/`

For any questions or customization needs, refer to the main documentation file.
