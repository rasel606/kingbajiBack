/**
 * __tests__/transactionService.test.js
 *
 * Smoke tests for TransactionService - verifies that key methods exist
 * and have the correct signatures (issue #22 fix verification).
 */

'use strict';

// All jest.mock calls are hoisted to the top of the file automatically
jest.mock('../src/Models/User', () => ({}));
jest.mock('../src/Models/AdminModel', () => ({}));
jest.mock('../src/Models/SubAdminModel', () => ({}));
jest.mock('../src/Models/AffiliateModel', () => ({}));
jest.mock('../src/Models/AgentModel', () => ({}));
jest.mock('../src/Models/SubAgentModel', () => ({}));
jest.mock('../src/Models/TransactionModel', () => ({}));
jest.mock('../src/Models/Bonus', () => ({}));
jest.mock('../src/Models/UserBonus', () => ({}));
jest.mock('../src/controllers/notificationController', () => ({
  notifyAdminsOnSubmit: jest.fn(),
  notifyUserOnStatusChange: jest.fn(),
}));
jest.mock('../src/utils/generateReferralCode', () => jest.fn(() => 'MOCK123'));

// Mock DepositHistory so searchDeposits can run without a real DB
const mockDepositFind = jest.fn().mockReturnValue({
  sort: jest.fn().mockReturnValue({
    skip: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([{ _id: '1', amount: 100 }]),
    }),
  }),
});
const mockDepositCount = jest.fn().mockResolvedValue(1);
jest.mock('../src/Models/DepositHistory', () => ({
  find: mockDepositFind,
  countDocuments: mockDepositCount,
}));

const TransactionService = require('../src/services/transactionService');

describe('TransactionService - method existence (issue #22)', () => {
  test('searchDeposits should be exported as a function', () => {
    expect(typeof TransactionService.searchDeposits).toBe('function');
  });

  test('searchWithdrawals should be exported as a function', () => {
    expect(typeof TransactionService.searchWithdrawals).toBe('function');
  });

  test('submitTransaction should be exported as a function', () => {
    expect(typeof TransactionService.submitTransaction).toBe('function');
  });

  test('approveDeposit should be exported as a function', () => {
    expect(typeof TransactionService.approveDeposit).toBe('function');
  });

  test('searchDeposits accepts empty filters and returns expected shape', async () => {
    const result = await TransactionService.searchDeposits({});

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('limit');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.total).toBe(1);
  });
});

