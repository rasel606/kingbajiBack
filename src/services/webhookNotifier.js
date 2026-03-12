const axios = require("axios");

async function sendWebhook(eventType, payload = {}) {
  try {
    const url = process.env.PROMO_WEBHOOK_URL;
    if (!url) return { skipped: true, reason: "PROMO_WEBHOOK_URL not configured" };

    await axios.post(
      url,
      {
        eventType,
        timestamp: new Date().toISOString(),
        payload,
      },
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
          "x-webhook-source": "kingbaji-backend",
        },
      }
    );

    return { sent: true };
  } catch (error) {
    return { sent: false, error: error.message };
  }
}

module.exports = { sendWebhook };
