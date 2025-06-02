import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { getUserProfile, getTutorDocuments } from '../../../../services/authService';
import '../../../../css/dashboards/tutor/snippets/navbar.css';

function TutorNavbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTutorData();
  }, []);

  const fetchTutorData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile data
      const profileResult = await getUserProfile();
      if (profileResult.success) {
        setTutorProfile(profileResult.data);
      }

      // Fetch document status
      const documentsResult = await getTutorDocuments();
      if (documentsResult.success) {
        setDocumentStatus(documentsResult.data);
      }
    } catch (error) {
      console.error('Error fetching tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if profile is complete (basic required fields)
  const isProfileComplete = () => {
    if (!tutorProfile || !tutorProfile.profile) return false;
    
    const profile = tutorProfile.profile;
    const user = tutorProfile;
    
    // Check basic profile fields
    return !!(
      user.first_name && 
      user.last_name && 
      user.email && 
      profile.bio && 
      profile.university
    );
  };

  // Check if documents are approved
  const areDocumentsApproved = () => {
    if (!documentStatus) return false;
    
    return (
      documentStatus.tutor_contract?.status === 'approved' &&
      documentStatus.wwcc_document?.status === 'approved'
    );
  };

  // Determine if alert should be shown
  const shouldShowAlert = () => {
    if (loading) return false; // Don't show while loading
    
    // If account is already live, don't show the alert
    if (tutorProfile?.profile?.account_live) return false;
    
    const profileComplete = isProfileComplete();
    const documentsApproved = areDocumentsApproved();
    
    // Show alert if either profile is incomplete OR documents are not approved
    return !profileComplete || !documentsApproved;
  };

  // Generate alert message based on what's missing
  const getAlertMessage = () => {
    const profileComplete = isProfileComplete();
    const documentsApproved = areDocumentsApproved();
    
    const steps = [];
    
    if (!documentsApproved) {
      steps.push("Upload required documents in Documents section");
    }
    
    if (!profileComplete) {
      steps.push("Complete your profile in Account Settings");
    }
    
    return steps;
  };

  return (
    <div className={`tutor-navbar-main ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Profile Section */}
      <div className="tutor-navbar-profile">
        <div className="tutor-navbar-profile-info">
          <div className="tutor-navbar-avatar">
            {user?.profile_picture_url ? (
              <img src={user.profile_picture_url} alt="Profile" className="tutor-navbar-avatar-img" />
            ) : user?.profile_picture ? (
              <img src={`http://178.128.109.143:8000${user.profile_picture}`} alt="Profile" className="tutor-navbar-avatar-img" />
            ) : (
              <div className="tutor-navbar-avatar-placeholder">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div className="tutor-navbar-user-info">
            <h6 className="tutor-navbar-greeting">Good morning</h6>
            <h5 className="tutor-navbar-username">
              {tutorProfile ? 
                `${tutorProfile.first_name || ''} ${tutorProfile.last_name || ''}`.trim() || tutorProfile.username || 'Tutor'
                : 'Tutor Name'
              }
            </h5>
          </div>
        </div>
        <button 
          className="tutor-navbar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      {/* Alert Section - Only show if profile incomplete or documents not approved */}
      {shouldShowAlert() && (
        <div className="tutor-navbar-alert">
          <div className="tutor-navbar-alert-content">
            <i className="fas fa-exclamation-circle"></i>
            <div className="tutor-navbar-alert-text">
              <p>Complete these steps to go live:</p>
              <ul>
                {getAlertMessage().map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="tutor-navbar-nav">
        <div className="tutor-navbar-section">
          <ul className="tutor-navbar-menu">
            <li className="tutor-navbar-menu-item">
              <Link to="/tutor/account-settings" className="tutor-navbar-menu-link">
                <i className="fas fa-user-cog"></i>
                <span>Account Settings</span>
              </Link>
              <Link to="/tutor/documents" className="tutor-navbar-menu-link">
              <i className="fa-solid fa-file"></i>
                <span>Documents</span>
              </Link>
              <Link to="/tutor/payment-details" className="tutor-navbar-menu-link">
              <i className="fa-solid fa-wallet"></i>
                <span>Payment Details</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <div className="tutor-navbar-logout">
          <button className="tutor-navbar-logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default TutorNavbar;
