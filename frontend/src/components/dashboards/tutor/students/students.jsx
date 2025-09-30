import React, { useEffect, useState } from "react";
import "../../../../css/dashboards/tutor/students/students.css";
import tutorService from "../../../../services/tutorService";

function TutorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await tutorService.getMyStudents();
        if (res.success) {
          setStudents(res.data || []);
        } else {
          setError(res.error || "Failed to load students");
        }
      } catch (e) {
        setError(e.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="tutor-students-container container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="tutor-students-content text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 mb-0">Loading assigned students...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-students-container container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="tutor-students-content py-4">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-students-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="tutor-students-content">
            <h3 className="tutor-students-section-title mb-4">
              Your Assigned Students
            </h3>
            {students.length === 0 ? (
              <div className="alert alert-info">No students assigned yet.</div>
            ) : (
              <div className="row g-4">
                {students.map((pair) => {
                  const s = pair.student || {};
                  const name =
                    [s.firstName, s.lastName].filter(Boolean).join(" ") ||
                    s.username ||
                    "Student";
                  return (
                    <div className="col-12 col-md-6" key={pair.id}>
                      <div className="tutor-students-card d-flex align-items-center p-3">
                        <div className="tutor-students-avatar me-3 flex-shrink-0">
                          <div
                            className="tutor-students-avatar-img placeholder rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 64, height: 64 }}
                          >
                            <i className="fas fa-user"></i>
                          </div>
                        </div>
                        <div className="tutor-students-card-body flex-grow-1">
                          <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
                            <div className="tutor-students-card-title">
                              {name}
                            </div>
                            <span
                              className={`badge bg-${
                                pair.status === "active"
                                  ? "success"
                                  : pair.status === "paused"
                                  ? "warning"
                                  : "secondary"
                              }`}
                            >
                              {pair.status}
                            </span>
                          </div>
                          <div className="tutor-students-card-degree mb-2">
                            {pair.subject || "General Tutoring"}
                          </div>
                          <div className="tutor-students-card-contact d-flex flex-wrap align-items-center gap-3">
                            {s.email && (
                              <span className="tutor-students-card-email">
                                <i className="fas fa-envelope me-1"></i>{" "}
                                {s.email}
                              </span>
                            )}
                            {s.username && (
                              <span className="tutor-students-card-phone">
                                <i className="fas fa-user me-1"></i> @
                                {s.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorStudents;
