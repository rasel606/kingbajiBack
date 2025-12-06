// const getAllowedContacts = require('./chatService');
// const ChatService = require('./chatService');


// module.exports = (io) => {
//   io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.user.email}`);
// console.log("Chatsocket", socket.user.email);
//     // Join user's personal room
//     socket.join(socket.user.email || socket.user.userId);
// console.log("socket.user", socket.user.email || socket.user.userId);
//     // Handle getting chat history
//     socket.on('getChatHistory', async (receiverId, callback) => {
//       try {
//         const messages = await ChatService.getChatHistory(
//           socket.user.userId, 
//           receiverId
//         );
//         console.log("messages", messages);
//         callback({ status: 'success', messages });
//       } catch (err) {
//         callback({ status: 'error', message: err.message });
//       }
//     });

//     // Handle sending messages
//     socket.on('sendMessage', async ({ receiverId, content }, callback) => {
//        console.log(receiverId, socket.user.userId,"allowedContacts----------------------7", content);
//       try {
//         // Check if receiver is allowed
//         const allowedContacts = await ChatService.getAllowedContacts(socket.user.email || socket.user.userId);
//         console.log("allowedContacts", allowedContacts);
//         const isAllowed = allowedContacts.some(user => user.userId === receiverId);
        
//         if (!isAllowed) {
//           throw new Error('You are not allowed to chat with this user');
//         }

//         const message = await ChatService.saveMessage(
//           socket.user.email || socket.user.userId,
//           receiverId,
//           content
//         );
//         // Emit to sender and receiver
//         io.to(socket.user.email ).emit('newMessage', message);
//         io.to(receiverId).emit('newMessage', message);

//         callback({ status: 'success', message });
//       } catch (err) {
//         callback({ status: 'error', message: err.message });
//       }
//     });

//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.user.userId}`);
//     });
//   });
// };