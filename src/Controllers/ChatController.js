// // const { ChatRoom, FixedReply } = require('../Models/Chat');
// // const User = require('../Models/User');
// // const AdminModel = require('../Models/AdminModel');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');
// // const { v4: uuidv4 } = require('uuid');
// // const { getChatSocket } = require('../socket/socketManager');
// // // Ensure uploads directory exists
// // const uploadsDir = 'uploads/chat';
// // if (!fs.existsSync(uploadsDir)) {
// //   fs.mkdirSync(uploadsDir, { recursive: true });
// // }

// // // Multer configuration for file uploads
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, uploadsDir);
// //   },
// //   filename: function (req, file, cb) {
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
// //   }
// // });

// // const fileFilter = (req, file, cb) => {
// //   const allowedTypes = [
// //     'image/jpeg', 
// //     'image/png', 
// //     'image/gif',
// //     'application/pdf',
// //     'application/msword',
// //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// //     'text/plain'
// //   ];
  
// //   if (allowedTypes.includes(file.mimetype)) {
// //     cb(null, true);
// //   } else {
// //     cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
// //   }
// // };

// // const upload = multer({ 
// //   storage: storage,
// //   limits: {
// //     fileSize: 10 * 1024 * 1024 // 10MB limit
// //   },
// //   fileFilter: fileFilter
// // });

// // class ChatController {
  
// //   // ✅ User নতুন Chat শুরু করবে
// //   static async startChat(req, res) {
// //     try {
// //       const { message } = req.body;
// //       const userId = req.user.userId;
      
// //       const user = await User.findOne({ userId });
// //       if (!user) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "User not found" 
// //         });
// //       }

// //       // Check if user already has an active chat
// //       const existingChat = await ChatRoom.findOne({ 
// //         userId, 
// //         status: { $in: ['active', 'waiting'] } 
// //       });

// //       if (existingChat) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "You already have an active chat",
// //           roomId: existingChat.roomId
// //         });
// //       }

// //       // নতুন Chat Room তৈরি করব
// //       const roomId = `chat_${userId}_${Date.now()}`;
      
// //       const newChatRoom = new ChatRoom({
// //         roomId,
// //         userId,
// //         userName: user.name || `User_${userId}`,
// //         status: 'waiting',
// //         messages: [{
// //           senderId: userId,
// //           senderType: 'user',
// //           senderName: user.name || `User_${userId}`,
// //           message: message,
// //           read: false
// //         }],
// //         lastMessage: message,
// //         lastMessageTime: new Date()
// //       });

// //       await newChatRoom.save();

// //       // Socket notification for admins
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.notifyAdmins('new_chat_created', {
// //           roomId: newChatRoom.roomId,
// //           userName: newChatRoom.userName,
// //           message: message,
// //           timestamp: new Date()
// //         });
// //       }

// //       res.status(201).json({
// //         success: true,
// //         message: "Chat started successfully",
// //         roomId: newChatRoom.roomId,
// //         chat: newChatRoom
// //       });

// //     } catch (error) {
// //       console.error("Start chat error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ User File Upload
// //   static async uploadFile(req, res) {
// //     try {
// //       upload.single('file')(req, res, async function (err) {
// //         if (err) {
// //           return res.status(400).json({ 
// //             success: false, 
// //             message: err.message 
// //           });
// //         }

// //         if (!req.file) {
// //           return res.status(400).json({ 
// //             success: false, 
// //             message: "No file uploaded" 
// //           });
// //         }

// //         const fileData = {
// //           filename: req.file.filename,
// //           originalName: req.file.originalname,
// //           mimeType: req.file.mimetype,
// //           size: req.file.size,
// //           url: `/uploads/chat/${req.file.filename}`
// //         };

// //         res.status(200).json({
// //           success: true,
// //           message: "File uploaded successfully",
// //           file: fileData
// //         });
// //       });
// //     } catch (error) {
// //       console.error("File upload error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "File upload failed" 
// //       });
// //     }
// //   }

// //   // ✅ User Send Message with File
// //   static async sendMessageWithFile(req, res) {
// //     try {
// //       const { roomId, message, attachment, messageType = 'text' } = req.body;
// //       const userId = req.user.userId;
// // const chatSocket = getChatSocket();
// //     if (chatSocket) {
// //       chatSocket.to(roomId).emit('new_message', newMessage);
// //     }
// //       const chatRoom = await ChatRoom.findOne({ roomId, userId });
// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       if (chatRoom.status === 'closed') {
// //         return res.status(400).json({ 
// //           success: false, 
// //           message: "This chat is closed" 
// //         });
// //       }

// //       const user = await User.findOne({ userId });

// //       const newMessage = {
// //         senderId: userId,
// //         senderType: 'user',
// //         senderName: user.name || `User_${userId}`,
// //         message: message,
// //         attachment: attachment,
// //         messageType: messageType,
// //         read: false,
// //         timestamp: new Date()
// //       };

// //       chatRoom.messages.push(newMessage);
// //       chatRoom.lastMessage = message || `Sent a ${attachment ? 'file' : 'message'}`;
// //       chatRoom.lastMessageTime = new Date();
// //       chatRoom.updatedAt = new Date();
      
// //       // Increment admin unread count
// //       chatRoom.unreadCount.admin = (chatRoom.unreadCount.admin || 0) + 1;

// //       await chatRoom.save();

// //       // Real-time event emit
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.sendToRoom(roomId, 'new_message', newMessage);
        
// //         // Notify admins about new message
// //         if (!chatRoom.adminId) {
// //           socketIO.notifyAdmins('new_chat_message', {
// //             roomId,
// //             message: message || 'New file uploaded',
// //             userName: chatRoom.userName,
// //             timestamp: new Date()
// //           });
// //         }
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Message sent successfully",
// //         newMessage
// //       });

// //     } catch (error) {
// //       console.error("Send message error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

  

// //   // ✅ User তার Chat History দেখবে
// //   static async getUserChatHistory(req, res) {
// //     try {
// //       const userId = req.user.userId;
// //       const { page = 1, limit = 50 } = req.query;

// //       const chatRooms = await ChatRoom.find({ userId })
// //         .sort({ lastMessageTime: -1 })
// //         .limit(limit * 1)
// //         .skip((page - 1) * limit)
// //         .select('roomId status lastMessage lastMessageTime createdAt adminName unreadCount');

// //       res.status(200).json({
// //         success: true,
// //         chatRooms,
// //         currentPage: page,
// //         totalPages: Math.ceil(await ChatRoom.countDocuments({ userId }) / limit)
// //       });

// //     } catch (error) {
// //       console.error("Chat history error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ User নির্দিষ্ট Chat Room এর Messages দেখবে
// //   static async getChatMessages(req, res) {
// //     try {
// //       const { roomId } = req.params;
// //       const userId = req.user.userId;

// //       const chatRoom = await ChatRoom.findOne({ roomId, userId });
// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         chatRoom
// //       });

// //     } catch (error) {
// //       console.error("Get chat error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ User Chat Close করবে
// //   static async userCloseChat(req, res) {
// //     try {
// //       const { roomId } = req.body;
// //       const userId = req.user.userId;

// //       const chatRoom = await ChatRoom.findOne({ roomId, userId });
// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       chatRoom.status = 'closed';
// //       chatRoom.updatedAt = new Date();
// //       await chatRoom.save();

// //       // Real-time event emit করব
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.sendToRoom(roomId, 'chat_closed', { 
// //           roomId, 
// //           closedBy: 'user',
// //           timestamp: new Date()
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Chat closed successfully"
// //       });

// //     } catch (error) {
// //       console.error("Close chat error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ Mark Messages as Read
// //   static async markMessagesAsRead(req, res) {
// //     try {
// //       const { roomId } = req.body;
// //       const userId = req.user.userId;
// //       const userType = req.user.role === 'user' ? 'user' : 'admin';

// //       const chatRoom = await ChatRoom.findOne({ roomId });
// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       // Mark messages as read
// //       let unreadCount = 0;
// //       chatRoom.messages.forEach(msg => {
// //         if (msg.senderType !== userType && !msg.read) {
// //           msg.read = true;
// //           msg.readBy.push({
// //             userId: userId,
// //             readAt: new Date()
// //           });
// //           unreadCount++;
// //         }
// //       });

// //       // Update last seen
// //       chatRoom.lastSeen[userType] = new Date();
      
// //       // Reset unread count for this user type
// //       if (userType === 'user') {
// //         chatRoom.unreadCount.user = 0;
// //       } else {
// //         chatRoom.unreadCount.admin = 0;
// //       }

// //       await chatRoom.save();

// //       // Real-time event
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.sendToRoom(roomId, 'messages_read', {
// //           userId,
// //           userType,
// //           readAt: new Date()
// //         });

// //         // Update unread counts for all in room
// //         socketIO.sendToRoom(roomId, 'unread_update', {
// //           roomId,
// //           unreadCount: chatRoom.unreadCount
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Messages marked as read",
// //         unreadCount
// //       });

// //     } catch (error) {
// //       console.error("Mark as read error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ Admin সব Active/Waiting Chat Room দেখবে
// //   static async getAdminChats(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { status, sortBy, page = 1, limit = 20 } = req.query;
      
// //       let filter = {};
// //       if (status && status !== 'all') {
// //         filter.status = status;
// //       } else {
// //         filter.status = { $in: ['active', 'waiting'] };
// //       }

// //       let sort = { lastMessageTime: -1 };
// //       if (sortBy === 'unread') {
// //         sort = { 'unreadCount.admin': -1, lastMessageTime: -1 };
// //       }

// //       const chatRooms = await ChatRoom.find(filter)
// //         .sort(sort)
// //         .limit(limit * 1)
// //         .skip((page - 1) * limit)
// //         .select('roomId userId userName adminId adminName status lastMessage lastMessageTime createdAt unreadCount');

// //       res.status(200).json({
// //         success: true,
// //         chatRooms,
// //         currentPage: page,
// //         totalPages: Math.ceil(await ChatRoom.countDocuments(filter) / limit)
// //       });

// //     } catch (error) {
// //       console.error("Admin chats error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ Admin Chat Room Assign করবে নিজের কাছে
// //   static async assignChatToAdmin(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { roomId } = req.body;
// //       const adminId = req.user.userId;

// //       const admin = await AdminModel.findOne({ userId: adminId });
// //       if (!admin) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Admin not found" 
// //         });
// //       }

// //       const chatRoom = await ChatRoom.findOne({ roomId });
// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       if (chatRoom.adminId && chatRoom.adminId !== adminId) {
// //         return res.status(400).json({ 
// //           success: false, 
// //           message: "Chat already assigned to another admin" 
// //         });
// //       }

// //       chatRoom.adminId = adminId;
// //       chatRoom.adminName = admin.firstName || `Admin_${adminId}`;
// //       chatRoom.status = 'active';
// //       chatRoom.updatedAt = new Date();

// //       await chatRoom.save();

// //       // Real-time event emit করব
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.sendToRoom(roomId, 'admin_joined_chat', {
// //           adminId,
// //           adminName: chatRoom.adminName,
// //           timestamp: new Date()
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Chat assigned successfully",
// //         chatRoom
// //       });

// //     } catch (error) {
// //       console.error("Assign chat error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ Admin Message পাঠাবে
// //   static async adminSendMessage(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { roomId, message } = req.body;
// //       const adminId = req.user.userId;

// //       const admin = await AdminModel.findOne({ userId: adminId });
// //       const chatRoom = await ChatRoom.findOne({ roomId });

// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       const newMessage = {
// //         senderId: adminId,
// //         senderType: 'admin',
// //         senderName: admin.firstName || `Admin_${adminId}`,
// //         message: message,
// //         read: false,
// //         timestamp: new Date()
// //       };

// //       chatRoom.messages.push(newMessage);
// //       chatRoom.lastMessage = message;
// //       chatRoom.lastMessageTime = new Date();
// //       chatRoom.updatedAt = new Date();
// //       chatRoom.unreadCount.user = (chatRoom.unreadCount.user || 0) + 1;

// //       await chatRoom.save();

// //       // Real-time event emit করব
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.sendToRoom(roomId, 'new_message', newMessage);
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Message sent successfully",
// //         newMessage
// //       });

// //     } catch (error) {
// //       console.error("Admin send message error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ Admin Chat Room Close করবে
// //   static async adminCloseChat(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { roomId } = req.body;
// //       const adminId = req.user.userId;

// //       const chatRoom = await ChatRoom.findOne({ roomId });
// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       chatRoom.status = 'closed';
// //       chatRoom.updatedAt = new Date();
// //       await chatRoom.save();

// //       // Real-time event emit করব
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.sendToRoom(roomId, 'chat_closed', { 
// //           roomId, 
// //           closedBy: 'admin',
// //           timestamp: new Date()
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Chat closed successfully"
// //       });

// //     } catch (error) {
// //       console.error("Admin close chat error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // ✅ Fixed Reply Routes

// //   // Get all fixed replies
// //   static async getAllFixedReplies(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { category, page = 1, limit = 50 } = req.query;
      
// //       let filter = { isActive: true };
// //       if (category && category !== 'all') {
// //         filter.category = category;
// //       }

// //       const fixedReplies = await FixedReply.find(filter)
// //         .sort({ usedCount: -1, createdAt: -1 })
// //         .limit(limit * 1)
// //         .skip((page - 1) * limit);

// //       const total = await FixedReply.countDocuments(filter);

// //       res.status(200).json({
// //         success: true,
// //         fixedReplies,
// //         currentPage: page,
// //         totalPages: Math.ceil(total / limit),
// //         total
// //       });

// //     } catch (error) {
// //       console.error("Get fixed replies error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // Create fixed reply
// //   static async createFixedReply(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { title, message, category = 'general' } = req.body;

// //       const fixedReply = new FixedReply({
// //         title,
// //         message,
// //         category,
// //         createdBy: req.user.userId
// //       });

// //       await fixedReply.save();

// //       res.status(201).json({
// //         success: true,
// //         message: "Fixed reply created successfully",
// //         fixedReply
// //       });

// //     } catch (error) {
// //       console.error("Create fixed reply error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // Use fixed reply in chat
// //   static async useFixedReplyInChat(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { roomId, fixedReplyId } = req.body;
// //       const adminId = req.user.userId;

// //       const fixedReply = await FixedReply.findById(fixedReplyId);
// //       if (!fixedReply) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Fixed reply not found" 
// //         });
// //       }

// //       const chatRoom = await ChatRoom.findOne({ roomId });
// //       if (!chatRoom) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Chat room not found" 
// //         });
// //       }

// //       const admin = await AdminModel.findOne({ userId: adminId });

// //       const newMessage = {
// //         senderId: adminId,
// //         senderType: 'admin',
// //         senderName: admin.firstName || `Admin_${adminId}`,
// //         message: fixedReply.message,
// //         messageType: 'fixed_reply',
// //         fixedReplyId: fixedReplyId,
// //         read: false,
// //         timestamp: new Date()
// //       };

// //       chatRoom.messages.push(newMessage);
// //       chatRoom.lastMessage = fixedReply.message;
// //       chatRoom.lastMessageTime = new Date();
// //       chatRoom.updatedAt = new Date();
// //       chatRoom.unreadCount.user = (chatRoom.unreadCount.user || 0) + 1;

// //       await chatRoom.save();

// //       // Increment used count
// //       fixedReply.usedCount += 1;
// //       await fixedReply.save();

// //       // Real-time event
// //       if (req.app.get('socketio')) {
// //         const socketIO = req.app.get('socketio');
// //         socketIO.sendToRoom(roomId, 'new_message', newMessage);
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Fixed reply sent successfully",
// //         newMessage
// //       });

// //     } catch (error) {
// //       console.error("Use fixed reply error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // Update fixed reply
// //   static async updateFixedReply(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const { title, message, category, isActive } = req.body;

// //       const fixedReply = await FixedReply.findByIdAndUpdate(
// //         req.params.id,
// //         {
// //           title,
// //           message,
// //           category,
// //           isActive,
// //           updatedAt: new Date()
// //         },
// //         { new: true }
// //       );

// //       if (!fixedReply) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Fixed reply not found" 
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Fixed reply updated successfully",
// //         fixedReply
// //       });

// //     } catch (error) {
// //       console.error("Update fixed reply error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }

// //   // Delete fixed reply
// //   static async deleteFixedReply(req, res) {
// //     try {
// //       if (req.user.role !== 'Admin' && req.user.role !== 'SubAdmin') {
// //         return res.status(403).json({ 
// //           success: false, 
// //           message: "Access denied" 
// //         });
// //       }

// //       const fixedReply = await FixedReply.findByIdAndDelete(req.params.id);

// //       if (!fixedReply) {
// //         return res.status(404).json({ 
// //           success: false, 
// //           message: "Fixed reply not found" 
// //         });
// //       }

// //       res.status(200).json({
// //         success: true,
// //         message: "Fixed reply deleted successfully"
// //       });

// //     } catch (error) {
// //       console.error("Delete fixed reply error:", error);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: "Internal server error" 
// //       });
// //     }
// //   }
// // }

// // module.exports = ChatController;


// const express = require('express');
// const ChatRoom = require('../Models/Chat');
// const FixedReply = require('../Models/FixedReply');
// const User = require('../Models/User');
// const upload = require('../MiddleWare/upload');
// // const { adminMiddleware } = require('../middleware/auth');
// const { sendToRoom, notifyAdmins } = require('../socket/socketServer');


// // User starts a new chat
// exports.startChat = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const userId = req.user.userId;

//     // Check if user already has an active chat
//     const existingChat = await ChatRoom.findOne({
//       userId,
//       status: { $in: ['active', 'waiting'] }
//     });

//     if (existingChat) {
//       return res.status(400).json({
//         success: false,
//         message: 'You already have an active chat',
//         chatRoom: existingChat
//       });
//     }

//     // Create new chat room
//     const roomId = `chat_${userId}_${Date.now()}`;
    
//     const newChatRoom = new ChatRoom({
//       roomId,
//       userId,
//       userName: req.user.name,
//       status: 'waiting',
//       messages: [{
//         senderId: userId,
//         senderType: 'user',
//         senderName: req.user.name,
//         message: message,
//         read: false
//       }],
//       unreadCount: {
//         admin: 1
//       }
//     });

//     await newChatRoom.save();

//     // Notify admins about new chat
//     const io = req.app.get('io');
//     if (io) {
//       io.emit('admin:new_chat_created', {
//         roomId: newChatRoom.roomId,
//         userId: newChatRoom.userId,
//         userName: newChatRoom.userName,
//         message: message,
//         timestamp: new Date()
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Chat started successfully',
//       chatRoom: newChatRoom
//     });

//   } catch (error) {
//     console.error('Start chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // User sends message
// exports.sendMessage = async (req, res) => {
//   try {
//     const { roomId, message, attachment } = req.body;
//     const userId = req.user.userId;

//     const chatRoom = await ChatRoom.findOne({ roomId, userId });
//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     if (chatRoom.status === 'closed') {
//       return res.status(400).json({
//         success: false,
//         message: 'This chat is closed'
//       });
//     }

//     const newMessage = {
//       senderId: userId,
//       senderType: 'user',
//       senderName: req.user.name,
//       message: message,
//       attachment: attachment,
//       messageType: attachment ? 'file' : 'text',
//       read: false,
//       timestamp: new Date()
//     };

//     chatRoom.messages.push(newMessage);
//     chatRoom.unreadCount.admin = (chatRoom.unreadCount.admin || 0) + 1;
//     await chatRoom.save();

//     // Send real-time message
//     const io = req.app.get('io');
//     if (io) {
//       io.to(roomId).emit('new_message', newMessage);
      
//       // Notify admins if no admin assigned
//       if (!chatRoom.adminId) {
//         io.emit('admin:new_chat_message', {
//           roomId,
//           message: message || 'New file uploaded',
//           userName: chatRoom.userName,
//           timestamp: new Date()
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: 'Message sent successfully',
//       newMessage
//     });

//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // File upload
// exports.uploadFile = [
//   upload.single('file'),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: 'No file uploaded'
//         });
//       }

//       const filePath = req.file.path; // multer saves file locally
//       const apiKey = 'YOUR_IMGBB_API_KEY';

//       // Convert image to base64
//       const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });

//       // Upload to ImageBB
//       const response = await axios.post('https://api.imgbb.com/1/upload', null, {
//         params: {
//           key: apiKey,
//           image: imageBase64
//         }
//       });

//       const imageUrl = response.data.data.url;

//       // Optionally, delete local file after upload
//       fs.unlinkSync(filePath);

//       return res.status(200).json({
//         success: true,
//         filename: req.file.originalname,
//         url: imageUrl
//       });
//     } catch (error) {
//       console.error('Upload failed:', error.response?.data || error.message);
//       return res.status(500).json({
//         success: false,
//         message: 'Image upload failed'
//       });
//     }
//   }
// ];


// // Get user chat history
// exports.getChatHistory = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { page = 1, limit = 20 } = req.query;

//     const chatRooms = await ChatRoom.find({ userId })
//       .sort({ lastMessageTime: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .select('roomId status lastMessage lastMessageTime createdAt adminName unreadCount');

//     const total = await ChatRoom.countDocuments({ userId });

//     res.json({
//       success: true,
//       chatRooms,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         total
//       }
//     });

//   } catch (error) {
//     console.error('Chat history error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // Get specific chat messages
// exports.getChat =  async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const userId = req.user.userId;

//     let chatRoom;
//     if (req.user.role === 'user') {
//       chatRoom = await ChatRoom.findOne({ roomId, userId });
//     } else {
//       chatRoom = await ChatRoom.findOne({ roomId });
//     }

//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     res.json({
//       success: true,
//       chatRoom
//     });

//   } catch (error) {
//     console.error('Get chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // Mark messages as read
// exports.markMessagesAsRead = async (req, res) => {
//   try {
//     const { roomId } = req.body;
//     const userId = req.user.userId;
//     const userType = req.user.role === 'user' ? 'user' : 'admin';

//     const chatRoom = await ChatRoom.findOne({ roomId });
//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     // Mark messages as read
//     let unreadCount = 0;
//     chatRoom.messages.forEach(msg => {
//       if (msg.senderType !== userType && !msg.read) {
//         msg.read = true;
//         msg.readBy.push({
//           userId: userId,
//           readAt: new Date()
//         });
//         unreadCount++;
//       }
//     });

//     // Update unread count
//     if (userType === 'user') {
//       chatRoom.unreadCount.user = 0;
//     } else {
//       chatRoom.unreadCount.admin = 0;
//     }

//     chatRoom.lastSeen[userType] = new Date();
//     await chatRoom.save();

//     // Send real-time event
//     const io = req.app.get('io');
//     if (io) {
//       io.to(roomId).emit('messages_read', {
//         userId,
//         userType,
//         readAt: new Date()
//       });

//       io.to(roomId).emit('unread_update', {
//         roomId,
//         unreadCount: chatRoom.unreadCount
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Messages marked as read',
//       unreadCount
//     });

//   } catch (error) {
//     console.error('Mark as read error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // User closes chat
// exports.closeChat = async (req, res) => {
//   try {
//     const { roomId } = req.body;
//     const userId = req.user.userId;

//     const chatRoom = await ChatRoom.findOne({ roomId, userId });
//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     chatRoom.status = 'closed';
//     chatRoom.closedAt = new Date();
//     await chatRoom.save();

//     // Send real-time event
//     const io = req.app.get('io');
//     if (io) {
//       io.to(roomId).emit('chat_closed', {
//         roomId,
//         closedBy: 'user',
//         timestamp: new Date()
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Chat closed successfully'
//     });

//   } catch (error) {
//     console.error('Close chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // Admin routes
// exports.getChatRooms = async (req, res) => {
//   try {
//     const { status, sortBy, page = 1, limit = 20 } = req.query;
    
//     let filter = {};
//     if (status && status !== 'all') {
//       filter.status = status;
//     } else {
//       filter.status = { $in: ['active', 'waiting'] };
//     }

//     let sort = { lastMessageTime: -1 };
//     if (sortBy === 'unread') {
//       sort = { 'unreadCount.admin': -1, lastMessageTime: -1 };
//     }

//     const chatRooms = await ChatRoom.find(filter)
//       .sort(sort)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .select('roomId userId userName adminId adminName status lastMessage lastMessageTime createdAt unreadCount');

//     const total = await ChatRoom.countDocuments(filter);

//     res.json({
//       success: true,
//       chatRooms,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         total
//       }
//     });

//   } catch (error) {
//     console.error('Admin chats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // Admin assigns chat to themselves
// exports.assignChatToAdmin = async (req, res) => {
//   try {
//     const { roomId } = req.body;
//     const adminId = req.user.userId;

//     const chatRoom = await ChatRoom.findOne({ roomId });
//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     if (chatRoom.adminId && chatRoom.adminId !== adminId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Chat already assigned to another admin'
//       });
//     }

//     chatRoom.adminId = adminId;
//     chatRoom.adminName = req.user.name;
//     chatRoom.status = 'active';
//     chatRoom.assignedAt = new Date();
//     await chatRoom.save();

//     // Send real-time event
//     const io = req.app.get('io');
//     if (io) {
//       io.to(roomId).emit('admin_joined_chat', {
//         adminId,
//         adminName: chatRoom.adminName,
//         timestamp: new Date()
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Chat assigned successfully',
//       chatRoom
//     });

//   } catch (error) {
//     console.error('Assign chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // Admin sends message
// exports.sendAdminMessage = async (req, res) => {
//   try {
//     const { roomId, message } = req.body;
//     const adminId = req.user.userId;

//     const chatRoom = await ChatRoom.findOne({ roomId });
//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     const newMessage = {
//       senderId: adminId,
//       senderType: 'admin',
//       senderName: req.user.name,
//       message: message,
//       read: false,
//       timestamp: new Date()
//     };

//     chatRoom.messages.push(newMessage);
//     chatRoom.unreadCount.user = (chatRoom.unreadCount.user || 0) + 1;
//     await chatRoom.save();

//     // Send real-time event
//     const io = req.app.get('io');
//     if (io) {
//       io.to(roomId).emit('new_message', newMessage);
//     }

//     res.json({
//       success: true,
//       message: 'Message sent successfully',
//       newMessage
//     });

//   } catch (error) {
//     console.error('Admin send message error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // Admin closes chat
// exports.closeChat = async (req, res) => {
//   try {
//     const { roomId } = req.body;
//     const adminId = req.user.userId;

//     const chatRoom = await ChatRoom.findOne({ roomId });
//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     chatRoom.status = 'closed';
//     chatRoom.closedAt = new Date();
//     await chatRoom.save();

//     // Send real-time event
//     const io = req.app.get('io');
//     if (io) {
//       io.to(roomId).emit('chat_closed', {
//         roomId,
//         closedBy: 'admin',
//         timestamp: new Date()
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Chat closed successfully'
//     });

//   } catch (error) {
//     console.error('Admin close chat error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// // Fixed replies management
// exports.getFixedReplies = async (req, res) => {
//   try {
//     const { category, page = 1, limit = 50 } = req.query;
    
//     let filter = { isActive: true };
//     if (category && category !== 'all') {
//       filter.category = category;
//     }

//     const fixedReplies = await FixedReply.find(filter)
//       .sort({ usedCount: -1, createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await FixedReply.countDocuments(filter);

//     res.json({
//       success: true,
//       fixedReplies,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         total
//       }
//     });

//   } catch (error) {
//     console.error('Get fixed replies error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// exports.createFixedReply = async (req, res) => {
//   try {
//     const { title, message, category = 'general' } = req.body;

//     const fixedReply = new FixedReply({
//       title,
//       message,
//       category,
//       createdBy: req.user.userId
//     });

//     await fixedReply.save();

//     res.status(201).json({
//       success: true,
//       message: 'Fixed reply created successfully',
//       fixedReply
//     });

//   } catch (error) {
//     console.error('Create fixed reply error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// exports.sendFixedReply = async (req, res) => {
//   try {
//     const { roomId, fixedReplyId } = req.body;
//     const adminId = req.user.userId;

//     const fixedReply = await FixedReply.findById(fixedReplyId);
//     if (!fixedReply) {
//       return res.status(404).json({
//         success: false,
//         message: 'Fixed reply not found'
//       });
//     }

//     const chatRoom = await ChatRoom.findOne({ roomId });
//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat room not found'
//       });
//     }

//     const newMessage = {
//       senderId: adminId,
//       senderType: 'admin',
//       senderName: req.user.name,
//       message: fixedReply.message,
//       messageType: 'fixed_reply',
//       fixedReplyId: fixedReplyId,
//       read: false,
//       timestamp: new Date()
//     };

//     chatRoom.messages.push(newMessage);
//     chatRoom.unreadCount.user = (chatRoom.unreadCount.user || 0) + 1;
//     await chatRoom.save();

//     // Increment used count
//     fixedReply.usedCount += 1;
//     await fixedReply.save();

//     // Send real-time event
//     const io = req.app.get('io');
//     if (io) {
//       io.to(roomId).emit('new_message', newMessage);
//     }

//     res.json({
//       success: true,
//       message: 'Fixed reply sent successfully',
//       newMessage
//     });

//   } catch (error) {
//     console.error('Use fixed reply error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }

// exports.updateFixedReply = async (req, res) => {
//   try {
//     const { title, message, category, isActive } = req.body;

//     const fixedReply = await FixedReply.findByIdAndUpdate(
//       req.params.id,
//       {
//         title,
//         message,
//         category,
//         isActive,
//         updatedAt: new Date()
//       },
//       { new: true }
//     );

//     if (!fixedReply) {
//       return res.status(404).json({
//         success: false,
//         message: 'Fixed reply not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Fixed reply updated successfully',
//       fixedReply
//     });

//   } catch (error) {
//     console.error('Update fixed reply error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }   

// exports.deleteFixedReply = async (req, res) => {
//   try {
//     const fixedReply = await FixedReply.findByIdAndDelete(req.params.id);

//     if (!fixedReply) {
//       return res.status(404).json({
//         success: false,
//         message: 'Fixed reply not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Fixed reply deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete fixed reply error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// }



// src/Controllers/ChatController.js
const ChatRoom = require('../Models/Chat');
const FixedReply = require('../Models/FixedReply');
const User = require('../Models/User');
const upload = require('../MiddleWare/upload');
const { sendToRoom, notifyAdmins, notifyUser, isUserOnline } = require('../socket/socketServer');
const fs = require('fs');
const axios = require('axios');

class ChatController {
  
  // User starts a new chat
  async startChat(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.userId;

      // Validate message
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message is required to start a chat'
        });
      }

      // Check if user already has an active chat
      const existingChat = await ChatRoom.findOne({
        userId,
        status: { $in: ['active', 'waiting'] }
      });

      if (existingChat) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active chat',
          chatRoom: existingChat,
          existingRoomId: existingChat.roomId
        });
      }

      // Create new chat room
      const roomId = `chat_${userId}_${Date.now()}`;
      
      const newChatRoom = new ChatRoom({
        roomId,
        userId,
        userName: req.user.name,
        status: 'waiting',
        messages: [{
          senderId: userId,
          senderType: 'user',
          senderName: req.user.name,
          message: message.trim(),
          messageType: 'text',
          read: false,
          timestamp: new Date()
        }],
        unreadCount: {
          admin: 1,
          user: 0
        },
        lastMessage: message.trim(),
        lastMessageTime: new Date()
      });

      await newChatRoom.save();

      // Notify admins about new chat
      const io = req.app.get('io');
      if (io) {
        notifyAdmins('admin:new_chat_created', {
          roomId: newChatRoom.roomId,
          userId: newChatRoom.userId,
          userName: newChatRoom.userName,
          message: message,
          timestamp: new Date(),
          unreadCount: 1
        });
      }

      console.log('✅ New chat started:', {
        roomId: newChatRoom.roomId,
        userId,
        messageLength: message.length
      });

      res.status(201).json({
        success: true,
        message: 'Chat started successfully',
        chatRoom: newChatRoom
      });

    } catch (error) {
      console.error('❌ Start chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // User sends message
  async sendMessage(req, res) {
    try {
      const { roomId, message, attachment, messageType = 'text' } = req.body;
      const userId = req.user.userId;

      // Validate input
      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      if (!message && !attachment) {
        return res.status(400).json({
          success: false,
          message: 'Message or attachment is required'
        });
      }

      const chatRoom = await ChatRoom.findOne({ roomId, userId });
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      if (chatRoom.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'This chat is closed'
        });
      }

      const newMessage = {
        senderId: userId,
        senderType: 'user',
        senderName: req.user.name,
        message: message ? message.trim() : '',
        attachment: attachment,
        messageType: attachment ? 'file' : messageType,
        read: false,
        timestamp: new Date(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      chatRoom.messages.push(newMessage);
      chatRoom.unreadCount.admin = (chatRoom.unreadCount.admin || 0) + 1;
      chatRoom.lastMessage = message || 'File shared';
      chatRoom.lastMessageTime = new Date();
      await chatRoom.save();

      // Send real-time message
      const io = req.app.get('io');
      if (io) {
        sendToRoom(roomId, 'new_message', newMessage);
        
        // Notify admins if no admin assigned
        if (!chatRoom.adminId) {
          notifyAdmins('admin:new_chat_message', {
            roomId,
            message: message || 'New file uploaded',
            userName: chatRoom.userName,
            timestamp: new Date(),
            unreadCount: chatRoom.unreadCount.admin
          });
        }
      }

      console.log('✅ Message sent:', {
        roomId,
        messageId: newMessage.messageId,
        hasAttachment: !!attachment
      });

      res.json({
        success: true,
        message: 'Message sent successfully',
        newMessage
      });

    } catch (error) {
      console.error('❌ Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // File upload with enhanced error handling
  uploadFile = [
    upload.single('file'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No file uploaded'
          });
        }

        // File validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (req.file.size > maxSize) {
          // Delete the uploaded file
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            message: 'File size must be less than 10MB'
          });
        }

        const allowedMimeTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only images, PDFs, and documents are allowed.'
          });
        }

        // For production, you might want to upload to cloud storage
        // For now, we'll use local storage with a public URL
        const fileUrl = `/uploads/${req.file.filename}`;
        const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

        console.log('✅ File uploaded successfully:', {
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fullUrl
        });

        res.json({
          success: true,
          message: 'File uploaded successfully',
          file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: fullUrl,
            path: req.file.path
          }
        });

      } catch (error) {
        console.error('❌ File upload error:', error);
        
        // Clean up file if it was uploaded
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
          success: false,
          message: 'File upload failed',
          error: error.message
        });
      }
    }
  ];

  // Get user chat history with pagination
  async getChatHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20, status } = req.query;

      let filter = { userId };
      if (status && status !== 'all') {
        filter.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { lastMessageTime: -1 },
        select: 'roomId status lastMessage lastMessageTime createdAt adminName adminId unreadCount userName'
      };

      const chatRooms = await ChatRoom.find(filter)
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit)
        .select(options.select);

      const total = await ChatRoom.countDocuments(filter);

      console.log('✅ Chat history fetched:', {
        userId,
        page: options.page,
        limit: options.limit,
        total
      });

      res.json({
        success: true,
        chatRooms,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          total,
          hasNext: options.page < Math.ceil(total / options.limit),
          hasPrev: options.page > 1
        }
      });

    } catch (error) {
      console.error('❌ Chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get specific chat messages with read tracking
  async getChat(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;
      const userType = req.user.role;

      let chatRoom;
      if (userType === 'user') {
        chatRoom = await ChatRoom.findOne({ roomId, userId });
      } else {
        chatRoom = await ChatRoom.findOne({ roomId });
      }

      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      // Mark messages as read when admin views the chat
      if (userType !== 'user') {
        let unreadMessages = 0;
        chatRoom.messages.forEach(msg => {
          if (msg.senderType === 'user' && !msg.read) {
            msg.read = true;
            msg.readAt = new Date();
            msg.readBy = userId;
            unreadMessages++;
          }
        });

        if (unreadMessages > 0) {
          chatRoom.unreadCount.admin = Math.max(0, chatRoom.unreadCount.admin - unreadMessages);
          await chatRoom.save();

          // Notify user that messages were read
          const io = req.app.get('io');
          if (io) {
            notifyUser(chatRoom.userId, 'messages_read', {
              roomId,
              readBy: userId,
              readAt: new Date(),
              unreadMessages
            });
          }
        }
      }

      console.log('✅ Chat messages fetched:', {
        roomId,
        userId,
        userType,
        messageCount: chatRoom.messages.length
      });

      res.json({
        success: true,
        chatRoom
      });

    } catch (error) {
      console.error('❌ Get chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Mark messages as read
  async markMessagesAsRead(req, res) {
    try {
      const { roomId, messageIds } = req.body;
      const userId = req.user.userId;
      const userType = req.user.role === 'user' ? 'user' : 'admin';

      const chatRoom = await ChatRoom.findOne({ roomId });
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      let unreadCount = 0;
      const readMessages = [];

      chatRoom.messages.forEach(msg => {
        if (msg.senderType !== userType && !msg.read) {
          // If specific message IDs are provided, only mark those
          if (messageIds && messageIds.length > 0) {
            if (messageIds.includes(msg.messageId)) {
              msg.read = true;
              msg.readAt = new Date();
              msg.readBy = userId;
              unreadCount++;
              readMessages.push(msg.messageId);
            }
          } else {
            // Mark all unread messages
            msg.read = true;
            msg.readAt = new Date();
            msg.readBy = userId;
            unreadCount++;
            readMessages.push(msg.messageId);
          }
        }
      });

      // Update unread count
      if (userType === 'user') {
        chatRoom.unreadCount.user = 0;
      } else {
        chatRoom.unreadCount.admin = Math.max(0, chatRoom.unreadCount.admin - unreadCount);
      }

      chatRoom.lastSeen = chatRoom.lastSeen || {};
      chatRoom.lastSeen[userType] = new Date();
      await chatRoom.save();

      // Send real-time event
      const io = req.app.get('io');
      if (io) {
        sendToRoom(roomId, 'messages_read', {
          userId,
          userType,
          readAt: new Date(),
          messageIds: readMessages,
          unreadCount: unreadCount
        });

        sendToRoom(roomId, 'unread_update', {
          roomId,
          unreadCount: chatRoom.unreadCount
        });
      }

      console.log('✅ Messages marked as read:', {
        roomId,
        userId,
        userType,
        unreadCount,
        messageCount: readMessages.length
      });

      res.json({
        success: true,
        message: 'Messages marked as read',
        unreadCount,
        readMessages
      });

    } catch (error) {
      console.error('❌ Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Close chat
  async closeChat(req, res) {
    try {
      const { roomId, reason } = req.body;
      const userId = req.user.userId;
      const userType = req.user.role;

      let chatRoom;
      if (userType === 'user') {
        chatRoom = await ChatRoom.findOne({ roomId, userId });
      } else {
        chatRoom = await ChatRoom.findOne({ roomId });
      }

      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      if (chatRoom.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Chat is already closed'
        });
      }

      chatRoom.status = 'closed';
      chatRoom.closedAt = new Date();
      chatRoom.closedBy = userId;
      chatRoom.closeReason = reason || 'Closed by user';

      await chatRoom.save();

      // Send real-time event
      const io = req.app.get('io');
      if (io) {
        sendToRoom(roomId, 'chat_closed', {
          roomId,
          closedBy: userType,
          closedByUserId: userId,
          reason: reason,
          timestamp: new Date()
        });
      }

      console.log('✅ Chat closed:', {
        roomId,
        closedBy: userId,
        userType,
        reason
      });

      res.json({
        success: true,
        message: 'Chat closed successfully',
        chatRoom
      });

    } catch (error) {
      console.error('❌ Close chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Admin routes
  async getChatRooms(req, res) {
    try {
      const { status, sortBy, page = 1, limit = 20, search } = req.query;
      
      let filter = {};
      if (status && status !== 'all') {
        filter.status = status;
      } else {
        filter.status = { $in: ['active', 'waiting'] };
      }

      // Search functionality
      if (search) {
        filter.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { 'messages.message': { $regex: search, $options: 'i' } },
          { roomId: { $regex: search, $options: 'i' } }
        ];
      }

      let sort = { lastMessageTime: -1 };
      if (sortBy === 'unread') {
        sort = { 'unreadCount.admin': -1, lastMessageTime: -1 };
      } else if (sortBy === 'oldest') {
        sort = { lastMessageTime: 1 };
      }

      const chatRooms = await ChatRoom.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('roomId userId userName adminId adminName status lastMessage lastMessageTime createdAt unreadCount assignedAt');

      const total = await ChatRoom.countDocuments(filter);

      console.log('✅ Admin chats fetched:', {
        status,
        sortBy,
        page,
        limit,
        total,
        search
      });

      res.json({
        success: true,
        chatRooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('❌ Admin chats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Admin assigns chat to themselves
  async assignChatToAdmin(req, res) {
    try {
      const { roomId } = req.body;
      const adminId = req.user.userId;

      const chatRoom = await ChatRoom.findOne({ roomId });
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      if (chatRoom.adminId && chatRoom.adminId !== adminId) {
        return res.status(400).json({
          success: false,
          message: 'Chat already assigned to another admin'
        });
      }

      chatRoom.adminId = adminId;
      chatRoom.adminName = req.user.name;
      chatRoom.status = 'active';
      chatRoom.assignedAt = new Date();
      await chatRoom.save();

      // Send real-time event
      const io = req.app.get('io');
      if (io) {
        sendToRoom(roomId, 'admin_joined_chat', {
          adminId,
          adminName: chatRoom.adminName,
          timestamp: new Date()
        });

        // Notify user
        notifyUser(chatRoom.userId, 'admin_assigned', {
          roomId,
          adminName: chatRoom.adminName,
          timestamp: new Date()
        });
      }

      console.log('✅ Chat assigned to admin:', {
        roomId,
        adminId,
        adminName: chatRoom.adminName
      });

      res.json({
        success: true,
        message: 'Chat assigned successfully',
        chatRoom
      });

    } catch (error) {
      console.error('❌ Assign chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Admin sends message
  async sendAdminMessage(req, res) {
    try {
      const { roomId, message, messageType = 'text' } = req.body;
      const adminId = req.user.userId;

      const chatRoom = await ChatRoom.findOne({ roomId });
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      if (chatRoom.status === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot send message to closed chat'
        });
      }

      const newMessage = {
        senderId: adminId,
        senderType: 'admin',
        senderName: req.user.name,
        message: message ? message.trim() : '',
        messageType: messageType,
        read: false,
        timestamp: new Date(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      chatRoom.messages.push(newMessage);
      chatRoom.unreadCount.user = (chatRoom.unreadCount.user || 0) + 1;
      chatRoom.lastMessage = message || 'Admin message';
      chatRoom.lastMessageTime = new Date();
      await chatRoom.save();

      // Send real-time event
      const io = req.app.get('io');
      if (io) {
        sendToRoom(roomId, 'new_message', newMessage);
      }

      console.log('✅ Admin message sent:', {
        roomId,
        adminId,
        messageLength: message ? message.length : 0
      });

      res.json({
        success: true,
        message: 'Message sent successfully',
        newMessage
      });

    } catch (error) {
      console.error('❌ Admin send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Fixed replies management
  async getFixedReplies(req, res) {
    try {
      const { category, page = 1, limit = 50, search } = req.query;
      
      let filter = { isActive: true };
      if (category && category !== 'all') {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      const fixedReplies = await FixedReply.find(filter)
        .sort({ usedCount: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await FixedReply.countDocuments(filter);

      res.json({
        success: true,
        fixedReplies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('❌ Get fixed replies error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  async createFixedReply(req, res) {
    try {
      const { title, message, category = 'general' } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      const fixedReply = new FixedReply({
        title: title.trim(),
        message: message.trim(),
        category,
        createdBy: req.user.userId
      });

      await fixedReply.save();

      console.log('✅ Fixed reply created:', {
        title: fixedReply.title,
        category: fixedReply.category,
        createdBy: req.user.userId
      });

      res.status(201).json({
        success: true,
        message: 'Fixed reply created successfully',
        fixedReply
      });

    } catch (error) {
      console.error('❌ Create fixed reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  async sendFixedReply(req, res) {
    try {
      const { roomId, fixedReplyId } = req.body;
      const adminId = req.user.userId;

      const fixedReply = await FixedReply.findById(fixedReplyId);
      if (!fixedReply) {
        return res.status(404).json({
          success: false,
          message: 'Fixed reply not found'
        });
      }

      const chatRoom = await ChatRoom.findOne({ roomId });
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      const newMessage = {
        senderId: adminId,
        senderType: 'admin',
        senderName: req.user.name,
        message: fixedReply.message,
        messageType: 'fixed_reply',
        fixedReplyId: fixedReplyId,
        read: false,
        timestamp: new Date(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      chatRoom.messages.push(newMessage);
      chatRoom.unreadCount.user = (chatRoom.unreadCount.user || 0) + 1;
      chatRoom.lastMessage = fixedReply.message;
      chatRoom.lastMessageTime = new Date();
      await chatRoom.save();

      // Increment used count
      fixedReply.usedCount += 1;
      fixedReply.lastUsed = new Date();
      await fixedReply.save();

      // Send real-time event
      const io = req.app.get('io');
      if (io) {
        sendToRoom(roomId, 'new_message', newMessage);
      }

      console.log('✅ Fixed reply sent:', {
        roomId,
        fixedReplyId,
        adminId
      });

      res.json({
        success: true,
        message: 'Fixed reply sent successfully',
        newMessage
      });

    } catch (error) {
      console.error('❌ Use fixed reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  async updateFixedReply(req, res) {
    try {
      const { title, message, category, isActive } = req.body;

      const fixedReply = await FixedReply.findByIdAndUpdate(
        req.params.id,
        {
          ...(title && { title: title.trim() }),
          ...(message && { message: message.trim() }),
          ...(category && { category }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!fixedReply) {
        return res.status(404).json({
          success: false,
          message: 'Fixed reply not found'
        });
      }

      console.log('✅ Fixed reply updated:', {
        id: req.params.id,
        title: fixedReply.title
      });

      res.json({
        success: true,
        message: 'Fixed reply updated successfully',
        fixedReply
      });

    } catch (error) {
      console.error('❌ Update fixed reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }   

  async deleteFixedReply(req, res) {
    try {
      const fixedReply = await FixedReply.findByIdAndDelete(req.params.id);

      if (!fixedReply) {
        return res.status(404).json({
          success: false,
          message: 'Fixed reply not found'
        });
      }

      console.log('✅ Fixed reply deleted:', {
        id: req.params.id,
        title: fixedReply.title
      });

      res.json({
        success: true,
        message: 'Fixed reply deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete fixed reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get chat statistics for dashboard
  async getChatStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await ChatRoom.aggregate([
        {
          $facet: {
            totalChats: [
              { $count: "count" }
            ],
            activeChats: [
              { $match: { status: { $in: ['active', 'waiting'] } } },
              { $count: "count" }
            ],
            todayChats: [
              { $match: { createdAt: { $gte: today } } },
              { $count: "count" }
            ],
            byStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } }
            ],
            byAdmin: [
              { $match: { adminId: { $exists: true } } },
              { $group: { _id: "$adminName", count: { $sum: 1 } } }
            ]
          }
        }
      ]);

      res.json({
        success: true,
        stats: stats[0]
      });

    } catch (error) {
      console.error('❌ Get chat stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new ChatController();