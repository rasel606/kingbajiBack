const express = require('express');
const { body, query, validationResult } = require('express-validator');

const ChatController = require('../Controllers/ChatController');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// ✅ User Routes
router.post("/user/start-chat",  auth, ChatController.startChat);
router.post("/user/upload-file", validate, auth, ChatController.uploadFile);
router.post("/user/send-message",  auth, ChatController.sendMessage);
router.get("/user/chat-history", validate, auth, ChatController.getChatHistory);
router.get("/user/chat/:roomId", validate, auth, ChatController.getChat);
router.post("/user/close-chat", validate, auth, ChatController.closeChat);

// ✅ Common Routes
router.post("/mark-as-read", validate, auth, ChatController.markMessagesAsRead);

// ✅ Admin Routes
router.get("/admin/chats", validate, auth, ChatController.getChatRooms);
router.post("/admin/assign-chat", validate, auth, ChatController.assignChatToAdmin);
router.post("/admin/send-message", validate, auth, ChatController.sendAdminMessage);
router.post("/admin/close-chat", validate, auth, ChatController.closeChat);

// ✅ Fixed Reply Routes
router.get("/fixed-replies", validate, auth, ChatController.getFixedReplies);
router.post("/fixed-replies", validate, auth, ChatController.createFixedReply);
router.post("/use-fixed-reply", validate, auth, ChatController.sendFixedReply);
router.put("/fixed-replies/:id", validate, auth, ChatController.updateFixedReply);
router.delete("/fixed-replies/:id", validate, auth, ChatController.deleteFixedReply);

module.exports = router;
