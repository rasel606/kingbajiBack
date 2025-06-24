



// রিবেট সেট API
// router.post("/set-rebate", async (req, res) => {
//     try {
//       const { userId, providerId, gameId, rebateAmount, duration } = req.body;
  
//       const nextRebateTime = new Date();
//       nextRebateTime.setMinutes(nextRebateTime.getMinutes() + duration); // সময় সেট
  
//       const rebate = new Rebate({
//         userId,
//         providerId,
//         gameId,
//         rebateAmount,
//         nextRebateTime
//       });
  
//       await rebate.save();
//       res.status(201).json({ message: "Rebate set successfully", rebate });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

  


//   const cron = require("node-cron");
// const Rebate = require("../models/rebate");
// const User = require("../Models/User");

// // প্রতি ১ মিনিটে চেক করবে
// cron.schedule("*/1 * * * *", async () => {
//   console.log("Checking rebates...");

//   const now = new Date();
//   const pendingRebates = await Rebate.find({ status: "pending", nextRebateTime: { $lte: now } });

//   for (let rebate of pendingRebates) {
//     // এখানে ইউজারের ব্যালেন্সে টাকা যোগ করার লজিক বসাতে হবে
//     console.log(`Rebate paid: ${rebate.rebateAmount} for user ${rebate.userId}`);

//     // আপডেট করে পেইড স্ট্যাটাস দেওয়া
//     await Rebate.updateOne({ _id: rebate._id }, { $set: { status: "paid" } });
//   }
// });




// // প্রতি ১ মিনিটে চেক করবে
// cron.schedule("*/1 * * * *", async () => {
//     console.log("Checking rebates...");
  
//     const now = new Date();
//     const pendingRebates = await Rebate.find({ status: "pending", nextRebateTime: { $lte: now } });
  
//     for (let rebate of pendingRebates) {
//       // ইউজারের তথ্য খুঁজে বের করা
//       const user = await User.findById(rebate.userId);
  
//       if (!user) {
//         console.log(`User not found for rebate: ${rebate.userId}`);
//         continue;
//       }
  
//       // ইউজারের ব্যালেন্সে রিবেট যোগ করা
//       user.balance += rebate.rebateAmount;
  
//       // ব্যালেন্স আপডেট করা
//       await user.save();
  
//       // রিবেটের স্ট্যাটাস পেইড করা
//       await Rebate.updateOne({ _id: rebate._id }, { $set: { status: "paid" } });
  
//       console.log(`Rebate of ${rebate.rebateAmount} paid to user ${rebate.userId}. New balance: ${user.balance}`);
//     }
//   });