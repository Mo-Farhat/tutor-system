const prisma = require("../db/prisma");

class NotificationModel {
  /**
   * Create a new notification
   */
  async create(data) {
    return await prisma.notification.create({
      data: {
        userId: Number(data.userId),
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || "medium",
        read: data.read || false,
        actionUrl: data.actionUrl || null,
        metadata: data.metadata || {},
      },
    });
  }

  /**
   * Find notifications by user ID with optional filters
   */
  async findByUserId(userId, options = {}) {
    const {
      read,
      type,
      limit = 50,
      offset = 0,
      orderBy = "createdAt",
      orderDir = "desc",
    } = options;

    const where = {
      userId: Number(userId),
    };

    if (read !== undefined) {
      where.read = read;
    }

    if (type) {
      where.type = type;
    }

    return await prisma.notification.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        [orderBy]: orderDir.toLowerCase(),
      },
    });
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId) {
    return await prisma.notification.count({
      where: {
        userId: Number(userId),
        read: false,
      },
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: Number(notificationId),
        userId: Number(userId),
      },
    });

    if (!notification) {
      return null;
    }

    return await prisma.notification.update({
      where: {
        id: Number(notificationId),
      },
      data: {
        read: true,
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: {
        userId: Number(userId),
        read: false,
      },
      data: {
        read: true,
      },
    });

    return result.count;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: Number(notificationId),
          userId: Number(userId),
        },
      });

      if (!notification) {
        return 0;
      }

      await prisma.notification.delete({
        where: {
          id: Number(notificationId),
        },
      });

      return 1;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return 0;
    }
  }

  /**
   * Find notification by ID
   */
  async findById(id) {
    return await prisma.notification.findUnique({
      where: {
        id: Number(id),
      },
    });
  }

  /**
   * Find one notification matching criteria
   */
  async findOne(where) {
    return await prisma.notification.findFirst({
      where: {
        ...where,
        userId: where.userId ? Number(where.userId) : undefined,
      },
    });
  }
}

module.exports = new NotificationModel();
