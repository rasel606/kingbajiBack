 const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// In-memory chat history per user (replace with DB in production)
const chatSessions = {};

// Analytics storage (in-memory, replace with DB)
const analytics = {
  crmSyncs: 0,
  sentimentScores: [],
  chatVolume: 0
};

async function gptBotReply(history) {
  const messages = history.map(msg => ({ role: msg.sender === 'bot' ? 'assistant' : 'user', content: msg.message }));
  const body = {
    model: 'gpt-3.5-turbo',
    messages
  };
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Bot: Sorry, I could not answer.';
}

// Get chat history for user
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(chatSessions[userId] || []);
});

// Send message (user/admin)
router.post('/send', async (req, res) => {
  const { userId, sender, message } = req.body;
  if (!chatSessions[userId]) chatSessions[userId] = [];
  chatSessions[userId].push({ sender, message, time: new Date().toISOString() });
  // AI bot reply
  if (sender !== 'bot') {
    const botMsg = await gptBotReply(chatSessions[userId]);
    chatSessions[userId].push({ sender: 'bot', message: botMsg, time: new Date().toISOString() });
  }
  res.json({ success: true });
});

// Example: Connect to Salesforce CRM
async function connectToCRM(crmUrl, apiKey) {
  const res = await fetch(crmUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  return await res.json();
}

// Example: Sentiment analysis using Google Cloud API
async function analyzeSentiment(text, apiKey) {
  const res = await fetch('https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document: { content: text, type: 'PLAIN_TEXT' },
      encodingType: 'UTF8'
    })
  });
  return await res.json();
}

// Salesforce CRM integration
async function connectToSalesforce(crmUrl, oauthToken) {
  const res = await fetch(crmUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${oauthToken}` }
  });
  return await res.json();
}

// Google Cloud Sentiment Analysis
async function analyzeSentimentGoogle(text, apiKey) {
  const res = await fetch('https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document: { content: text, type: 'PLAIN_TEXT' },
      encodingType: 'UTF8'
    })
  });
  return await res.json();
}

// CRM integration endpoint
router.post('/crm/connect', async (req, res) => {
  const { crmUrl, apiKey } = req.body;
  try {
    const crmData = await connectToCRM(crmUrl, apiKey);
    res.json(crmData);
  } catch (err) {
    res.status(500).json({ error: 'CRM connection failed' });
  }
});

// Sentiment analysis endpoint
router.post('/sentiment', async (req, res) => {
  const { text, apiKey } = req.body;
  try {
    const sentiment = await analyzeSentiment(text, apiKey);
    res.json(sentiment);
  } catch (err) {
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// Salesforce CRM endpoint
router.post('/crm/salesforce', async (req, res) => {
  const { crmUrl, oauthToken } = req.body;
  try {
    const crmData = await connectToSalesforce(crmUrl, oauthToken);
    res.json(crmData);
  } catch (err) {
    res.status(500).json({ error: 'Salesforce connection failed' });
  }
});

// Google Cloud Sentiment endpoint
router.post('/sentiment/google', async (req, res) => {
  const { text, apiKey } = req.body;
  try {
    const sentiment = await analyzeSentimentGoogle(text, apiKey);
    res.json(sentiment);
  } catch (err) {
    res.status(500).json({ error: 'Google sentiment analysis failed' });
  }
});

// Hook: CRM sync after user registration
router.post('/user/register', async (req, res) => {
  // ...user registration logic...
  // CRM sync
  try {
    await connectToSalesforce(req.body.crmUrl, req.body.oauthToken);
    analytics.crmSyncs++;
  } catch {}
  res.json({ success: true });
});

// Hook: Sentiment analysis after chat
router.post('/chat/send', async (req, res) => {
  const { userId, sender, message, apiKey } = req.body;
  if (!chatSessions[userId]) chatSessions[userId] = [];
  chatSessions[userId].push({ sender, message, time: new Date().toISOString() });
  analytics.chatVolume++;
  // AI bot reply
  if (sender !== 'bot') {
    const botMsg = await gptBotReply(chatSessions[userId]);
    chatSessions[userId].push({ sender: 'bot', message: botMsg, time: new Date().toISOString() });
    // Sentiment analysis
    if (apiKey) {
      try {
        const sentiment = await analyzeSentimentGoogle(message, apiKey);
        analytics.sentimentScores.push(sentiment.documentSentiment.score);
      } catch {}
    }
  }
  res.json({ success: true });
});

// Analytics endpoint
router.get('/analytics', (req, res) => {
  res.json(analytics);
});

module.exports = router;
