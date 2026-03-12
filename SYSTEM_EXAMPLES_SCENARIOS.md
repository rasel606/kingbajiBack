# সিস্টেম উদাহরণ - তিনটি সিনারিও (System Examples - Three Scenarios)

## সিনারিও ১: এফিলিয়েট হায়ারার্কি (Affiliate Hierarchy)

### হায়ারার্কি স্ট্রাকচার:
```
এডমিন (userId: "admin1", referralCode: "1", Gateway: ✅)
│
└── সাব-এডমিন (userId: "subadmin1", referralCode: "SUB001", Gateway: ✅, referredBy: "admin1")
    │
    └── এফিলিয়েট (userId: "affiliate1", referralCode: "AFF001", Gateway: ❌, referredBy: "subadmin1")
        │
        └── ইউজার A (userId: "userA", referralCode: "USERA", Gateway: ❌, referredBy: "affiliate1")
            │
            └── ইউজার B (userId: "userB", referralCode: "USERB", Gateway: ❌, referredBy: "userA")
                │
                └── ইউজার C (userId: "userC", referralCode: "USERC", Gateway: ❌, referredBy: "userB")
```

### ReferralChain Documents:

#### ইউজার C এর Referral Chain:
```json
{
  "userId": "userC",
  "referralCode": "USERC",
  "userRole": "user",
  "userLevel": 5,
  "hasOwnGateway": false,
  
  "directReferrer": {
    "userId": "userB",
    "role": "user",
    "referralCode": "USERB",
    "hasGateway": false
  },
  
  "gatewayOwner": {
    "userId": "subadmin1",
    "role": "subAdmin",
    "referralCode": "SUB001"
  },
  
  "bonusDeductionOwner": {
    "userId": "affiliate1",
    "role": "affiliate",
    "referralCode": "AFF001"
  },
  
  "fullChain": [
    { "userId": "userC", "role": "user", "level": 0, "hasGateway": false },
    { "userId": "userB", "role": "user", "level": 1, "hasGateway": false },
    { "userId": "userA", "role": "user", "level": 2, "hasGateway": false },
    { "userId": "affiliate1", "role": "affiliate", "level": 3, "hasGateway": false },
    { "userId": "subadmin1", "role": "subAdmin", "level": 4, "hasGateway": true },
    { "userId": "admin1", "role": "admin", "level": 5, "hasGateway": true }
  ],
  
  "adminId": "admin1",
  "subAdminId": "subadmin1",
  "affiliateId": "affiliate1"
}
```

### ইউজার C যখন 10,000 টাকা ডিপজিট করে:

#### Step 1: Gateway Resolution
```
userC এর Gateway নেই
→ userB এর Gateway নেই
→ userA এর Gateway নেই
→ affiliate1 এর Gateway নেই
→ subadmin1 এর Gateway আছে ✅

ব্যবহৃত Gateway: subadmin1 এর Gateway
```

#### Step 2: Bonus Deduction Owner
```
userC এর Direct Referrer: userB (user role)
→ userB কোনো gateway owner না
→ উপরে যাই: userA (user role)
→ userA ও gateway owner না
→ আরো উপরে: affiliate1 (affiliate role) ✅

Bonus কাটা হবে: affiliate1 থেকে
```

#### Step 3: Deposit Bonus Calculation
```
Deposit Amount: 10,000 টাকা
Deposit Bonus (10%): 1,000 টাকা

Transaction:
- affiliate1 এর balance: 50,000 → 49,000 (1,000 টাকা কাটা হলো)
- userC এর balance: 0 → 11,000 (10,000 + 1,000 পেল)
```

#### Step 4: Multi-Level Referral Bonus

```
Level 0 (Direct Referrer - userB):
  Bonus: 10,000 × 2% = 200 টাকা
  userB এর balance: 0 → 200

Level 1 (userA):
  Bonus: 10,000 × 1% = 100 টাকা
  userA এর balance: 500 → 600

Level 2 (affiliate1):
  Bonus: 10,000 × 3% = 300 টাকা
  affiliate1 এর balance: 49,000 → 49,300
  
  Net for affiliate1: -1,000 + 300 = -700 টাকা
```

#### Final Balances:
```
Before Transaction:
- admin1: 1,000,000
- subadmin1: 500,000
- affiliate1: 50,000
- userA: 500
- userB: 0
- userC: 0

After Transaction:
- admin1: 1,000,000 (no change)
- subadmin1: 500,000 (no change, gateway use only)
- affiliate1: 49,300 (-1,000 bonus deducted, +300 referral bonus)
- userA: 600 (+100 level 1 bonus)
- userB: 200 (+200 direct referral bonus)
- userC: 11,000 (+10,000 deposit + 1,000 bonus)
```

---

## সিনারিও ২: সরাসরি সাব-এডমিন রেফারেল (Direct SubAdmin Referral)

### হায়ারার্কি স্ট্রাকচার:
```
এডমিন (userId: "admin1", referralCode: "1", Gateway: ✅)
│
└── সাব-এডমিন (userId: "subadmin1", referralCode: "SUB001", Gateway: ✅, referredBy: "admin1")
    │
    └── ইউজার A (userId: "userA2", referralCode: "USERA2", Gateway: ❌, referredBy: "subadmin1")
        │
        └── ইউজার B (userId: "userB2", referralCode: "USERB2", Gateway: ❌, referredBy: "userA2")
            │
            └── ইউজার C (userId: "userC2", referralCode: "USERC2", Gateway: ❌, referredBy: "userB2")
```

### ইউজার C2 এর Referral Chain:
```json
{
  "userId": "userC2",
  "referralCode": "USERC2",
  "userRole": "user",
  "userLevel": 4,
  "hasOwnGateway": false,
  
  "directReferrer": {
    "userId": "userB2",
    "role": "user",
    "referralCode": "USERB2",
    "hasGateway": false
  },
  
  "gatewayOwner": {
    "userId": "subadmin1",
    "role": "subAdmin",
    "referralCode": "SUB001"
  },
  
  "bonusDeductionOwner": {
    "userId": "subadmin1",
    "role": "subAdmin",
    "referralCode": "SUB001"
  },
  
  "fullChain": [
    { "userId": "userC2", "role": "user", "level": 0, "hasGateway": false },
    { "userId": "userB2", "role": "user", "level": 1, "hasGateway": false },
    { "userId": "userA2", "role": "user", "level": 2, "hasGateway": false },
    { "userId": "subadmin1", "role": "subAdmin", "level": 3, "hasGateway": true },
    { "userId": "admin1", "role": "admin", "level": 4, "hasGateway": true }
  ],
  
  "adminId": "admin1",
  "subAdminId": "subadmin1",
  "affiliateId": null
}
```

### ইউজার C2 যখন 5,000 টাকা ডিপজিট করে:

#### Calculations:
```
Gateway Owner: subadmin1 ✅
Bonus Deduction Owner: subadmin1 ✅ (কারণ সব user এর উপরে subadmin1)

Deposit Bonus:
- 5,000 × 10% = 500 টাকা
- subadmin1 থেকে কাটা হবে

Referral Bonuses:
- userB2 (Direct): 5,000 × 2% = 100 টাকা
- userA2 (Level 1): 5,000 × 1% = 50 টাকা
- subadmin1 (Level 2): 5,000 × 2% = 100 টাকা (SubAdmin হিসেবে)

SubAdmin Net: -500 + 100 = -400 টাকা
```

#### Final Balances:
```
Before:
- subadmin1: 500,000
- userA2: 0
- userB2: 0
- userC2: 0

After:
- subadmin1: 499,600 (-500 bonus deducted, +100 referral bonus)
- userA2: 50 (+50 level 1 bonus)
- userB2: 100 (+100 direct referral bonus)
- userC2: 5,500 (+5,000 deposit + 500 bonus)
```

---

## সিনারিও ৩: সরাসরি এডমিন রেফারেল (Direct Admin Referral)

### হায়ারার্কি স্ট্রাকচার:
```
এডমিন (userId: "admin1", referralCode: "1", Gateway: ✅)
│
└── ইউজার A (userId: "userA3", referralCode: "USERA3", Gateway: ❌, referredBy: "admin1")
    │
    └── ইউজার B (userId: "userB3", referralCode: "USERB3", Gateway: ❌, referredBy: "userA3")
        │
        └── ইউজার C (userId: "userC3", referralCode: "USERC3", Gateway: ❌, referredBy: "userB3")
```

### ইউজার C3 এর Referral Chain:
```json
{
  "userId": "userC3",
  "referralCode": "USERC3",
  "userRole": "user",
  "userLevel": 3,
  "hasOwnGateway": false,
  
  "directReferrer": {
    "userId": "userB3",
    "role": "user",
    "referralCode": "USERB3",
    "hasGateway": false
  },
  
  "gatewayOwner": {
    "userId": "admin1",
    "role": "admin",
    "referralCode": "1"
  },
  
  "bonusDeductionOwner": {
    "userId": "admin1",
    "role": "admin",
    "referralCode": "1"
  },
  
  "fullChain": [
    { "userId": "userC3", "role": "user", "level": 0, "hasGateway": false },
    { "userId": "userB3", "role": "user", "level": 1, "hasGateway": false },
    { "userId": "userA3", "role": "user", "level": 2, "hasGateway": false },
    { "userId": "admin1", "role": "admin", "level": 3, "hasGateway": true }
  ],
  
  "adminId": "admin1",
  "subAdminId": null,
  "affiliateId": null
}
```

### ইউজার C3 যখন 20,000 টাকা ডিপজিট করে (First Deposit):

#### Calculations:
```
Gateway Owner: admin1 ✅
Bonus Deduction Owner: admin1 ✅
First Deposit: YES (20% bonus)

Deposit Bonus:
- 20,000 × 20% = 4,000 টাকা (First deposit bonus)
- admin1 থেকে কাটা হবে

Referral Bonuses:
- userB3 (Direct): 20,000 × 2% = 400 টাকা
- userA3 (Level 1): 20,000 × 1% = 200 টাকা
- admin1 (Level 2): 20,000 × 2% = 400 টাকা (Admin হিসেবে)

Admin Net: -4,000 + 400 = -3,600 টাকা
```

#### Final Balances:
```
Before:
- admin1: 1,000,000
- userA3: 0
- userB3: 0
- userC3: 0

After:
- admin1: 996,400 (-4,000 bonus deducted, +400 referral bonus)
- userA3: 200 (+200 level 1 bonus)
- userB3: 400 (+400 direct referral bonus)
- userC3: 24,000 (+20,000 deposit + 4,000 first deposit bonus)
```

---

## BonusTransaction Records

### সিনারিও ১ এর জন্য Transactions:

#### Transaction 1: Deposit Bonus
```json
{
  "transactionId": "BTX1234567890ABC",
  "depositorUserId": "userC",
  "bonusDeductedFrom": "affiliate1",
  "depositAmount": 10000,
  "bonusPercentage": 10,
  "bonusAmount": 1000,
  "transactionType": "deposit_bonus",
  "gatewayUsed": {
    "gatewayId": "GW_SUBADMIN1_001",
    "gatewayOwnerId": "subadmin1",
    "gatewayType": "bKash"
  },
  "status": "completed",
  "completedAt": "2024-01-15T10:30:00Z"
}
```

#### Transaction 2: Direct Referral Bonus (userB)
```json
{
  "transactionId": "RTX1234567890DEF",
  "depositorUserId": "userC",
  "bonusDeductedFrom": "userB",
  "depositAmount": 10000,
  "bonusPercentage": 2,
  "bonusAmount": 200,
  "transactionType": "referral_bonus",
  "status": "completed",
  "details": {
    "level": 0,
    "notes": "Level 0 referral bonus"
  }
}
```

#### Transaction 3: Level 1 Bonus (userA)
```json
{
  "transactionId": "RTX1234567890GHI",
  "depositorUserId": "userC",
  "bonusDeductedFrom": "userA",
  "depositAmount": 10000,
  "bonusPercentage": 1,
  "bonusAmount": 100,
  "transactionType": "level1_bonus",
  "status": "completed"
}
```

#### Transaction 4: Level 2 Bonus (affiliate1)
```json
{
  "transactionId": "RTX1234567890JKL",
  "depositorUserId": "userC",
  "bonusDeductedFrom": "affiliate1",
  "depositAmount": 10000,
  "bonusPercentage": 3,
  "bonusAmount": 300,
  "transactionType": "level2_bonus",
  "status": "completed"
}
```

---

## API Call Examples

### Creating the Hierarchy

#### 1. Create Admin Gateway:
```bash
POST /api/gateway/create
{
  "ownerId": "admin1",
  "gatewayName": "Admin Main bKash",
  "gatewayType": "bKash",
  "accountNumber": "01700000001",
  "accountName": "Admin Account"
}
```

#### 2. Create SubAdmin Gateway:
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

#### 3. Register Affiliate under SubAdmin:
```bash
POST /api/referral/register-with-code
{
  "userId": "affiliate1",
  "referralCode": "SUB001"
}
```

#### 4. Register Users in Chain:
```bash
# User A under Affiliate
POST /api/referral/register-with-code
{
  "userId": "userA",
  "referralCode": "AFF001"
}

# User B under User A
POST /api/referral/register-with-code
{
  "userId": "userB",
  "referralCode": "USERA"
}

# User C under User B
POST /api/referral/register-with-code
{
  "userId": "userC",
  "referralCode": "USERB"
}
```

#### 5. User C Makes Deposit:
```bash
POST /api/deposit-bonus/create
{
  "userId": "userC",
  "amount": 10000,
  "gatewayId": "GW_SUBADMIN1_001",
  "paymentMethod": "Nagad"
}
```

---

## Summary Tables

### Scenario 1: Affiliate Hierarchy (10,000 টাকা deposit)

| User       | Role      | Balance Change | Reason                        |
|------------|-----------|----------------|-------------------------------|
| userC      | User      | +11,000        | +10,000 deposit + 1,000 bonus |
| userB      | User      | +200           | Direct referral bonus (2%)    |
| userA      | User      | +100           | Level 1 referral bonus (1%)   |
| affiliate1 | Affiliate | -700           | -1,000 deposit bonus + 300 L2 |
| subadmin1  | SubAdmin  | 0              | Gateway owner only            |
| admin1     | Admin     | 0              | No involvement                |

### Scenario 2: SubAdmin Direct (5,000 টাকা deposit)

| User      | Role     | Balance Change | Reason                        |
|-----------|----------|----------------|-------------------------------|
| userC2    | User     | +5,500         | +5,000 deposit + 500 bonus    |
| userB2    | User     | +100           | Direct referral bonus (2%)    |
| userA2    | User     | +50            | Level 1 referral bonus (1%)   |
| subadmin1 | SubAdmin | -400           | -500 deposit bonus + 100 L2   |
| admin1    | Admin    | 0              | No involvement                |

### Scenario 3: Admin Direct (20,000 টাকা first deposit)

| User   | Role  | Balance Change | Reason                             |
|--------|-------|----------------|------------------------------------|
| userC3 | User  | +24,000        | +20,000 deposit + 4,000 bonus (20%)|
| userB3 | User  | +400           | Direct referral bonus (2%)         |
| userA3 | User  | +200           | Level 1 referral bonus (1%)        |
| admin1 | Admin | -3,600         | -4,000 first deposit bonus + 400 L2|

---

## উপসংহার (Conclusion)

এই সিস্টেম সম্পূর্ণভাবে functional এবং সব ধরনের hierarchy support করে:

1. ✅ Unlimited depth referral chain
2. ✅ Smart gateway resolution (chain এ উপরে যেতে থাকে)
3. ✅ Flexible bonus deduction (Affiliate/SubAdmin/Admin থেকে)
4. ✅ Multi-level referral rewards (3 levels)
5. ✅ First deposit special bonus
6. ✅ Complete transaction history
7. ✅ Real-time balance updates

সব সিনারিওতে সঠিকভাবে কাজ করবে!
