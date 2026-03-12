const User = require('../models/User'); // Assuming a User model
const Transaction = require('../models/Transaction'); // Assuming a Transaction model
const { controllerWrapper } = require('../utils/controllerWrapper'); // Assuming this utility exists

// Helper to get downline users of a specific role
const getDownline = async (subAdminId, role) => {
  return User.find({ referredBy: subAdminId, role });
};

// Helper to get users for a specific downline member (e.g., users of an agent)
const getDownlineUsers = async (parentId) => {
  return User.find({ referredBy: parentId, role: 'user' });
};

// Helper to get transactions for a list of user IDs
const getDownlineTransactions = async (userIds, type, status) => {
  return Transaction.find({
    user: { $in: userIds },
    type,
    status,
  }).populate('user', 'username name');
};

// --- Agent Management ---

exports.getAgents = controllerWrapper(async (req, res) => {
  const agents = await getDownline(req.user.id, 'agent');
  res.json({ success: true, data: agents });
});

exports.getAgentUsers = controllerWrapper(async (req, res) => {
  // Security check: ensure the requested agent belongs to the sub-admin
  const agent = await User.findOne({ _id: req.params.agentId, referredBy: req.user.id, role: 'agent' });
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent not found or access denied' });
  }
  const users = await getDownlineUsers(req.params.agentId);
  res.json({ success: true, data: users });
});

exports.getAgentDeposits = controllerWrapper(async (req, res) => {
  const agents = await getDownline(req.user.id, 'agent');
  const agentIds = agents.map(a => a._id);
  const users = await User.find({ referredBy: { $in: agentIds } });
  const userIds = users.map(u => u._id);
  const deposits = await getDownlineTransactions(userIds, 'deposit', 'pending');
  res.json({ success: true, data: deposits });
});

exports.getAgentWithdrawals = controllerWrapper(async (req, res) => {
  const agents = await getDownline(req.user.id, 'agent');
  const agentIds = agents.map(a => a._id);
  const users = await User.find({ referredBy: { $in: agentIds } });
  const userIds = users.map(u => u._id);
  const withdrawals = await getDownlineTransactions(userIds, 'withdrawal', 'pending');
  res.json({ success: true, data: withdrawals });
});

// --- Sub-Agent Management ---

exports.getSubAgents = controllerWrapper(async (req, res) => {
  const subAgents = await getDownline(req.user.id, 'sub-agent');
  res.json({ success: true, data: subAgents });
});

exports.getSubAgentUsers = controllerWrapper(async (req, res) => {
  const subAgent = await User.findOne({ _id: req.params.subAgentId, referredBy: req.user.id, role: 'sub-agent' });
  if (!subAgent) {
    return res.status(404).json({ success: false, message: 'Sub-Agent not found or access denied' });
  }
  const users = await getDownlineUsers(req.params.subAgentId);
  res.json({ success: true, data: users });
});

exports.getSubAgentDeposits = controllerWrapper(async (req, res) => {
  const subAgents = await getDownline(req.user.id, 'sub-agent');
  const subAgentIds = subAgents.map(sa => sa._id);
  const users = await User.find({ referredBy: { $in: subAgentIds } });
  const userIds = users.map(u => u._id);
  const deposits = await getDownlineTransactions(userIds, 'deposit', 'pending');
  res.json({ success: true, data: deposits });
});

exports.getSubAgentWithdrawals = controllerWrapper(async (req, res) => {
    const subAgents = await getDownline(req.user.id, 'sub-agent');
    const subAgentIds = subAgents.map(sa => sa._id);
    const users = await User.find({ referredBy: { $in: subAgentIds } });
    const userIds = users.map(u => u._id);
    const withdrawals = await getDownlineTransactions(userIds, 'withdrawal', 'pending');
    res.json({ success: true, data: withdrawals });
});

// --- Affiliate Management ---

exports.getAffiliates = controllerWrapper(async (req, res) => {
  const affiliates = await getDownline(req.user.id, 'affiliate');
  res.json({ success: true, data: affiliates });
});

exports.getAffiliateUsers = controllerWrapper(async (req, res) => {
  const affiliate = await User.findOne({ _id: req.params.affiliateId, referredBy: req.user.id, role: 'affiliate' });
  if (!affiliate) {
    return res.status(404).json({ success: false, message: 'Affiliate not found or access denied' });
  }
  const users = await getDownlineUsers(req.params.affiliateId);
  res.json({ success: true, data: users });
});

exports.getAffiliateDeposits = controllerWrapper(async (req, res) => {
  const affiliates = await getDownline(req.user.id, 'affiliate');
  const affiliateIds = affiliates.map(a => a._id);
  const users = await User.find({ referredBy: { $in: affiliateIds } });
  const userIds = users.map(u => u._id);
  const deposits = await getDownlineTransactions(userIds, 'deposit', 'pending');
  res.json({ success: true, data: deposits });
});

exports.getAffiliateWithdrawals = controllerWrapper(async (req, res) => {
    const affiliates = await getDownline(req.user.id, 'affiliate');
    const affiliateIds = affiliates.map(a => a._id);
    const users = await User.find({ referredBy: { $in: affiliateIds } });
    const userIds = users.map(u => u._id);
    const withdrawals = await getDownlineTransactions(userIds, 'withdrawal', 'pending');
    res.json({ success: true, data: withdrawals });
});