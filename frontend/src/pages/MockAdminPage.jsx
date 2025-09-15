import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MockAdminPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/stats");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError("Failed to fetch applications");
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (applicationId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/auth/tutor/approve-mock/${applicationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Application approved successfully!");
        fetchApplications(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to approve application"}`);
      }
    } catch (err) {
      alert("Failed to approve application");
      console.error("Error approving application:", err);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge bg-warning",
      approved: "badge bg-success",
      onboarded: "badge bg-info",
      rejected: "badge bg-danger",
    };
    return (
      <span className={statusClasses[status] || "badge bg-secondary"}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Mock Admin Panel - Tutor Approvals</h1>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Tutor Applications</h5>
            </div>
            <div className="card-body">
              {applications.length === 0 ? (
                <p className="text-muted">No applications found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Applied</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>{app.id}</td>
                          <td>{app.fullName}</td>
                          <td>{app.email}</td>
                          <td>{getStatusBadge(app.status)}</td>
                          <td>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            {app.status === "pending" && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => approveApplication(app.id)}
                              >
                                Approve
                              </button>
                            )}
                            {app.status === "approved" && (
                              <span className="text-success">✓ Approved</span>
                            )}
                            {app.status === "onboarded" && (
                              <span className="text-info">✓ Onboarded</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <button className="btn btn-primary" onClick={fetchApplications}>
              Refresh Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockAdminPage;
