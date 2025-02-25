// controllers/notificationController.js
const Notification = require('../Models/Notification');

const sendNotification = async (req, res) => {
  const { userId, title, message } = req.body;
  try {
    const newNotification = new Notification({ userId, title, message });
    await newNotification.save();
    // You could also implement a real-time push mechanism here (like with WebSockets)
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

module.exports = { sendNotification, getNotifications };
