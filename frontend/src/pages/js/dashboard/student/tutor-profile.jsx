import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index";
import profileService from "../../../../services/profileService";

const StudentTutorProfilePage = () => {
  const { username } = useParams();
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
  const usernameSafe = user.username || username;
  const email = user.email;

  const toBadges = (arr) =>
    Array.isArray(arr) && arr.length > 0 ? (
      <div className="d-flex flex-wrap gap-2">
        {arr.map((item, i) => (
          <span key={i} className="badge bg-primary-subtle text-primary">
            {typeof item === "string"
              ? item
              : item?.name || JSON.stringify(item)}
          </span>
        ))}
      </div>
    ) : (
      <span className="text-muted">Not specified</span>
    );

  const formatMoney = (v) =>
    v === null || v === undefined || v === ""
      ? "Not specified"
      : `$${Number(v).toLocaleString()}`;

  const formatNumber = (v) =>
    v === null || v === undefined || v === "" ? "Not specified" : String(v);

  const computeVideoUrl = () => {
    const p = profile?.intro_video_path;
    if (!p) return null;
    // If already an http(s) URL, return as is
    if (/^https?:\/\//i.test(p)) return p;
    // Try map local absolute path to /uploads/ path
    const idx = p.lastIndexOf("/uploads/");
    if (idx !== -1) {
      const rel = p.slice(idx);
      const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
      return `${base}${rel}`;
    }
    return null;
  };

  const videoUrl = computeVideoUrl();

  return (
    <div className="student-home-page-main">
      <div className="student-notifications-nav-bar">
        <Snippets.StudentNavbar />
      </div>
      <div className="tutor-home-content container py-4">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading tutor profile...</p>
          </div>
        )}
        {error && !loading && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {profile && !loading && (
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${firstName} ${lastName}`
                  )}&background=random`}
                  alt="avatar"
                  style={{ width: 64, height: 64, borderRadius: "50%" }}
                  className="me-3"
                />
                <div>
                  <h4 className="mb-0">
                    {firstName} {lastName}
                  </h4>
                  <small className="text-muted">@{usernameSafe}</small>
                </div>
              </div>

              {profile.headline && <p className="mb-3">{profile.headline}</p>}

              {videoUrl && (
                <div className="mb-3">
                  <h6>Introduction Video</h6>
                  <video
                    src={videoUrl}
                    controls
                    style={{ width: "100%", maxWidth: 640, borderRadius: 8 }}
                  />
                </div>
              )}

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <h6>Subjects</h6>
                  {toBadges(profile.subjects)}
                </div>

                <div className="col-12 col-md-6">
                  <h6>Selected Subjects</h6>
                  {toBadges(profile.subjects_selected)}
                </div>

                <div className="col-12 col-md-6">
                  <h6>Preferred Locations</h6>
                  {toBadges(profile.preferred_locations)}
                </div>

                <div className="col-12 col-md-6">
                  <h6>Available Locations</h6>
                  {toBadges(profile.locations)}
                </div>

                <div className="col-12 col-md-6">
                  <h6>University</h6>
                  <p className="mb-0">
                    {profile.university || "Not specified"}
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <h6>Current Studies</h6>
                  {toBadges(profile.current_studies)}
                </div>

                <div className="col-12 col-md-6">
                  <h6>Schools Attended</h6>
                  {toBadges(profile.schools_attended)}
                </div>

                <div className="col-12">
                  <h6>About</h6>
                  <p className="mb-0">{profile.bio || "Not specified"}</p>
                </div>

                <div className="col-12 col-md-4">
                  <h6>Hourly Rate</h6>
                  <p className="mb-0">{formatMoney(profile.hourly_rate)}</p>
                </div>

                <div className="col-12 col-md-4">
                  <h6>ATAR</h6>
                  <p className="mb-0">{formatNumber(profile.atar)}</p>
                </div>

                <div className="col-12 col-md-4">
                  <h6>Rating</h6>
                  <p className="mb-0">{formatNumber(profile.rating)}</p>
                </div>

                <div className="col-12 col-md-4">
                  <h6>Tier</h6>
                  <p className="mb-0">{profile.tier || "Not specified"}</p>
                </div>

                <div className="col-12 col-md-4">
                  <h6>Profile Status</h6>
                  <p className="mb-0">
                    {profile.is_live ? "Live" : "Offline"} ·{" "}
                    {profile.documents_uploaded
                      ? "Documents OK"
                      : "Docs missing"}
                  </p>
                </div>

                <div className="col-12 col-md-4">
                  <h6>WWCC</h6>
                  <p className="mb-0">
                    {profile.wwcc_status?.status || "unknown"}
                    {profile.wwcc_status?.daysLeft != null &&
                      ` · ${profile.wwcc_status.daysLeft} days left`}
                  </p>
                </div>

                <div className="col-12">
                  <h6>Contact</h6>
                  <div className="d-flex flex-column">
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className="text-decoration-none mb-1"
                      >
                        <i className="fas fa-envelope me-2"></i>
                        {email}
                      </a>
                    )}
                    {profile.phone_number && (
                      <a
                        href={`tel:${profile.phone_number}`}
                        className="text-decoration-none"
                      >
                        <i className="fas fa-phone me-2"></i>
                        {profile.phone_number}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTutorProfilePage;
