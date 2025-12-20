const Notification = require("../models/Notification");

// Create notification
exports.createNotification = async (title, userId, content, type, metaData = {}) => {
  try {
    console.log(title, userId, content, type, metaData);
    const notification = new Notification({
      title,
      userId,
      content,
      type,
      metaData
    });
    await notification.save();
    console.log(notification);
    return notification;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get user notifications
exports.getGroupedNotifications = async (req, res) => {

  try {
    console.log(req.params);
    const { userId } = req.params;
    // const page = parseInt(req.query.page) || 1; // default page 1
    // const limit = parseInt(req.query.limit) || 5; // default 5 groups per page

    // Calculate 7 days ago date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // including today (last 7 days)

    // Aggregation pipeline


    // Run aggregation
    const groupedNotifications = await Notification.aggregate(
      [
        // Match only last 7 days notifications

        { $match: { userId: userId } },


        // Add a formatted date string field (yyyy-mm-dd)
        {
          $addFields: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Dhaka" },
            },
          },
        },
        // Group by date
        {
          $group: {
            _id: {
              date: "$date",
              timezone: "$timezone"
            },
            notifications: {
              $push: {
                _id: "$_id",
                title: "$title",
                // userId: "$userId",
                content: "$content",
                // type: "$type",
                read: "$read",
                // metaData: "$metaData",
                createdAt: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        // Sort groups by date descending (newest first)
        { $sort: { _id: -1 } },
        // Pagination: skip & limit
        // { $skip: (page - 1) * limit },
        // { $limit: limit },
      ]
    );


    console.log(groupedNotifications);
    // Also get total groups count for pagination
    // const totalGroupsCountPipeline = [
    //   { $match: { createdAt: { $gte: sevenDaysAgo } } },
    //   {
    //     $addFields: {
    //       date: {
    //         $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Dhaka" },
    //       },
    //     },
    //   },
    //   { $group: { _id: "$date" } },
    //   { $count: "totalGroups" },
    // ];
    // const countResult = await Notification.aggregate(totalGroupsCountPipeline);
    // const totalGroups = countResult.length > 0 ? countResult[0].totalGroups : 0;

    res.json({
      // page,
      // limit,
      // totalGroups,
      // // totalPages: Math.ceil(totalGroups / limit),
      // data: groupedNotifications.map((group) => ({
      //   date: group._id,
      //   count: group.count,
      //   notifications: group.notifications,
      groupedNotifications

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.updateMany(
      { userId, read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await UserModel.findById(userId).select('notificationPreferences');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      data: user.notificationPreferences || getDefaultPreferences() 
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select('notificationPreferences');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user.notificationPreferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendPushNotification = async (req, res) => {
  try {
    const { userIds, title, message, type, data } = req.body;
    
    // Create notifications for each user
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type: type || 'system',
      data: data || {}
    }));
    
    await Notification.insertMany(notifications);
    
    // Here you would integrate with actual push notification services
    // like Firebase Cloud Messaging, OneSignal, etc.
    
    res.json({ 
      success: true, 
      message: `Notification sent to ${userIds.length} users` 
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function for default preferences
function getDefaultPreferences() {
  return {
    email: true,
    push: true,
    sms: false,
    depositAlerts: true,
    withdrawalAlerts: true,
    bonusAlerts: true,
    systemAlerts: true,
    marketing: false
  };
}