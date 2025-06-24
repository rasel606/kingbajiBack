const Notification = require("../Models/Notification");

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
    const notificationId = notification._id;
    console.log(notificationId);
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



// Mark notifications as read
exports.markAsRead = async (notificationIds) => {
  try {
    return await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { read: true } }
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

// router.get("/:userId", async (req, res) => {
//   try {
//     const notifications = await notificationController.getUserNotifications(
//       req.params.userId,
//       req.query.limit || 10
//     );
//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Mark notifications as read
// router.post("/mark-read", async (req, res) => {
//   try {
//     const result = await notificationController.markAsRead(req.body.notificationIds);
//     res.json({ success: true, modifiedCount: result.modifiedCount });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });