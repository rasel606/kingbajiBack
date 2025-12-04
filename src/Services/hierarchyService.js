// const Transaction = require('../Models/TransactionModel');
// const UserLookup = require('../Models/UserBase');
// const Admin = require('../Models/AdminModel');
// const SubAdmin = require('../Models/SubAdminModel');
// const Agent = require('../Models/Agent');
// const SubAgent = require('../Models/SubAgent');
// const Affiliate = require('../Models/AffiliateModel');

// let redisClient = null;
// module.exports.initCache = (client) => { redisClient = client; };

// async function resolveReferralOwner(referralCode) {
//   if (!referralCode) return null;

//   const lookup = await UserLookup.findOne({ referralCode }).lean();
//   if (lookup) {
//     const { role, refId } = lookup;
//     const mapping = { Admin, SubAdmin, Agent, SubAgent, Affiliate };
//     const Model = mapping[role];
//     if (!Model) return null;
//     const data = await Model.findById(refId).select('-password -__v').lean();
//     return { referralCode, role, data };
//   }

//   const tries = [
//     { model: Admin, role: 'Admin' },
//     { model: SubAdmin, role: 'SubAdmin' },
//     { model: Agent, role: 'Agent' },
//     { model: SubAgent, role: 'SubAgent' },
//     { model: Affiliate, role: 'Affiliate' }
//   ];

//   for (const t of tries) {
//     const found = await t.model.findOne({ referralCode }).select('-password -__v').lean();
//     if (found) return { referralCode, role: t.role, data: found };
//   }
//   return null;
// }

// async function findParentHierarchy(startReferralCode) {
//   const result = [];
//   let current = startReferralCode;
//   const maxDepth = 10;

//   for (let i = 0; i < maxDepth && current; i++) {
//     const cachedKey = `hier:${current}`;
//     let owner = null;
//     if (redisClient) {
//       const cached = await redisClient.get(cachedKey);
//       if (cached) owner = JSON.parse(cached);
//     }

//     if (!owner) {
//       owner = await resolveReferralOwner(current);
//       if (redisClient && owner) await redisClient.setEx(cachedKey, 300, JSON.stringify(owner));
//     }

//     if (!owner) break;

//     result.push({ referralCode: current, ...owner });
//     current = owner.data?.referredBy || null;
//   }

//   return result;
// }

// async function getFilterForUser(role, referralCode) {
//   if (!referralCode) return { _id: { $exists: false } };

//   const cacheKey = `downline:${role}:${referralCode}`;
//   if (redisClient) {
//     const cached = await redisClient.get(cacheKey);
//     if (cached) return { referredBy: { $in: JSON.parse(cached) } };
//   }

//   const referralCodes = new Set();
//   const queue = [referralCode];
//   const maxNodes = 2000;

//   while (queue.length && referralCodes.size < maxNodes) {
//     const rc = queue.shift();
//     referralCodes.add(rc);

//     const children = await UserLookup.find({ parentReferralCode: rc }).select('referralCode').lean();
//     for (const c of children) {
//       if (!referralCodes.has(c.referralCode)) queue.push(c.referralCode);
//     }
//   }

//   const arr = Array.from(referralCodes);
//   if (redisClient) await redisClient.setEx(cacheKey, 600, JSON.stringify(arr));
//   return { referredBy: { $in: arr } };
// }

// async function getTransactionsWithHierarchy(transactions = []) {
//   const codes = Array.from(new Set(transactions.map(t => t.referredBy).filter(Boolean)));
//   const owners = {};
//   await Promise.all(codes.map(async (code) => {
//     owners[code] = await resolveReferralOwner(code);
//   }));

//   return transactions.map(t => ({
//     ...t.toObject(),
//     referralOwner: owners[t.referredBy] || null
//   }));
// }

// async function getTransactionWithHierarchy(transaction) {
//   const tx = transaction.toObject();
//   const owner = await resolveReferralOwner(tx.referredBy);
//   const parents = owner ? await findParentHierarchy(tx.referredBy) : [];
//   return { transaction: tx, referralOwner: owner, parentChain: parents };
// }

// module.exports = {
//   resolveReferralOwner,
//   findParentHierarchy,
//   getFilterForUser,
//   getTransactionsWithHierarchy,
//   getTransactionWithHierarchy,
//   initCache
// };





const Transaction = require('../Models/TransactionModel');
const AdminModel = require('../Models/AdminModel');
const SubAdminModel = require('../Models/SubAdminModel');
const AgentModel = require('../Models/AgentModel');
const SubAgentModel = require('../Models/SubAgentModel');
const AffiliateModel = require('../Models/AffiliateModel');

let redisClient = null;
function initCache  (client)  { redisClient = client; };

// রেফারাল কোড থেকে মালিক খোঁজা
async function resolveReferralOwner(referralCode) {
  if (!referralCode) return null;

  const Models = [
    { model: AdminModel, role: 'Admin' },
    { model: SubAdminModel, role: 'SubAdmin' },
    { model: AgentModel, role: 'Agent' },
    { model: SubAgentModel, role: 'SubAgent' },
    { model: AffiliateModel, role: 'Affiliate' }
  ];

  for (const m of Models) {
    const owner = await m.model.findOne({ referralCode }).select('-password -__v').lean();
    if (owner) return { referralCode, role: m.role, data: owner };
  }

  return null;
}



// প্যারেন্ট হায়ারার্কি খুঁজে বের করা
async function findParentHierarchy(startReferralCode) {
  const result = [];
  let current = startReferralCode;
  const maxDepth = 10;

  for (let i = 0; i < maxDepth && current; i++) {
    const cachedKey = `hier:${current}`;
    let owner = null;
    if (redisClient) {
      const cached = await redisClient.get(cachedKey);
      if (cached) owner = JSON.parse(cached);
    }

    if (!owner) {
      owner = await resolveReferralOwner(current);
      if (redisClient && owner) await redisClient.setEx(cachedKey, 300, JSON.stringify(owner));
    }

    if (!owner) break;

    result.push({ referralCode: current, ...owner });
    current = owner.data?.referredBy || null;
  }

  return result;
}

// ইউজারের অধীনে ট্রানজেকশন ফিল্টার
async function getFilterForUser(role, referralCode) {
  if (!referralCode) return { referredBy: { $exists: false } };

  const cacheKey = `downline:${role}:${referralCode}`;
  if (redisClient) {
    const cached = await redisClient.get(cacheKey);
    if (cached) return { referredBy: { $in: JSON.parse(cached) } };
  }

  const referralCodes = new Set([referralCode]);
  const queue = [referralCode];
  const maxNodes = 2000;
console.log("getFilterForUser referralCode",referralCode);
  while (queue.length && referralCodes.size < maxNodes) {
    const rc = queue.shift();
    console.log("getFilterForUser rc",rc);
    for (const model of [AdminModel, SubAdminModel, AgentModel, SubAgentModel, AffiliateModel]) {
      const children = await model.find({ referredBy: rc }).select('referralCode').lean();
      for (const c of children) {
        if (!referralCodes.has(c.referralCode)) queue.push(c.referralCode);
      }
    }
  }
  console.log("getFilterForUser referralCodes",referralCodes);
  const arr = Array.from(referralCodes);
  if (redisClient) await redisClient.setEx(cacheKey, 600, JSON.stringify(arr));
  return { referredBy: { $in: arr } };
}

// হায়ারার্কি সহ ট্রানজেকশন
async function getTransactionsWithHierarchy(transactions = []) {
  const codes = Array.from(new Set(transactions.map(t => t.referredBy).filter(Boolean)));
  const owners = {};
  await Promise.all(codes.map(async (code) => {
    owners[code] = await resolveReferralOwner(code);
  }));

  return transactions.map(t => ({
    ...t.toObject(),
    referralOwner: owners[t.referredBy] || null
  }));
}

async function getTransactionWithHierarchy(transaction) {
  const tx = transaction.toObject();
  const owner = await resolveReferralOwner(tx.referredBy);
  const parents = owner ? await findParentHierarchy(tx.referredBy) : [];
  return { transaction: tx, referralOwner: owner, parentChain: parents };
}

module.exports = {
  resolveReferralOwner,
  findParentHierarchy,
  getFilterForUser,
  getTransactionsWithHierarchy,
  getTransactionWithHierarchy,
  initCache
};



// class HierarchyService {
//   /**
//    * রেফারেল কোড থেকে প্যারেন্ট হায়ারার্কি বের করে
//    * @param {string} referralCode - রেফারেল কোড
//    * @returns {Promise<Array>} - হায়ারার্কি অ্যারেট
//    */
//   static async findParentHierarchy(referralCode) {
//     if (!referralCode || referralCode === "1") {
//       return [];
//     }

//     let currentCode = referralCode;
//     const hierarchy = [];
//     const visited = new Set(); // লুপ এড়ানোর জন্য
// console.log(currentCode);
// console.log(referralCode);
// console.log(visited);
// console.log(hierarchy);
//     while (currentCode && currentCode !== "1" && !visited.has(currentCode)) {
//       visited.add(currentCode);
      
//       let foundUser = null;
//       let role = '';

//       // সব মডেলে সার্চ করি
//       const [
//         admin,
//         subAdmin,
//         agent,
//         subAgent,
//         affiliate
//       ] = await Promise.all([
//         AdminModel.findOne({ referralCode: currentCode }).select('referralCode referredBy firstName lastName email role'),
//         SubAdminModel.findOne({ referralCode: currentCode }).select('referralCode referredBy firstName lastName email role'),
//         Agent.findOne({ referralCode: currentCode }).select('referralCode referredBy firstName lastName email role agentType'),
//         SubAgent.findOne({ referralCode: currentCode }).select('referralCode referredBy firstName lastName email role'),
//         AffiliateModel.findOne({ referralCode: currentCode }).select('referralCode referredBy firstName lastName email role')
//       ]);

//       // প্রথমে যেটা পাওয়া যায় সেটা নিই
//       if (admin) {
//         foundUser = admin;
//         role = 'Admin';
//       } else if (subAdmin) {
//         foundUser = subAdmin;
//         role = 'SubAdmin';
//       } else if (agent) {
//         foundUser = agent;
//         role = 'Agent';
//       } else if (subAgent) {
//         foundUser = subAgent;
//         role = 'SubAgent';
//       } else if (affiliate) {
//         foundUser = affiliate;
//         role = 'Affiliate';
//       }

//       if (!foundUser) {
//         // কোনো মডেলে না পাওয়া গেলে
//         hierarchy.push({
//           referralCode: currentCode,
//           role: 'Unknown',
//           data: null,
//           message: 'User not found'
//         });
//         break;
//       }

//       // হায়ারার্কিতে যোগ করি
//       hierarchy.push({
//         referralCode: currentCode,
//         role: role,
//         data: foundUser,
//         referredBy: foundUser.referredBy
//       });

//       // পরবর্তী কোডে যাই
//       currentCode = foundUser.referredBy;
//     }

//     return hierarchy;
//   }

//   /**
//    * ট্রানজেকশনের জন্য হায়ারার্কি বের করে
//    * @param {Object} transaction - ট্রানজেকশন অবজেক্ট
//    * @returns {Promise<Object>} - ট্রানজেকশন সহ হায়ারার্কি
//    */
//   static async getTransactionWithHierarchy(transaction) {
//     if (!transaction.referredBy || transaction.referredBy === "1") {
//       return {
//         ...transaction.toObject ? transaction.toObject() : transaction,
//         hierarchy: [],
//         topParent: null
//       };
//     }

//     const hierarchy = await this.findParentHierarchy(transaction.referredBy);
    
//     let topParent = null;
//     if (hierarchy.length > 0) {
//       // শেষ উপাদান (যে "1" বা null এর কাছে পৌঁছেছে)
//       topParent = hierarchy[hierarchy.length - 1];
//     }

//     return {
//       ...transaction.toObject ? transaction.toObject() : transaction,
//       hierarchy: hierarchy,
//       topParent: topParent,
//       directReferrer: hierarchy.length > 0 ? hierarchy[0] : null
//     };
//   }

//   /**
//    * একাধিক ট্রানজেকশনের জন্য হায়ারার্কি বের করে
//    * @param {Array} transactions - ট্রানজেকশনের অ্যারে
//    * @returns {Promise<Array>} - হায়ারার্কি সহ ট্রানজেকশন
//    */
//   static async getTransactionsWithHierarchy(transactions) {
//     const results = [];
    
//     for (const transaction of transactions) {
//       const transactionWithHierarchy = await this.getTransactionWithHierarchy(transaction);
//       results.push(transactionWithHierarchy);
//     }
    
//     return results;
//   }

//   /**
//    * নির্দিষ্ট প্যারেন্টের অধীনে সব ট্রানজেকশন বের করে
//    * @param {string} referralCode - প্যারেন্টের রেফারেল কোড
//    * @returns {Promise<Array>} - সব ট্রানজেকশন
//    */
//   static async getTransactionsByParent(referralCode) {
//     if (!referralCode || referralCode === "1") {
//       return [];
//     }

//     // প্রথমে সেই কোডের সকল ডাউনলাইন খুঁজে বের করি
//     const allDownlineCodes = await this.getAllDownlineCodes(referralCode);
    
//     // এখন সব ট্রানজেকশন খুঁজি
//     const transactions = await Transaction.find({
//       referredBy: { $in: allDownlineCodes }
//     }).sort({ datetime: -1 });

//     return this.getTransactionsWithHierarchy(transactions);
//   }

//   /**
//    * একটি রেফারেল কোডের সব ডাউনলাইন কোড বের করে
//    * @param {string} referralCode - রেফারেল কোড
//    * @returns {Promise<Array>} - সব ডাউনলাইন কোড
//    */
//   static async getAllDownlineCodes(referralCode) {
//     const downlineCodes = [referralCode];
//     let currentLevel = [referralCode];
    
//     // ৩ লেভেল পর্যন্ত খুঁজি (আপনার requirement অনুযায়ী)
//     for (let level = 0; level < 3; level++) {
//       const nextLevel = [];
      
//       // প্রতিটি মডেল থেকে ডাউনলাইন খুঁজি
//       const promises = currentLevel.map(async (code) => {
//         // Affiliate থেকে ডাউনলাইন
//         const affiliateDownlines = await AffiliateModel.find({ 
//           referredBy: code 
//         }).select('referralCode');
        
//         // SubAgent থেকে ডাউনলাইন
//         const subAgentDownlines = await SubAgent.find({ 
//           referredBy: code 
//         }).select('referralCode');
        
//         // Agent থেকে ডাউনলাইন
//         const agentDownlines = await Agent.find({ 
//           referredBy: code 
//         }).select('referralCode');
        
//         // SubAdmin থেকে ডাউনলাইন
//         const subAdminDownlines = await SubAdminModel.find({ 
//           referredBy: code 
//         }).select('referralCode');

//         return [
//           ...affiliateDownlines.map(d => d.referralCode),
//           ...subAgentDownlines.map(d => d.referralCode),
//           ...agentDownlines.map(d => d.referralCode),
//           ...subAdminDownlines.map(d => d.referralCode)
//         ];
//       });

//       const results = await Promise.all(promises);
//       const newCodes = results.flat().filter(code => code && !downlineCodes.includes(code));
      
//       downlineCodes.push(...newCodes);
//       nextLevel.push(...newCodes);
//       currentLevel = nextLevel;
      
//       if (currentLevel.length === 0) break;
//     }

//     return downlineCodes;
//   }

//   /**
//    * ট্রানজেকশন সার্চের জন্য ফিল্টার বের করে
//    * @param {string} role - ইউজার টাইপ (Admin, SubAdmin, etc.)
//    * @param {string} referralCode - রেফারেল কোড
//    * @returns {Promise<Object>} - MongoDB ফিল্টার
//    */
//   static async getFilterForUser(role, referralCode) {
//     if (!referralCode || referralCode === "1") {
//       return {}; // সব ট্রানজেকশন দেখাবে
//     }

//     const downlineCodes = await this.getAllDownlineCodes(referralCode);
    
//     return {
//       referredBy: { $in: downlineCodes }
//     };
//   }
// }

// module.exports = HierarchyService;