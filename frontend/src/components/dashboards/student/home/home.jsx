import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import studentService from "../../../../services/studentService";
import SessionConfirmationModal from "../lessons/SessionConfirmationModal";
import "../../../../css/dashboards/student/home/home.css";

function StudentHome() {
  const [assignedTutors, setAssignedTutors] = useState([]);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadMyTutors();
  }, []);

  const handleContactTutor = (tutor) => {
    // Open email client
    if (tutor.email) {
      window.location.href = `mailto:${tutor.email}`;
    }
  };

  const loadMyTutors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tutors, upcoming lessons, and pending confirmations
      const [tutorsResult, lessonsResult, confirmationsResult] = await Promise.all([
        studentService.getMyTutors(),
        studentService.getUpcomingLessons(),
        studentService.getPendingConfirmations(),
      ]);

      if (confirmationsResult.success) {
        setPendingConfirmations(confirmationsResult.data || []);
        
        // Check if we should auto-open a specific session from URL
        const params = new URLSearchParams(location.search);
        const confirmId = params.get("confirmId");
        if (confirmId) {
          const sessionToConfirm = confirmationsResult.data.find(s => s.id === parseInt(confirmId));
          if (sessionToConfirm) setSelectedSession(sessionToConfirm);
        }
      }

      if (tutorsResult.success) {
        // Ensure data is an array before calling map
        const tutorsData = Array.isArray(tutorsResult.data)
          ? tutorsResult.data
          : [];

        // Transform the API data to match the expected format
        const transformedTutors = tutorsData.map((tutorAssignment) => {
          const tutor = tutorAssignment.tutor;

          // Find the next lesson for this tutor
          const lessonsData =
            lessonsResult.success && Array.isArray(lessonsResult.data)
              ? lessonsResult.data
              : [];
          const nextLesson = lessonsData.find(
            (lesson) => lesson.tutorId === tutor.id
          );

          // Format next session info
          let nextSessionText = "Next session not scheduled";
          if (nextLesson) {
            const sessionDate = new Date(nextLesson.scheduledAt);
            const now = new Date();
            const diffTime = sessionDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              nextSessionText = `Today, ${sessionDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`;
            } else if (diffDays === 1) {
              nextSessionText = `Tomorrow, ${sessionDate.toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}`;
            } else if (diffDays < 7) {
              nextSessionText = `${sessionDate.toLocaleDateString([], {
                weekday: "long",
              })}, ${sessionDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`;
            } else {
              nextSessionText = sessionDate.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          }

          return {
            id: tutorAssignment.id,
            name: `${tutor.firstName} ${tutor.lastName}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              tutor.firstName + " " + tutor.lastName
            )}&background=random`,
            email: tutor.email,
            phone: tutor.phone || "Phone not available",
            nextSession: nextSessionText,
            status: tutorAssignment.status === "active" ? "Active" : "Inactive",
            tutorId: tutor.id,
            username: tutor.username,
            assignmentId: tutorAssignment.id,
            nextLesson: nextLesson,
          };
        });
        setAssignedTutors(transformedTutors);
      } else {
        setError(tutorsResult.error || "Failed to load tutors");
      }
    } catch (err) {
      console.error("Error loading tutors:", err);
      setError("Failed to load tutors. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="student-home-container container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="student-home-content">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading your tutors...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="student-home-container container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="student-home-content">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Error Loading Tutors</h4>
                <p>{error}</p>
                <hr />
                <button
                  className="btn btn-outline-danger"
                  onClick={loadMyTutors}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (assignedTutors.length === 0) {
    return (
      <div className="student-home-container container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="student-home-content">
              <div
                className="text-center"
                style={{
                  minHeight: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div>
                  <i className="fas fa-user-graduate fa-3x text-muted mb-3"></i>
                  <h4>No Tutors Assigned</h4>
                  <p className="text-muted">
                    You don't have any tutors assigned yet. Contact support to
                    get matched with a tutor.
                  </p>
                  <button className="btn btn-primary" onClick={loadMyTutors}>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-home-container container-fluid">
      {selectedSession && (
        <SessionConfirmationModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)}
          onConfirmed={(id) => {
            setPendingConfirmations(prev => prev.filter(s => s.id !== id));
            setSelectedSession(null);
          }}
        />
      )}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="student-home-content">
            {pendingConfirmations.length > 0 && (
              <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4 shadow-sm border-0" style={{ borderRadius: '12px', background: '#fffaf0', borderLeft: '4px solid #ed8936' }}>
                <div className="d-flex align-items-center">
                  <div className="me-3 bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">Pending Session Confirmations</h6>
                    <p className="mb-0 small text-muted">You have {pendingConfirmations.length} session{pendingConfirmations.length > 1 ? 's' : ''} waiting for your confirmation.</p>
                  </div>
                </div>
                <button 
                  className="btn btn-warning btn-sm fw-bold px-3" 
                  style={{ borderRadius: '8px' }}
                  onClick={() => setSelectedSession(pendingConfirmations[0])}
                >
                  Review Now
                </button>
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="student-home-section-title mb-0">
                Your Assigned Tutors
              </h3>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={loadMyTutors}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>
            <div className="row g-4">
              {assignedTutors.map((tutor, idx) => (
                <div className="col-12 col-md-6" key={tutor.id || idx}>
                  <div className="student-home-card d-flex align-items-center p-3">
                    <div className="student-home-avatar me-3 flex-shrink-0">
                      <img
                        src={tutor.avatar}
                        alt={tutor.name}
                        className="student-home-avatar-img"
                      />
                    </div>
                    <div className="student-home-card-body flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
                        <div className="student-home-card-title">
                          {tutor.name}
                        </div>
                        <span
                          className={`student-home-status-badge ${
                            tutor.status === "Active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {tutor.status}
                        </span>
                      </div>
                      <div className="student-home-next-session mb-2">
                        <i className="fas fa-clock me-1"></i>
                        <strong>Next Session:</strong>
                        {tutor.nextLesson ? (
                          <span className="text-primary ms-1">
                            {tutor.nextSession}
                          </span>
                        ) : (
                          <span className="text-muted ms-1">
                            {tutor.nextSession}
                          </span>
                        )}
                      </div>
                      <div className="student-home-card-contact d-flex flex-wrap align-items-center gap-3 mb-3">
                        <span className="student-home-card-email">
                          <i className="fas fa-envelope me-1"></i>
                          <a
                            href={`mailto:${tutor.email}`}
                            className="text-decoration-none"
                          >
                            {tutor.email}
                          </a>
                        </span>
                        {tutor.phone &&
                          tutor.phone !== "Phone not available" && (
                            <span className="student-home-card-phone">
                              <i className="fas fa-phone me-1"></i>
                              <a
                                href={`tel:${tutor.phone}`}
                                className="text-decoration-none"
                              >
                                {tutor.phone}
                              </a>
                            </span>
                          )}
                      </div>
                      <div className="student-home-card-actions d-flex gap-2">
                        {tutor.username && (
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              navigate(
                                `/dashboard/student/tutor/${tutor.username}`
                              )
                            }
                          >
                            <i className="fas fa-user me-1"></i>
                            View Profile
                          </button>
                        )}
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleContactTutor(tutor)}
                        >
                          <i className="fas fa-envelope me-1"></i>
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
