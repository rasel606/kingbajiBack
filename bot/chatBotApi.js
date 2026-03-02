const express = require('express');
const router = express.Router();

// In-memory chat history (replace with DB in production)
let chatHistory = [];

// Simple AI bot reply (replace with ML model)
function aiBotReply(message) {
  if (message.toLowerCase().includes('help')) return 'How can I assist you today?';
  if (message.toLowerCase().includes('bonus')) return 'Ask me about bonus offers!';
  return 'Bot: I am here to help!';
}

// Get chat history
router.get('/chat/history', (req, res) => {
  res.json(chatHistory);
});

// Send message (user/admin)
router.post('/chat/send', (req, res) => {
  const { sender, message } = req.body;
  chatHistory.push({ sender, message, time: new Date().toISOString() });
  // AI bot auto-reply
  if (sender !== 'bot') {
    const botMsg = aiBotReply(message);
    chatHistory.push({ sender: 'bot', message: botMsg, time: new Date().toISOString() });
  }
  res.json({ success: true });
});

module.exports = router;
