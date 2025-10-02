import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import "../../../../css/dashboards/tutor/snippets/navbar.css";

function TutorNavbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTutorData();
  }, []);

  const fetchTutorData = async () => {
    try {
      setLoading(true);

      // Fetch profile data from our new API
      const username = user?.username || "notmanu23"; // Use logged in user or fallback to existing user
      const response = await fetch(
        `http://localhost:8000/api/auth/tutor/profile/?username=${username}`
      );
      const data = await response.json();

      if (data.success) {
        setTutorProfile(data.data);
      } else {
        console.error("Failed to fetch profile data:", data.message);
      }

      // Fetch completion status
      const completionResponse = await fetch(
        `http://localhost:8000/api/auth/tutor/completion-status/?username=${username}`
      );
      const completionData = await completionResponse.json();

      if (completionData.success) {
        setCompletionStatus(completionData.data);
      } else {
        console.error(
          "Failed to fetch completion status:",
          completionData.message
        );
      }

      // For now, set empty document status since we don't have that API yet
      setDocumentStatus(null);
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if profile is complete (basic required fields)
  const isProfileComplete = () => {
    if (!tutorProfile) return false;

    const userData = tutorProfile.user;

    // Check basic profile fields
    return !!(
      userData.first_name &&
      userData.last_name &&
      userData.email &&
      tutorProfile.bio &&
      tutorProfile.university
    );
  };

  // Check if documents are approved (for now, return false since we don't have this data)
  const areDocumentsApproved = () => {
    return false; // We'll implement this when we have the documents API
  };

  // Determine if alert should be shown
  const shouldShowAlert = () => {
    return !isProfileComplete() || !areDocumentsApproved();
  };

  // Get alert message
  const getAlertMessage = () => {
    if (!isProfileComplete()) {
      return "Please complete your profile to start receiving bookings.";
    }
    if (!areDocumentsApproved()) {
      return "Please upload and verify your required documents.";
    }
    return "";
  };

  if (loading) {
    return (
      <div className="tutor-navbar-main">
        <div className="tutor-navbar-profile">
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tutor-navbar-main ${isCollapsed ? "collapsed" : ""}`}>
      {/* Profile Section */}
      <div className="tutor-navbar-profile">
        <div className="tutor-navbar-profile-info">
          <div className="tutor-navbar-avatar">
            {tutorProfile?.profile_picture ? (
              <img
                src={tutorProfile.profile_picture}
                alt="Profile"
                className="tutor-navbar-avatar-img"
              />
            ) : (
              <div className="tutor-navbar-avatar-placeholder">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div className="tutor-navbar-user-info">
            <h6 className="tutor-navbar-greeting">Good morning</h6>
            <h5 className="tutor-navbar-username">
              {tutorProfile
                ? `${tutorProfile.user.first_name || ""} ${
                    tutorProfile.user.last_name || ""
                  }`.trim() ||
                  tutorProfile.user.username ||
                  "Tutor"
                : "Tutor Name"}
            </h5>
          </div>
        </div>
        <button
          className="tutor-navbar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"}`}></i>
        </button>
      </div>

      {/* Alert Section - Only show if profile incomplete or documents not approved */}
      {shouldShowAlert() && (
        <div className="tutor-navbar-alert">
          <div
            className="alert alert-warning alert-dismissible fade show"
            role="alert"
          >
            <i className="fas fa-exclamation-triangle me-2"></i>
            {getAlertMessage()}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
            ></button>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="tutor-navbar-nav">
        <ul className="tutor-navbar-nav-list">
          <li className="tutor-navbar-nav-item">
            <Link
              to="/dashboard/tutor/home"
              className={`tutor-navbar-nav-link ${
                !completionStatus?.fully_complete ? "disabled" : ""
              }`}
              onClick={(e) =>
                !completionStatus?.fully_complete && e.preventDefault()
              }
            >
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
              {!completionStatus?.fully_complete && (
                <i className="fas fa-lock ms-auto"></i>
              )}
            </Link>
          </li>
          <li className="tutor-navbar-nav-item">
            <Link
              to="/dashboard/tutor/profile"
              className="tutor-navbar-nav-link"
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </Link>
          </li>
          <li className="tutor-navbar-nav-item">
            <Link
              to="/dashboard/tutor/students"
              className={`tutor-navbar-nav-link ${
                !completionStatus?.fully_complete ? "disabled" : ""
              }`}
              onClick={(e) =>
                !completionStatus?.fully_complete && e.preventDefault()
              }
            >
              <i className="fas fa-users"></i>
              <span>Students</span>
              {!completionStatus?.fully_complete && (
                <i className="fas fa-lock ms-auto"></i>
              )}
            </Link>
          </li>
          <li className="tutor-navbar-nav-item">
            <Link
              to="/dashboard/tutor/calendar"
              className={`tutor-navbar-nav-link ${
                !completionStatus?.fully_complete ? "disabled" : ""
              }`}
              onClick={(e) =>
                !completionStatus?.fully_complete && e.preventDefault()
              }
            >
              <i className="fas fa-calendar"></i>
              <span>Calendar</span>
              {!completionStatus?.fully_complete && (
                <i className="fas fa-lock ms-auto"></i>
              )}
            </Link>
          </li>
          <li className="tutor-navbar-nav-item">
            <Link
              to="/dashboard/tutor/earnings"
              className={`tutor-navbar-nav-link ${
                !completionStatus?.fully_complete ? "disabled" : ""
              }`}
              onClick={(e) =>
                !completionStatus?.fully_complete && e.preventDefault()
              }
            >
              <i className="fas fa-dollar-sign"></i>
              <span>Earnings</span>
              {!completionStatus?.fully_complete && (
                <i className="fas fa-lock ms-auto"></i>
              )}
            </Link>
          </li>
          <li className="tutor-navbar-nav-item">
            <Link to="/tutor/documents" className="tutor-navbar-nav-link">
              <i className="fas fa-file-alt"></i>
              <span>Documents</span>
            </Link>
          </li>
          <li className="tutor-navbar-nav-item">
            <Link
              to="/dashboard/tutor/notifications"
              className={`tutor-navbar-nav-link ${
                !completionStatus?.fully_complete ? "disabled" : ""
              }`}
              onClick={(e) =>
                !completionStatus?.fully_complete && e.preventDefault()
              }
            >
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
              {!completionStatus?.fully_complete && (
                <i className="fas fa-lock ms-auto"></i>
              )}
            </Link>
          </li>
          <li className="tutor-navbar-nav-item">
            <Link
              to="/dashboard/tutor/settings"
              className="tutor-navbar-nav-link"
            >
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="tutor-navbar-footer">
        <button className="tutor-navbar-logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default TutorNavbar;
