const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const notificationService = require("../services/notificationService");

// Get user's notifications
router.get("/auth/notifications", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { read, type, limit, offset } = req.query;

    const filters = {};
    if (read !== undefined) {
      filters.read = read === "true";
    }
    if (type) {
      filters.type = type;
    }
    if (limit) {
      filters.limit = parseInt(limit, 10);
    }
    if (offset) {
      filters.offset = parseInt(offset, 10);
    }

    const notifications = await notificationService.getUserNotifications(userId, filters);
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
});

// Get unread count
router.get("/auth/notifications/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
});

// Mark notification as read
router.put("/auth/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
});

// Mark all notifications as read
router.put("/auth/notifications/read-all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
      error: error.message,
    });
  }
});

// Delete notification
router.delete("/auth/notifications/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const deleted = await notificationService.deleteNotification(notificationId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
});

module.exports = router;
