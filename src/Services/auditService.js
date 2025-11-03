const AuditLog = require('../Models/AuditLog');

class AuditService {
    
    // অডিট লগ তৈরি করুন
    static async createAuditLog(auditData) {
        try {
            const auditLog = new AuditLog(auditData);
            await auditLog.save();
            return auditLog;
        } catch (error) {
            console.error('Audit log creation error:', error);
            throw error;
        }
    }

    // ট্রানজেকশন অডিট লগ
    static async logTransactionAction(action, performedBy, userType, transaction, ipAddress, userAgent, status = 'success', errorMessage = null) {
        return await this.createAuditLog({
            action,
            performedBy,
            userType,
            targetId: transaction.transactionID,
            targetType: 'Transaction',
            oldValues: { status: transaction.status },
            newValues: transaction,
            ipAddress,
            userAgent,
            status,
            errorMessage
        });
    }

    // বোনাস অডিট লগ
    static async logBonusAction(action, performedBy, userType, bonus, ipAddress, userAgent, status = 'success') {
        return await this.createAuditLog({
            action,
            performedBy,
            userType,
            targetId: bonus._id,
            targetType: 'Bonus',
            oldValues: {},
            newValues: bonus,
            ipAddress,
            userAgent,
            status
        });
    }

    // ইউজার অডিট লগ
    static async logUserAction(action, performedBy, userType, user, oldValues = {}, ipAddress = '', userAgent = '') {
        return await this.createAuditLog({
            action,
            performedBy,
            userType,
            targetId: user.userId,
            targetType: 'User',
            oldValues,
            newValues: user,
            ipAddress,
            userAgent,
            status: 'success'
        });
    }

    // অডিট লগ সার্চ
    static async searchAuditLogs(query, page = 1, limit = 50) {
        try {
            const { action, performedBy, targetType, startDate, endDate, status } = query;
            
            let searchQuery = {};
            
            if (action) searchQuery.action = action;
            if (performedBy) searchQuery.performedBy = performedBy;
            if (targetType) searchQuery.targetType = targetType;
            if (status) searchQuery.status = status;
            
            if (startDate || endDate) {
                searchQuery.timestamp = {};
                if (startDate) searchQuery.timestamp.$gte = new Date(startDate);
                if (endDate) searchQuery.timestamp.$lte = new Date(endDate);
            }

            const auditLogs = await AuditLog.find(searchQuery)
                .sort({ timestamp: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await AuditLog.countDocuments(searchQuery);

            return {
                auditLogs,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuditService;