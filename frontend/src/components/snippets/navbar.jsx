import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../css/snippets/navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Function to handle navigation with refresh if coming from find-a-tutor
  const handleNavigation = (to) => (e) => {
    if (location.pathname === "/find-a-tutor" && to !== "/find-a-tutor") {
      e.preventDefault();
      window.location.replace(to);
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
    setOpenDropdowns({});
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMobileMenuOpen(false);
      setOpenDropdowns({});
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setOpenDropdowns({});
    }
  };

  // Toggle dropdown (for mobile accordion style)
  const toggleDropdown = (dropdownId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownId]: !prev[dropdownId],
    }));
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".navbar-collapse")) {
        setIsMobileMenuOpen(false);
        setOpenDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="row w-100 d-flex nav-main g-0">
      <div className="col-12 g-0 nav-sec">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid p-0">
            <Link
              className="navbar-brand d-flex align-items-center"
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
              onClick={toggleMobileMenu}
              aria-controls="navbarSupportedContent"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className={`collapse navbar-collapse ${
                isMobileMenuOpen ? "show" : ""
              }`}
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mb-2 mb-lg-0">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex justify-content-between align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={openDropdowns.aboutUs}
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.innerWidth <= 991) {
                        toggleDropdown("aboutUs");
                      }
                    }}
                  >
                    <span>About Us</span>
                    <span className="dropdown-arrow">
                      <i
                        className={`bi ${
                          openDropdowns.aboutUs
                            ? "bi-chevron-up"
                            : "bi-chevron-down"
                        }`}
                      ></i>
                    </span>
                  </a>
                  <ul
                    className={`dropdown-menu nav-item-drop-down ${
                      openDropdowns.aboutUs ? "show" : ""
                    }`}
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
                    className="nav-link dropdown-toggle d-flex justify-content-between align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={openDropdowns.medical}
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.innerWidth <= 991) {
                        toggleDropdown("medical");
                      }
                    }}
                  >
                    <span>Medical Entrance</span>
                    <span className="dropdown-arrow">
                      <i
                        className={`bi ${
                          openDropdowns.medical
                            ? "bi-chevron-up"
                            : "bi-chevron-down"
                        }`}
                      ></i>
                    </span>
                  </a>
                  <ul
                    className={`dropdown-menu nav-item-drop-down ${
                      openDropdowns.medical ? "show" : ""
                    }`}
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

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex justify-content-between align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={openDropdowns.tutoring}
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.innerWidth <= 991) {
                        toggleDropdown("tutoring");
                      }
                    }}
                  >
                    <span>Tutoring</span>
                    <span className="dropdown-arrow">
                      <i
                        className={`bi ${
                          openDropdowns.tutoring
                            ? "bi-chevron-up"
                            : "bi-chevron-down"
                        }`}
                      ></i>
                    </span>
                  </a>
                  <ul
                    className={`dropdown-menu nav-item-drop-down ${
                      openDropdowns.tutoring ? "show" : ""
                    }`}
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
                  Find a Tutor
                </Link>

                {/* Authentication Links */}
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <li className="nav-item dropdown">
                        <a
                          className="nav-link dropdown-toggle d-flex justify-content-between align-items-center"
                          href="#"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded={openDropdowns.user}
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.innerWidth <= 991) {
                              toggleDropdown("user");
                            }
                          }}
                        >
                          <span>
                            <i className="bi bi-person-circle me-1"></i>{" "}
                            {user?.first_name || user?.username}
                          </span>
                          <span className="dropdown-arrow">
                            <i
                              className={`bi ${
                                openDropdowns.user
                                  ? "bi-chevron-up"
                                  : "bi-chevron-down"
                              }`}
                            ></i>
                          </span>
                        </a>
                        <ul
                          className={`dropdown-menu nav-item-drop-down ${
                            openDropdowns.user ? "show" : ""
                          }`}
                        >
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
                                  to="/admin/dashboard"
                                  onClick={handleNavigation("/admin/dashboard")}
                                >
                                  Admin Dashboard
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/admin/users"
                                  onClick={handleNavigation("/admin/users")}
                                >
                                  Manage Users
                                </Link>
                              </li>
                              <li>
                                <Link
                                  className="dropdown-item nav-item-drop-down-item"
                                  to="/admin/tutors"
                                  onClick={handleNavigation("/admin/tutors")}
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
