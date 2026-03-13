import Notification from "../models/Notification.js";
import { parsePagination, parseSort } from "../utils/queryUtils.js";

// GET /api/notifications
export const getMyNotifications = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === "true";
    }

    const { page, limit, skip } = parsePagination(req);
    const sort = parseSort(req);

    const [items, total] = await Promise.all([
      Notification.find(filter).sort(sort).skip(skip).limit(limit),
      Notification.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ unread });
  } catch (err) {
    next(err);
  }
};

