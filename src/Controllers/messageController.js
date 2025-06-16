// const jwt = require("jsonwebtoken");
// const User = require("../Models/User");
// const Message = require("../Models/Message");
// const SubAdmin = require("../Models/SubAdminModel");
// const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

// exports.getChatContacts = async (userId) => {
//      console.log("getChatContacts   -           -             -userId",userId);
//     const user = await SubAdmin.findOne({ email : userId.senderId }) || await User.findOne({ userId });
//     const regularUser = await User.findOne({ userId: userId });
//     // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------1",user);
//     if (!user) return [];
// // console.log("getAllowedContacts-------------------------------------------1",user);
//     if (user.role === 'admin') {
//       return await User.find({});
//     }

//     if (user.user_role === 'subAdmin') {
//       const referrals = await User.find({ 
//         $or: [
//           { referredBy: user.referralCode },
//           { referredbysubAdmin: user.SubAdminId }
//         ]
//       });
//       // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin-",referrals);
//       const upline = await User.find({ referredBy : user.referralCode });
//     //   const Downline = await User.find({ referredBy : upline.referralCode });
//     //   const DownlineSecond = await User.find({ referredBy : Downline.referralCode });
//     //   const DownlineThird = await User.find({ referredBy :  DownlineSecond.referralCode });
//     //   // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------2",upline);
//       if (upline) referrals.push(upline);
//     //   if (Downline) referrals.push(Downline);
//     //   if (DownlineSecond) referrals.push(DownlineSecond);
//     //   if (DownlineThird) referrals.push(DownlineThird);

//       // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------3",referrals);
//       return referrals;
//     }

//     // For regular users
      
//     //   const Downline = await User.find({ referredBy : upline.referralCode });
//     //   const DownlineSecond = await User.find({ referredBy : Downline.referralCode });
//     //   const DownlineThird = await User.find({ referredBy :  DownlineSecond.referralCode });
//     //   const upline = await SubAdmin.find({ referralCode : user.referredBy });
//     //   // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------2",upline);
//     //   if (upline) referrals.push(upline);
//     //   if (Downline) referrals.push(Downline);
//     //   if (DownlineSecond) referrals.push(DownlineSecond);
//     //   if (DownlineThird) referrals.push(DownlineThird);
//     return referrals;
// };

// exports.getAllowedReceivers = async (senderId,toUserId) => {
//     console.log("user", senderId, toUserId);
//   const allowed = new Set();

// //   if (user.role === "admin") {
// //     const users = await User.find({ userId: { $ne: user.userId } });
// //     users.forEach(u => allowed.add(u.userId));
// //     return [...allowed];
// //   }



// const users = await SubAdmin.find({ email: senderId  }) || await User.findOne({ userId: senderId });
// console.log("users", users);
// if (!users) return [];

//   const downline = await User.find({ referredBy:users.referralCode });
//   downline.forEach(u => allowed.add(u.userId));
// console.log("downline", downline);
//   const upline = await User.findOne({ referralCode: users.referredBy });
//   if (upline) allowed.add(upline.userId);



  

//   return [...allowed];
// };

// // ... [include all other controller methods from your code]