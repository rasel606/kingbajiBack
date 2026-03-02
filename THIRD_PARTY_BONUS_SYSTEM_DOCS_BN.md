# 🎮 Third-Party API Integration এবং Comprehensive Bonus System

## 📋 সূচিপত্র

1. [সিস্টেম ওভারভিউ](#সিস্টেম-ওভারভিউ)
2. [Third-Party API Integration](#third-party-api-integration)
3. [Bonus System](#bonus-system)
4. [Models বিস্তারিত](#models-বিস্তারিত)
5. [Services বিস্তারিত](#services-বিস্তারিত)
6. [ব্যবহার উদাহরণ](#ব্যবহার-উদাহরণ)
7. [Configuration](#configuration)

---

## 🎯 সিস্টেম ওভারভিউ

এই সিস্টেম দুটি প্রধান অংশ নিয়ে গঠিত:

### 1. Third-Party Provider Integration
- বিভিন্ন gaming provider (GSC, JILI, PP, etc.) এর সাথে API integration
- Game launch, betting, winning সব transaction handle করা
- Session management এবং balance tracking
- Real-time transaction processing

### 2. Comprehensive Bonus System
- ২০+ ধরনের bonus support
- Automatic bonus calculation এবং distribution
- Wagering requirement tracking
- VIP level based bonuses
- Referral bonuses
- Cashback এবং Rebate system

---

## 🔌 Third-Party API Integration

### Models

#### 1. ThirdPartyProvider
**উদ্দেশ্য:** সব gaming provider এর তথ্য এবং configuration রাখে

**প্রধান ফিল্ড:**
```javascript
{
  providerId: "PROVIDER_001",
  providerName: "JILI Games",
  providerCode: "JILI",
  apiConfig: {
    baseUrl: "https://api.jili.com",
    operatorCode: "YOUR_OPERATOR_CODE",
    secretKey: "YOUR_SECRET_KEY",
    timeout: 30000
  },
  providerType: "SLOT",
  isActive: true,
  features: {
    seamlessWallet: true,
    freeSpins: true
  }
}
```

**ব্যবহার:**
- নতুন provider যোগ করা
- Provider settings manage করা
- API credentials সংরক্ষণ করা

#### 2. ProviderGameSession
**উদ্দেশ্য:** প্রতিটি game session track করে

**প্রধান ফিল্ড:**
```javascript
{
  sessionId: "JILI_USER123_1234567890",
  userId: "USER123",
  gameId: "SUPER_ACE",
  gameUrl: "https://game.jili.com/launch?token=xxx",
  status: "ACTIVE",
  totalBet: 1000,
  totalWin: 1500,
  duration: 3600 // seconds
}
```

**ব্যবহার:**
- Game session শুরু করা
- Betting activity track করা
- Session শেষ করা এবং summary তৈরি করা

#### 3. ProviderTransaction
**উদ্দেশ্য:** সব provider transaction এর বিস্তারিত রেকর্ড

**Transaction Types:**
- `BET` - বাজি ধরা
- `WIN` - জয়
- `REFUND` - রিফান্ড
- `ROLLBACK` - লেনদেন বাতিল
- `BONUS` - বোনাস
- `JACKPOT` - জ্যাকপট

**উদাহরণ:**
```javascript
{
  transactionId: "BET_JILI_1234567890",
  userId: "USER123",
  transactionType: "BET",
  amount: 100,
  balanceBefore: 1000,
  balanceAfter: 900,
  status: "COMPLETED"
}
```

---

## 🎁 Bonus System

### Bonus Types (২০+ ধরনের)

#### 1. Deposit Bonuses
- **WELCOME_BONUS** - স্বাগত বোনাস (প্রথম registration এ)
- **FIRST_DEPOSIT** - প্রথম ডিপোজিট বোনাস
- **RELOAD_DEPOSIT** - রিলোড ডিপোজিট বোনাস
- **DAILY_DEPOSIT** - দৈনিক ডিপোজিট বোনাস
- **WEEKLY_DEPOSIT** - সাপ্তাহিক ডিপোজিট বোনাস

#### 2. Betting Bonuses
- **CASHBACK** - ক্যাশব্যাক (loss এর উপর ভিত্তি করে)
- **REBATE** - রিবেট (turnover এর উপর ভিত্তি করে)
- **INSTANT_REBATE** - তাৎক্ষণিক রিবেট
- **LOSS_BONUS** - লস বোনাস
- **WIN_BONUS** - জয় বোনাস
- **TURNOVER_BONUS** - টার্নওভার বোনাস

#### 3. Special Bonuses
- **REFERRAL_BONUS** - রেফারেল বোনাস
- **VIP_BONUS** - ভিআইপি বোনাস
- **LOYALTY_BONUS** - লয়্যালটি বোনাস
- **FREE_SPIN** - ফ্রি স্পিন
- **BIRTHDAY_BONUS** - জন্মদিন বোনাস
- **SPECIAL_EVENT** - বিশেষ ইভেন্ট
- **TOURNAMENT_PRIZE** - টুর্নামেন্ট পুরস্কার
- **ACHIEVEMENT_BONUS** - অর্জন বোনাস
- **DAILY_CHECK_IN** - দৈনিক চেক-ইন
- **LUCKY_DRAW** - লাকি ড্র

### BonusConfiguration Model

**উদ্দেশ্য:** প্রতিটি bonus এর সম্পূর্ণ configuration

**প্রধান সেকশন:**

#### 1. Eligibility (যোগ্যতা)
```javascript
eligibility: {
  minVipLevel: "BRONZE",        // ন্যূনতম VIP level
  minDepositAmount: 500,         // ন্যূনতম ডিপোজিট
  minTotalBets: 10,              // ন্যূনতম বেট সংখ্যা
  requiresKYC: true,             // KYC প্রয়োজন কিনা
  allowedGameTypes: ["SLOT", "FISHING"]  // কোন গেমে valid
}
```

#### 2. Amount Configuration (পরিমাণ)
```javascript
amountConfig: {
  type: "PERCENTAGE",            // FIXED, PERCENTAGE, TIERED
  percentage: 100,               // 100% বোনাস
  minBonusAmount: 100,           // সর্বনিম্ন বোনাস
  maxBonusAmount: 5000,          // সর্বোচ্চ বোনাস
  
  // Tiered এর জন্য
  tiers: [
    { minAmount: 500, maxAmount: 1000, bonusPercentage: 50 },
    { minAmount: 1001, maxAmount: 5000, bonusPercentage: 100 },
    { minAmount: 5001, maxAmount: 10000, bonusPercentage: 150 }
  ]
}
```

#### 3. Wagering Requirements (বাজির শর্ত)
```javascript
wageringRequirements: {
  multiplier: 10,                // 10x wagering
  includeDeposit: false,         // ডিপোজিট অন্তর্ভুক্ত করবে কিনা
  maxBetAmount: 500,             // সর্বোচ্চ বেট পরিমাণ
  gameContribution: {
    SLOT: 100,                   // 100% contribution
    LIVE_CASINO: 10,             // 10% contribution
    SPORTS: 50                   // 50% contribution
  }
}
```

#### 4. Time Restrictions (সময় সীমা)
```javascript
timeRestrictions: {
  validityDays: 7,               // ৭ দিন বৈধ
  claimStartDate: "2024-01-01",  // শুরুর তারিখ
  claimEndDate: "2024-12-31",    // শেষ তারিখ
  allowedDays: ["MONDAY", "FRIDAY"],  // শুধু সোম ও শুক্রবার
  allowedHoursStart: 18,         // সন্ধ্যা ৬টা থেকে
  allowedHoursEnd: 23            // রাত ১১টা পর্যন্ত
}
```

#### 5. Claim Limits (দাবি সীমা)
```javascript
claimLimits: {
  maxClaimsPerUser: 1,           // প্রতি user ১ বার
  maxClaimsPerDay: 1,            // দিনে ১ বার
  maxClaimsPerWeek: 3,           // সপ্তাহে ৩ বার
  cooldownHours: 24              // ২৪ ঘণ্টা অপেক্ষা
}
```

### UserBonusInstance Model

**উদ্দেশ্য:** প্রতিটি user এর individual bonus track করে

**Status Flow:**
```
PENDING → ACTIVE → WAGERING → COMPLETED
                 ↓
              EXPIRED / CANCELLED / FORFEITED
```

**প্রধান ফিল্ড:**
```javascript
{
  instanceId: "BONUS_USER123_1234567890",
  userId: "USER123",
  bonusType: "FIRST_DEPOSIT",
  bonusAmount: 1000,
  wageringRequired: 10000,      // 10x wagering
  wageringCompleted: 5000,      // ৫০% complete
  wageringProgress: 50,         // Percentage
  status: "WAGERING",
  expiryDate: "2024-12-31"
}
```

---

## 🛠️ Services বিস্তারিত

### 1. ProviderAPIService

**উদ্দেশ্য:** সব provider এর সাথে API communication

#### প্রধান Methods:

##### createMember()
```javascript
// নতুন member তৈরি করা
const result = await ProviderAPIService.createMember('JILI', {
  userId: 'USER123',
  username: 'player123',
  currency: 'BDT'
});
```

##### launchGame()
```javascript
// Game launch করা
const result = await ProviderAPIService.launchGame(
  'JILI',           // Provider code
  'USER123',        // User ID
  'SUPER_ACE',      // Game ID
  {
    platform: 'WEB',
    language: 'bn',
    ipAddress: '192.168.1.1'
  }
);

// Response:
{
  success: true,
  data: {
    gameUrl: "https://game.jili.com/launch?token=xxx",
    sessionId: "JILI_USER123_1234567890",
    token: "xxx"
  }
}
```

##### processBet()
```javascript
// Bet process করা
const result = await ProviderAPIService.processBet('JILI', {
  userId: 'USER123',
  gameId: 'SUPER_ACE',
  amount: 100,
  sessionId: 'SESSION123',
  balanceBefore: 1000
});
```

##### processWin()
```javascript
// Win process করা
const result = await ProviderAPIService.processWin('JILI', {
  userId: 'USER123',
  gameId: 'SUPER_ACE',
  amount: 500,
  sessionId: 'SESSION123',
  balanceBefore: 900
});
```

### 2. BonusProcessingService

**উদ্দেশ্য:** সব bonus processing এবং calculation

#### প্রধান Methods:

##### processDepositBonus()
```javascript
// Deposit bonus process করা
const result = await BonusProcessingService.processDepositBonus(
  'USER123',              // User ID
  1000,                   // Deposit amount
  'TXN123',              // Transaction ID
  'FIRST_DEPOSIT'        // Bonus type
);

// Response:
{
  success: true,
  bonus: {
    instanceId: "BONUS_USER123_xxx",
    bonusAmount: 1000,           // 100% of 1000
    wageringRequired: 10000,     // 10x wagering
    expiryDate: "2024-12-31",
    status: "ACTIVE"
  }
}
```

##### processCashbackBonus()
```javascript
// Cashback bonus process করা
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');

const result = await BonusProcessingService.processCashbackBonus(
  'USER123',
  startDate,
  endDate
);

// Response:
{
  success: true,
  bonus: {
    instanceId: "CASHBACK_USER123_xxx",
    cashbackAmount: 500,         // 10% of 5000 loss
    totalLoss: 5000,
    percentage: 10
  }
}
```

##### processRebateBonus()
```javascript
// Rebate bonus process করা (turnover based)
const result = await BonusProcessingService.processRebateBonus(
  'USER123',
  startDate,
  endDate
);

// Response:
{
  success: true,
  bonus: {
    instanceId: "REBATE_USER123_xxx",
    rebateAmount: 250,           // 0.5% of 50000 turnover
    totalTurnover: 50000,
    percentage: 0.5
  }
}
```

##### updateWageringProgress()
```javascript
// Wagering progress update করা
const result = await BonusProcessingService.updateWageringProgress(
  'USER123',        // User ID
  100,              // Bet amount
  'SLOT',           // Game type
  'SUPER_ACE'       // Game ID
);

// Response:
{
  success: true,
  updates: [
    {
      instanceId: "BONUS_USER123_xxx",
      wageringCompleted: 5100,
      wageringProgress: 51,
      status: "WAGERING"
    }
  ]
}
```

---

## 💡 ব্যবহার উদাহরণ

### Example 1: নতুন Provider যোগ করা

```javascript
const ThirdPartyProvider = require('./models/ThirdPartyProvider');

// JILI Provider যোগ করা
const jiliProvider = await ThirdPartyProvider.create({
  providerId: 'PROVIDER_JILI_001',
  providerName: 'JILI Games',
  providerCode: 'JILI',
  apiConfig: {
    baseUrl: 'https://api.jili.com',
    operatorCode: 'YOUR_OPERATOR_CODE',
    secretKey: 'YOUR_SECRET_KEY',
    apiVersion: 'v1',
    timeout: 30000
  },
  providerType: 'SLOT',
  isActive: true,
  features: {
    seamlessWallet: true,
    freeSpins: true,
    tournaments: false
  },
  supportedCurrencies: ['BDT', 'USD'],
  rateLimits: {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  }
});

console.log('✅ JILI Provider added successfully');
```

### Example 2: First Deposit Bonus Configuration

```javascript
const BonusConfiguration = require('./models/BonusConfiguration');

// ১৫০% First Deposit Bonus তৈরি করা
const firstDepositBonus = await BonusConfiguration.create({
  bonusId: 'FIRST_DEPOSIT_150',
  bonusName: '150% First Deposit Bonus',
  bonusNameBn: '১৫০% প্রথম ডিপোজিট বোনাস',
  description: 'Get 150% bonus on your first deposit up to ৳1000',
  descriptionBn: 'আপনার প্রথম ডিপোজিটে ১৫০% বোনাস পান সর্বোচ্চ ৳১০০০ পর্যন্ত',
  
  bonusType: 'FIRST_DEPOSIT',
  category: 'DEPOSIT',
  isActive: true,
  isAutomatic: false,
  requiresClaim: true,
  
  eligibility: {
    minVipLevel: 'COPPER',
    minDepositAmount: 200,
    maxDepositAmount: 25000,
    requiresKYC: false,
    requiresPhoneVerification: true,
    allowedGameTypes: ['SLOT', 'FISHING']
  },
  
  amountConfig: {
    type: 'PERCENTAGE',
    percentage: 150,
    minBonusAmount: 100,
    maxBonusAmount: 1000
  },
  
  wageringRequirements: {
    multiplier: 18,
    includeDeposit: false,
    maxBetAmount: 500,
    gameContribution: {
      SLOT: 100,
      FISHING: 100,
      LIVE_CASINO: 10,
      SPORTS: 50
    }
  },
  
  timeRestrictions: {
    validityDays: 7
  },
  
  claimLimits: {
    maxClaimsPerUser: 1
  }
});

console.log('✅ First Deposit Bonus configured');
```

### Example 3: Complete User Journey

```javascript
const ProviderAPIService = require('./services/thirdParty/ProviderAPIService');
const BonusProcessingService = require('./services/bonus/BonusProcessingService');

// ধাপ ১: User registration এবং provider member তৈরি
const memberResult = await ProviderAPIService.createMember('JILI', {
  userId: 'USER123',
  username: 'player123',
  currency: 'BDT'
});

// ধাপ ২: First deposit করা
const depositAmount = 1000;
const depositTxnId = 'TXN_DEPOSIT_123';

// ধাপ ৩: Deposit bonus process করা
const bonusResult = await BonusProcessingService.processDepositBonus(
  'USER123',
  depositAmount,
  depositTxnId,
  'FIRST_DEPOSIT'
);

console.log('Bonus Amount:', bonusResult.bonus.bonusAmount); // 1000 (150% of 1000, max 1000)
console.log('Wagering Required:', bonusResult.bonus.wageringRequired); // 18000 (1000 * 18)

// ধাপ ৪: Bonus claim করা
const claimResult = await BonusProcessingService.claimBonus(
  'USER123',
  bonusResult.bonus.instanceId
);

// ধাপ ৫: Game launch করা
const gameResult = await ProviderAPIService.launchGame(
  'JILI',
  'USER123',
  'SUPER_ACE',
  {
    platform: 'WEB',
    language: 'bn'
  }
);

console.log('Game URL:', gameResult.data.gameUrl);

// ধাপ ৬: Betting করা এবং wagering update
const betResult = await ProviderAPIService.processBet('JILI', {
  userId: 'USER123',
  gameId: 'SUPER_ACE',
  amount: 100,
  sessionId: gameResult.data.sessionId,
  balanceBefore: 2000 // 1000 deposit + 1000 bonus
});

// Wagering progress update
const wageringUpdate = await BonusProcessingService.updateWageringProgress(
  'USER123',
  100,
  'SLOT',
  'SUPER_ACE'
);

console.log('Wagering Progress:', wageringUpdate.updates[0].wageringProgress); // 0.56% (100/18000)
```

### Example 4: Daily Cashback Processing (Cron Job)

```javascript
const cron = require('node-cron');
const BonusProcessingService = require('./services/bonus/BonusProcessingService');
const User = require('./models/User');

// প্রতিদিন রাত ১২টায় cashback process করা
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Processing daily cashback...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // সব active user দের জন্য
  const users = await User.find({ accountStatus: 'active' });
  
  let processedCount = 0;
  let totalCashback = 0;
  
  for (const user of users) {
    try {
      const result = await BonusProcessingService.processCashbackBonus(
        user.userId,
        yesterday,
        today
      );
      
      if (result.success) {
        processedCount++;
        totalCashback += result.bonus.cashbackAmount;
        console.log(`✅ Cashback processed for ${user.username}: ৳${result.bonus.cashbackAmount}`);
      }
    } catch (error) {
      console.error(`❌ Error processing cashback for ${user.username}:`, error);
    }
  }
  
  console.log(`✅ Daily cashback complete: ${processedCount} users, Total: ৳${totalCashback}`);
});
```

### Example 5: Weekly Rebate Processing

```javascript
// প্রতি সোমবার সকাল ১০টায় সাপ্তাহিক rebate process
cron.schedule('0 10 * * 1', async () => {
  console.log('🔄 Processing weekly rebate...');
  
  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);
  
  const lastWeekEnd = new Date();
  lastWeekEnd.setHours(0, 0, 0, 0);
  
  const users = await User.find({ accountStatus: 'active' });
  
  for (const user of users) {
    try {
      const result = await BonusProcessingService.processRebateBonus(
        user.userId,
        lastWeekStart,
        lastWeekEnd
      );
      
      if (result.success) {
        console.log(`✅ Rebate: ${user.username} - ৳${result.bonus.rebateAmount} (${result.bonus.percentage}% of ৳${result.bonus.totalTurnover})`);
      }
    } catch (error) {
      console.error(`❌ Error:`, error);
    }
  }
});
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Third-Party Provider Settings
PROVIDER_GSC_BASE_URL=https://api.gsc.com
PROVIDER_GSC_OPERATOR_CODE=YOUR_OPERATOR_CODE
PROVIDER_GSC_SECRET_KEY=YOUR_SECRET_KEY

PROVIDER_JILI_BASE_URL=https://api.jili.com
PROVIDER_JILI_OPERATOR_CODE=YOUR_OPERATOR_CODE
PROVIDER_JILI_SECRET_KEY=YOUR_SECRET_KEY

# Bonus Settings
BONUS_AUTO_EXPIRE_ENABLED=true
BONUS_EXPIRY_CHECK_INTERVAL=3600000  # 1 hour in ms
BONUS_MAX_WAGERING_MULTIPLIER=50
BONUS_DEFAULT_VALIDITY_DAYS=7

# Rate Limiting
API_RATE_LIMIT_PER_MINUTE=60
API_RATE_LIMIT_PER_HOUR=1000
```

### Database Indexes

```javascript
// Ensure these indexes are created for optimal performance

// ThirdPartyProvider
db.thirdpartyproviders.createIndex({ providerCode: 1, isActive: 1 });
db.thirdpartyproviders.createIndex({ providerType: 1, isActive: 1 });

// ProviderGameSession
db.providergamesessions.createIndex({ userId: 1, status: 1, startTime: -1 });
db.providergamesessions.createIndex({ sessionId: 1 });

// ProviderTransaction
db.providertransactions.createIndex({ userId: 1, createdAt: -1 });
db.providertransactions.createIndex({ transactionType: 1, status: 1 });

// BonusConfiguration
db.bonusconfigurations.createIndex({ bonusType: 1, isActive: 1 });
db.bonusconfigurations.createIndex({ category: 1, isActive: 1 });

// UserBonusInstance
db.userbonusinstances.createIndex({ userId: 1, status: 1, createdAt: -1 });
db.userbonusinstances.createIndex({ status: 1, expiryDate: 1 });
```

---

## 🎯 সারসংক্ষেপ

এই সিস্টেম আপনাকে দেয়:

### ✅ Third-Party Integration
- Multiple provider support
- Seamless game launching
- Real-time transaction processing
- Session management
- Balance tracking
- Error handling এবং retry logic

### ✅ Comprehensive Bonus System
- ২০+ bonus types
- Flexible configuration
- Automatic calculation
- Wagering tracking
- VIP level integration
- Time-based restrictions
- Claim limits
- Game contribution rules

### ✅ Production Ready Features
- Rate limiting
- Error handling
- Logging
- Statistics tracking
- Cron job support
- Scalable architecture

---

## 📞 সাপোর্ট

কোন প্রশ্ন বা সমস্যা থাকলে:
- Documentation পড়ুন
- Code comments দেখুন
- Example গুলো follow করুন

**সফল হোক আপনার প্রজেক্ট! 🚀**
