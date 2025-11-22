// routes/withdrawals.js
const express = require('express');
const { body } = require('express-validator');
const {
  getWithdrawalHistory,
  requestWithdrawal,
  getWithdrawalById
} = require('../Controllers/withdrawalController');
const {protectAffiliate} = require('../MiddleWare/affiliateAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

router.use(protectAffiliate);

router.get('/', getWithdrawalHistory);
router.get('/:id', getWithdrawalById);

router.post('/', [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Valid amount is required'),
  body('currency')
    .notEmpty()
    .withMessage('Currency is required'),
  body('type')
    .isIn(['bank', 'player'])
    .withMessage('Valid withdrawal type is required'),
  body('bankAccountId')
    .if(body('type').equals('bank'))
    .notEmpty()
    .withMessage('Bank account is required for bank withdrawals'),
  body('playerInfo.playerId')
    .if(body('type').equals('player'))
    .notEmpty()
    .withMessage('Player ID is required for player withdrawals'),
  body('playerInfo.playerName')
    .if(body('type').equals('player'))
    .notEmpty()
    .withMessage('Player name is required for player withdrawals')
], validate, requestWithdrawal);

module.exports = router;