import React, { useState } from "react";

const ChangeRequestsTab = () => {
  const [changeRequests, setChangeRequests] = useState([
    {
      id: 1,
      type: "profile_update",
      field: "intro",
      oldValue: "Experienced tutor with 5 years of teaching experience.",
      newValue:
        "Experienced tutor with 6 years of teaching experience specializing in VCE Chemistry and Biology.",
      status: "pending",
      submittedDate: "2024-03-15",
      comments: "Updated experience and added specialization details",
    },
    {
      id: 2,
      type: "subject_change",
      field: "subjects",
      oldValue: ["VCE Chemistry", "VCE Biology"],
      newValue: ["VCE Chemistry", "VCE Biology", "VCE Physics"],
      status: "approved",
      submittedDate: "2024-03-10",
      comments: "Added Physics to subject list after completing certification",
    },
    {
      id: 3,
      type: "banking_update",
      field: "banking",
      oldValue: "BSB: 123-456, Account: ****7890",
      newValue: "BSB: 123-456, Account: ****7891",
      status: "pending",
      submittedDate: "2024-03-18",
      comments: "Updated account number due to bank account change",
    },
  ]);

  const handleApproveChange = (requestId) => {
    setChangeRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "approved" } : req
      )
    );
  };

  const handleRejectChange = (requestId, reason) => {
    setChangeRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: "rejected", rejectionReason: reason }
          : req
      )
    );
  };

  return (
    <div className="tutor-profile-change-requests">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Change Requests Queue</h6>
        <span className="badge bg-info">
          {changeRequests.filter((req) => req.status === "pending").length}{" "}
          Pending
        </span>
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
                      {new Date(request.submittedDate).toLocaleDateString(
                        "en-AU"
                      )}
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
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleRejectChange(
                          request.id,
                          "Please provide more details"
                        )
                      }
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
    </div>
  );
};

export default ChangeRequestsTab;


