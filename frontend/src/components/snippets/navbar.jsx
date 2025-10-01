import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../css/snippets/navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle navigation with refresh if coming from find-a-tutor
  const handleNavigation = (to) => (e) => {
    if (location.pathname === "/find-a-tutor" && to !== "/find-a-tutor") {
      e.preventDefault();
      window.location.replace(to);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="row w-100 d-flex nav-main g-0">
      <div className="col-12 g-0 nav-sec">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid p-0 col-9">
            <Link
              className="navbar-brand"
              to="/"
              onClick={handleNavigation("/")}
            >
              <img
                src="/Images/logo/logo-h/logo-h-gr.svg"
                alt=""
                className="nav-logo"
              />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mb-2 mb-lg-0">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    About Us
                  </a>
                  <ul
                    className="dropdown-menu nav-item-drop-down"
                    id="nav-au-dd"
                  >
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/aboutus"
                        onClick={handleNavigation("/aboutus")}
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/reviews"
                        onClick={handleNavigation("/reviews")}
                      >
                        Reviews
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/faq"
                        onClick={handleNavigation("/faq")}
                      >
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <a
                        className="dropdown-item nav-item-drop-down-item"
                        href="/contact-us"
                        onClick={handleNavigation("/contact-us")}
                      >
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/join-us"
                        onClick={handleNavigation("/join-us")}
                      >
                        Become A Tutor
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Medical Entrance
                  </a>
                  <ul
                    className="dropdown-menu nav-item-drop-down"
                    id="nav-me-dd"
                  >
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/ucat"
                        onClick={handleNavigation("/ucat")}
                      >
                        UCAT
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/interview-preparation"
                        onClick={handleNavigation("/interview-preperation")}
                      >
                        Interview Preparation
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link active"
                    aria-current="page"
                    to="/pricing"
                    onClick={handleNavigation("/pricing")}
                  >
                    Pricing
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Tutoring
                  </a>
                  <ul
                    className="dropdown-menu nav-item-drop-down"
                    id="nav-Tu-5"
                  >
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/find-a-tutor"
                        onClick={handleNavigation("/find-a-tutor")}
                      >
                        Private Tutoring
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item nav-item-drop-down-item"
                        to="/bring-a-friend-and-save"
                        onClick={handleNavigation("/bring-a-friend-and-save")}
                      >
                        Bring a Friend & Save
                      </Link>
                    </li>
                  </ul>
                </li>


                <li className="nav-item">
                  <Link
                    className="nav-link active"
                    aria-current="page"
                    to="/pricing"
                    onClick={handleNavigation("/pricing")}
                  >
                    Pricing
                  </Link>
                </li>

                <Link
                  to="/find-a-tutor"
                  className="btn btn-outline-primary nav-item nav-f-t-btn"
                  onClick={handleNavigation("/find-a-tutor")}
                >


                <Link to='/find-a-tutor' className="btn btn-outline-primary nav-item nav-f-t-btn" onClick={handleNavigation('/find-a-tutor')}>


                  Find a Tutor
                </Link>

                {/* Authentication Links */}
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <li className="nav-item dropdown">
                        <a
                          className="nav-link dropdown-toggle"
                          href="#"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bi bi-person-circle me-1"></i>
                          {user?.first_name || user?.username}
                        </a>
                        <ul className="dropdown-menu nav-item-drop-down">
                          {user?.role === "student" && (
                            <>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/profile"
                                  onClick={handleNavigation("/profile")}
                                >
                                  My Profile
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/my-sessions"
                                  onClick={handleNavigation("/my-sessions")}
                                >
                                  My Sessions
                                </Link>
                              </li>
                            </>
                          )}
                          {user?.role === "tutor" && (
                            <>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/tutor/account-settings"
                                  onClick={handleNavigation(
                                    "/tutor/account-settings"
                                  )}
                                >
                                  Account Settings
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/tutor/documents"
                                  onClick={handleNavigation("/tutor/documents")}
                                >
                                  Documents
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/tutor/payment-details"
                                  onClick={handleNavigation(
                                    "/tutor/payment-details"
                                  )}
                                >
                                  Payment Details
                                </Link>
                              </li>
                            </>
                          )}
                          {user?.role === "admin" && (
                            <>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/dashboard/admin/home"
                                  onClick={handleNavigation(
                                    "/dashboard/admin/home"
                                  )}
                                >
                                  Admin Dashboard
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/dashboard/admin/users"
                                  onClick={handleNavigation(
                                    "/dashboard/admin/users"
                                  )}
                                >
                                  Manage Users
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/dashboard/admin/tutors"
                                  onClick={handleNavigation(
                                    "/dashboard/admin/tutors"
                                  )}
                                >
                                  Manage Tutors
                                </Link>
                              </li>
                            </>
                          )}
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <button
                              className="dropdown-item nav-item-drop-down-item text-danger"
                              onClick={handleLogout}
                            >
                              <i className="bi bi-box-arrow-right me-2"></i>
                              Logout
                            </button>
                          </li>
                        </ul>
                      </li>
                    ) : (
                      <li className="nav-item login-signup-links">
                        <Link
                          className="nav-link signup-btn active"
                          aria-current="page"
                          to="/signup"
                          onClick={handleNavigation("/signup")}
                        >
                          Sign Up
                        </Link>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
