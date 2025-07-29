import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/tutor/snippets/navbar2.css';

function TutorNavbar2() {
    const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="navbar2-mobile-toggle d-lg-none">
                <button 
                    className={`navbar2-toggle-btn btn btn-outline-secondary ${isMobileMenuOpen ? 'navbar2-toggle-active' : ''}`}
                    onClick={toggleMobileMenu}
                >
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
            </div>

            {/* Desktop Navbar */}
            <nav 
                className={`navbar2-main ${isNavbarExpanded ? 'navbar2-expanded' : 'navbar2-collapsed'} d-none d-lg-block`}
                onMouseEnter={() => setIsNavbarExpanded(true)}
                onMouseLeave={() => setIsNavbarExpanded(false)}
            >
                <div className="navbar2-container">
                    {/* User Profile Header */}
                    <div className="navbar2-user-profile">
                        <div className="navbar2-avatar">
                            <img src="/Images/site-images/com/hero.png" alt="User Avatar" />
                        </div>
                        <div className={`navbar2-user-info ${!isNavbarExpanded ? 'navbar2-hidden' : ''}`}>
                            <h6 className="navbar2-username">Sarah Johnson</h6>
                            <p className="navbar2-user-role">Mathematics Tutor</p>
                        </div>
                        <div className={`navbar2-options ${!isNavbarExpanded ? 'navbar2-hidden' : ''}`}>
                            <i className="fas fa-ellipsis-v"></i>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <ul className="navbar2-menu">
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/home" className="navbar2-menu-link" title="Home">
                                <i className="fas fa-home navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Home</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/profile" className="navbar2-menu-link" title="Profile">
                                <i className="fas fa-user navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Profile</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/calendar" className="navbar2-menu-link" title="Calendar">
                                <i className="fas fa-calendar navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Calendar</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link" title="Student Requests">
                                <i className="fas fa-hand-paper navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Student Requests</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/students" className="navbar2-menu-link" title="Students">
                                <i className="fas fa-users navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Students</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/progress" className="navbar2-menu-link" title="Tutor Progress">
                                <i className="fas fa-chart-line navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Tutor Progress</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/earnings" className="navbar2-menu-link" title="Earnings">
                                <i className="fas fa-dollar-sign navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Earnings</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/notifications" className="navbar2-menu-link" title="Notifications">
                                <i className="fas fa-bell navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Notifications</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="/dashboard/tutor/settings" className="navbar2-menu-link" title="Settings">
                                <i className="fas fa-cog navbar2-icon"></i>
                                <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Settings</span>
                            </a>
                        </li>
                    </ul>

                    {/* Logout Section */}
                    <div className="navbar2-logout">
                        <a href="#" className="navbar2-logout-link" title="Logout">
                            <span className={!isNavbarExpanded ? 'navbar2-hidden' : ''}>Logout</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className={`navbar2-mobile ${isMobileMenuOpen ? 'navbar2-mobile-open' : ''} d-lg-none`}>
                <div className="navbar2-mobile-container">
                    {/* User Profile Header */}
                    <div className="navbar2-user-profile">
                        <div className="navbar2-avatar">
                            <img src="/Images/site-images/com/hero.png" alt="User Avatar" />
                        </div>
                        <div className="navbar2-user-info">
                            <h6 className="navbar2-username">Sarah Johnson</h6>
                            <p className="navbar2-user-role">Mathematics Tutor</p>
                        </div>
                        <div className="navbar2-options">
                            <i className="fas fa-ellipsis-v"></i>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <ul className="navbar2-mobile-menu">
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-home navbar2-icon"></i>
                                <span>Home</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-user navbar2-icon"></i>
                                <span>Profile</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-calendar navbar2-icon"></i>
                                <span>Calendar</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-hand-paper navbar2-icon"></i>
                                <span>Student Requests</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-users navbar2-icon"></i>
                                <span>Students</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-chart-line navbar2-icon"></i>
                                <span>Tutor Progress</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-dollar-sign navbar2-icon"></i>
                                <span>Earnings</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-bell navbar2-icon"></i>
                                <span>Notifications</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <i className="fas fa-cog navbar2-icon"></i>
                                <span>Settings</span>
                            </a>
                        </li>
                        <li className="navbar2-menu-item">
                            <a href="#" className="navbar2-menu-link">
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default TutorNavbar2;
