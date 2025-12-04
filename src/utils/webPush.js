const webpush = require('web-push');

// Configure VAPID keys (generate with: npx web-push generate-vapid-keys)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Configure web-push
webpush.setVapidDetails(
  'mailto:bajicrick247@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const webPushService = {
  /**
   * Send push notification to a specific user
   */
  async sendNotification(subscription, payload) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      if (error.statusCode === 410) {
        // Subscription expired or invalid
        return 'expired';
      }
      return false;
    }
  },

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(subscriptions, payload) {
    const results = await Promise.allSettled(
      subscriptions.map(sub => this.sendNotification(sub, payload))
    );
    return results;
  },

  /**
   * Create notification payload
   */
  createPayload(title, body, data = {}) {
    return {
      title,
      body,
      icon: '/logo192.png', // Your app icon
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: {
        url: window.location.origin,
        createdAt: new Date().toISOString(),
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
  }
};

module.exports = webPushService;