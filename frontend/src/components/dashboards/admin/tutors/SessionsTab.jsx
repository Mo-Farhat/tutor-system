import React, { useState, useEffect } from "react";
import { getTutorAllLessons } from "../../../../services/adminService";

const SESSION_STATUS_LABELS = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Pending",
};

const SessionsTab = ({ tutorId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!tutorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getTutorAllLessons(tutorId);
        if (result?.success && Array.isArray(result.data)) {
          setSessions(result.data);
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError("Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [tutorId]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const calculateDuration = (startAt, endAt) => {
    if (!startAt || !endAt) return "N/A";
    try {
      const start = new Date(startAt);
      const end = new Date(endAt);
      const diffMs = end - start;
      const diffMins = Math.round(diffMs / 60000);
      if (diffMins >= 60) {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      }
      return `${diffMins}m`;
    } catch (e) {
      return "N/A";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "scheduled":
        return "bg-primary";
      case "cancelled":
        return "bg-danger";
      case "pending":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="tutor-profile-sessions">
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading lessons...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-profile-sessions">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const scheduledCount = sessions.filter((s) => s.status === "scheduled").length;
  const cancelledCount = sessions.filter((s) => s.status === "cancelled").length;

  return (
    <div className="tutor-profile-sessions">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Sessions & Lessons</h6>
        <div className="session-stats">
          <span className="badge bg-success me-2">
            {completedCount} Completed
          </span>
          <span className="badge bg-primary me-2">
            {scheduledCount} Scheduled
          </span>
          {cancelledCount > 0 && (
            <span className="badge bg-danger">
              {cancelledCount} Cancelled
            </span>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-muted text-center py-4">
          <i className="fas fa-calendar-times fa-2x mb-2 d-block"></i>
          No lessons found for this tutor.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    {session.student
                      ? `${session.student.firstName || ""} ${session.student.lastName || ""}`.trim() || "Unknown"
                      : "Unknown"}
                  </td>
                  <td>{session.subject || "N/A"}</td>
                  <td>{formatDateTime(session.startAt)}</td>
                  <td>{calculateDuration(session.startAt, session.endAt)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(session.status)}`}>
                      {SESSION_STATUS_LABELS[session.status] || session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionsTab;
