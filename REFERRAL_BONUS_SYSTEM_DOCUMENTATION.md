# Multi-Level Referral & Bonus System - Complete Documentation

## সিস্টেম ওভারভিউ (System Overview)

এই সিস্টেমে একটি advanced multi-level referral এবং bonus management system তৈরি করা হয়েছে যা MongoDB ব্যবহার করে। এই সিস্টেমে:

### হায়ারার্কি (Hierarchy)

```
Admin (referralCode: 1, নিজস্ব Gateway আছে)
│
├── SubAdmin (নিজের Gateway + referralCode আছে, Admin এর রেফার)
│   │
│   ├── Affiliate (SubAdmin এর রেফার, referralCode আছে কিন্তু নিজের Gateway নেই)
│   │   │
│   │   ├── User A (Affiliate এর রেফার, referralCode আছে, Gateway নেই)
│   │   │   │
│   │   │   ├── User B (User A এর রেফার, referralCode আছে, Gateway নেই) - Level 2
│   │   │   │   │
│   │   │   │   └── User C (User B এর রেফার) - Level 3
│   │
│   └── User D (SubAdmin এর সরাসরি রেফার)
│
└── User E (Admin এর সরাসরি রেফার)
```

### মূল বৈশিষ্ট্য (Key Features)

1. **Gateway Management**: Admin, SubAdmin এবং Affiliate দের নিজস্ব gateway থাকতে পারে
2. **Referral Chain Tracking**: পুরো referral hierarchy automatic track হয়
3. **Smart Bonus Deduction**: Affiliate এর নিচের users দের deposit bonus Affiliate থেকে কাটা হয়
4. **Multi-Level Referral Bonus**: 3 level পর্যন্ত referral bonus দেওয়া হয়
5. **Gateway Resolution**: User সবসময় তার উপরের available gateway ব্যবহার করে

---

## ডেটাবেস স্কিমা (Database Schemas)

### 1. Gateway Schema (`src/models/Gateway.js`)

```javascript
{
  gatewayId: String (unique),
  ownerId: String (User reference),
  ownerRole: String (admin/subAdmin/affiliate),
  gatewayName: String,
  gatewayType: String (bKash, Nagad, etc.),
  accountNumber: String,
  accountName: String,
  isActive: Boolean,
  balance: Number,
  totalDeposits: Number,
  totalWithdrawals: Number,
  minDeposit: Number,
  maxDeposit: Number,
  configuration: Object,
  statistics: {
    successfulTransactions: Number,
    failedTransactions: Number,
    lastTransactionAt: Date
  }
}
```

### 2. ReferralChain Schema (`src/models/ReferralChain.js`)

```javascript
{
  userId: String (unique),
  referralCode: String,
  directReferrer: {
    userId: String,
    role: String,
    referralCode: String,
    hasGateway: Boolean
  },
  gatewayOwner: {
    userId: String,
    role: String,
    referralCode: String
  },
  bonusDeductionOwner: {
    userId: String,
    role: String,
    referralCode: String
  },
  fullChain: [
    {
      userId: String,
      role: String,
      referralCode: String,
      level: Number,
      hasGateway: Boolean
    }
  ],
  adminId: String,
  subAdminId: String,
  affiliateId: String,
  userLevel: Number,
  userRole: String,
  hasOwnGateway: Boolean,
  totalDirectReferrals: Number,
  totalIndirectReferrals: Number,
  totalBonusEarned: Number,
  totalBonusDeducted: Number
}
```

### 3. BonusTransaction Schema (`src/models/BonusTransaction.js`)

```javascript
{
  transactionId: String (unique),
  depositorUserId: String,
  bonusDeductedFrom: String,
  depositAmount: Number,
  bonusPercentage: Number,
  bonusAmount: Number,
  transactionType: String (deposit_bonus, referral_bonus, level1_bonus, etc.),
  gatewayUsed: {
    gatewayId: String,
    gatewayOwnerId: String,
    gatewayType: String
  },
  referralChainSnapshot: Array,
  status: String (pending, completed, failed, cancelled),
  completedAt: Date
}
```

---

## বোনাস ক্যালকুলেশন লজিক (Bonus Calculation Logic)

### 1. Deposit Bonus

**নিয়ম:**
- Default: 10% deposit bonus
- First Deposit: 20% bonus
- VIP Users: 15% bonus

**ডিডাকশন:**
- Bonus Deduction Owner এর balance থেকে কাটা হয়
- যদি Affiliate এর নিচে হয়, তাহলে Affiliate থেকে কাটা হবে
- নাহলে উপরে গিয়ে SubAdmin বা Admin থেকে কাটা হবে

**Example:**
```
User A ডিপজিট করল: 1000 টাকা
Deposit Bonus (10%): 100 টাকা
User A পাবে: 1000 + 100 = 1100 টাকা
Affiliate এর balance থেকে কাটা হবে: 100 টাকা
```

### 2. Multi-Level Referral Bonus

**Bonus Percentage (Role-based):**

| Role      | Direct | Level 1 | Level 2 | Level 3 |
|-----------|--------|---------|---------|---------|
| Admin     | 5%     | 3%      | 2%      | 1%      |
| SubAdmin  | 5%     | 3%      | 2%      | 1%      |
| Affiliate | 7%     | 4%      | 3%      | 2%      |
| User      | 2%     | 1%      | 0.5%    | 0%      |

**Example Scenario:**
```
Hierarchy:
Affiliate (Level 0)
  └── User A (Level 1)
      └── User B (Level 2)
          └── User C (Level 3) - ডিপজিট করল 1000 টাকা

Bonuses:
- User B পাবে (Direct): 1000 × 2% = 20 টাকা
- User A পাবে (Level 1): 1000 × 1% = 10 টাকা
- Affiliate পাবে (Level 2): 1000 × 3% = 30 টাকা
```

---

## API Endpoints

### Deposit & Bonus APIs (`/api/deposit-bonus`)

#### 1. Create Deposit with Bonus
```http
POST /api/deposit-bonus/create
```

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 1000,
  "gatewayId": "GW12345",
  "paymentMethod": "bKash",
  "transactionReference": "TRX123",
  "accountNumber": "01700000000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ডিপজিট সফলভাবে সম্পন্ন হয়েছে",
  "data": {
    "transactionId": "BTX12345",
    "depositAmount": 1000,
    "bonusAmount": 100,
    "totalAmount": 1100,
    "bonusDeductedFrom": "affiliate123"
  }
}
```

#### 2. Get Available Gateways
```http
GET /api/deposit-bonus/available-gateways?userId=user123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gateways": [
      {
        "gatewayId": "GW12345",
        "gatewayName": "SubAdmin bKash",
        "gatewayType": "bKash",
        "accountNumber": "01700000000",
        "minDeposit": 100,
        "maxDeposit": 100000
      }
    ]
  }
}
```

#### 3. Get Referral Chain
```http
GET /api/deposit-bonus/referral-chain?userId=user123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "userRole": "user",
    "directReferrer": {
      "userId": "affiliate123",
      "role": "affiliate"
    },
    "gatewayOwner": {
      "userId": "subadmin123",
      "role": "subAdmin"
    },
    "bonusDeductionOwner": {
      "userId": "affiliate123",
      "role": "affiliate"
    },
    "fullChain": [...]
  }
}
```

#### 4. Get Bonus Statistics
```http
GET /api/deposit-bonus/bonus-statistics?userId=user123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "earned": {
      "total": 150,
      "count": 5
    },
    "deducted": {
      "total": 500,
      "count": 10
    },
    "received": {
      "total": 200,
      "count": 2
    },
    "netBonus": -350
  }
}
```

### Gateway Management APIs (`/api/gateway`)

#### 1. Create Gateway
```http
POST /api/gateway/create
```

**Request Body:**
```json
{
  "ownerId": "admin123",
  "gatewayName": "Admin bKash Account",
  "gatewayType": "bKash",
  "accountNumber": "01700000000",
  "accountName": "Admin Account",
  "minDeposit": 100,
  "maxDeposit": 100000
}
```

#### 2. Get Gateways by Owner
```http
GET /api/gateway/owner/admin123
```

#### 3. Update Gateway
```http
PUT /api/gateway/update/GW12345
```

#### 4. Toggle Gateway Status
```http
PATCH /api/gateway/GW12345/toggle
```

### Referral Management APIs (`/api/referral`)

#### 1. Get My Referrals
```http
GET /api/referral/my-referrals?userId=user123&level=direct&page=1&limit=20
```

**Query Parameters:**
- `level`: `direct`, `1`, `2`, `3`, or omit for all
- `page`: Page number
- `limit`: Items per page

#### 2. Get Referral Tree
```http
GET /api/referral/tree?userId=user123&maxDepth=3
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "role": "affiliate",
    "referralCode": "REF123",
    "directReferralsCount": 5,
    "children": [
      {
        "userId": "userA",
        "level": 1,
        "children": [...]
      }
    ]
  }
}
```

#### 3. Get Referral Performance
```http
GET /api/referral/performance?userId=user123&startDate=2024-01-01&endDate=2024-12-31
```

#### 4. Get Referral Leaderboard
```http
GET /api/referral/leaderboard?period=month&limit=10&role=affiliate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "leaderboard": [
      {
        "userId": "affiliate123",
        "referralCode": "AFF123",
        "totalReferrals": 50,
        "totalBonusEarned": 5000
      }
    ]
  }
}
```

#### 5. Register with Referral Code
```http
POST /api/referral/register-with-code
```

**Request Body:**
```json
{
  "userId": "newuser123",
  "referralCode": "REF123"
}
```

---

## ব্যবহার উদাহরণ (Usage Examples)

### Example 1: Affiliate এর নিচের User deposit করছে

```
Hierarchy:
Admin → SubAdmin → Affiliate → User A

Deposit Flow:
1. User A: 1000 টাকা deposit করতে চায়
2. System checks referral chain
3. Gateway Owner: SubAdmin (কারণ তার gateway আছে)
4. Bonus Deduction Owner: Affiliate (কারণ User A এর direct referrer)
5. Affiliate এর balance চেক (minimum 100 টাকা লাগবে 10% bonus এর জন্য)
6. Affiliate থেকে 100 টাকা কাটা হবে
7. User A পাবে: 1000 + 100 = 1100 টাকা
8. Multi-level bonus:
   - Affiliate: 1000 × 7% = 70 টাকা (referral bonus)
   - SubAdmin: 1000 × 5% = 50 টাকা (level 1 bonus)
   - Admin: 1000 × 3% = 30 টাকা (level 2 bonus)
```

### Example 2: Direct Admin Referral deposit করছে

```
Hierarchy:
Admin → User X

Deposit Flow:
1. User X: 2000 টাকা deposit করতে চায়
2. Gateway Owner: Admin
3. Bonus Deduction Owner: Admin
4. Admin থেকে 200 টাকা কাটা হবে (10% bonus)
5. User X পাবে: 2000 + 200 = 2200 টাকা
6. No multi-level bonus (কারণ শুধু Admin আছে উপরে)
```

---

## রাউট সেটআপ (Route Setup)

`app.js` ফাইলে রাউট যোগ করুন:

```javascript
const depositBonusRoutes = require('./src/router/depositBonusRoutes');
const gatewayRoutes = require('./src/router/gatewayRoutes');
const referralRoutes = require('./src/router/referralRoutes'); // বা referralManagementRoutes

// Routes
app.use('/api/deposit-bonus', depositBonusRoutes);
app.use('/api/gateway', gatewayRoutes);
app.use('/api/referral', referralRoutes);
```

---

## টেস্টিং (Testing)

### 1. Create Admin Gateway

```bash
POST /api/gateway/create
{
  "ownerId": "admin1",
  "gatewayName": "Admin bKash",
  "gatewayType": "bKash",
  "accountNumber": "01700000001",
  "accountName": "Admin Account"
}
```

### 2. Create SubAdmin with Gateway

```bash
POST /api/gateway/create
{
  "ownerId": "subadmin1",
  "gatewayName": "SubAdmin Nagad",
  "gatewayType": "Nagad",
  "accountNumber": "01800000001",
  "accountName": "SubAdmin Account"
}
```

### 3. Register Users with Referral

```bash
# Create Affiliate under SubAdmin
POST /api/referral/register-with-code
{
  "userId": "affiliate1",
  "referralCode": "SUBADMIN1_CODE"
}

# Create User under Affiliate
POST /api/referral/register-with-code
{
  "userId": "user1",
  "referralCode": "AFFILIATE1_CODE"
}
```

### 4. Test Deposit with Bonus

```bash
POST /api/deposit-bonus/create
{
  "userId": "user1",
  "amount": 1000,
  "gatewayId": "<gateway_id_from_step2>",
  "paymentMethod": "Nagad"
}
```

---

## Advanced Features

### 1. Bonus Configuration কাস্টমাইজ করা

`src/services/bonusCalculationService.js` ফাইলে `BONUS_CONFIG` object edit করুন:

```javascript
const BONUS_CONFIG = {
  depositBonus: {
    default: 15,  // 10% থেকে 15% করা হলো
    vip: 20,
    firstDeposit: 25
  },
  // ... referral bonus configuration
};
```

### 2. Custom Validation যোগ করা

Deposit controller এ custom validation:

```javascript
// Minimum balance requirement for bonus deduction
if (ownerBalance < depositBonus.bonusAmount) {
  throw new Error("Insufficient balance for bonus");
}

// Daily deposit limit check
const todayDeposits = await getTodayDeposits(userId);
if (todayDeposits > DAILY_LIMIT) {
  throw new Error("Daily deposit limit exceeded");
}
```

### 3. Webhook Integration

Gateway transaction complete হলে webhook:

```javascript
// In DepositBonusController
const sendWebhook = async (transactionData) => {
  await axios.post(webhookUrl, {
    event: 'deposit.completed',
    data: transactionData
  });
};
```

---

## Performance Optimization

### 1. Indexing

Schemas তে ইতিমধ্যে index তৈরি করা আছে:

```javascript
// ReferralChain indexes
referralChainSchema.index({ userId: 1 });
referralChainSchema.index({ "directReferrer.userId": 1 });
referralChainSchema.index({ "gatewayOwner.userId": 1 });
```

### 2. Caching

Redis দিয়ে frequently accessed data cache করুন:

```javascript
const getReferralChain = async (userId) => {
  // Check cache first
  const cached = await redis.get(`referral:${userId}`);
  if (cached) return JSON.parse(cached);
  
  // Get from DB
  const chain = await ReferralChain.findOne({ userId });
  
  // Cache for 1 hour
  await redis.setex(`referral:${userId}`, 3600, JSON.stringify(chain));
  
  return chain;
};
```

### 3. Batch Processing

Bulk referral chain rebuild:

```javascript
// Already implemented in ReferralController
POST /api/referral/rebuild-all
```

---

## Security Considerations

1. **Authentication**: সব route এ authentication middleware যোগ করুন
2. **Authorization**: Role-based access control implement করুন
3. **Rate Limiting**: Deposit API তে rate limiting যোগ করুন
4. **Transaction Atomicity**: MongoDB transactions ব্যবহার করুন critical operations এ
5. **Input Validation**: সব input validate করুন

---

## Error Handling

সব controller এ comprehensive error handling আছে:

```javascript
try {
  // Operation
} catch (error) {
  console.error("Error:", error);
  return res.status(500).json({
    success: false,
    message: "Error message in Bengali",
    error: error.message
  });
}
```

---

## সমাপনী (Conclusion)

এই সিস্টেমে যা যা আছে:

✅ Multi-level referral tracking (unlimited depth)
✅ Smart gateway resolution
✅ Flexible bonus calculation
✅ Comprehensive statistics and reporting
✅ Role-based bonus percentages
✅ Transaction history tracking
✅ Leaderboard and performance metrics
✅ Referral tree visualization
✅ Bulk operations support

এই সিস্টেম production-ready এবং scalable। প্রয়োজন অনুযায়ী কাস্টমাইজ করে ব্যবহার করতে পারবেন।
