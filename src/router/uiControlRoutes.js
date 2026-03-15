const express = require('express');
const router = express.Router();

// In-memory store for UI config and jackpot state
let uiConfig = {
  header: true,
  loaderBox: true,
  mainRouter: true,
  mcdRotatingPhone: true,
  mcdPopupPage: true,
  step1DevExtUi: true,
  cdkOverlayContainer: true
};

let jackpot = {
  value: 1000,
  lastWinner: null
};

// Get UI config
router.get('/ui-config', (req, res) => {
  res.json(uiConfig);
});

// Update UI config
router.post('/ui-config', (req, res) => {
  uiConfig = { ...uiConfig, ...req.body };
  res.json(uiConfig);
});

// Get jackpot state
router.get('/jackpot', (req, res) => {
  res.json(jackpot);
});

// Update jackpot state
router.post('/jackpot', (req, res) => {
  jackpot = { ...jackpot, ...req.body };
  res.json(jackpot);
});

module.exports = router;
