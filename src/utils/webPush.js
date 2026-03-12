const webpush = require('web-push');

// Webpush config - DISABLED until VAPID keys are set
// To enable: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env

let webpushConfigured = false;

try {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@bajicrick.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    webpushConfigured = true;
    console.log('✅ Webpush VAPID configured');
  } else {
    console.log('⚠️ Webpush VAPID keys missing - push notifications disabled');
  }
} catch (error) {
  console.log('❌ Webpush configuration error:', error.message);
  webpushConfigured = false;
}

const webPushService = {
  /**
   * Send push notification to a specific user (only if configured)
   */
  async sendNotification(subscription, payload) {
    if (!webpushConfigured) {
      console.log('Push notifications disabled - missing VAPID keys');
      return false;
    }
    
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      if (error.statusCode === 410) {
        return 'expired';
      }
      return false;
    }
  },

  /**
   * Send notification to multiple users (only if configured)
   */
  async sendBulkNotification(subscriptions, payload) {
    if (!webpushConfigured) {
      return { success: false, message: 'Push notifications disabled' };
    }
    
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
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: {
        url: '/',
        createdAt: new Date().toISOString(),
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    };
  },

  /**
   * Check if push notifications are enabled
   */
  isEnabled() {
    return webpushConfigured;
  }
};

module.exports = webPushService;
