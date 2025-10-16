import React, { useState, useEffect } from "react";
import { getChangeRequests, approveChangeRequest, rejectChangeRequest } from "../../../../services/adminService";

const ChangeRequestsTab = () => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Load change requests on component mount
  useEffect(() => {
    loadChangeRequests();
  }, []);

  const loadChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getChangeRequests();
      if (response.success && Array.isArray(response.data)) {
        setChangeRequests(response.data);
      } else {
        setError("Failed to load change requests");
      }
    } catch (err) {
      console.error("Error loading change requests:", err);
      setError("Failed to load change requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChange = async (requestId) => {
    try {
      setProcessing(prev => ({ ...prev, [requestId]: true }));
      const response = await approveChangeRequest(requestId, "Approved by admin");
      
      if (response.success) {
        // Update local state
        setChangeRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: "approved" } : req
          )
        );
        alert("Change request approved successfully!");
      } else {
        alert("Failed to approve change request: " + (response.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error approving change request:", err);
      alert("Failed to approve change request: " + err.message);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectChange = async (requestId, reason) => {
    try {
      setProcessing(prev => ({ ...prev, [requestId]: true }));
      const response = await rejectChangeRequest(requestId, reason);
      
      if (response.success) {
        // Update local state
        setChangeRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status: "rejected", rejectionReason: reason }
              : req
          )
        );
        alert("Change request rejected successfully!");
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedRequestId(null);
      } else {
        alert("Failed to reject change request: " + (response.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error rejecting change request:", err);
      alert("Failed to reject change request: " + err.message);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const openRejectModal = (requestId) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason("");
    setSelectedRequestId(null);
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    handleRejectChange(selectedRequestId, rejectionReason.trim());
  };

  if (loading) {
    return (
      <div className="tutor-profile-change-requests">
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading change requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-profile-change-requests">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-2" 
            onClick={loadChangeRequests}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-profile-change-requests">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Change Requests Queue</h6>
        <div className="d-flex gap-2">
          <span className="badge bg-info">
            {changeRequests.filter((req) => req.status === "pending").length}{" "}
            Pending
          </span>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={loadChangeRequests}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {changeRequests.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="fas fa-inbox fa-2x mb-2"></i>
          <p>No change requests</p>
        </div>
      ) : (
        <div className="change-requests-list">
          {changeRequests.map((request) => (
            <div key={request.id} className="change-request-card">
              <div className="change-request-header">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">
                      {request.field === "intro"
                        ? "Profile Introduction"
                        : request.field === "subjects"
                        ? "Subject Changes"
                        : "Profile Update"}
                    </h6>
                    <small className="text-muted">
                      Submitted:{" "}
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString(
                        "en-AU"
                      ) : "Unknown date"}
                    </small>
                  </div>
                  <span
                    className={`badge bg-${
                      request.status === "pending"
                        ? "warning"
                        : request.status === "approved"
                        ? "success"
                        : "danger"
                    }`}
                  >
                    {request.status === "pending"
                      ? "Pending"
                      : request.status === "approved"
                      ? "Approved"
                      : "Rejected"}
                  </span>
                </div>
              </div>

              <div className="change-request-content mt-3">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-danger">Current Value:</h6>
                    <div className="change-value-box">
                      {Array.isArray(request.oldValue)
                        ? request.oldValue.map((item, idx) => (
                            <span key={idx} className="badge bg-secondary me-1">
                              {item}
                            </span>
                          ))
                        : request.oldValue}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-success">Requested Change:</h6>
                    <div className="change-value-box">
                      {Array.isArray(request.newValue)
                        ? request.newValue.map((item, idx) => (
                            <span key={idx} className="badge bg-primary me-1">
                              {item}
                            </span>
                          ))
                        : request.newValue}
                    </div>
                  </div>
                </div>

                <div className="change-request-comments mt-3">
                  <strong>Comments:</strong> {request.comments}
                </div>

                {request.status === "pending" && (
                  <div className="change-request-actions mt-3">
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApproveChange(request.id)}
                      disabled={processing[request.id]}
                    >
                      {processing[request.id] ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i> Approve
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => openRejectModal(request.id)}
                      disabled={processing[request.id]}
                    >
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </div>
                )}

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="rejection-reason mt-2">
                    <strong className="text-danger">Rejection Reason:</strong>{" "}
                    {request.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Change Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRejectModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Reason for Rejection</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this change request..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={submitRejection}
                  disabled={!rejectionReason.trim() || processing[selectedRequestId]}
                >
                  {processing[selectedRequestId] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times"></i> Reject Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeRequestsTab;


