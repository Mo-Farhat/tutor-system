import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminService from "../../../../services/adminService";
import "../../../../css/dashboards/admin/home/home.css";

function AdminHome() {
  const [overviewData, setOverviewData] = useState({
    onboarding: {
      pendingApplications: 12,
      pendingDocuments: 8,
      activeReviews: 5,
    },
    sessions: {
      todaysSessions: 47,
      upcomingSessions: 156,
      completedThisWeek: 234,
    },
    revenue: {
      thisMonth: 28450.75,
      lastMonth: 26320.5,
      growth: 8.1,
    },
    compliance: [
      {
        type: "WWCC Expiring",
        count: 3,
        priority: "high",
        color: "warning",
      },
      {
        type: "Missing ABN",
        count: 7,
        priority: "medium",
        color: "info",
      },
      {
        type: "Contract Pending",
        count: 15,
        priority: "medium",
        color: "primary",
      },
    ],
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "tutor_application",
      message: "New tutor application from Sarah Johnson",
      time: "2 minutes ago",
      icon: "fas fa-user-plus",
      color: "success",
    },
    {
      id: 2,
      type: "compliance_alert",
      message: "WWCC expiring for John Smith in 7 days",
      time: "15 minutes ago",
      icon: "fas fa-exclamation-triangle",
      color: "warning",
    },
    {
      id: 3,
      type: "payment_issue",
      message: "Payment failed for Emma Thompson - $120",
      time: "1 hour ago",
      icon: "fas fa-credit-card",
      color: "danger",
    },
    {
      id: 4,
      type: "session_completed",
      message: "5 sessions completed successfully",
      time: "2 hours ago",
      icon: "fas fa-check-circle",
      color: "success",
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch real dashboard data
        const [statsResponse, applicationsResponse, usersResponse] =
          await Promise.all([
            adminService.getDashboardStats(),
            adminService.getApplications({ status: "pending", limit: 10 }),
            adminService.getUsers({ limit: 10 }),
          ]);

        // Update overview data with real API data
        setOverviewData((prev) => ({
          ...prev,
          onboarding: {
            pendingApplications: applicationsResponse.data?.length || 0,
            pendingDocuments: 8, // This would come from a documents API
            activeReviews: 5, // This would come from a reviews API
          },
          sessions: {
            todaysSessions: statsResponse.data?.todaysSessions || 0,
            upcomingSessions: statsResponse.data?.upcomingSessions || 0,
            completedThisWeek: statsResponse.data?.completedThisWeek || 0,
          },
          revenue: {
            thisMonth: statsResponse.data?.thisMonthRevenue || 0,
            lastMonth: statsResponse.data?.lastMonthRevenue || 0,
            growth: statsResponse.data?.revenueGrowth || 0,
          },
        }));

        // Update recent activity with real data
        const recentActivityData =
          applicationsResponse.data?.slice(0, 4).map((app, index) => ({
            id: app.id,
            type: "tutor_application",
            message: `New tutor application from ${app.fullName}`,
            time: new Date(app.createdAt).toLocaleString(),
            icon: "fas fa-user-plus",
            color: "success",
          })) || [];

        setRecentActivity(recentActivityData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="admin-home-container">
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
                  <p className="mt-3">Loading dashboard...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-home-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-home-content">
              {/* Header */}
              <div className="admin-home-header mb-4">
                <h2 className="admin-home-title">Admin Dashboard</h2>
                <p className="admin-home-subtitle text-muted">
                  Welcome to the Strive Academy Admin Panel
                </p>
              </div>

              {/* Overview Cards */}
              <div className="row g-4 mb-5">
                {/* Onboarding Card */}
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <div className="admin-overview-icon bg-primary">
                        <i className="fas fa-user-check"></i>
                      </div>
                      <div className="admin-overview-info">
                        <h3 className="admin-overview-number">
                          {overviewData.onboarding.pendingApplications}
                        </h3>
                        <p className="admin-overview-label">
                          Pending Applications
                        </p>
                      </div>
                    </div>
                    <div className="admin-overview-details">
                      <div className="admin-overview-detail-item">
                        <span className="admin-overview-detail-number">
                          {overviewData.onboarding.pendingDocuments}
                        </span>
                        <span className="admin-overview-detail-label">
                          Pending Documents
                        </span>
                      </div>
                      <div className="admin-overview-detail-item">
                        <span className="admin-overview-detail-number">
                          {overviewData.onboarding.activeReviews}
                        </span>
                        <span className="admin-overview-detail-label">
                          Active Reviews
                        </span>
                      </div>
                    </div>
                    <div className="admin-overview-action">
                      <Link
                        to="/dashboard/admin/tutors"
                        className="btn btn-outline-primary btn-sm"
                      >
                        View Tutors
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Sessions Card */}
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <div className="admin-overview-icon bg-success">
                        <i className="fas fa-calendar-check"></i>
                      </div>
                      <div className="admin-overview-info">
                        <h3 className="admin-overview-number">
                          {overviewData.sessions.todaysSessions}
                        </h3>
                        <p className="admin-overview-label">Today's Sessions</p>
                      </div>
                    </div>
                    <div className="admin-overview-details">
                      <div className="admin-overview-detail-item">
                        <span className="admin-overview-detail-number">
                          {overviewData.sessions.upcomingSessions}
                        </span>
                        <span className="admin-overview-detail-label">
                          Upcoming
                        </span>
                      </div>
                      <div className="admin-overview-detail-item">
                        <span className="admin-overview-detail-number">
                          {overviewData.sessions.completedThisWeek}
                        </span>
                        <span className="admin-overview-detail-label">
                          This Week
                        </span>
                      </div>
                    </div>
                    <div className="admin-overview-action">
                      <Link
                        to="/dashboard/admin/calendar"
                        className="btn btn-outline-success btn-sm"
                      >
                        View Calendar
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Revenue Card */}
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <div className="admin-overview-icon bg-warning">
                        <i className="fas fa-dollar-sign"></i>
                      </div>
                      <div className="admin-overview-info">
                        <h3 className="admin-overview-number">
                          ${overviewData.revenue.thisMonth.toLocaleString()}
                        </h3>
                        <p className="admin-overview-label">
                          This Month Revenue
                        </p>
                      </div>
                    </div>
                    <div className="admin-overview-details">
                      <div className="admin-overview-detail-item">
                        <span className="admin-overview-detail-number">
                          ${overviewData.revenue.lastMonth.toLocaleString()}
                        </span>
                        <span className="admin-overview-detail-label">
                          Last Month
                        </span>
                      </div>
                      <div className="admin-overview-detail-item">
                        <span className="admin-overview-detail-number text-success">
                          +{overviewData.revenue.growth}%
                        </span>
                        <span className="admin-overview-detail-label">
                          Growth
                        </span>
                      </div>
                    </div>
                    <div className="admin-overview-action">
                      <Link
                        to="/dashboard/admin/finance"
                        className="btn btn-outline-warning btn-sm"
                      >
                        View Finance
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Compliance Card */}
                <div className="col-12 col-md-6 col-xl-3">
                  <div className="admin-overview-card">
                    <div className="admin-overview-card-header">
                      <div className="admin-overview-icon bg-danger">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div className="admin-overview-info">
                        <h3 className="admin-overview-number">
                          {overviewData.compliance.reduce(
                            (sum, item) => sum + item.count,
                            0
                          )}
                        </h3>
                        <p className="admin-overview-label">
                          Compliance Alerts
                        </p>
                      </div>
                    </div>
                    <div className="admin-overview-details">
                      {overviewData.compliance
                        .slice(0, 2)
                        .map((alert, index) => (
                          <div
                            key={index}
                            className="admin-overview-detail-item"
                          >
                            <span
                              className={`admin-overview-detail-number text-${alert.color}`}
                            >
                              {alert.count}
                            </span>
                            <span className="admin-overview-detail-label">
                              {alert.type}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div className="admin-overview-action">
                      <Link
                        to="/dashboard/admin/tutors"
                        className="btn btn-outline-danger btn-sm"
                      >
                        View Issues
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="row">
                <div className="col-12 col-lg-8">
                  <div className="admin-home-section">
                    <div className="admin-section-header">
                      <h4 className="admin-section-title">Recent Activity</h4>
                      <Link
                        to="/dashboard/admin/notifications"
                        className="btn btn-outline-primary btn-sm"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="admin-activity-list">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="admin-activity-item">
                          <div
                            className={`admin-activity-icon bg-${activity.color}`}
                          >
                            <i className={activity.icon}></i>
                          </div>
                          <div className="admin-activity-content">
                            <p className="admin-activity-message">
                              {activity.message}
                            </p>
                            <small className="admin-activity-time text-muted">
                              {activity.time}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="col-12 col-lg-4">
                  <div className="admin-home-section">
                    <div className="admin-section-header">
                      <h4 className="admin-section-title">Quick Actions</h4>
                    </div>
                    <div className="admin-quick-actions">
                      <Link
                        to="/dashboard/admin/tutors"
                        className="admin-quick-action-btn"
                      >
                        <i className="fas fa-user-plus"></i>
                        <span>Review Applications</span>
                      </Link>
                      <Link
                        to="/dashboard/admin/calendar"
                        className="admin-quick-action-btn"
                      >
                        <i className="fas fa-calendar-plus"></i>
                        <span>Schedule Session</span>
                      </Link>
                      <Link
                        to="/dashboard/admin/packages"
                        className="admin-quick-action-btn"
                      >
                        <i className="fas fa-box"></i>
                        <span>Create Package</span>
                      </Link>
                      <Link
                        to="/dashboard/admin/blog"
                        className="admin-quick-action-btn"
                      >
                        <i className="fas fa-edit"></i>
                        <span>Write Blog Post</span>
                      </Link>
                      <Link
                        to="/dashboard/admin/support"
                        className="admin-quick-action-btn"
                      >
                        <i className="fas fa-ticket-alt"></i>
                        <span>Support Tickets</span>
                      </Link>
                      <Link
                        to="/dashboard/admin/settings"
                        className="admin-quick-action-btn"
                      >
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
