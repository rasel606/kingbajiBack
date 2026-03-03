
// const jwt = require("jsonwebtoken");
// const { getAllowedReceivers } = require("../controllers/messageController");
// const User = require("../Models/User");
// const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
// const connectedUsers = new Map();

// const verifyUser = async (token) => {
//   try {
//     const decoded = jwt.verify(token,JWT_SECRET);
//     console.log("verifyUser---1",decoded);
//     const user = await User.findOne({ email: decoded.email });
//     return 
//   } catch {
//     return null;
//   }
// };

// const chatSocketHandler = (io) => {
//   io.on("connection", async (socket) => {
//     const token = socket.handshake.auth?.token;
//     console.log("getAllowedReceivers ---------------------",token);
//     const user = await verifyUser(token);
//     console.log("getAllowedReceivers ---------------------verifyUser",user);
//     if (!user) return socket.disconnect();

//     connectedUsers.set(user.email, socket.id);
//     console.log(`${user.email} connected`);

//     socket.on("send_message", async ({senderId, toUserId, content, file }) => {
//       console.log("getAllowedReceivers ---------------------toUserId",toUserId);
//       const allowedReceivers = await getAllowedReceivers(senderId,toUserId);
//  console.log(senderId,"getAllowedReceivers ---------------------toUserId",allowedReceivers);
//       if (!allowedReceivers.includes(toUserId)) {
//         return socket.emit("error", { message: "Not authorized to chat with this user." });
//       }
// console.log("toUserId",toUserId);
//       const newMessage = new Message({
//         sender: user.email,
//         receiver: toUserId,
//         content,
//         file,
//       });

//       await newMessage.save();

//       const receiverSocketId = connectedUsers.get(toUserId);
//       console.log("receiverSocketId",receiverSocketId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("receive_message", {
//           sender: user.email,
//           content,
//           file,
//         });
//       }
//     });
//     console.log(connectedUsers);

//     socket.on("disconnect", () => {
//       connectedUsers.delete(user.userId);
//       console.log(`${user.userId} disconnected`);
//     });
//   });
// };

// module.exports = chatSocketHandler;
// // 