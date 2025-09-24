import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { ADMIN_NAV_LINKS } from "../constants/adminConstants";
import "../../../../css/dashboards/admin/snippets/navbar.css";

function AdminNavbar() {
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="admin-navbar-mobile-toggle d-lg-none">
        <button
          className={`admin-navbar-toggle-btn btn btn-outline-secondary ${
            isMobileMenuOpen ? "admin-navbar-toggle-active" : ""
          }`}
          onClick={toggleMobileMenu}
        >
          <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
      </div>

      {/* Desktop Navbar */}
      <nav
        className={`admin-navbar-main ${
          isNavbarExpanded ? "admin-navbar-expanded" : "admin-navbar-collapsed"
        } d-none d-lg-block`}
        onMouseEnter={() => setIsNavbarExpanded(true)}
        onMouseLeave={() => setIsNavbarExpanded(false)}
      >
        <div className="admin-navbar-container">
          {/* User Profile Header */}
          <div className="admin-navbar-user-profile">
            <div className="admin-navbar-avatar">
              <div className="admin-navbar-avatar-placeholder">
                <i className="fas fa-user-shield"></i>
              </div>
            </div>
            <div
              className={`admin-navbar-user-info ${
                !isNavbarExpanded ? "admin-navbar-hidden" : ""
              }`}
            >
              <h6 className="admin-navbar-username">
                {user
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username ||
                    "Admin"
                  : "Admin User"}
              </h6>
              <p className="admin-navbar-user-role">Administrator</p>
            </div>
            <div
              className={`admin-navbar-options ${
                !isNavbarExpanded ? "admin-navbar-hidden" : ""
              }`}
            >
              <i className="fas fa-ellipsis-v"></i>
            </div>
          </div>

          {/* Navigation Menu */}
          <ul className="admin-navbar-menu">
            {ADMIN_NAV_LINKS.map((link) => (
              <li key={link.path} className="admin-navbar-menu-item">
                <Link
                  to={link.path}
                  className={`admin-navbar-menu-link ${
                    location.pathname === link.path ? "active" : ""
                  }`}
                  title={link.name}
                >
                  <i className={`${link.icon} admin-navbar-icon`}></i>
                  <span
                    className={!isNavbarExpanded ? "admin-navbar-hidden" : ""}
                  >
                    {link.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout Section */}
          <div className="admin-navbar-logout">
            <button
              className="admin-navbar-logout-link"
              onClick={handleLogout}
              title="Logout"
            >
              <span className={!isNavbarExpanded ? "admin-navbar-hidden" : ""}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav
        className={`admin-navbar-mobile ${
          isMobileMenuOpen ? "admin-navbar-mobile-open" : ""
        } d-lg-none`}
      >
        <div className="admin-navbar-mobile-container">
          {/* User Profile Header */}
          <div className="admin-navbar-user-profile">
            <div className="admin-navbar-avatar">
              <div className="admin-navbar-avatar-placeholder">
                <i className="fas fa-user-shield"></i>
              </div>
            </div>
            <div className="admin-navbar-user-info">
              <h6 className="admin-navbar-username">
                {user
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username ||
                    "Admin"
                  : "Admin User"}
              </h6>
              <p className="admin-navbar-user-role">Administrator</p>
            </div>
            <div className="admin-navbar-options">
              <i className="fas fa-ellipsis-v"></i>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <ul className="admin-navbar-mobile-menu">
            {ADMIN_NAV_LINKS.map((link) => (
              <li key={link.path} className="admin-navbar-menu-item">
                <Link
                  to={link.path}
                  className="admin-navbar-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`${link.icon} admin-navbar-icon`}></i>
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
            <li className="admin-navbar-menu-item">
              <button className="admin-navbar-menu-link" onClick={handleLogout}>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default AdminNavbar;
