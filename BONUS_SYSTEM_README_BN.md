# 🎁 Comprehensive Bonus System - সম্পূর্ণ গাইড

## 🎯 এই সিস্টেম কি?

এটি একটি সম্পূর্ণ **Third-Party Gaming Provider Integration** এবং **Advanced Bonus Management System** যা:

✅ Multiple gaming providers support করে (JILI, PP, SEXY, etc.)  
✅ 20+ ধরনের bonus automatically process করে  
✅ Real-time wagering tracking করে  
✅ VIP level based rewards দেয়  
✅ Referral system manage করে  
✅ Production-ready এবং scalable  

---

## 📁 তৈরি করা Files

### Models (5টি)
```
✅ ThirdPartyProvider.js       - Provider configuration
✅ ProviderGameSession.js      - Game session tracking
✅ ProviderTransaction.js      - Transaction records
✅ BonusConfiguration.js       - Bonus settings
✅ UserBonusInstance.js        - User bonus tracking
```

### Services (2টি)
```
✅ ProviderAPIService.js       - Provider API calls
✅ BonusProcessingService.js   - Bonus processing logic
```

### Controllers (2টি)
```
✅ ProviderController.js       - Provider endpoints
✅ BonusController.js          - Bonus endpoints
```

### Others
```
✅ providerRoutes.js           - API routes
✅ BonusAutomationJobs.js      - Cron jobs
✅ bonusSetup.js               - Configuration data
✅ setupBonusSystem.js         - Setup script
```

---

## 🚀 Quick Start

### Step 1: Setup করুন

```bash
# Setup script run করুন
cd Backend
node src/scripts/setupBonusSystem.js
```

এটি করবে:
- ✅ Database এ providers create করবে
- ✅ Bonus configurations setup করবে
- ✅ Indexes create করবে

### Step 2: Routes যোগ করুন

`app.js` file এ যোগ করুন:

```javascript
const providerRoutes = require('./src/router/providerRoutes');
app.use('/api/v1', providerRoutes);
```

### Step 3: Cron Jobs Initialize করুন

`index.js` file এ যোগ করুন:

```javascript
const BonusAutomationJobs = require('./src/corn/BonusAutomationJobs');

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  BonusAutomationJobs.initializeJobs();
});
```

### Step 4: Environment Variables

`.env` file এ যোগ করুন:

```env
# JILI Provider
PROVIDER_JILI_BASE_URL=https://api.jili.com
PROVIDER_JILI_OPERATOR_CODE=YOUR_CODE
PROVIDER_JILI_SECRET_KEY=YOUR_SECRET

# PP Provider
PROVIDER_PP_BASE_URL=https://api.pragmaticplay.com
PROVIDER_PP_OPERATOR_CODE=YOUR_CODE
PROVIDER_PP_SECRET_KEY=YOUR_SECRET

# Webhook
WEBHOOK_URL=https://yourdomain.com/api/webhooks
```

---

## 💡 ব্যবহার উদাহরণ

### Example 1: Game Launch

```javascript
// API Call
POST /api/v1/providers/JILI/games/SUPER_ACE/launch
Body: {
  "userId": "USER123",
  "platform": "WEB",
  "language": "bn"
}

// Response
{
  "success": true,
  "data": {
    "gameUrl": "https://game.jili.com/launch?token=xxx",
    "sessionId": "JILI_USER123_1234567890"
  }
}
```

### Example 2: Deposit Bonus

```javascript
// API Call
POST /api/v1/bonuses/deposit
Body: {
  "userId": "USER123",
  "depositAmount": 1000,
  "transactionId": "TXN_DEP_123",
  "bonusType": "FIRST_DEPOSIT"
}

// Response
{
  "success": true,
  "data": {
    "instanceId": "BONUS_USER123_xxx",
    "bonusAmount": 1000,
    "wageringRequired": 18000,
    "expiryDate": "2024-12-31",
    "status": "PENDING"
  }
}
```

### Example 3: Check Active Bonuses

```javascript
// API Call
GET /api/v1/users/USER123/bonuses/active

// Response
{
  "success": true,
  "count": 2,
  "data": [
    {
      "instanceId": "BONUS_USER123_xxx",
      "bonusType": "FIRST_DEPOSIT",
      "bonusAmount": 1000,
      "wageringProgress": 45.5,
      "status": "WAGERING",
      "daysRemaining": 5
    },
    {
      "instanceId": "CASHBACK_USER123_xxx",
      "bonusType": "CASHBACK",
      "bonusAmount": 500,
      "wageringProgress": 0,
      "status": "ACTIVE",
      "daysRemaining": 7
    }
  ]
}
```

---

## 🎮 Supported Bonus Types

### Deposit Bonuses
1. **WELCOME_BONUS** - স্বাগত বোনাস
2. **FIRST_DEPOSIT** - প্রথম ডিপোজিট (150%)
3. **RELOAD_DEPOSIT** - রিলোড ডিপোজিট
4. **DAILY_DEPOSIT** - দৈনিক ডিপোজিট (5%)
5. **WEEKLY_DEPOSIT** - সাপ্তাহিক (588%)

### Betting Bonuses
6. **CASHBACK** - ক্যাশব্যাক (20%)
7. **REBATE** - রিবেট (0.98%)
8. **INSTANT_REBATE** - তাৎক্ষণিক রিবেট
9. **LOSS_BONUS** - লস বোনাস
10. **WIN_BONUS** - জয় বোনাস
11. **TURNOVER_BONUS** - টার্নওভার বোনাস

### Special Bonuses
12. **REFERRAL_BONUS** - রেফারেল (3 Tier)
13. **VIP_BONUS** - ভিআইপি বোনাস
14. **LOYALTY_BONUS** - লয়্যালটি (VIP Points)
15. **FREE_SPIN** - ফ্রি স্পিন
16. **BIRTHDAY_BONUS** - জন্মদিন বোনাস
17. **SPECIAL_EVENT** - বিশেষ ইভেন্ট
18. **TOURNAMENT_PRIZE** - টুর্নামেন্ট
19. **ACHIEVEMENT_BONUS** - অর্জন বোনাস
20. **DAILY_CHECK_IN** - দৈনিক চেক-ইন
21. **LUCKY_DRAW** - লাকি ড্র

---

## ⏰ Automatic Processing (Cron Jobs)

```
✅ Daily Cashback      → 00:30 BST (প্রতিদিন)
✅ Weekly Rebate       → 10:00 BST Monday (সোমবার)
✅ Instant Rebate      → Every hour (প্রতি ঘণ্টা)
✅ Expire Bonuses      → Every hour (প্রতি ঘণ্টা)
✅ Weekend 2x Rebate   → 10:00 BST Sat/Sun (শনি/রবি)
✅ Midnight Bonus      → 08:00 BST (সকাল ৮টা)
✅ Monthly Member Day  → 10:00 BST 26th (২৬ তারিখ)
✅ Weekly Lucky Draw   → 11:00 BST Monday (সোমবার)
```

---

## 📊 Database Schema Overview

```
ThirdPartyProvider
├── Provider Info
├── API Config
├── Features
├── Rate Limits
└── Statistics

ProviderGameSession
├── Session Info
├── Game Details
├── Financial Data
└── Device Info

ProviderTransaction
├── Transaction Details
├── Amount Info
├── Balance Tracking
└── Status

BonusConfiguration
├── Bonus Details
├── Eligibility Rules
├── Amount Config
├── Wagering Rules
├── Time Restrictions
└── Claim Limits

UserBonusInstance
├── User Info
├── Bonus Amount
├── Wagering Progress
├── Status
└── Expiry Info
```

---

## 🔑 Key Features

### 1. Flexible Bonus Configuration
- Fixed amount বা percentage based
- Tiered bonuses (amount range অনুযায়ী)
- VIP level based bonuses
- Game type restrictions
- Time-based restrictions

### 2. Smart Wagering System
- Game contribution rules (SLOT: 100%, CASINO: 10%)
- Multiple active bonuses support
- Automatic progress tracking
- Completion detection

### 3. Advanced Eligibility
- VIP level requirements
- Account age requirements
- Deposit amount ranges
- KYC verification
- Phone/Email verification
- Referral requirements

### 4. Comprehensive Tracking
- Real-time wagering progress
- Transaction history
- Session management
- Statistics and analytics

---

## 🎯 Use Cases

### Use Case 1: First Deposit Journey
```
User deposits ৳1000
↓
System checks FIRST_DEPOSIT bonus config
↓
Calculates: ৳1000 × 150% = ৳1500 (capped at ৳1000)
↓
Creates bonus instance with ৳18000 wagering
↓
User claims bonus
↓
User plays SLOT games
↓
Each ৳100 bet = ৳100 wagering (100% contribution)
↓
After ৳18000 bets → Bonus COMPLETED
```

### Use Case 2: Daily Cashback
```
User plays all day
↓
Total Bet: ৳20,000
Total Win: ৳15,000
Loss: ৳5,000
↓
Cron job runs at 00:30 BST
↓
Calculates cashback: ৳5,000 × 10% = ৳500
↓
Creates cashback bonus instance
↓
User gets ৳500 with 1x wagering
```

### Use Case 3: Referral Commission
```
Player A refers Player B
↓
Player B deposits ৳2000 and bets ৳10,000
↓
Player A gets:
- Tier 1: ৳10,000 × 0.15% = ৳15
↓
Player B refers Player C
↓
Player C bets ৳5,000
↓
Player A gets:
- Tier 2: ৳5,000 × 0.06% = ৳3
```

---

## 📞 Support

### Documentation Files
- `THIRD_PARTY_BONUS_SYSTEM_DOCS_BN.md` - বিস্তারিত technical docs
- `IMPLEMENTATION_SUMMARY_BN.md` - Implementation summary
- `COMPLETE_INTEGRATION_GUIDE_BN.md` - Integration guide
- `BONUS_SYSTEM_README_BN.md` - এই file

### Testing
```bash
# Setup test করুন
node src/scripts/setupBonusSystem.js

# Server start করুন
npm start

# API test করুন
curl http://localhost:5000/api/v1/providers
curl http://localhost:5000/api/v1/bonuses/available
```

---

## ✅ Checklist

Setup করার পরে check করুন:

- [ ] MongoDB connected
- [ ] Providers created
- [ ] Bonus configurations created
- [ ] Routes working
- [ ] Cron jobs initialized
- [ ] API endpoints responding
- [ ] Bonus processing working
- [ ] Wagering tracking working

---

## 🎉 সফল হোক আপনার প্রজেক্ট!

এই সিস্টেম সম্পূর্ণ production-ready এবং আপনার সব bonus requirements handle করতে পারবে।

**যেকোনো প্রশ্নের জন্য documentation files দেখুন।**
