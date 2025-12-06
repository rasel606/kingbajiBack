// -------------------------------------
// TransactionController.js (Optimized)
// -------------------------------------

const Transaction = require('../models/TransactionModel');
const HierarchyService = require('../services/hierarchyService');

class TransactionController {

  // ============================================================
  // 01. Get All Transactions With Hierarchy
  // ============================================================
  static async getAllTransactionsWithHierarchy(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        type,
        status,
        gateway_name,
        startDate,
        endDate,
        userId,
        referredBy
      } = req.query;

      const filter = {};

      if (type !== undefined) filter.type = Number(type);
      if (status !== undefined) filter.status = Number(status);
      if (gateway_name) filter.gateway_name = gateway_name;
      if (userId) filter.userId = userId;
      if (referredBy) filter.referredBy = referredBy;

      if (startDate || endDate) {
        filter.datetime = {};
        if (startDate) filter.datetime.$gte = new Date(startDate);
        if (endDate) filter.datetime.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const transactions = await Transaction.find(filter)
        .sort({ datetime: -1 })
        .skip(skip)
        .limit(Number(limit));

      const transactionsWithHierarchy =
        await HierarchyService.getTransactionsWithHierarchy(transactions);

      const total = await Transaction.countDocuments(filter);

      res.json({
        success: true,
        data: transactionsWithHierarchy,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // ============================================================
  // 02. Single Transaction Details With Hierarchy
  // ============================================================
  static async getTransactionDetails(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      const result =
        await HierarchyService.getTransactionWithHierarchy(transaction);
console.log(result);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // ============================================================
  // 03. Get Transactions Related to Specific UserType + Referral
  // ============================================================
  static async getTransactionsByUser(req, res) {
    try {
      const user = req.user;
      console.log(user.email, user.referralCode, user.role);
      const { role, referralCode } = user;
      // const { role, referralCode } = req.params;
      const { page = 1, limit = 50 } = req.query;
      console.log(role, referralCode);
      const valid = ["Admin", "SubAdmin", "Agent", "SubAgent", "Affiliate"];
      // if (!valid.includes(role)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Invalid user type"
      //   });
      // }

      const filter = await HierarchyService.getFilterForUser(role, referralCode);
      console.log(filter);
      const skip = (page - 1) * limit;

      const transactions = await Transaction.find(filter)
        .sort({ datetime: -1 })
        .skip(skip)
        .limit(Number(limit));

      const transactionsWithHierarchy =
        await HierarchyService.getTransactionsWithHierarchy(transactions);

      const total = await Transaction.countDocuments(filter);

      res.json({
        success: true,
        role,
        referralCode,
        data: transactionsWithHierarchy,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // ============================================================
  // 04. Referral Hierarchy Tree for Admin Panel
  // ============================================================
  static async getHierarchyTree(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      // No referral = No tree
      if (!transaction.referredBy || transaction.referredBy === "1") {
        return res.json({
          success: true,
          transactionId,
          hierarchyTree: null,
          message: "No referral hierarchy found"
        });
      }

      const hierarchy = await HierarchyService.findParentHierarchy(transaction.referredBy);

      // Build Tree
      const tree = [];
      let current = null;

      for (const level of hierarchy) {
        const node = {
          referralCode: level.referralCode,
          role: level.role,
          referredBy: level.referredBy,
          name:
            level.data?.firstName ||
            level.data?.email ||
            "Unknown",
          children: []
        };

        if (!current) {
          tree.push(node);
          current = node;
        } else {
          current.children.push(node);
          current = node;
        }
      }

      res.json({
        success: true,
        transaction: transaction,
        hierarchyTree: tree.length ? tree[0] : null,
        flatHierarchy: hierarchy
      });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // ============================================================
  // 05. Commission Calculation
  // ============================================================
  static async calculateCommission(req, res) {
    try {
      const { role, referralCode, startDate, endDate } = req.query;

      const filter = {
        status: 1, // approved
        type: 0    // deposit
      };

      if (startDate || endDate) {
        filter.datetime = {};
        if (startDate) filter.datetime.$gte = new Date(startDate);
        if (endDate) filter.datetime.$lte = new Date(endDate);
      }

      const userFilter = await HierarchyService.getFilterForUser(role, referralCode);
      Object.assign(filter, userFilter);

      const transactions = await Transaction.find(filter);

      let totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      const rate = {
        Admin: 0.05,
        SubAdmin: 0.04,
        Agent: 0.03,
        SubAgent: 0.02,
        Affiliate: 0.01
      }[role] || 0;

      const commission = totalAmount * rate;

      res.json({
        success: true,
        summary: {
          role,
          referralCode,
          totalTransactions: transactions.length,
          totalAmount,
          commissionRate: `${rate * 100}%`,
          commission
        }
      });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

}

module.exports = TransactionController;
