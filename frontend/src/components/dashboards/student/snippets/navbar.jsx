import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/student/snippets/navbar.css';

function StudentNavbar() {
    const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="student-navbar-mobile-toggle d-lg-none">
                <button 
                    className={`student-navbar-toggle-btn btn btn-outline-secondary ${isMobileMenuOpen ? 'student-navbar-toggle-active' : ''}`}
                    onClick={toggleMobileMenu}
                >
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            </div>

            {/* Desktop Navbar */}
            <nav 
                className={`student-navbar-main ${isNavbarExpanded ? 'student-navbar-expanded' : 'student-navbar-collapsed'} d-none d-lg-block`}
                onMouseEnter={() => setIsNavbarExpanded(true)}
                onMouseLeave={() => setIsNavbarExpanded(false)}
            >
                <div className="student-navbar-container">
                    {/* User Profile Header */}
                    <div className="student-navbar-user-profile">
                        <div className="student-navbar-avatar">
                            <img src="/Images/site-images/com/hero.png" alt="User Avatar" />
                        </div>
                        <div className={`student-navbar-user-info ${!isNavbarExpanded ? 'student-navbar-hidden' : ''}`}>
                            <h6 className="student-navbar-username">John Doe</h6>
                            <p className="student-navbar-user-role">Student ID: ST20205001</p>
                        </div>
                        <div className={`student-navbar-options ${!isNavbarExpanded ? 'student-navbar-hidden' : ''}`}>
                            <i className="fas fa-ellipsis-v"></i>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <ul className="student-navbar-menu">
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/home" className="student-navbar-menu-link" title="Assigned Tutors">
                                <i className="fas fa-user-friends student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Assigned Tutors</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/scheduling" className="student-navbar-menu-link" title="Scheduling">
                                <i className="fas fa-calendar-alt student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Scheduling</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/payment-history" className="student-navbar-menu-link" title="Payment History & Package">
                                <i className="fas fa-credit-card student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Payment History & Package</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/progress-milestones" className="student-navbar-menu-link" title="Progress Milestones">
                                <i className="fas fa-trophy student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Progress Milestones</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/notifications" className="student-navbar-menu-link" title="Notifications">
                                <i className="fas fa-bell student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Notifications</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link" title="Tutor Reports">
                                <i className="fas fa-file-alt student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Tutor Reports</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/profile-management" className="student-navbar-menu-link" title="Profile Management">
                                <i className="fas fa-user-cog student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Profile Management</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/t-profile" className="student-navbar-menu-link" title="My Profile Details">
                                <i className="fas fa-user-graduate student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>My Profile Details</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/payment-methods" className="student-navbar-menu-link" title="Payment Methods">
                                <i className="fas fa-wallet student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Payment Methods</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link" title="Student Support Center">
                                <i className="fas fa-question-circle student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Student Support Center</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/referral-and-offers" className="student-navbar-menu-link" title="Referral & Offers">
                                <i className="fas fa-gift student-navbar-icon"></i>
                                <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Referral & Offers</span>
                            </a>
                        </li>
                    </ul>

                    {/* Logout Section */}
                    <div className="student-navbar-logout">
                        <a href="#" className="student-navbar-logout-link" title="Logout">
                            <span className={!isNavbarExpanded ? 'student-navbar-hidden' : ''}>Logout</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className={`student-navbar-mobile ${isMobileMenuOpen ? 'student-navbar-mobile-open' : ''} d-lg-none`}>
                <div className="student-navbar-mobile-container">
                    {/* User Profile Header */}
                    <div className="student-navbar-user-profile">
                        <div className="student-navbar-avatar">
                            <img src="/Images/site-images/com/hero.png" alt="User Avatar" />
                        </div>
                        <div className="student-navbar-user-info">
                            <h6 className="student-navbar-username">John Doe</h6>
                            <p className="student-navbar-user-role">Student ID: ST20205001</p>
                        </div>
                        <div className="student-navbar-options">
                            <i className="fas fa-ellipsis-v"></i>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <ul className="student-navbar-mobile-menu">
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/home" className="student-navbar-menu-link">
                                <i className="fas fa-user-friends student-navbar-icon"></i>
                                <span>Assigned Tutors</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-calendar-alt student-navbar-icon"></i>
                                <span>Scheduling</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-credit-card student-navbar-icon"></i>
                                <span>Payment History & Package</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-trophy student-navbar-icon"></i>
                                <span>Progress Milestones</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/notifications" className="student-navbar-menu-link">
                                <i className="fas fa-bell student-navbar-icon"></i>
                                <span>Notifications</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-file-alt student-navbar-icon"></i>
                                <span>Tutor Reports</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-user-cog student-navbar-icon"></i>
                                <span>Profile Management</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="/dashboard/student/t-profile" className="student-navbar-menu-link">
                                <i className="fas fa-user-graduate student-navbar-icon"></i>
                                <span>My Profile Details</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-wallet student-navbar-icon"></i>
                                <span>Payment Methods</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-comments student-navbar-icon"></i>
                                <span>Communication Hub</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-question-circle student-navbar-icon"></i>
                                <span>Student Support Center</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <i className="fas fa-gift student-navbar-icon"></i>
                                <span>Referral & Offers</span>
                            </a>
                        </li>
                        <li className="student-navbar-menu-item">
                            <a href="#" className="student-navbar-menu-link">
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default StudentNavbar;
