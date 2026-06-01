import {
  findNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from './notification.repository.js';

// Get my notifications
export const getMyNotifications = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await findNotificationsByUserId(req.user._id, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// Mark one as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(
      req.params.id,
      req.user._id,
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, notification });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.user._id);
    res
      .status(200)
      .json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// Delete one notification
export const deleteOneNotification = async (req, res) => {
  try {
    const notification = await deleteNotification(req.params.id, req.user._id);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};
