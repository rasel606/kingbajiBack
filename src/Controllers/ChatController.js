// const jwt = require("jsonwebtoken");
// const User = require("../Models/User");
// const Message = require("../Models/Message");
// const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
// exports.getChatContacts = async (userId) => {
//   const user = await User.findOne({ userId });
//   if (!user) return [];

//   if (user.role === "admin") {
//     return await User.find({ userId: { $ne: userId } });
//   }

//   const contacts = await User.find({ referredBy: user.referralCode });
//   if (user.role === "user") {
//     const referrer = await User.findOne({ referralCode: user.referredBy });
//     if (referrer) contacts.push(referrer);
//   }

//   return contacts;
// };

// exports.getAllowedReceivers = async (user) => {
//   const allowed = new Set();

//   if (user.role === "admin") {
//     const users = await User.find({ userId: { $ne: user.userId } });
//     users.forEach(u => allowed.add(u.userId));
//     return [...allowed];
//   }

//   const downline = await User.find({ referredBy: user.referralCode });
//   downline.forEach(u => allowed.add(u.userId));

//   const upline = await User.findOne({ referralCode: user.referredBy });
//   if (upline) allowed.add(upline.userId);

//   return [...allowed];
// };

// exports.getChatHistory = async (req, res) => {
//   console.log(req.params.userId);
//   try {
//     // const token = req.headers.authorization?.split(" ")[1];
//     // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const currentUserId = decoded.userId;
//     const otherUserId = req.params.userId;
// console.log("currentUserId",currentUserId);
// console.log(otherUserId);
//     const messages = await Message.find({
//       $or: [
//         { sender: currentUserId, receiver: otherUserId },
//         { sender: otherUserId, receiver: currentUserId },
//       ]
//     }).sort({ createdAt: 1 });

//     res.json({ messages });
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// exports.getReferralChat = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

//     const { user1Id, user2Id } = req.params;
//     const user1 = await User.findById(user1Id);
//     const user2 = await User.findById(user2Id);

//     if (
//       user1.referredBy !== decoded.userId &&
//       user2.referredBy !== decoded.userId
//     ) {
//       return res.status(403).json({ error: "Not in your referral network" });
//     }

//     const messages = await Message.find({
//       $or: [
//         { sender: user1Id, receiver: user2Id },
//         { sender: user2Id, receiver: user1Id },
//       ]
//     }).sort({ createdAt: 1 });

//     res.json({ messages });
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// exports.getChatList = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;

//     const messages = await Message.aggregate([
//       { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
//       { $sort: { createdAt: -1 } },
//       {
//         $group: {
//           _id: {
//             sender: "$sender",
//             receiver: "$receiver"
//           },
//           lastMessage: { $first: "$content" },
//           lastTimestamp: { $first: "$createdAt" }
//         }
//       }
//     ]);

//     const chatMap = new Map();

//     for (const msg of messages) {
//       const otherUserId = msg._id.sender === userId ? msg._id.receiver : msg._id.sender;
//       if (!chatMap.has(otherUserId)) {
//         chatMap.set(otherUserId, {
//           userId: otherUserId,
//           lastMessage: msg.lastMessage,
//           lastTimestamp: msg.lastTimestamp
//         });
//       }
//     }

//     const chatList = [];
//     for (const [otherUserId, data] of chatMap.entries()) {
//       const user = await User.findOne({ userId: otherUserId }).select("username role");
//       chatList.push({
//         userId: otherUserId,
//         username: user?.username || "Unknown",
//         role: user?.role || "user",
//         lastMessage: data.lastMessage,
//         lastTimestamp: data.lastTimestamp
//       });
//     }

//     chatList.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));

//     res.json({ chatList });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };