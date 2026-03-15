// src/Services/notificationService.js
const webpush = require('web-push');
const NotificationModel = require('../Models/notificationModel');
const User = require('../Models/userModel');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Store user's push subscription
  async saveSubscription(userId, subscription) {
    try {
      await NotificationModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            pushSubscription: subscription,
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      console.log(`Push subscription saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  // Send push notification to specific user
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      const notification = await NotificationModel.findOne({ userId });
      if (!notification || !notification.pushSubscription) {
        console.log(`No push subscription found for user ${userId}`);
        return false;
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: '/logo.png',
        badge: '/badge.png',
        data: {
          url: data.url || '/',
          ...data
        }
      });

      try {
        await webpush.sendNotification(notification.pushSubscription, payload);
        console.log(`Push notification sent to user ${userId}: ${title}`);
        return true;
      } catch (error) {
        if (error.statusCode === 410) {
          // Subscription expired, remove it
          await NotificationModel.updateOne(
            { userId },
            { $unset: { pushSubscription: 1 } }
          );
          console.log(`Removed expired subscription for user ${userId}`);
        }
        console.error('Error sending push notification:', error);
        return false;
      }
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
      return false;
    }
  }

  // Send real-time notification via Socket.io
  sendRealtimeNotification(userId, notification) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification', notification);
      console.log(`Realtime notification sent to user ${userId}`);
    }
  }

  // Get all admins (including sub-admins and agents based on hierarchy)
  async getHierarchyAdmins(userId, type = 'deposit') {
    try {
      const user = await User.findOne({ userId });
      if (!user) return [];

      let adminUsers = [];

      switch (type) {
        case 'deposit':
        case 'withdrawal':
          // Get all admins for financial transactions
          adminUsers = await User.find({
            role: { $in: ['admin', 'subadmin', 'agent'] },
            status: 'active'
          });
          break;

        case 'kyc':
          // Only admins and subadmins for KYC
          adminUsers = await User.find({
            role: { $in: ['admin', 'subadmin'] },
            status: 'active'
          });
          break;

        case 'user_related':
          // Get hierarchy-based admins
          if (user.role === 'agent') {
            // Get subadmins and admins above this agent
            adminUsers = await User.find({
              role: { $in: ['admin', 'subadmin'] },
              status: 'active'
            });
          } else if (user.role === 'subadmin') {
            // Get admins above this subadmin
            adminUsers = await User.find({
              role: 'admin',
              status: 'active'
            });
          }
          break;

        default:
          // Default: all admins, subadmins, agents
          adminUsers = await User.find({
            role: { $in: ['admin', 'subadmin', 'agent'] },
            status: 'active'
          });
      }

      return adminUsers;
    } catch (error) {
      console.error('Error getting hierarchy admins:', error);
      return [];
    }
  }

  // Send notification to hierarchy-based admins
  async sendToHierarchyAdmins(userId, title, body, data = {}, type = 'deposit') {
    try {
      const adminUsers = await this.getHierarchyAdmins(userId, type);
      
      const results = await Promise.all(
        adminUsers.map(async (admin) => {
          // Send push notification if subscription exists
          const notificationDoc = await NotificationModel.findOne({ userId: admin.userId });
          if (notificationDoc && notificationDoc.pushSubscription) {
            await this.sendPushNotification(admin.userId, title, body, data);
          }
          
          // Send real-time notification
          this.sendRealtimeNotification(admin.userId, {
            title,
            body,
            data,
            timestamp: new Date(),
            type: data.type || type
          });
          
          // Save to database
          await NotificationModel.create({
            userId: admin.userId,
            title,
            message: body,
            type: data.type || type,
            data: {
              ...data,
              triggeredByUserId: userId
            },
            read: false,
            createdAt: new Date()
          });
          
          return admin.userId;
        })
      );

      console.log(`Notifications sent to ${results.length} admins`);
      return results;
    } catch (error) {
      console.error('Error sending to hierarchy admins:', error);
    }
  }

  // Send notification to specific role (admin, subadmin, agent)
  async sendToRole(role, title, body, data = {}) {
    try {
      const users = await User.find({ 
        role: role,
        status: 'active' 
      });

      const results = await Promise.all(
        users.map(async (user) => {
          await this.createAndSendNotification(
            user.userId,
            title,
            body,
            data.type || 'system',
            data
          );
          return user.userId;
        })
      );

      console.log(`Notifications sent to ${results.length} ${role}(s)`);
      return results;
    } catch (error) {
      console.error(`Error sending to ${role}:`, error);
    }
  }

  // Send notification to user's direct admin/agent
  async sendToUserAdmin(userId, title, body, data = {}) {
    try {
      const user = await User.findOne({ userId });
      if (!user || !user.referredBy) {
        console.log(`User ${userId} has no referrer`);
        return [];
      }

      // Find the direct referrer (could be agent or subadmin)
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (!referrer) {
        console.log(`Referrer not found for user ${userId}`);
        return [];
      }

      // Send notification to referrer
      await this.createAndSendNotification(
        referrer.userId,
        title,
        body,
        data.type || 'user_activity',
        {
          ...data,
          referredUserId: userId,
          referredUserName: user.name
        }
      );

      return [referrer.userId];
    } catch (error) {
      console.error('Error sending to user admin:', error);
      return [];
    }
  }

  // Create and send notification (combined method)
  async createAndSendNotification(userId, title, message, type, data = {}) {
    try {
      const notificationData = {
        userId,
        title,
        message,
        type,
        data,
        read: false,
        createdAt: new Date()
      };

      // Save to database
      const notification = await NotificationModel.create(notificationData);

      // Send push notification
      await this.sendPushNotification(userId, title, message, data);

      // Send real-time notification
      this.sendRealtimeNotification(userId, notificationData);

      console.log(`Notification created and sent to user ${userId}`);
      return notification;
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }

  // Send transaction notification based on user's hierarchy
  async sendTransactionNotification(transaction, action = 'created') {
    try {
      const { userId, amount, type, transactionID, _id } = transaction;
      const user = await User.findOne({ userId });
      
      if (!user) {
        console.log(`User ${userId} not found`);
        return;
      }

      let title, body, notificationType;

      switch (action) {
        case 'created':
          title = `New ${type === 0 ? 'Deposit' : 'Withdrawal'} Request`;
          body = `${user.name} submitted a ${type === 0 ? 'deposit' : 'withdrawal'} request of ${amount}`;
          notificationType = type === 0 ? 'deposit_request' : 'withdrawal_request';
          break;
        
        case 'approved':
          title = `${type === 0 ? 'Deposit' : 'Withdrawal'} Approved`;
          body = `Your ${type === 0 ? 'deposit' : 'withdrawal'} of ${amount} has been approved`;
          notificationType = type === 0 ? 'deposit_approved' : 'withdrawal_approved';
          break;
        
        case 'rejected':
          title = `${type === 0 ? 'Deposit' : 'Withdrawal'} Rejected`;
          body = `Your ${type === 0 ? 'deposit' : 'withdrawal'} of ${amount} has been rejected`;
          notificationType = type === 0 ? 'deposit_rejected' : 'withdrawal_rejected';
          break;
        
        case 'processing':
          title = `${type === 0 ? 'Deposit' : 'Withdrawal'} Processing`;
          body = `Your ${type === 0 ? 'deposit' : 'withdrawal'} of ${amount} is being processed`;
          notificationType = type === 0 ? 'deposit_processing' : 'withdrawal_processing';
          break;
      }

      const data = {
        transactionId: _id,
        transactionID,
        userId,
        amount,
        type,
        action,
        url: `/admin/transactions/${_id}`
      };

      if (action === 'created') {
        // Send to hierarchy admins when transaction is created
        await this.sendToHierarchyAdmins(
          userId,
          title,
          body,
          { ...data, type: notificationType },
          type === 0 ? 'deposit' : 'withdrawal'
        );

        // Also send to user's direct referrer
        await this.sendToUserAdmin(
          userId,
          `Your Downline ${type === 0 ? 'Deposit' : 'Withdrawal'}`,
          `${user.name} (your downline) submitted a ${type === 0 ? 'deposit' : 'withdrawal'} of ${amount}`,
          { ...data, type: 'downline_activity' }
        );
      } else {
        // Send to user when transaction status changes
        await this.createAndSendNotification(
          userId,
          title,
          body,
          notificationType,
          data
        );

        // Also notify the admin who processed it (if available)
        if (transaction.processedBy) {
          await this.createAndSendNotification(
            transaction.processedBy,
            `Transaction ${action}`,
            `You ${action} a ${type === 0 ? 'deposit' : 'withdrawal'} of ${amount} for ${user.name}`,
            'transaction_processed',
            data
          );
        }
      }

      console.log(`Transaction notification sent for ${transactionID}`);
    } catch (error) {
      console.error('Error sending transaction notification:', error);
    }
  }
}

module.exports = NotificationService;