import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MockAdminPage = () => {
  const [applications, setApplications] = useState([]);
  const [tutorProfiles, setTutorProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("applications");
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    fetchTutorProfiles();
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

  const fetchTutorProfiles = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/mock/profiles");
      const data = await response.json();
      console.log("Tutor profiles response:", data);

      // Handle different response structures
      if (Array.isArray(data)) {
        setTutorProfiles(data);
      } else if (data && Array.isArray(data.data)) {
        setTutorProfiles(data.data);
      } else if (data && Array.isArray(data.profiles)) {
        setTutorProfiles(data.profiles);
      } else {
        console.warn("Unexpected response structure:", data);
        setTutorProfiles([]);
      }
    } catch (err) {
      console.error("Error fetching tutor profiles:", err);
      setTutorProfiles([]);
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

  const makeTutorLive = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/mock/profiles/${userId}/make-live`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Tutor made live successfully!");
        fetchTutorProfiles(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to make tutor live"}`);
      }
    } catch (err) {
      alert("Failed to make tutor live");
      console.error("Error making tutor live:", err);
    }
  };

  const makeTutorOffline = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/mock/profiles/${userId}/make-offline`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Tutor made offline successfully!");
        fetchTutorProfiles(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to make tutor offline"}`);
      }
    } catch (err) {
      alert("Failed to make tutor offline");
      console.error("Error making tutor offline:", err);
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
            <h1>Mock Admin Panel</h1>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "applications" ? "active" : ""
                }`}
                onClick={() => setActiveTab("applications")}
              >
                Applications
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tutors" ? "active" : ""}`}
                onClick={() => setActiveTab("tutors")}
              >
                Tutor Profiles
              </button>
            </li>
          </ul>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
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
          )}

          {/* Tutor Profiles Tab */}
          {activeTab === "tutors" && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Tutor Profiles</h5>
              </div>
              <div className="card-body">
                {!Array.isArray(tutorProfiles) || tutorProfiles.length === 0 ? (
                  <p className="text-muted">
                    {!Array.isArray(tutorProfiles)
                      ? "Error loading tutor profiles..."
                      : "No tutor profiles found."}
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Live Status</th>
                          <th>Documents</th>
                          <th>Profile Complete</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutorProfiles.map((profile) => (
                          <tr key={profile.userId}>
                            <td>{profile.userId}</td>
                            <td>
                              {profile.user?.firstName} {profile.user?.lastName}
                            </td>
                            <td>{profile.user?.email}</td>
                            <td>
                              <span
                                className={`badge ${
                                  profile.is_live
                                    ? "bg-success"
                                    : "bg-secondary"
                                }`}
                              >
                                {profile.is_live ? "Live" : "Offline"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  profile.documents_uploaded
                                    ? "bg-success"
                                    : "bg-warning"
                                }`}
                              >
                                {profile.documents_uploaded
                                  ? "Uploaded"
                                  : "Pending"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  profile.is_profile_complete
                                    ? "bg-success"
                                    : "bg-warning"
                                }`}
                              >
                                {profile.is_profile_complete
                                  ? "Complete"
                                  : "Incomplete"}
                              </span>
                            </td>
                            <td>
                              {profile.documents_uploaded &&
                                !profile.is_live && (
                                  <button
                                    className="btn btn-primary btn-sm me-2"
                                    onClick={() =>
                                      makeTutorLive(profile.userId)
                                    }
                                  >
                                    Make Live
                                  </button>
                                )}
                              {profile.is_live && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() =>
                                    makeTutorOffline(profile.userId)
                                  }
                                >
                                  Make Offline
                                </button>
                              )}
                              {!profile.documents_uploaded && (
                                <span className="text-muted">
                                  Documents Required
                                </span>
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
          )}

          <div className="mt-4">
            <button
              className="btn btn-primary"
              onClick={() => {
                fetchApplications();
                fetchTutorProfiles();
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockAdminPage;
