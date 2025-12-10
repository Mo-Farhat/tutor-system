import api from "./api";

const notificationService = {
  /**
   * Get user's notifications
   * @param {object} filters - Optional filters (read, type, limit, offset)
   * @returns {Promise<object>} Notifications and unread count
   */
  async getNotifications(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.read !== undefined) {
        params.append("read", filters.read);
      }
      if (filters.type) {
        params.append("type", filters.type);
      }
      if (filters.limit) {
        params.append("limit", filters.limit);
      }
      if (filters.offset) {
        params.append("offset", filters.offset);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/auth/notifications?${queryString}` : "/auth/notifications";
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const response = await api.get("/auth/notifications/unread-count");
      return response.data.count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<object>} Updated notification
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/auth/notifications/${notificationId}/read`);
      return response.data.notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<number>} Number of notifications marked as read
   */
  async markAllAsRead() {
    try {
      const response = await api.put("/auth/notifications/read-all");
      return response.data.count;
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/auth/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};

export default notificationService;
