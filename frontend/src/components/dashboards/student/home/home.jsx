import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../../../../services/studentService";
import "../../../../css/dashboards/student/home/home.css";

function StudentHome() {
  const [assignedTutors, setAssignedTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyTutors();
  }, []);

  const handleViewLesson = (lesson) => {
    if (lesson) {
      // Navigate to lesson details or open modal
      console.log("View lesson:", lesson);
      // You can implement navigation here or open a modal
    }
  };

  const handleContactTutor = (tutor) => {
    // Open email client or show contact options
    console.log("Contact tutor:", tutor);
  };

  const loadMyTutors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both tutors and upcoming lessons
      const [tutorsResult, lessonsResult] = await Promise.all([
        studentService.getMyTutors(),
        studentService.getUpcomingLessons(),
      ]);

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
            degree: tutorAssignment.subject || "Subject Not Specified",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              tutor.firstName + " " + tutor.lastName
            )}&background=random`,
            tags: [
              { label: tutorAssignment.subject || "General", color: "primary" },
            ],
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
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="student-home-content">
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
                      <div className="student-home-card-degree mb-2">
                        {tutor.degree}
                      </div>
                      <div className="mb-2">
                        {tutor.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={`student-home-tag student-home-tag-${tag.color} me-2 mb-1`}
                          >
                            {tag.label}
                          </span>
                        ))}
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
                        {tutor.nextLesson && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewLesson(tutor.nextLesson)}
                          >
                            <i className="fas fa-calendar-check me-1"></i>
                            View Lesson
                          </button>
                        )}
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
                          <i className="fas fa-comments me-1"></i>
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
