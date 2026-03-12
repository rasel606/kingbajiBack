const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../app');
const User = require('../models/User');
const Transaction = require('../models/TransactionModel');

const JWT_SECRET = process.env.JWT_SECRET || 'Kingbaji';

/**
 * Test suite for Balance Transfer & Commission Management Endpoints
 */
describe('Balance Transfer & Commission Management', () => {
  
  // Sample users for testing
  let adminToken, subAdminToken, agentToken, subAgentToken, affiliateToken;
  let adminId, subAdminId, agentId, subAgentId, affiliateId, userId;

  // Setup test users before all tests
  beforeAll(async () => {
    // Create test users
    const admin = new User({
      userId: 'admin_test_001',
      email: 'admin@test.com',
      password: 'hashedpassword',
      role: 'admin',
      balance: 50000,
    });
    adminId = admin._id;
    adminToken = jwt.sign({ userId: admin.userId, role: 'admin' }, JWT_SECRET);

    const subAdmin = new User({
      userId: 'subadmin_test_001',
      email: 'subadmin@test.com',
      password: 'hashedpassword',
      role: 'sub-admin',
      referredBy: adminId.toString(),
      balance: 10000,
      commissionRate: 0.15,
    });
    subAdminId = subAdmin._id;
    subAdminToken = jwt.sign({ userId: subAdmin.userId, role: 'sub-admin' }, JWT_SECRET);

    const agent = new User({
      userId: 'agent_test_001',
      email: 'agent@test.com',
      password: 'hashedpassword',
      role: 'agent',
      referredBy: subAdminId.toString(),
      balance: 5000,
      commissionRate: 0.10,
    });
    agentId = agent._id;
    agentToken = jwt.sign({ userId: agent.userId, role: 'agent' }, JWT_SECRET);

    const subAgent = new User({
      userId: 'subagent_test_001',
      email: 'subagent@test.com',
      password: 'hashedpassword',
      role: 'sub-agent',
      referredBy: agentId.toString(),
      balance: 2000,
      commissionRate: 0.05,
    });
    subAgentId = subAgent._id;
    subAgentToken = jwt.sign({ userId: subAgent.userId, role: 'sub-agent' }, JWT_SECRET);

    const affiliate = new User({
      userId: 'affiliate_test_001',
      email: 'affiliate@test.com',
      password: 'hashedpassword',
      role: 'affiliate',
      referredBy: subAdminId.toString(),
      balance: 3000,
      commissionRate: 0.20,
    });
    affiliateId = affiliate._id;
    affiliateToken = jwt.sign({ userId: affiliate.userId, role: 'affiliate' }, JWT_SECRET);

    const user = new User({
      userId: 'user_test_001',
      email: 'user@test.com',
      password: 'hashedpassword',
      role: 'user',
      referredBy: affiliateId.toString(),
      balance: 1000,
    });
    userId = user._id;

    // Save all test users
    await Promise.all([admin, subAdmin, agent, subAgent, affiliate, user].map(u => u.save()));
  });

  // Clean up after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
  });

  /**
   * =========================================================================
   * Sub-Admin Balance Transfer Tests
   * =========================================================================
   */

  describe('Sub-Admin to Sub-Agent Transfer', () => {
    test('should transfer balance successfully', async () => {
      const response = await request(app)
        .post('/api/subadmin/transfer_balance_to_subagent')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({
          subAgentId: subAgentId.toString(),
          amount: 500,
          notes: 'Weekly allocation',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transfer successful.');
    });

    test('should reject transfer with insufficient balance', async () => {
      const response = await request(app)
        .post('/api/subadmin/transfer_balance_to_subagent')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({
          subAgentId: subAgentId.toString(),
          amount: 50000, // More than available
          notes: 'Should fail',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient balance');
    });

    test('should reject transfer to non-affiliated sub-agent', async () => {
      // Create another sub-admin
      const otherSubAdmin = new User({
        userId: 'subadmin_other_001',
        email: 'subadmin.other@test.com',
        password: 'hashedpassword',
        role: 'sub-admin',
        referredBy: adminId.toString(),
        balance: 10000,
      });
      await otherSubAdmin.save();

      const otherToken = jwt.sign({ userId: otherSubAdmin.userId, role: 'sub-admin' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/subadmin/transfer_balance_to_subagent')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          subAgentId: subAgentId.toString(), // Belongs to first subadmin
          amount: 100,
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('not affiliated');

      // Cleanup
      await User.deleteOne({ _id: otherSubAdmin._id });
    });

    test('should retrieve sub-agent transfer history', async () => {
      const response = await request(app)
        .get('/api/subadmin/get_subagent_balance_transfers')
        .set('Authorization', `Bearer ${subAdminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Sub-Admin to Affiliate Transfer', () => {
    test('should transfer to affiliated affiliate', async () => {
      const response = await request(app)
        .post('/api/subadmin/transfer_balance_to_affiliate')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({
          affiliateId: affiliateId.toString(),
          amount: 300,
          notes: 'Monthly bonus',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transfer successful.');
    });

    test('should reject transfer with invalid amount', async () => {
      const response = await request(app)
        .post('/api/subadmin/transfer_balance_to_affiliate')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({
          affiliateId: affiliateId.toString(),
          amount: -100,
          notes: 'Invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('positive');
    });
  });

  describe('Sub-Admin to Agent User Transfer', () => {
    test('should transfer to user under affiliate', async () => {
      const response = await request(app)
        .post('/api/subadmin/transfer_to_agent_user')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({
          userId: userId.toString(),
          amount: 200,
          notes: 'Direct disbursement',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transfer successful.');
    });

    test('should reject transfer to user not under sub-admin', async () => {
      // Create user under different referrer
      const orphanUser = new User({
        userId: 'orphan_user_001',
        email: 'orphan@test.com',
        password: 'hashedpassword',
        role: 'user',
        referredBy: adminId.toString(), // Not under this subadmin's tree
        balance: 100,
      });
      await orphanUser.save();

      const response = await request(app)
        .post('/api/subadmin/transfer_to_agent_user')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({
          userId: orphanUser._id.toString(),
          amount: 50,
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('not under your agent');

      // Cleanup
      await User.deleteOne({ _id: orphanUser._id });
    });
  });

  /**
   * =========================================================================
   * Commission Management Tests
   * =========================================================================
   */

  describe('Admin Commission Setting', () => {
    test('should set commission for affiliate', async () => {
      const response = await request(app)
        .patch(`/api/admin/affiliates/${affiliateId.toString()}/commission`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commissionRate: 25 });

      expect(response.status).toBe(200);
      expect(response.body.user.commissionRate).toBe(0.25); // 25% as decimal
    });

    test('should reject invalid commission rate', async () => {
      const response = await request(app)
        .patch(`/api/admin/affiliates/${affiliateId.toString()}/commission`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commissionRate: 150 }); // > 100%

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('between 0 and 100');
    });

    test('should allow only admin to set global commission', async () => {
      const response = await request(app)
        .patch(`/api/admin/affiliates/${affiliateId.toString()}/commission`)
        .set('Authorization', `Bearer ${subAdminToken}`) // Wrong role
        .send({ commissionRate: 30 });

      expect(response.status).toBe(403);
    });

    test('should retrieve affiliates with commission', async () => {
      const response = await request(app)
        .get('/api/admin/affiliates_with_commission?role=affiliate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });
  });

  describe('Agent Commission Setting (own sub-agents)', () => {
    test('agent should set commission for their sub-agent', async () => {
      const response = await request(app)
        .patch(`/api/agent/subagents/${subAgentId.toString()}/commission`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ commissionRate: 12 });

      expect(response.status).toBe(200);
      expect(response.body.user.commissionRate).toBe(0.12);
    });

    test('agent should NOT set commission for sub-agent they do not own', async () => {
      // Create another agent
      const otherAgent = new User({
        userId: 'agent_other_001',
        email: 'agent.other@test.com',
        password: 'hashedpassword',
        role: 'agent',
        referredBy: subAdminId.toString(),
        balance: 5000,
      });
      await otherAgent.save();

      const otherAgentToken = jwt.sign({ userId: otherAgent.userId, role: 'agent' }, JWT_SECRET);

      const response = await request(app)
        .patch(`/api/agent/subagents/${subAgentId.toString()}/commission`)
        .set('Authorization', `Bearer ${otherAgentToken}`)
        .send({ commissionRate: 15 });

      expect(response.status).toBe(404); // subAgentId belongs to first agent
      expect(response.body.message).toContain('not found');

      // Cleanup
      await User.deleteOne({ _id: otherAgent._id });
    });

    test('agent should retrieve only their sub-agents', async () => {
      const response = await request(app)
        .get('/api/agent/subagents_with_commission')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      // Should only include sub-agents referred by this agent
      response.body.users.forEach(u => {
        expect(u.role).toBe('sub-agent');
      });
    });
  });

  describe('Sub-Admin Commission Setting (own users)', () => {
    test('sub-admin should set commission for their affiliate', async () => {
      const response = await request(app)
        .patch(`/api/subadmin/users/${affiliateId.toString()}/commission`)
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({ commissionRate: 22 });

      expect(response.status).toBe(200);
      expect(response.body.user.commissionRate).toBe(0.22);
    });

    test('sub-admin should retrieve only their users', async () => {
      const response = await request(app)
        .get('/api/subadmin/users_with_commission')
        .set('Authorization', `Bearer ${subAdminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      // Should only include users (affiliate/agent/sub-agent) referred by this sub-admin
      response.body.users.forEach(u => {
        expect(['affiliate', 'agent', 'sub-agent']).toContain(u.role);
      });
    });
  });

  /**
   * =========================================================================
   * Authorization Tests
   * =========================================================================
   */

  describe('Authorization & Authentication', () => {
    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/admin/affiliates_with_commission');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Access denied');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/affiliates_with_commission')
        .set('Authorization', 'Bearer invalid_token_xyz');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('invalid');
    });

    test('should reject non-admin from accessing admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/affiliates_with_commission')
        .set('Authorization', `Bearer ${subAdminToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  /**
   * =========================================================================
   * Edge Cases & Data Validation
   * =========================================================================
   */

  describe('Data Validation', () => {
    test('should validate sender and recipient exist', async () => {
      const fakeId = '000000000000000000000000';

      const response = await request(app)
        .post('/api/subadmin/transfer_balance_to_subagent')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({
          subAgentId: fakeId,
          amount: 100,
        });

      expect(response.status).toBe(403); // Not affiliated check
    });

    test('should round commission rates correctly', async () => {
      const response = await request(app)
        .patch(`/api/admin/affiliates/${affiliateId.toString()}/commission`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commissionRate: 33.333 });

      expect(response.status).toBe(200);
      const stored = response.body.user.commissionRate;
      expect(stored).toBeCloseTo(0.33333, 4);
    });

    test('should handle zero commission rate', async () => {
      const response = await request(app)
        .patch(`/api/admin/affiliates/${affiliateId.toString()}/commission`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commissionRate: 0 });

      expect(response.status).toBe(200);
      expect(response.body.user.commissionRate).toBe(0);
    });
  });
});
