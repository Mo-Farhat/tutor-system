import React, { useState } from "react";

const SESSION_STATUS = {
  COMPLETED: "completed",
  SCHEDULED: "scheduled",
  CANCELLED: "cancelled",
};

const SESSION_STATUS_LABELS = {
  [SESSION_STATUS.COMPLETED]: "Completed",
  [SESSION_STATUS.SCHEDULED]: "Scheduled",
  [SESSION_STATUS.CANCELLED]: "Cancelled",
};

const SessionsTab = () => {
  const [sessions] = useState([
    {
      id: 1,
      studentName: "John Smith",
      subject: "VCE Chemistry",
      date: new Date(2024, 2, 20, 14, 0),
      duration: 60,
      status: SESSION_STATUS.COMPLETED,
      rating: 5,
      notes:
        "Great session, student understood organic chemistry concepts well. Covered alkanes, alkenes, and alkynes.",
    },
    {
      id: 2,
      studentName: "Emily Chen",
      subject: "VCE Biology",
      date: new Date(2024, 2, 21, 16, 0),
      duration: 90,
      status: SESSION_STATUS.COMPLETED,
      rating: 4,
      notes:
        "Worked on cell division concepts. Student needs more practice with mitosis diagrams.",
    },
    {
      id: 3,
      studentName: "David Lee",
      subject: "VCE Chemistry",
      date: new Date(2024, 2, 22, 10, 0),
      duration: 60,
      status: SESSION_STATUS.SCHEDULED,
      rating: null,
      notes: "",
    },
    {
      id: 4,
      studentName: "Sophie Wilson",
      subject: "VCE Biology",
      date: new Date(2024, 2, 25, 15, 30),
      duration: 60,
      status: SESSION_STATUS.COMPLETED,
      rating: 5,
      notes:
        "Excellent progress on genetics unit. Student mastered Punnett squares.",
    },
    {
      id: 5,
      studentName: "Alex Thompson",
      subject: "VCE Physics",
      date: new Date(2024, 2, 28, 11, 0),
      duration: 90,
      status: SESSION_STATUS.SCHEDULED,
      rating: null,
      notes: "",
    },
  ]);

  const [selectedSessionNotes, setSelectedSessionNotes] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const handleViewNotes = (session) => {
    setSelectedSessionNotes(session);
    setShowNotesModal(true);
  };

  const closeNotesModal = () => {
    setSelectedSessionNotes(null);
    setShowNotesModal(false);
  };

  return (
    <>
      <div className="tutor-profile-sessions">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6>Sessions & Completed Lessons</h6>
          <div className="session-stats">
            <span className="badge bg-success me-2">
              {
                sessions.filter((s) => s.status === SESSION_STATUS.COMPLETED)
                  .length
              }{" "}
              Completed
            </span>
            <span className="badge bg-primary">
              {
                sessions.filter((s) => s.status === SESSION_STATUS.SCHEDULED)
                  .length
              }{" "}
              Scheduled
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.studentName}</td>
                  <td>{session.subject}</td>
                  <td>
                    {session.date.toLocaleDateString("en-AU")} at{" "}
                    {session.date.toLocaleTimeString("en-AU")}
                  </td>
                  <td>{session.duration} min</td>
                  <td>
                    <span
                      className={`badge bg-${
                        session.status === SESSION_STATUS.COMPLETED
                          ? "success"
                          : session.status === SESSION_STATUS.SCHEDULED
                          ? "primary"
                          : "danger"
                      }`}
                    >
                      {SESSION_STATUS_LABELS[session.status]}
                    </span>
                  </td>
                  <td>
                    {session.rating ? (
                      <div className="d-flex align-items-center">
                        <i className="fas fa-star text-warning me-1"></i>
                        {session.rating}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {session.notes ? (
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => handleViewNotes(session)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                    ) : (
                      <span className="text-muted">No notes</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Notes Modal */}
      {showNotesModal && selectedSessionNotes && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-sticky-note me-2"></i>
                  Session Notes - {selectedSessionNotes.studentName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeNotesModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Student:</strong> {selectedSessionNotes.studentName}
                  </div>
                  <div className="col-md-6">
                    <strong>Subject:</strong> {selectedSessionNotes.subject}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Date:</strong>{" "}
                    {selectedSessionNotes.date.toLocaleDateString("en-AU")}
                  </div>
                  <div className="col-md-6">
                    <strong>Time:</strong>{" "}
                    {selectedSessionNotes.date.toLocaleTimeString("en-AU")}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Duration:</strong> {selectedSessionNotes.duration}{" "}
                    minutes
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong>
                    <span
                      className={`badge bg-${
                        selectedSessionNotes.status === SESSION_STATUS.COMPLETED
                          ? "success"
                          : selectedSessionNotes.status ===
                            SESSION_STATUS.SCHEDULED
                          ? "primary"
                          : "danger"
                      } ms-2`}
                    >
                      {SESSION_STATUS_LABELS[selectedSessionNotes.status]}
                    </span>
                  </div>
                </div>
                {selectedSessionNotes.rating && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>Rating:</strong>
                      <div className="d-flex align-items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${
                              i < selectedSessionNotes.rating
                                ? "text-warning"
                                : "text-muted"
                            } me-1`}
                          ></i>
                        ))}
                        <span className="ms-2">
                          {selectedSessionNotes.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="row">
                  <div className="col-12">
                    <strong>Session Notes:</strong>
                    <div className="mt-2 p-3 bg-light rounded">
                      {selectedSessionNotes.notes}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeNotesModal}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-edit me-1"></i>
                  Edit Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionsTab;


