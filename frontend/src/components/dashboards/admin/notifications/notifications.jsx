import React, { useState, useEffect } from "react";
import "../../../../css/dashboards/admin/notifications/notifications.css";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock notifications
      const mockNotifications = [
        {
          id: 1,
          type: "payment_due",
          title: "Payment Overdue",
          message: "Student Alice Chen has an overdue payment of $150",
          priority: "high",
          timestamp: "2024-03-20 10:30",
          read: false,
          actionUrl: "/dashboard/admin/finance",
        },
        {
          id: 2,
          type: "session_reminder",
          title: "Upcoming Session",
          message: "Mathematics session with Michael Chen starts in 1 hour",
          priority: "medium",
          timestamp: "2024-03-20 09:00",
          read: false,
          actionUrl: "/dashboard/admin/calendar",
        },
        {
          id: 3,
          type: "compliance_alert",
          title: "WWCC Expiring",
          message: "Tutor Sarah Johnson's WWCC expires in 7 days",
          priority: "high",
          timestamp: "2024-03-20 08:15",
          read: true,
          actionUrl: "/dashboard/admin/tutors",
        },
        {
          id: 4,
          type: "package_expiring",
          title: "Package Expiring",
          message: "Student Emma Wilson's package expires in 3 days",
          priority: "medium",
          timestamp: "2024-03-19 16:45",
          read: true,
          actionUrl: "/dashboard/admin/students",
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      payment_due: "fas fa-exclamation-circle text-danger",
      session_reminder: "fas fa-clock text-info",
      compliance_alert: "fas fa-shield-alt text-warning",
      package_expiring: "fas fa-box text-warning",
    };
    return icons[type] || "fas fa-bell text-secondary";
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "danger",
      medium: "warning",
      low: "info",
    };
    return (
      <span className={`badge bg-${colors[priority] || "secondary"}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-AU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "unread") return !notif.read;
    if (activeTab === "high") return notif.priority === "high";
    return true;
  });

  if (isLoading) {
    return (
      <div className="admin-notifications-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading notifications...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notifications-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-notifications-content">
              {/* Header */}
              <div className="admin-notifications-header">
                <h2 className="admin-notifications-title">
                  Notifications Centre
                </h2>
                <p className="admin-notifications-subtitle text-muted">
                  Central hub for system alerts and notifications
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="admin-notifications-tabs">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "all" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("all")}
                    >
                      All ({notifications.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "unread" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("unread")}
                    >
                      Unread ({notifications.filter((n) => !n.read).length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "high" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("high")}
                    >
                      High Priority (
                      {
                        notifications.filter((n) => n.priority === "high")
                          .length
                      }
                      )
                    </button>
                  </li>
                </ul>
              </div>

              {/* Notifications List */}
              <div className="admin-notifications-list">
                {filteredNotifications.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-bell-slash text-muted mb-3"></i>
                    <h5>No notifications</h5>
                    <p className="text-muted">
                      All caught up! No notifications match your filter.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`admin-notification-item ${
                        !notification.read ? "unread" : ""
                      }`}
                    >
                      <div className="admin-notification-icon">
                        <i
                          className={getNotificationIcon(notification.type)}
                        ></i>
                      </div>
                      <div className="admin-notification-content">
                        <div className="admin-notification-header">
                          <h6 className="admin-notification-title">
                            {notification.title}
                          </h6>
                          <div className="admin-notification-meta">
                            {getPriorityBadge(notification.priority)}
                            <small className="text-muted ms-2">
                              {formatTimestamp(notification.timestamp)}
                            </small>
                          </div>
                        </div>
                        <p className="admin-notification-message">
                          {notification.message}
                        </p>
                        <div className="admin-notification-actions">
                          {notification.actionUrl && (
                            <button className="btn btn-sm btn-outline-primary me-2">
                              View Details
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;
