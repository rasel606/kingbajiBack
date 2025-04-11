const Promotion = require("../Models/PromotionSchema");
const User = require("../Models/User");
const GameListTable = require("../Models/GameListTable");
const BettingTable = require("../Models/BettingTable");


























// অ্যাডমিন API (প্রোমোশন সেট করা + টার্নওভার কমপ্লি

// router.post('/set-promotion',
//     exports.setCreatePromotion = async (req, res) => {
//     const { name, eligibleGames, turnoverRequirement, validUntil , bonusAmount, startDate, requiredBetAmount, bonusReward, validTime} = req.body;

//     const newPromotion = new Promotion({
//         name,
//         eligibleGames,
//         turnoverRequirement,
//         validUntil,
//         bonusAmount,
//         startDate,
//         requiredBetAmount,
//         bonusReward,
//         validTime
//     });

//     await newPromotion.save();
//     res.json({ message: 'Promotion Set Successfully', promotion: newPromotion });
// }


// // ===============================ডিপোজিট করলে বোনাস দেওয়া======================================//

// //  ১.  প্রোমোশন যোগ করা (ডিপোজিট করলে বোনাস দেওয়া)

// app.post("/apply-promotion", async (req, res) => {
//     const { userId } = req.body;
//     const user = await User.findById(userId);
    
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.bonus.active) {
//         return res.status(400).json({ message: "Already claimed a promotion" });
//     }

//     // নির্দিষ্ট গেমগুলোর অনুমতি দেওয়া হবে
//     const allowedGames = ["game1", "game2", "game3"];
//     const restrictedGames = ["gameX", "gameY", "gameZ"];

//     await User.updateOne(
//         { UserId: userId },
//         {
//             $set: {
//                 balance: user.balance + 500,
//                 bonus: { amount: 300, wagered: 0, requirement: 3000, active: true },
//                 allowedGames,
//                 restrictedGames
//             }
//         }
//     );

//     res.json({ message: "Promotion applied successfully!" });
// });


// //  ২. বাজি ধরার চেষ্টা করলে চেক করা হবে (শুধুমাত্র অনুমোদিত গেমে বাজি ধরা যাবে)

// app.post("/place-bet", async (req, res) => {
//     const { userId, gameId, amount } = req.body;
//     const user = await User.findById(userId);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.allowedGames.includes(gameId)) {
//         return res.status(403).json({ message: "This game is not allowed for the promotion!" });
//     }

//     if (user.balance < amount) {
//         return res.status(400).json({ message: "Insufficient balance" });
//     }

//     await Bet.create({ userId, gameId, amount, status: "pending" });

//     await User.updateOne(
//         { _id: userId },
//         {
//             $inc: { "bonus.wagered": amount }
//         }
//     );

//     res.json({ message: "Bet placed successfully!" });
// });


// // ৩. উইথড্রঅল চেক (১০x বাজি শেষ হলে উইথড্রঅল অনুমোদন)


// app.post("/withdraw", async (req, res) => {
//     const { userId } = req.body;
//     const user = await User.findById(userId);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.bonus.wagered < user.bonus.requirement) {
//         return res.status(400).json({ message: "Wagering requirement not met!" });
//     }

//     await User.updateOne(
//         { _id: userId },
//         {
//             $set: { "bonus.active": false }
//         }
//     );

//     res.json({ message: "Withdrawal enabled!" });
// });


// // ৪. প্রোমোশন ভঙ্গ করলে ব্যালেন্স বাজেয়াপ্ত করা হবে


// app.post("/check-violation", async (req, res) => {
//     const { userId } = req.body;
//     const user = await User.findById(userId);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const restrictedBets = await Bet.find({
//         userId,
//         gameId: { $in: user.restrictedGames }
//     });

//     if (restrictedBets.length > 0) {
//         await User.updateOne(
//             { _id: userId },
//             { $set: { balance: 0, bonus: { active: false } } }
//         );

//         return res.status(400).json({ message: "Violation detected! Balance confiscated!" });
//     }

//     res.json({ message: "No violations found." });
// });












// //Weekly Promotion ======================================================================================











// //   1. প্রতিদিন লগইন ট্র্যাক করা


// router.post("/login", async (req, res) => {
//     const { userId } = req.body;
//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         const today = new Date().toISOString().split("T")[0];

//         // যদি আজকের দিনটি ইতিমধ্যে লগ করা থাকে, তাহলে আবার সংযোজন না করা
//         const alreadyLogged = user.loginHistory.some((log) =>
//             log.date.toISOString().split("T")[0] === today
//         );

//         if (!alreadyLogged) {
//             user.loginHistory.push({ date: new Date() });
//             await user.save();
//         }

//         res.json({ message: "Login tracked successfully", loginHistory: user.loginHistory });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });







// //    2. ডিপোজিট সংযোজন করা


// router.post("/deposit", async (req, res) => {
//     const { userId, amount } = req.body;
//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         user.totalDeposit += amount;
//         user.balance += amount;
//         await user.save();

//         res.json({ message: "Deposit successful", totalDeposit: user.totalDeposit });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });





// //    3. বোনাস দেওয়া (৭ম দিনে চেক করা)


// // router.post("/claim-bonus", 
//     async (req, res) => {
//     const { userId } = req.body;
//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         // চেক করুন ৭ দিন লগইন হয়েছে কিনা
//         if (user.loginHistory.length < 7) {
//             return res.status(400).json({ message: "You have not logged in for 7 days." });
//         }

//         // চেক করুন মোট ৳৪০,০০০ জমা হয়েছে কিনা
//         if (user.totalDeposit < 40000) {
//             return res.status(400).json({ message: "Minimum deposit of ৳40,000 is required." });
//         }

//         // চেক করুন যদি আগেই বোনাস নেওয়া হয়ে থাকে
//         if (user.bonusReceived) {
//             return res.status(400).json({ message: "Bonus already claimed." });
//         }

//         // বোনাস সংযোজন করা
//         const bonus = new Bonus({
//             userId: user._id,
//             amount: 888,
//             status: "pending",
//             wageringRequirement: 1
//         });

//         await bonus.save();
//         user.bonusReceived = true;
//         await user.save();

//         res.json({ message: "Bonus granted successfully", bonus });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });






// //4. বাজির শর্তাবলী চেক করা

// // router.post("/wagering",
//     exports.wagering = async (req, res) => {
//     const { userId, betAmount } = req.body;
//     try {
//         const bonus = await Bonus.findOne({ userId, status: "pending" });
//         if (!bonus) return res.status(400).json({ message: "No active bonus found." });

//         bonus.wageringRequirement -= betAmount;
//         if (bonus.wageringRequirement <= 0) {
//             bonus.status = "completed";
//         }

//         await bonus.save();
//         res.json({ message: "Wagering updated", bonus });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });





// //===================================================================================================



// // 
// // Check if game is eligible and handle promotion logic
// const checkPromotion = async (userId, gameId, betAmount) => {
//     const promotion = await Promotion.findOne({ isActive: true });

//     // Ensure the promotion is active and within valid date range
//     if (!promotion || promotion.startDate > Date.now() || promotion.endDate < Date.now()) {
//         return { success: false, message: 'Promotion is not active or expired' };
//     }

//     // Check if the game is eligible
//     if (!promotion.eligibleGames.includes(gameId)) {
//         if (promotion.invalidGamesCancelPromo) {
//             // If playing invalid games cancels the promo
//             await cancelPromotionForUser(userId, promotion._id);
//             return { success: false, message: 'You cannot play this game during the promotion.' };
//         }
//         return { success: false, message: 'This game is not eligible for the promotion.' };
//     }

//     // Check if the user has met the turnover requirements
//     const userTotalBets = await calculateUserTotalBets(userId, promotion._id);
//     if (userTotalBets < promotion.bonusConditions.requiredBetAmount) {
//         return { success: false, message: 'You have not met the required turnover amount.' };
//     }

//     // If turnover completed, allow bonus reward
//     if (userTotalBets >= promotion.bonusConditions.requiredBetAmount && !promotion.completedTurnover) {
//         return { success: true, message: 'Turnover conditions met. You can now claim your bonus.' };
//     }

//     return { success: true, message: 'You can play the eligible games.' };
// }

// // Admin function to finalize turnover
// async function completeTurnover(promotionId) {
//     const promotion = await Promotion.findById(promotionId);
//     if (promotion && promotion.isActive) {
//         promotion.completedTurnover = true;
//         await promotion.save();
//         return { success: true, message: 'Turnover completed and promotion finalized.' };
//     }
//     return { success: false, message: 'Promotion not found or already finalized.' };
// }






// // router.post('/complete-turnover', 
//     exports.completeTurnover = async (req, res) => {
//     const { userId } = req.body;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.activePromotion = null; // টার্নওভার কমপ্লিট হলে প্রোমোশন শেষ
//     await user.save();

//     res.json({ message: 'Turnover Completed' });
// }



// // router.post('/set-promotion', async (req, res) => {
// //     const { name, eligibleGames, turnoverRequirement, validUntil } = req.body;

// //     const newPromotion = new Promotion({
// //         name,
// //         eligibleGames,
// //         turnoverRequirement,
// //         validUntil
// //     });

// //     await newPromotion.save();
// //     res.json({ message: 'Promotion Set Successfully', promotion: newPromotion });
// // });

// exports.completeTurnover = async (req, res) => {
//     const { userId } = req.body;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.activePromotion = null; // টার্নওভার কমপ্লিট হলে প্রোমোশন শেষ
//     await user.save();

//     res.json({ message: 'Turnover Completed' });
// }


// //==============================================================প্রচারটি প্রতিদিন অনুষ্ঠিত হয় এবং প্রতিদিন এএম===========================//
// //

// exports.claimBonus = async (req, res) => {
//     try {
//         const { userId } = req.body;

//         // Fetch user details
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Check if user has already claimed the bonus
//         const existingClaim = await Promotion.findOne({ userId });
//         if (existingClaim) {
//             return res.status(400).json({ message: "Bonus already claimed." });
//         }

//         // Get active promotion set by admin
//         const promotion = await Promotion.findOne({ isActive: true });
//         if (!promotion) {
//             return res.status(400).json({ message: "No active promotion available." });
//         }

//         // Get deposit amount
//         const deposit = user.lastMonthDeposit;
//         if (deposit < 5000) {
//             return res.status(400).json({ message: "Minimum deposit of ৳5,000 required in the previous month." });
//         }

//         // Determine bonus dynamically from admin settings
//         let bonusAmount = 0;
//         for (const condition of promotion.depositBonusConditions) {
//             if (deposit >= condition.minDeposit && deposit <= condition.maxDeposit) {
//                 bonusAmount = condition.bonusReward;
//                 break;
//             }
//         }

//         // If no matching condition is found, return an error
//         if (bonusAmount === 0) {
//             return res.status(400).json({ message: "No bonus available for this deposit range." });
//         }

//         // Create a bonus claim entry
//         const promotionClaim = new Promotion({
//             userId,
//             bonusAmount,
//             eligibleGames: promotion.eligibleGames,
//             wagerRequirement: bonusAmount * 8, // 8x wagering requirement
//             validUntil: promotion.endDate,
//         });

//         await promotion.save();

//         res.json({ message: "Bonus claimed successfully!", bonusAmount });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// };





// app.post("/api/promotions", async (req, res) => {
//     const { name, eligibleGames, invalidGamesCancelPromo, bonusAmount, startDate, endDate } = req.body;
//     const newPromotion = new Promotion({
//         name,
//         eligibleGames,
//         invalidGamesCancelPromo,
//         bonusAmount,
//         startDate,
//         endDate
//     });
//     await newPromotion.save();
//     res.json({ message: "Promotion added successfully!" });
// });


  

// router.post("/assign-promotion", async (req, res) => {
//     try {
//       const { userId, promotionId } = req.body;
  
//       await User.findByIdAndUpdate(userId, {
//         activePromotion: promotionId,
//         promotionStatus: "active"
//       });
  
//       res.json({ message: "Promotion Assigned!" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

//   app.post("/api/game-play", async (req, res) => {
//     const { userId, gameId, amount } = req.body;

//     const user = await User.findById(userId);
//     if (!user || !user.activePromotion) {
//         return res.status(400).json({ message: "No active promotion found." });
//     }

//     const promotion = await Promotion.findById(user.activePromotion);
//     if (!promotion) {
//         return res.status(400).json({ message: "Invalid promotion." });
//     }

//     if (!promotion.eligibleGames.includes(gameId)) {
//         await User.findByIdAndUpdate(userId, { $unset: { activePromotion: 1 } });
//         return res.status(400).json({ message: "Promotion cancelled due to invalid game play." });
//     }

//     await new Transaction({ userId, gameId, amount }).save();
//     res.json({ message: "Game played successfully!" });
// });




// router.post("/place-bet", async (req, res) => {
//     try {
//       const { userId, gameId, amount } = req.body;
  
//       const user = await User.findById(userId);
//       const game = await GameListTable.findById(gameId);
//       const promotion = await Promotion.findById(user.activePromotion);
  
//       if (!user) return res.status(404).json({ message: "User not found" });
//       if (!game) return res.status(404).json({ message: "Game not found" });
//       if (!promotion) return res.status(404).json({ message: "No active promotion" });
  
//       const isValidGame = promotion.validGames.includes(gameId);
  
//       if (!isValidGame) {
//         await User.findByIdAndUpdate(userId, { promotionStatus: "cancelled" });
//         return res.json({ message: "Invalid game played! Promotion cancelled." });
//       }
  
//       const newBet = new BettingTable({ userId, gameId, amount });
//       await newBet.save();
  
//       res.json({ message: "Bet placed successfully!" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });












 // গেম খেলার সময় চেক করা (প্রোমোশন রুলস ভঙ্গ হয়েছে কিনা) লজিক

// exports.ChackPromotionRules = () => {

//  const now = new Date();
// const user = db.users.findOne({ _id: ObjectId("USER_ID") });

// if (user.activePromotion) {
//     const promotion = db.promotions.findOne({ _id: user.activePromotion });

//     // প্রোমোশন সময় চেক
//     if (now < promotion.startDate || now > promotion.endDate) {
//         db.users.updateOne(
//             { _id: ObjectId("USER_ID") },
//             { $unset: { activePromotion: "" } }
//         );
//         print("Promotion expired.");
//     } else {
//         // ভুল গেম খেললে প্রোমোশন বাতিল ও বোনাস মুছে ফেলা
//         if (!promotion.eligibleGames.includes("GAME_ID")) {
//             db.users.updateOne(
//                 { _id: ObjectId("USER_ID") },
//                 { $unset: { activePromotion: "" }, $set: { bonusBalance: 0 } }
//             );
//             print("Promotion cancelled due to invalid game play.");
//         } else {
//             // সঠিক গেম খেললে ইউজারের ব্যালেন্স আপডেট করুন
//             db.users.updateOne(
//                 { _id: ObjectId("USER_ID") },
//                 { $inc: { balance: -50 } }  // এখানে ৫০ হল বাজির পরিমাণ
//             );

//             // লেনদেন সংরক্ষণ করুন
//             db.transactions.insertOne({
//                 userId: ObjectId("USER_ID"),
//                 gameId: "GAME_ID",
//                 amount: 50,
//                 timestamp: now
//             });

//             print("Game played successfully!");
//         }
//     }
// }


// }

// অতিরিক্ত বোনাস যোগ করা (যদি ইউজার নির্দিষ্ট পরিমাণ বাজি ধরে) লজিক


// exports.checkExtraBonus = () => {




// const userId = ObjectId("USER_ID");
// const promotion = db.promotions.findOne({ _id: ObjectId("PROMOTION_ID") });

// const totalBet = db.transactions.aggregate([
//     { $match: { userId: userId, timestamp: { $gte: new Date(Date.now() - promotion.bonusConditions.validTime) } } },
//     { $group: { _id: null, totalBet: { $sum: "$amount" } } }
// ]).toArray();

// if (totalBet.length > 0 && totalBet[0].totalBet >= promotion.bonusConditions.requiredBetAmount) {
//     db.users.updateOne(
//         { _id: userId },
//         { $inc: { bonusBalance: promotion.bonusConditions.bonusReward } }
//     );
//     print("Extra bonus awarded!");
// }
// }



// নতুন প্রোমোশন তৈরি করা
// router.post("/create", async (req, res) => {
//     try {
//         const promotion = new Promotion(req.body);
//         await promotion.save();
//         res.json({ message: "Promotion created successfully!", promotion });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });




// ইউজারের প্রোমোশন আপডেট করা
// router.post("/assign-promotion", async (req, res) => {
//     const { userId, promotionId } = req.body;
//     try {
//         await User.findByIdAndUpdate(userId, { activePromotion: promotionId });
//         res.json({ message: "Promotion assigned to user!" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });



// গেম খেলার সময় চেক করা
// router.post("/play", async (req, res) => {
//     const { userId, gameId, amount } = req.body;

//     const user = await User.findById(userId);
//     if (!user || !user.activePromotion) {
//         return res.status(400).json({ message: "No active promotion found." });
//     }

//     const promotion = await Promotion.findById(user.activePromotion);
//     if (!promotion) {
//         return res.status(400).json({ message: "Invalid promotion." });
//     }

//     const now = new Date();
    
//     // **প্রোমোশন সময় চেক করুন**
//     if (now < promotion.startDate || now > promotion.endDate) {
//         await User.findByIdAndUpdate(userId, { $unset: { activePromotion: 1 } });
//         return res.status(400).json({ message: "Promotion expired." });
//     }

//     // **ভুল গেম খেললে প্রোমোশন বাতিল**
//     if (!promotion.eligibleGames.includes(gameId)) {
//         await User.findByIdAndUpdate(userId, { $unset: { activePromotion: 1 }, $set: { bonusBalance: 0 } });
//         return res.status(400).json({ message: "Promotion cancelled due to invalid game play." });
//     }

//     // **ইউজারের ব্যালেন্স আপডেট করুন**
//     await User.findByIdAndUpdate(userId, { $inc: { balance: -amount } });

//     // **লেনদেন সংরক্ষণ করুন**
//     await new Transaction({ userId, gameId, amount }).save();

//     // **অতিরিক্ত বোনাস চেক করুন**
//     const totalBet = await Transaction.aggregate([
//         { $match: { userId: user._id, timestamp: { $gte: new Date(Date.now() - promotion.bonusConditions.validTime) } } },
//         { $group: { _id: null, totalBet: { $sum: "$amount" } } }
//     ]);

//     if (totalBet.length > 0 && totalBet[0].totalBet >= promotion.bonusConditions.requiredBetAmount) {
//         await User.findByIdAndUpdate(userId, { $inc: { bonusBalance: promotion.bonusConditions.bonusReward } });
//         return res.json({ message: "Game played successfully! Extra bonus awarded!", bonus: promotion.bonusConditions.bonusReward });
//     }

//     res.json({ message: "Game played successfully!" });
// });







// //গেম খেলার সময় চেক করা checkPromotionStatus
// async function checkPromotionStatus(userId) {
//     try {
//       const result = await User.aggregate([
//         {
//           $match: { _id: new mongoose.Types.ObjectId(userId) }
//         },
//         {
//           $lookup: {
//             from: "promotions",
//             localField: "activePromotion",
//             foreignField: "_id",
//             as: "promotion"
//           }
//         },
//         {
//           $unwind: "$promotion"
//         },
//         {
//           $lookup: {
//             from: "bets",
//             localField: "_id",
//             foreignField: "userId",
//             as: "bets"
//           }
//         },
//         {
//           $lookup: {
//             from: "games",
//             localField: "bets.gameId",
//             foreignField: "_id",
//             as: "betGames"
//           }
//         },
//         {
//           $set: {
//             invalidBets: {
//               $filter: {
//                 input: "$betGames",
//                 as: "game",
//                 cond: { $not: { $in: ["$$game._id", "$promotion.validGames"] } }
//               }
//             }
//           }
//         },
//         {
//           $set: {
//             promotionStatus: {
//               $cond: {
//                 if: { $gt: [{ $size: "$invalidBets" }, 0] },
//                 then: "cancelled",
//                 else: "active"
//               }
//             }
//           }
//         },
//         {
//           $project: {
//             username: 1,
//             "promotion.name": 1,
//             "promotion.validGames": 1,
//             "bets.gameId": 1,
//             "betGames.name": 1,
//             invalidBets: 1,
//             promotionStatus: 1
//           }
//         }
//       ]);
  
//       // যদি প্রোমোশন বাতিল হয়, তাহলে ইউজার ডাটাবেজ আপডেট করা হবে
//       if (result.length > 0 && result[0].promotionStatus === "cancelled") {
//         await User.findByIdAndUpdate(userId, { promotionStatus: "cancelled" });
//         console.log("User's promotion cancelled due to invalid game play.");
//       }
  
//       return result;
//     } catch (error) {
//       console.error(error);
//     }
//   }



//   const isPromotionValid = (promotion) => {
//     const now = new Date();
//     return now >= new Date(promotion.startDate) && now <= new Date(promotion.endDate);
// };


// app.post("/api/game-play", async (req, res) => {
//     const { userId, gameId, amount } = req.body;

//     const user = await User.findById(userId);
//     if (!user || !user.activePromotion) {
//         return res.status(400).json({ message: "No active promotion found." });
//     }

//     const promotion = await Promotion.findById(user.activePromotion);
//     if (!promotion) {
//         return res.status(400).json({ message: "Invalid promotion." });
//     }

//     // **প্রোমোশন সময় চেক করুন**
//     if (!isPromotionValid(promotion)) {
//         await User.findByIdAndUpdate(userId, { $unset: { activePromotion: 1 } });
//         return res.status(400).json({ message: "Promotion expired." });
//     }

//     // **যাচাই করুন ইউজার অনুমোদিত গেম খেলছে কিনা**
//     if (!promotion.eligibleGames.includes(gameId)) {
//         await User.findByIdAndUpdate(userId, { $unset: { activePromotion: 1 }, $set: { bonusBalance: 0 } });
//         return res.status(400).json({ message: "Promotion cancelled due to invalid game play. Bonus removed." });
//     }

//     // **ইউজারের ব্যালেন্স আপডেট করুন**
//     const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { balance: -amount } }, { new: true });

//     // **লেনদেন সংরক্ষণ করুন**
//     await new Transaction({ userId, gameId, amount }).save();

//     res.json({ message: "Game played successfully!", balance: updatedUser.balance });
// });






// app.post("/api/game-play", async (req, res) => {
//     const { userId, gameId, amount } = req.body;

//     const user = await User.findById(userId);
//     if (!user || !user.activePromotion) {
//         return res.status(400).json({ message: "No active promotion found." });
//     }

//     const promotion = await Promotion.findById(user.activePromotion);
//     if (!promotion) {
//         return res.status(400).json({ message: "Invalid promotion." });
//     }

//     // **প্রোমোশন সময় চেক করুন**
//     if (!isPromotionValid(promotion)) {
//         await User.findByIdAndUpdate(userId, { $unset: { activePromotion: 1 } });
//         return res.status(400).json({ message: "Promotion expired." });
//     }

//     // **ভুল গেম চেক করুন**
//     if (!promotion.eligibleGames.includes(gameId)) {
//         await User.findByIdAndUpdate(userId, { $unset: { activePromotion: 1 }, $set: { bonusBalance: 0 } });
//         return res.status(400).json({ message: "Promotion cancelled due to invalid game play. Bonus removed." });
//     }

//     // **ইউজারের ব্যালেন্স আপডেট করুন**
//     await User.findByIdAndUpdate(userId, { $inc: { balance: -amount } });

//     // **লেনদেন সংরক্ষণ করুন**
//     const transaction = await new Transaction({ userId, gameId, amount }).save();

//     // **অতিরিক্ত বোনাস চেক করুন**
//     const totalBet = await Transaction.aggregate([
//         { $match: { userId: user._id, timestamp: { $gte: new Date(Date.now() - promotion.bonusConditions.validTime) } } },
//         { $group: { _id: null, totalBet: { $sum: "$amount" } } }
//     ]);

//     if (totalBet.length > 0 && totalBet[0].totalBet >= promotion.bonusConditions.requiredBetAmount) {
//         await User.findByIdAndUpdate(userId, { $inc: { bonusBalance: promotion.bonusConditions.bonusReward } });
//         return res.json({ message: "Game played successfully! Extra bonus awarded!", bonus: promotion.bonusConditions.bonusReward });
//     }

//     res.json({ message: "Game played successfully!" });
// });




//ip Chack


// app.get("/check-multiple-accounts", async (req, res) => {
//     const { userId } = req.query;

//     const user = await User.findById(userId);
    
//     // একই IP Address থেকে কয়টি অ্যাকাউন্ট বোনাস পেয়েছে তা চেক করুন
//     const duplicateAccounts = await User.countDocuments({
//         ipAddress: user.ipAddress,
//         receivedQuickBonus: true
//     });

//     if (duplicateAccounts > 1) {
//         return res.status(400).json({ message: "Fraud detected! Multiple accounts using the same IP." });
//     }

//     return res.json({ message: "No fraud detected." });
// });






// //যদি ব্যবহারকারী খুব দ্রুত এবং খুব কম সময়ের মধ্যে অনেক বড় অঙ্কে বাজি ধরে, তাহলে এটি প্রতারণার সম্ভাবনা।

// app.get("/check-betting-pattern", async (req, res) => {
//     const { userId } = req.query;
//     const suspiciousThreshold = 10; // ১০টি বাজি ১ মিনিটের মধ্যে

//     // সর্বশেষ ১ মিনিটের মধ্যে বাজির সংখ্যা চেক করুন
//     const suspiciousBets = await Bet.countDocuments({
//         userId,
//         createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // শেষ ১ মিনিট
//     });

//     if (suspiciousBets > suspiciousThreshold) {
//         return res.status(400).json({ message: "Fraud detected! Too many bets in a short time." });
//     }

//     return res.json({ message: "No fraud detected." });
// });









// exports.AbilityOfpromotion = ()=>{

// const now = new Date();
// const user = db.users.findOne({ _id: ObjectId("USER_ID") });

// if (user.activePromotion) {
//     const promotion = db.promotions.findOne({ _id: user.activePromotion });

//     // প্রোমোশন সময় চেক
//     if (now < promotion.startDate || now > promotion.endDate) {
//         db.users.updateOne(
//             { _id: ObjectId("USER_ID") },
//             { $unset: { activePromotion: "" } }
//         );
//         print("Promotion expired.");
//     } else {
//         // ভুল গেম খেললে প্রোমোশন বাতিল ও বোনাস মুছে ফেলা
//         if (!promotion.eligibleGames.includes("GAME_ID")) {
//             db.users.updateOne(
//                 { _id: ObjectId("USER_ID") },
//                 { $unset: { activePromotion: "" }, $set: { bonusBalance: 0 } }
//             );
//             print("Promotion cancelled due to invalid game play.");
//         } else {
//             // সঠিক গেম খেললে ইউজারের ব্যালেন্স আপডেট করুন
//             db.users.updateOne(
//                 { _id: ObjectId("USER_ID") },
//                 { $inc: { balance: -50 } }  // এখানে ৫০ হল বাজির পরিমাণ
//             );

//             // লেনদেন সংরক্ষণ করুন
//             db.transactions.insertOne({
//                 userId: ObjectId("USER_ID"),
//                 gameId: "GAME_ID",
//                 amount: 50,
//                 timestamp: now
//             });

//             print("Game played successfully!");
//         }
//     }
// }
// }


//প্রতারণার সন্দেহ হলে ব্যালেন্স বাজেয়াপ্ত করা


// app.post("/forfeit-balance", async (req, res) => {
//     const { userId } = req.body;

//     // প্রতারণা চেক করুন
//     const suspiciousActivity = await Transaction.find({ userId, suspicious: true });

//     if (suspiciousActivity.length > 0) {
//         await User.findByIdAndUpdate(userId, { balance: 0 });
//         return res.status(400).json({ message: "Fraud detected! Your balance has been forfeited." });
//     }

//     return res.json({ message: "No fraud detected." });
// });



//প্রথম ডিপোজিট চেক ও বোনাস প্রদান




// app.post("/deposit", async (req, res) => {
//     const { userId, amount, selectedPromo } = req.body;
    
//     // চেক করুন, ইউজার ইতিমধ্যে এই প্রোমো পেয়েছে কিনা
//     const user = await User.findById(userId);
//     if (user.receivedQuickBonus) {
//         return res.status(400).json({ message: "You have already claimed this bonus." });
//     }

//     // চেক করুন, ইউজার "৩০০ দ্রুত বোনাস" প্রোমো সিলেক্ট করেছে কিনা
//     if (selectedPromo !== "300 Quick Bonus") {
//         return res.status(400).json({ message: "Please select the correct promotion." });
//     }

//     // ন্যূনতম ৳৫০০ ডিপোজিট হয়েছে কিনা চেক করুন
//     if (amount < 500) {
//         return res.status(400).json({ message: "Minimum deposit of ৳500 required." });
//     }

//     // বোনাস প্রদান
//     await User.findByIdAndUpdate(userId, {
//         $inc: { balance: 300 },
//         receivedQuickBonus: true,
//         wageringRequirement: 3000, // ১০x বাজির জন্য (৩০০ × ১০)
//         completedWagering: 0
//     });

//     return res.json({ message: "Deposit successful! ৳300 bonus added." });
// });



//chack 24 hour bet

// const timeLimit = new Date();
// timeLimit.setHours(timeLimit.getHours() - 24); // গত ২৪ ঘণ্টার বেট চেক

// const totalBet = await Transaction.aggregate([
//     { $match: { userId, type: "bet", timestamp: { $gte: timeLimit } } },
//     { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
// ]);

// if (totalBet[0]?.totalAmount >= 50000) {
//     await User.findByIdAndUpdate(userId, { $inc: { balance: 500 } });
//     return res.json({ message: "Congrats! You received an extra ৳500 bonus." });
// }


//যদি ইউজার নির্দিষ্ট গেম ব্যতীত অন্য গেম খেলে, তাহলে বোনাস বাতিল হবে।
// যদি ইউজার বোনাস উইথড্র করার পূর্বে টার্নওভার পূরণ না করে, তাহলে বোনাস বাতিল হবে।




// const validGames = ["Slots", "Live Casino", "Sports", "Fishing"];
// const bet = await Transaction.findOne({ userId, type: "bet" });

// if (!validGames.includes(bet.product)) {
//     await User.findByIdAndUpdate(userId, { receivedBonus: false, $inc: { balance: -bonus.bonusAmount } });
//     return res.status(400).json({ message: "Bonus canceled due to playing an invalid game." });
// }

// if (bet.amount < bonus.wageringRequirement * bonus.bonusAmount) {
//     return res.status(400).json({ message: "You must meet the wagering requirement to withdraw the bonus." });
// }







//ইউজার লগইন করলে স্ট্রিক আপডেট হবে।


//ইউজার যখন লগইন করবে, চেক করতে হবে সে আগের দিনে লগইন করেছিল কিনা।
//যদি আগের দিনে লগইন করা থাকে, তাহলে streak +1 হবে।
//যদি আগের দিনে লগইন না করে তাহলে streak reset (1) হবে।

// const now = new Date();
// const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;

// if (lastLogin && now.toDateString() === lastLogin.toDateString()) {
//     return res.status(400).json({ message: "Already logged in today!" });
// }

// let newStreak = lastLogin && (now - lastLogin) <= 86400000 ? user.loginStreak + 1 : 1;

// await User.findByIdAndUpdate(userId, {
//     loginStreak: newStreak,
//     lastLogin: now
// });




//bonusController.js


// const User = require("../models/userModel");
// const Bonus = require("../models/bonusModel");

// exports.checkBonusEligibility = async (req, res) => {
//     const { userId } = req.body;
//     try {
//         const user = await User.findById(userId);
//         const bonus = await Bonus.findOne();

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         if (user.receivedBonus) {
//             return res.status(400).json({ message: "Bonus already claimed." });
//         }

//         if (user.loginStreak < bonus.requiredDays) {
//             return res.status(400).json({ message: `You must login for ${bonus.requiredDays} days.` });
//         }

//         if (user.totalDeposit < bonus.requiredDeposit) {
//             return res.status(400).json({ message: `You need to deposit at least ৳${bonus.requiredDeposit}.` });
//         }

//         await User.findByIdAndUpdate(userId, {
//             $inc: { balance: bonus.bonusAmount },
//             receivedBonus: true
//         });

//         res.json({ message: `Bonus of ৳${bonus.bonusAmount} credited to your account!` });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
