const { notificationModel } = require("../models");

class NotificationService {
  /**
   * Create a new notification
   * @param {string} userId - User ID to send notification to
   * @param {string} type - Notification type
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} priority - Priority level (low, medium, high)
   * @param {string} actionUrl - Optional URL for action button
   * @param {object} metadata - Optional metadata object
   * @returns {Promise<object>} Created notification
   */
  async createNotification(userId, type, title, message, priority = "medium", actionUrl = null, metadata = {}) {
    try {
      const notification = await notificationModel.create({
        userId,
        type,
        title,
        message,
        priority,
        actionUrl,
        metadata,
      });

      console.log(`📬 Notification created for user ${userId}: ${type}`);
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      // Don't throw - notifications should not break the main flow
      return null;
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {object} filters - Optional filters (read, type, limit, offset)
   * @returns {Promise<Array>} Array of notifications
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      return await notificationModel.findByUserId(userId, filters);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  async getUnreadCount(userId) {
    try {
      return await notificationModel.getUnreadCount(userId);
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<object|null>} Updated notification or null
   */
  async markAsRead(notificationId, userId) {
    try {
      return await notificationModel.markAsRead(notificationId, userId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of notifications updated
   */
  async markAllAsRead(userId) {
    try {
      const result = await notificationModel.markAllAsRead(userId);
      return result[0]; // Sequelize returns [affectedCount]
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<number>} Number of deleted rows
   */
  async deleteNotification(notificationId, userId) {
    try {
      return await notificationModel.deleteNotification(notificationId, userId);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Create welcome notification for first-time login
   * @param {string} userId - User ID
   * @param {string} userRole - User role (tutor, student, admin)
   * @param {string} firstName - User's first name
   * @returns {Promise<object|null>} Created notification
   */
  async createWelcomeNotification(userId, userRole, firstName) {
    const roleMessages = {
      tutor: {
        title: `Welcome to Strive Academics, ${firstName}! 🎉`,
        message: "We're excited to have you join our team of exceptional tutors. Check out our platform guide to get started with scheduling lessons, managing students, and more.",
        actionUrl: "/dashboard/tutor/platform-guide",
      },
      student: {
        title: `Welcome to Strive Academics, ${firstName}! 🎓`,
        message: "Welcome to your learning journey! Explore our platform guide to learn how to book lessons, track your progress, and communicate with your tutor.",
        actionUrl: "/dashboard/student/platform-guide",
      },
      admin: {
        title: `Welcome to Strive Academics Admin, ${firstName}! 👋`,
        message: "Welcome to the admin dashboard. Check out the platform guide to learn about managing tutors, students, and monitoring the platform.",
        actionUrl: "/dashboard/admin/platform-guide",
      },
    };

    const config = roleMessages[userRole];
    if (!config) {
      console.warn(`Unknown user role for welcome notification: ${userRole}`);
      return null;
    }

    return await this.createNotification(
      userId,
      "welcome",
      config.title,
      config.message,
      "low",
      config.actionUrl,
      { isWelcome: true, role: userRole }
    );
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
