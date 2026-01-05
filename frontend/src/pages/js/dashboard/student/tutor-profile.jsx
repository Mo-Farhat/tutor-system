import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index";
import profileService from "../../../../services/profileService";
import "../../../../css/dashboards/tutor/profile/profile.css";

const StudentTutorProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await profileService.getTutorProfile(username);
        if (res?.success) {
          setProfile(res.data);
        } else {
          setError(res?.error || "Tutor not found");
        }
      } catch (e) {
        setError("Failed to load tutor profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  const user = profile?.user || {};
  const firstName = user.first_name || user.firstName || "";
  const lastName = user.last_name || user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || username;
  const email = user.email;

  // Capitalize tier name
  const formatTier = (tier) => {
    if (!tier) return "Gold";
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  };

  // Format subject objects or strings into readable badges
  const formatSubjectItem = (item) => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null) {
      // Handle subject object format
      if (item.subject) {
        let label = item.subject;
        if (item.year_level) label += ` (${item.year_level})`;
        if (item.curriculum) label += ` - ${item.curriculum}`;
        return label;
      }
      if (item.name) return item.name;
      return null;
    }
    return null;
  };

  const toBadges = (arr) =>
    Array.isArray(arr) && arr.length > 0 ? (
      <div className="d-flex flex-wrap gap-2">
        {arr.map((item, i) => {
          const label = formatSubjectItem(item);
          if (!label) return null;
          return (
            <span key={i} className="badge bg-primary">
              {label}
            </span>
          );
        }).filter(Boolean)}
      </div>
    ) : (
      <span className="text-muted">Not specified</span>
    );

  const formatMoney = (v) =>
    v === null || v === undefined || v === ""
      ? "Not specified"
      : `$${Number(v).toLocaleString()}/hr`;

  const computeVideoUrl = () => {
    const p = profile?.intro_video_path;
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    const idx = p.lastIndexOf("/uploads/");
    if (idx !== -1) {
      const rel = p.slice(idx);
      const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
      return `${base}${rel}`;
    }
    return null;
  };

  const computePhotoUrl = () => {
    const p = profile?.photo_url;
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
    return `${base}${p}`;
  };

  const videoUrl = computeVideoUrl();
  const photoUrl = computePhotoUrl();

  if (loading) {
    return (
      <div className="student-home-page-main">
        <div className="student-notifications-nav-bar">
          <Snippets.StudentNavbar />
        </div>
        <div className="tutor-profile-container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading tutor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-home-page-main">
        <div className="student-notifications-nav-bar">
          <Snippets.StudentNavbar />
        </div>
        <div className="tutor-profile-container">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-home-page-main">
      <div className="student-notifications-nav-bar">
        <Snippets.StudentNavbar />
      </div>
      <div className="tutor-profile-container">
        <div className="tutor-profile-content">
          {/* Back Button */}
          <button 
            className="btn btn-outline-secondary mb-4"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-2"></i>Back
          </button>

          {/* Profile Summary Section */}
          <div className="tutor-profile-section">
            <div className="tutor-profile-card">
              <div className="tutor-profile-card-body">
                <div className="tutor-profile-summary">
                  <div className="tutor-profile-avatar">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={fullName}
                        className="tutor-profile-avatar-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="tutor-profile-avatar-placeholder"
                      style={{ display: photoUrl ? 'none' : 'flex' }}
                    >
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                  <div className="tutor-profile-info">
                    <h2>{fullName}</h2>
                    <div className="tutor-profile-badges">
                      {/* Tier Badge */}
                      <span className="tutor-profile-badge-gold">
                        {formatTier(profile?.tier)} Tier
                      </span>
                      {/* ATAR Badge */}
                      {profile?.atar && (
                        <span className="tutor-profile-badge-atr">
                          ATAR {profile.atar}
                        </span>
                      )}
                      {/* Availability Badge */}
                      {profile?.is_fully_booked ? (
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-calendar-times me-1"></i>Fully Booked
                        </span>
                      ) : (
                        <span className="badge bg-success">
                          <i className="fas fa-check-circle me-1"></i>Available Now
                        </span>
                      )}
                      {/* WWCC Badge */}
                      {profile?.wwcc_status && (
                        <span className={`badge ${
                          profile.wwcc_status.status === 'valid' ? 'bg-success' :
                          profile.wwcc_status.status === 'expiring_soon' ? 'bg-warning text-dark' :
                          'bg-secondary'
                        }`}>
                          <i className="fas fa-shield-alt me-1"></i>
                          WWCC {profile.wwcc_status.status === 'valid' ? 'Verified' :
                                profile.wwcc_status.status === 'expiring_soon' ? 'Expiring Soon' :
                                profile.wwcc_status.status || 'Unknown'}
                        </span>
                      )}
                    </div>
                    <div className="tutor-profile-meta">
                      <span className="tutor-profile-location">
                        <i className="fas fa-map-marker-alt"></i>{" "}
                        {profile?.preferred_locations?.[0] ||
                          profile?.locations?.[0] ||
                          "Location not specified"}
                      </span>
                      <span>
                        <i className="fas fa-graduation-cap me-1"></i>
                        {profile?.university || "University not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile?.bio && (
            <div className="tutor-profile-section">
              <h2 className="tutor-profile-section-title">About</h2>
              <div className="tutor-profile-card">
                <div className="tutor-profile-card-body">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {profile.bio}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Video Section */}
          {videoUrl && (
            <div className="tutor-profile-section">
              <h2 className="tutor-profile-section-title">Introduction Video</h2>
              <div className="tutor-profile-card">
                <div className="tutor-profile-card-body">
                  <video
                    src={videoUrl}
                    controls
                    className="tutor-profile-video"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subjects Section */}
          <div className="tutor-profile-section">
            <h2 className="tutor-profile-section-title">Tutoring Subjects</h2>
            <div className="tutor-profile-card">
              <div className="tutor-profile-card-body">
                <div className="row g-4">
                  <div className="col-12">
                    <label className="form-label text-muted small mb-2">
                      <i className="fas fa-book me-2"></i>Subjects
                    </label>
                    {toBadges(profile?.subjects_selected || profile?.subjects)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Locations Section */}
          <div className="tutor-profile-section">
            <h2 className="tutor-profile-section-title">Available Locations</h2>
            <div className="tutor-profile-card">
              <div className="tutor-profile-card-body">
                {toBadges(profile?.preferred_locations || profile?.locations)}
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="tutor-profile-section">
            <h2 className="tutor-profile-section-title">Education</h2>
            <div className="tutor-profile-card">
              <div className="tutor-profile-card-body">
                <div className="row g-4">
                  {profile?.university && (
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-2">
                        <i className="fas fa-university me-2"></i>University
                      </label>
                      <p className="mb-0">{profile.university}</p>
                    </div>
                  )}
                  {profile?.current_studies?.length > 0 && (
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-2">
                        <i className="fas fa-graduation-cap me-2"></i>Current Studies
                      </label>
                      {toBadges(profile.current_studies)}
                    </div>
                  )}
                  {profile?.schools_attended?.length > 0 && (
                    <div className="col-12">
                      <label className="form-label text-muted small mb-2">
                        <i className="fas fa-school me-2"></i>Schools Attended
                      </label>
                      {toBadges(profile.schools_attended)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="tutor-profile-section">
            <h2 className="tutor-profile-section-title">Contact</h2>
            <div className="tutor-profile-card">
              <div className="tutor-profile-card-body">
                <div className="d-flex flex-wrap gap-3">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-envelope me-2"></i>
                      Email Tutor
                    </a>
                  )}
                  {profile?.phone_number && (
                    <a
                      href={`tel:${profile.phone_number}`}
                      className="btn btn-outline-success"
                    >
                      <i className="fas fa-phone me-2"></i>
                      Call Tutor
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTutorProfilePage;
