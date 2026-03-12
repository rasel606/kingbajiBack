const mongoose = require('mongoose');
const SubAdminModel = require('../models/SubAdminModel');
const AgentModel = require('../models/AgentModel');
const SubAgentModel = require('../models/SubAgentModel');
const TransactionModel = require('../models/TransactionModel');
const UserModel = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helper function to create a transaction record
const createTransaction = async (fromUser, toUser, amount, type, role, notes) => {
  const transaction = new TransactionModel({
    userId: toUser.userId || toUser.email,
    transactionID: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type, // 0 = deposit/credit, 1 = withdrawal/debit
    amount: amount,
    base_amount: amount,
    payment_type: 'balance_transfer',
    gateway_name: 'Internal Transfer',
    status: 1, // Completed
    referredBy: fromUser.referralCode,
    recipientId: toUser.referralCode,
    notes: notes || `Balance transfer from ${role}`,
    datetime: new Date(),
    updatetime: new Date(),
  });
  await transaction.save();
  return transaction;
};

// ==================== ADMIN TO AGENT TRANSFERS ====================

// Admin transfers balance to Agent
exports.transferBalanceToAgent = catchAsync(async (req, res, next) => {
  const { agentId, amount, notes } = req.body;
  const admin = req.user;

  // Validate input
  if (!agentId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid agentId and amount are required'
    });
  }

  // Find agent
  const agent = await AgentModel.findById(agentId);
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Check admin balance (assuming admin has a wallet balance)
  const adminBalance = admin.wallet?.balance || admin.balance || 0;
  if (adminBalance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }

  // Update balances using atomic operations
  await Promise.all([
    AdminModel.findByIdAndUpdate(admin._id, {
      $inc: { 'wallet.balance': -amount }
    }),
    AgentModel.findByIdAndUpdate(agentId, {
      $inc: { wallet: { balance: amount } }
    })
  ]);

  // Create transaction record
  await createTransaction(admin, agent, amount, 0, 'admin', notes);

  res.status(200).json({
    success: true,
    message: `Successfully transferred ${amount} to Agent ${agent.userId}`,
    data: {
      amount,
      toAgent: agent.userId
    }
  });
});

// Get Agent balance transfer history
exports.getAgentBalanceTransfers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    payment_type: 'balance_transfer',
    $or: [
      { recipientId: req.user.referralCode },
      { referredBy: req.user.referralCode }
    ]
  };

  const [transfers, total] = await Promise.all([
    TransactionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    TransactionModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: transfers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// ==================== ADMIN TO SUBAGENT TRANSFERS ====================

// Admin transfers balance to SubAgent
exports.transferBalanceToSubAgent = catchAsync(async (req, res, next) => {
  const { subAgentId, amount, notes } = req.body;
  const admin = req.user;

  // Validate input
  if (!subAgentId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid subAgentId and amount are required'
    });
  }

  // Find sub-agent
  const subAgent = await SubAgentModel.findById(subAgentId);
  if (!subAgent) {
    return res.status(404).json({
      success: false,
      message: 'SubAgent not found'
    });
  }

  // Check admin balance
  const adminBalance = admin.wallet?.balance || admin.balance || 0;
  if (adminBalance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }

  // Update balances
  await Promise.all([
    AdminModel.findByIdAndUpdate(admin._id, {
      $inc: { 'wallet.balance': -amount }
    }),
    SubAgentModel.findByIdAndUpdate(subAgentId, {
      $inc: { wallet: { balance: amount } }
    })
  ]);

  await createTransaction(admin, subAgent, amount, 0, 'admin', notes);

  res.status(200).json({
    success: true,
    message: `Successfully transferred ${amount} to SubAgent ${subAgent.userId}`,
    data: {
      amount,
      toSubAgent: subAgent.userId
    }
  });
});

// Get SubAgent balance transfer history
exports.getSubAgentBalanceTransfers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    payment_type: 'balance_transfer'
  };

  const [transfers, total] = await Promise.all([
    TransactionModel.find(query)
      .populate('recipientId', 'userId name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    TransactionModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: transfers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// ==================== AGENT TO SUBAGENT TRANSFERS ====================

// Get affiliated sub-agents for Agent
exports.getAffiliatedSubAgents = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const agent = req.user;

  // Find sub-agents that belong to this Agent (by referredBy)
  const query = {
    referredBy: agent.referralCode
  };

  if (search) {
    query.$or = [
      { userId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [subAgents, total] = await Promise.all([
    SubAgentModel.find(query)
      .select('userId name email wallet balance commissionRate status createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    SubAgentModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: subAgents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Agent transfers balance to SubAgent
exports.agentTransferToSubAgent = catchAsync(async (req, res, next) => {
  const { subAgentId, amount, notes } = req.body;
  const agent = req.user;

  // Validate input
  if (!subAgentId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid subAgentId and amount are required'
    });
  }

  // Find sub-agent
  const subAgent = await SubAgentModel.findById(subAgentId);
  if (!subAgent) {
    return res.status(404).json({
      success: false,
      message: 'SubAgent not found'
    });
  }

  // Verify sub-agent belongs to this agent
  if (subAgent.referredBy !== agent.referralCode) {
    return res.status(403).json({
      success: false,
      message: 'This sub-agent is not affiliated with you'
    });
  }

  // Check Agent balance
  const agentBalance = agent.wallet?.balance || agent.balance || 0;
  if (agentBalance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }

  // Update balances
  await Promise.all([
    AgentModel.findByIdAndUpdate(agent._id, {
      $inc: { 'wallet.balance': -amount }
    }),
    SubAgentModel.findByIdAndUpdate(subAgentId, {
      $inc: { wallet: { balance: amount } }
    })
  ]);

  await createTransaction(agent, subAgent, amount, 0, 'agent', notes);

  res.status(200).json({
    success: true,
    message: `Successfully transferred ${amount} to SubAgent ${subAgent.userId}`,
    data: {
      amount,
      toSubAgent: subAgent.userId
    }
  });
});

// Get agent's sub-agent transfer history
exports.getAgentToSubAgentTransfers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const agent = req.user;

  const query = {
    payment_type: 'balance_transfer',
    referredBy: agent.referralCode
  };

  const [transfers, total] = await Promise.all([
    TransactionModel.find(query)
      .populate('recipientId', 'userId name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    TransactionModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: transfers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// ==================== SUBAGENT TO USER TRANSFERS ====================

// Get affiliated users for SubAgent
exports.getSubAgentAffiliatedUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const subAgent = req.user;

  const query = {
    referredBy: subAgent.referralCode
  };

  if (search) {
    query.$or = [
      { userId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    UserModel.find(query)
      .select('userId name email balance status createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    UserModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// SubAgent transfers balance to User
exports.subAgentTransferToUser = catchAsync(async (req, res, next) => {
  const { userId, amount, notes } = req.body;
  const subAgent = req.user;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid userId and amount are required'
    });
  }

  const user = await UserModel.findOne({ userId });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.referredBy !== subAgent.referralCode) {
    return res.status(403).json({
      success: false,
      message: 'This user is not affiliated with you'
    });
  }

  const subAgentBalance = subAgent.wallet?.balance || subAgent.balance || 0;
  if (subAgentBalance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }

  await Promise.all([
    SubAgentModel.findByIdAndUpdate(subAgent._id, {
      $inc: { 'wallet.balance': -amount }
    }),
    UserModel.findByIdAndUpdate(user._id, {
      $inc: { balance: amount }
    })
  ]);

  await createTransaction(subAgent, user, amount, 0, 'subagent', notes);

  res.status(200).json({
    success: true,
    message: `Successfully transferred ${amount} to User ${user.userId}`,
    data: {
      amount,
      toUser: user.userId
    }
  });
});

// Get sub-agent's user transfer history
exports.getSubAgentToUserTransfers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const subAgent = req.user;

  const query = {
    payment_type: 'balance_transfer',
    referredBy: subAgent.referralCode
  };

  const [transfers, total] = await Promise.all([
    TransactionModel.find(query)
      .populate('recipientId', 'userId name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    TransactionModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: transfers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// ==================== COMMISSION MANAGEMENT ====================

// Admin: Set commission rate for Agent
exports.setAgentCommission = catchAsync(async (req, res, next) => {
  const { userId, commissionRate } = req.body;

  if (!userId || commissionRate === undefined) {
    return res.status(400).json({
      success: false,
      message: 'userId and commissionRate are required'
    });
  }

  if (commissionRate < 0 || commissionRate > 100) {
    return res.status(400).json({
      success: false,
      message: 'Commission rate must be between 0 and 100'
    });
  }

  const agent = await AgentModel.findByIdAndUpdate(
    userId,
    { commissionRate: parseFloat(commissionRate) },
    { new: true }
  );

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Commission rate updated successfully',
    data: {
      userId: agent._id,
      userIdDisplay: agent.userId,
      commissionRate: agent.commissionRate
    }
  });
});

// Admin: Set commission rate for SubAgent
exports.setSubAgentCommission = catchAsync(async (req, res, next) => {
  const { userId, commissionRate } = req.body;

  if (!userId || commissionRate === undefined) {
    return res.status(400).json({
      success: false,
      message: 'userId and commissionRate are required'
    });
  }

  if (commissionRate < 0 || commissionRate > 100) {
    return res.status(400).json({
      success: false,
      message: 'Commission rate must be between 0 and 100'
    });
  }

  const subAgent = await SubAgentModel.findByIdAndUpdate(
    userId,
    { commissionRate: parseFloat(commissionRate) },
    { new: true }
  );

  if (!subAgent) {
    return res.status(404).json({
      success: false,
      message: 'SubAgent not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Commission rate updated successfully',
    data: {
      userId: subAgent._id,
      userIdDisplay: subAgent.userId,
      commissionRate: subAgent.commissionRate
    }
  });
});

// Admin: Get all agents with their commission rates
exports.getAllAgentsWithCommission = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};

  if (search) {
    query.$or = [
      { userId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [agents, total] = await Promise.all([
    AgentModel.find(query)
      .select('userId name email commissionRate status createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    AgentModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: agents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Admin: Get all sub-agents with their commission rates
exports.getAllSubAgentsWithCommission = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};

  if (search) {
    query.$or = [
      { userId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [subAgents, total] = await Promise.all([
    SubAgentModel.find(query)
      .select('userId name email commissionRate status createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    SubAgentModel.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: subAgents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

