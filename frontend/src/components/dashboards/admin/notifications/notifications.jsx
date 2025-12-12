import React, { useState, useEffect } from "react";
import "../../../../css/dashboards/admin/notifications/notifications.css";
import notificationService from "../../../../services/notificationService";

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
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_application: "fas fa-user-plus text-primary",
      payment_issue: "fas fa-exclamation-circle text-danger",
      wwcc_expiry: "fas fa-shield-alt text-warning",
      compliance_alert: "fas fa-exclamation-triangle text-warning",
      welcome: "fas fa-hand-wave text-success",
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

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
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
                              {formatTimestamp(notification.createdAt)}
                            </small>
                          </div>
                        </div>
                        <p className="admin-notification-message">
                          {notification.message}
                        </p>
                        <div className="admin-notification-actions">
                          
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
