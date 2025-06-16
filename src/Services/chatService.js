// const Message = require("../Models/Message");
// const SubAdmin = require("../Models/SubAdminModel");
// const User = require("../Models/User");


// // class ChatService {
// //   static async getAllowedContacts(userId) {

// //     console.log("getAllowedContacts   -           -             -userId", userId);
// //     const user = await User.findOne({ userId:userId }) ||
// //       await SubAdmin.findOne({ email: userId });
// //     // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------1",user);
// //     if (!user) return [];
// //     // console.log("getAllowedContacts-------------------------------------------1",user);
// //     if (user.role === 'admin') {
// //       return await User.find({});
// //     }

// //   if (user.role === 'subAdmin') {

// //   const referrals = await User.find({ 
// //         $or: [
// //           { referredBy: user.referralCode },
// //           { referredbysubAdmin: user.SubAdminId }
// //         ]
// //       });

// //        const upline = await User.find({ referredBy : user.referralCode });
// //     // const Downline = await User.find({ referredBy: user.referralCode });
// //     // const DownlineSecond = await User.find({ referredBy: Downline.referralCode });
// //     // const DownlineThird = await User.find({ referredBy: DownlineSecond.referralCode });
// //     // const upline = await SubAdmin.find({ referralCode: user.referredBy });
// //     // const uplineSecond = await SubAdmin.find({ referralCode: DownlineSecond.referredBy });
// //     // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------2",upline);
// //     if (upline) referrals.push(upline);
// //     // if (Downline) referrals.push(Downline);
// //     // if (DownlineSecond) referrals.push(DownlineSecond);
// //     // if (DownlineThird) referrals.push(DownlineThird);
// //     // if (uplineSecond) referrals.push(uplineSecond);

// //     console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------3", referrals);
// //     return referrals;
// //   }

// //   // For regular users
// //   // const referrals = await User.find({ referredBy: user.referralCode });
// //   // const upline = await User.findOne({  referredBy: user.referralCode });
// //   // if (upline) referrals.push(upline);
// //   // return referrals;
// //   }

// //   static async getChatHistory(senderId, receiverId) {
// //   console.log("getChatHistory----------------------------------------------1", senderId, receiverId);
// //   return Message.find({
// //     $or: [
// //       { sender: senderId, receiver: receiverId },
// //       { sender: receiverId, receiver: senderId }
// //     ]
// //   }).sort({ createdAt: 1 });
// // }

// //   static async saveMessage(senderId, receiverId, content) {
// //   const message = new Message({
// //     sender: senderId,
// //     receiver: receiverId,
// //     content
// //   });
// //   return message.save();
// // }
// // }




// class ChatService {
//   static async getAllowedContacts(userId) {

//     console.log("getAllowedContacts   -           -             -userId",userId);
//     const user = await SubAdmin.findOne({ email : userId });
//     // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------1",user);
//     if (!user) return [];
// // console.log("getAllowedContacts-------------------------------------------1",user);
//     if (user.role === 'admin') {
//       return await User.find({});
//     }
// // 
//     if (user.user_role === 'subAdmin') {
//       const referrals = await User.find({ 
//         $or: [
//           { referredBy: user.referralCode },
//           { referredbysubAdmin: user.SubAdminId }
//         ]
//       });
//       console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin-",referrals);
//       const upline = await User.find({ referredBy : user.referralCode });
//       // console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------2",upline);
//       if (upline) referrals.push(upline);

//       console.log("getAllowedContacts----------------- SubAdminSubAdminSubAdminSubAdmin--------------------------3",referrals);
//       return referrals;
//     }

//     // For regular users
//     // const referrals = await User.find({ referredBy: user.referralCode });
//     // const upline = await User.findOne({  referredBy: user.referralCode });
//     // if (upline) referrals.push(upline);
//     // return referrals;
//   }

//   static async getChatHistory(senderId, receiverId) {
//     console.log("getChatHistory----------------------------------------------1",senderId, receiverId);
//     return Message.find({
//       $or: [
//         { sender: senderId, receiver: receiverId },
//         { sender: receiverId, receiver: senderId }
//       ]
//     }).sort({ createdAt: 1 });
//   }

//   static async saveMessage(senderId, receiverId, content) {
//     const message = new Message({
//       sender: senderId,
//       receiver: receiverId,
//       content
//     });
//     return message.save();
//   }
// }

// module.exports = ChatService;
