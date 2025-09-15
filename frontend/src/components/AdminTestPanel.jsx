import React, { useState, useEffect } from "react";
import tutorService from "../services/tutorService";

const AdminTestPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [adminToken, setAdminToken] = useState("");

  const setAdminAccess = () => {
    // Temporarily set admin token for testing
    const tempAdminToken = "admin-bypass-token";
    localStorage.setItem("access_token", tempAdminToken);
    setAdminToken(tempAdminToken);
    setMessage("Admin access enabled (bypass mode)");
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const result = await tutorService.getApplicationStats();
      if (result.success) {
        setApplications(result.data.applications || []);
        setMessage(
          `Found ${result.data.applications?.length || 0} applications`
        );
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!window.confirm("Are you sure you want to approve this application?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await tutorService.approveApplication(applicationId);
      if (result.success) {
        setMessage(
          `Application approved successfully! Setup token: ${result.data.setupToken}`
        );
        fetchApplications(); // Refresh the list
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if there's already an admin token
    const existingToken = localStorage.getItem("access_token");
    if (existingToken) {
      setAdminToken(existingToken);
    }
  }, []);

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">🔧 Admin Test Panel - Tutor Applications</h4>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <div className="row">
              <div className="col-md-6">
                <h5>Admin Controls</h5>
                <div className="btn-group mb-3" role="group">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={setAdminAccess}
                    disabled={loading}
                  >
                    Enable Admin Access
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchApplications}
                    disabled={loading || !adminToken}
                  >
                    {loading ? "Loading..." : "Load Applications"}
                  </button>
                </div>
                {adminToken && (
                  <div className="alert alert-info alert-sm">
                    <small>✓ Admin access active</small>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <h5>Quick Access</h5>
                <div className="btn-group btn-group-sm">
                  <a href="/admin" className="btn btn-outline-secondary">
                    /admin
                  </a>
                  <a href="/admin/panel" className="btn btn-outline-secondary">
                    /admin/panel
                  </a>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`alert ${
                message.includes("Error") ? "alert-danger" : "alert-info"
              }`}
            >
              {message}
            </div>
          )}

          {applications.length === 0 ? (
            <div className="alert alert-warning">
              No applications found. Submit an application through the "Join Us"
              form first.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Application ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td>
                        <code>{app.applicationId}</code>
                      </td>
                      <td>{app.fullName}</td>
                      <td>{app.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            app.status === "pending"
                              ? "bg-warning"
                              : app.status === "approved"
                              ? "bg-primary"
                              : app.status === "onboarded"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleString()}</td>
                      <td>
                        {app.status === "pending" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(app.id)}
                            disabled={loading}
                          >
                            Approve
                          </button>
                        )}
                        {app.status === "approved" && (
                          <span className="text-muted">
                            Awaiting password setup
                          </span>
                        )}
                        {app.status === "onboarded" && (
                          <span className="text-success">✓ Complete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <h6>Quick Test Links:</h6>
            <div className="btn-group" role="group">
              <a href="/join-us" className="btn btn-outline-secondary btn-sm">
                Submit Application
              </a>
              <a href="/login" className="btn btn-outline-secondary btn-sm">
                Login Page
              </a>
              <a
                href="/dashboard/tutor/profile"
                className="btn btn-outline-secondary btn-sm"
              >
                Tutor Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPanel;
