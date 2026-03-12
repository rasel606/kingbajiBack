const cron = require("node-cron");
const { creditDueFreeSpins } = require("../services/depositPromoService");

let isRunning = false;

// Every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const result = await creditDueFreeSpins(300);
    if (result.processed > 0) {
      console.log("✅ promoFreeSpinWorker:", result);
    }
  } catch (error) {
    console.error("❌ promoFreeSpinWorker error:", error.message);
  } finally {
    isRunning = false;
  }
});

module.exports = {};
