import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../css/snippets/navbar.css';

function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="row w-100 d-flex nav-main g-0">
      <div className="col-12 g-0 nav-sec">
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid p-0 col-9">
            <Link className="navbar-brand" to="/">
              <img src="/Images/logo/logo-h/logo-h-gr.svg" alt="" className="nav-logo" />
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
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
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
                  <ul className="dropdown-menu nav-item-drop-down" id="nav-au-dd">
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/aboutus">About us</Link></li>
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/reviews">Reviews</Link></li>
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/faq">FAQ</Link></li>
                    <li><a className="dropdown-item nav-item-drop-down-item" href="/contact-us">Contact US</a></li>
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/join-us">Become Tutor</Link></li>
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
                    Tutoring
                  </a>
                  <ul className="dropdown-menu nav-item-drop-down" id="nav-Tu-dd">
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/find-a-tutor">Private Tutoring</Link></li>
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/bring-a-friend-and-save">Bring a Friend and save</Link></li>
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
                  <ul className="dropdown-menu nav-item-drop-down" id="nav-me-dd">
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/ucat">UCAT</Link></li>
                    <li><Link className="dropdown-item nav-item-drop-down-item" to="/interview-preperation">Interview Preperation</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/pricing">Pricing</Link>
                </li>
                <Link to='/find-a-tutor' className="btn btn-outline-primary nav-item nav-f-t-btn">
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
                          {user?.role === 'student' && (
                            <>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/profile">My Profile</Link></li>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/my-sessions">My Sessions</Link></li>
                            </>
                          )}
                          {user?.role === 'tutor' && (
                            <>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/tutor/account-settings">Account Settings</Link></li>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/tutor/documents">Documents</Link></li>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/tutor/payment-details">Payment Details</Link></li>
                            </>
                          )}
                          {user?.role === 'admin' && (
                            <>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/admin/dashboard">Admin Dashboard</Link></li>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/admin/users">Manage Users</Link></li>
                              <li><Link className="dropdown-item nav-item-drop-down-item" to="/admin/tutors">Manage Tutors</Link></li>
                            </>
                          )}
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item nav-item-drop-down-item text-danger" 
                              onClick={handleLogout}
                            >
                              <i className="bi bi-box-arrow-right me-2"></i>Logout
                            </button>
                          </li>
                        </ul>
                      </li>
                    ) : (
                      <li className="nav-item login-signup-links">
                        <Link className="nav-link active" aria-current="page" to="/login">Login</Link>/
                        <Link className="nav-link active" aria-current="page" to="/signup">Sign Up</Link>
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
