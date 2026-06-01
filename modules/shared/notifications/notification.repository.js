import Notification from '../models/notification.model.js';

export const createNotification = async (data) => {
  return await Notification.create(data);
};

export const findNotificationsByUserId = async (
  userId,
  { page = 1, limit = 20 } = {},
) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ 'recipient.userId': userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ 'recipient.userId': userId }),
    Notification.countDocuments({ 'recipient.userId': userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const markNotificationAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      'recipient.userId': userId,
    },
    { isRead: true },
    { new: true },
  );
};

export const markAllNotificationsAsRead = async (userId) => {
  return await Notification.updateMany(
    { 'recipient.userId': userId, isRead: false },
    { isRead: true },
  );
};

export const deleteNotification = async (notificationId, userId) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    'recipient.userId': userId,
  });
};
