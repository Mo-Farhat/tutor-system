import React, { useState } from "react";
import studentService from "../../../../services/studentService";
import "../../../../css/dashboards/student/lessons/confirmationModal.css";

function SessionConfirmationModal({ session, onClose, onConfirmed }) {
  const [isDisputing, setIsDisputing] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!session) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await studentService.confirmSession(session.id, {
        confirmed: true,
        notes: null
      });
      if (res.success) {
        onConfirmed(session.id);
        onClose();
      } else {
        setError(res.error || "Failed to confirm session");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispute = async () => {
    if (!notes.trim()) {
      setError("Please provide notes for the dispute");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await studentService.confirmSession(session.id, {
        confirmed: false,
        notes: notes
      });
      if (res.success) {
        onConfirmed(session.id);
        onClose();
      } else {
        setError(res.error || "Failed to submit dispute");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const audit = session.audit || {};
  const hasExtraCharges = audit.overageAmount > 0 || audit.travelFee > 0;

  return (
    <div className="session-confirmation-modal-overlay" onClick={onClose}>
      <div className="session-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="session-confirmation-header">
          <h3 className="session-confirmation-title">Confirm Session</h3>
          <button className="session-confirmation-close" onClick={onClose}>&times;</button>
        </div>

        <div className="session-confirmation-details">
          <div className="session-detail-item">
            <span className="session-detail-label">Tutor</span>
            <span className="session-detail-value">{session.tutor?.firstName} {session.tutor?.lastName}</span>
          </div>
          <div className="session-detail-item">
            <span className="session-detail-label">Subject</span>
            <span className="session-detail-value">{session.subject}</span>
          </div>
          <div className="session-detail-item">
            <span className="session-detail-label">Date</span>
            <span className="session-detail-value">{new Date(session.startAt).toLocaleDateString()}</span>
          </div>
          <div className="session-detail-item">
            <span className="session-detail-label">Duration</span>
            <span className="session-detail-value">{audit.durationHours} hours</span>
          </div>

          {hasExtraCharges && (
            <div className="session-confirmation-charges">
              {audit.overageAmount > 0 && (
                <div className="charge-item">
                  <span className="charge-label">Overage Charge</span>
                  <span className="charge-value">${parseFloat(audit.overageAmount).toFixed(2)}</span>
                </div>
              )}
              {audit.travelFee > 0 && (
                <div className="charge-item">
                  <span className="charge-label">Travel Fee</span>
                  <span className="charge-value">${parseFloat(audit.travelFee).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        <div className="session-confirmation-dispute-section">
          <div className="dispute-toggle" onClick={() => setIsDisputing(!isDisputing)}>
            <input type="checkbox" checked={isDisputing} onChange={() => {}} />
            <span>I want to dispute the hours or charges</span>
          </div>
          
          {isDisputing && (
            <textarea
              className="dispute-notes"
              placeholder="Please explain why you are disputing this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          )}
        </div>

        <div className="session-confirmation-actions">
          {!isDisputing ? (
            <button 
              className="btn-confirm" 
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm Session"}
            </button>
          ) : (
            <button 
              className="btn-dispute" 
              onClick={handleDispute}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionConfirmationModal;
