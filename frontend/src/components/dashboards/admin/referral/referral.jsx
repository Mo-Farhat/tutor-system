import React, { useState, useEffect } from "react";
import { REFERRAL_CREDIT_AMOUNT } from "../constants/adminConstants";
import "../../../../css/dashboards/admin/referral/referral.css";

function AdminReferral() {
  const [activeTab, setActiveTab] = useState("tutor-referrals");
  const [referralData, setReferralData] = useState({
    tutorReferrals: [],
    studentReferrals: [],
    analytics: {
      totalTutorReferrals: 45,
      totalStudentReferrals: 62,
      totalCreditsIssued: 2140,
      conversionRate: 68.5,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock referral data
      const mockData = {
        tutorReferrals: [
          {
            id: 1,
            tutorName: "Sarah Johnson",
            tutorEmail: "sarah@example.com",
            referredStudentName: "Alice Chen",
            referredStudentEmail: "alice@example.com",
            referralDate: "2024-03-10",
            firstSessionDate: "2024-03-15",
            creditAmount: 20,
            status: "completed",
          },
          {
            id: 2,
            tutorName: "Michael Chen",
            tutorEmail: "michael@example.com",
            referredStudentName: "Emma Wilson",
            referredStudentEmail: "emma@example.com",
            referralDate: "2024-03-12",
            firstSessionDate: null,
            creditAmount: 20,
            status: "pending",
          },
          {
            id: 3,
            tutorName: "Emma Thompson",
            tutorEmail: "emma.t@example.com",
            referredStudentName: "David Kim",
            referredStudentEmail: "david@example.com",
            referralDate: "2024-03-08",
            firstSessionDate: "2024-03-14",
            creditAmount: 20,
            status: "completed",
          },
          {
            id: 4,
            tutorName: "James Wilson",
            tutorEmail: "james@example.com",
            referredStudentName: "Sophie Brown",
            referredStudentEmail: "sophie@example.com",
            referralDate: "2024-03-20",
            firstSessionDate: null,
            creditAmount: 20,
            status: "pending",
          },
          {
            id: 5,
            tutorName: "Lisa Anderson",
            tutorEmail: "lisa@example.com",
            referredStudentName: "Lucas White",
            referredStudentEmail: "lucas@example.com",
            referralDate: "2024-03-18",
            firstSessionDate: "2024-03-25",
            creditAmount: 20,
            status: "completed",
          },
          {
            id: 6,
            tutorName: "Robert Taylor",
            tutorEmail: "robert@example.com",
            referredStudentName: "Olivia Davis",
            referredStudentEmail: "olivia@example.com",
            referralDate: "2024-03-22",
            firstSessionDate: null,
            creditAmount: 20,
            status: "pending",
          },
        ],
        studentReferrals: [
          {
            id: 1,
            referrerName: "Alice Chen",
            referrerEmail: "alice@example.com",
            referredName: "Sophie Brown",
            referredEmail: "sophie@example.com",
            referralDate: "2024-03-15",
            firstPaidSessionDate: "2024-03-20",
            creditAmount: 20,
            status: "completed",
          },
          {
            id: 2,
            referrerName: "Charlotte Wilson",
            referrerEmail: "charlotte@example.com",
            referredName: "Lucas White",
            referredEmail: "lucas@example.com",
            referralDate: "2024-03-18",
            firstPaidSessionDate: null,
            creditAmount: 20,
            status: "pending",
          },
          {
            id: 3,
            referrerName: "Benjamin Smith",
            referrerEmail: "ben@example.com",
            referredName: "Olivia Taylor",
            referredEmail: "olivia@example.com",
            referralDate: "2024-03-14",
            firstPaidSessionDate: "2024-03-22",
            creditAmount: 20,
            status: "completed",
          },
          {
            id: 4,
            referrerName: "Emma Davis",
            referrerEmail: "emma.d@example.com",
            referredName: "Noah Johnson",
            referredEmail: "noah@example.com",
            referralDate: "2024-03-25",
            firstPaidSessionDate: null,
            creditAmount: 20,
            status: "pending",
          },
          {
            id: 5,
            referrerName: "William Brown",
            referrerEmail: "william@example.com",
            referredName: "Ava Miller",
            referredEmail: "ava@example.com",
            referralDate: "2024-03-19",
            firstPaidSessionDate: "2024-03-26",
            creditAmount: 20,
            status: "completed",
          },
          {
            id: 6,
            referrerName: "Grace Lee",
            referrerEmail: "grace@example.com",
            referredName: "Ethan Wilson",
            referredEmail: "ethan@example.com",
            referralDate: "2024-03-23",
            firstPaidSessionDate: null,
            creditAmount: 20,
            status: "pending",
          },
        ],
        analytics: {
          totalTutorReferrals: 45,
          totalStudentReferrals: 62,
          totalCreditsIssued: 2140,
          conversionRate: 68.5,
        },
      };

      setReferralData(mockData);
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: "success",
      pending: "warning",
      cancelled: "danger",
    };
    return (
      <span className={`badge bg-${colors[status] || "secondary"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not completed";
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getCurrentData = () => {
    return activeTab === "tutor-referrals"
      ? referralData.tutorReferrals
      : referralData.studentReferrals;
  };

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setShowDetailsModal(true);
  };

  const handleProcessCredit = (referral) => {
    setSelectedReferral(referral);
    setShowProcessModal(true);
  };

  const confirmProcessCredit = () => {
    if (!selectedReferral) return;

    // Update the referral status to completed
    const updatedData = { ...referralData };
    if (activeTab === "tutor-referrals") {
      updatedData.tutorReferrals = updatedData.tutorReferrals.map((item) =>
        item.id === selectedReferral.id
          ? {
              ...item,
              status: "completed",
              firstSessionDate: new Date().toISOString().split("T")[0],
            }
          : item
      );
    } else {
      updatedData.studentReferrals = updatedData.studentReferrals.map((item) =>
        item.id === selectedReferral.id
          ? {
              ...item,
              status: "completed",
              firstPaidSessionDate: new Date().toISOString().split("T")[0],
            }
          : item
      );
    }

    // Update analytics
    updatedData.analytics.totalCreditsIssued += selectedReferral.creditAmount;

    setReferralData(updatedData);
    setShowProcessModal(false);
    setSelectedReferral(null);
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowProcessModal(false);
    setSelectedReferral(null);
  };

  const filteredData = getCurrentData().filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === "tutor-referrals") {
      return (
        item.tutorName.toLowerCase().includes(searchLower) ||
        item.referredStudentName.toLowerCase().includes(searchLower)
      );
    } else {
      return (
        item.referrerName.toLowerCase().includes(searchLower) ||
        item.referredName.toLowerCase().includes(searchLower)
      );
    }
  });

  if (isLoading) {
    return (
      <div className="admin-referral-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading referral data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-referral-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-referral-content">
              {/* Header */}
              <div className="admin-referral-header">
                <h2 className="admin-referral-title">Referral Program</h2>
                <p className="admin-referral-subtitle text-muted">
                  Track and manage tutor and student referrals
                </p>
              </div>

              {/* Analytics Cards */}
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="admin-referral-card">
                    <div className="admin-referral-card-icon bg-primary">
                      <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div className="admin-referral-card-content">
                      <h3>{referralData.analytics.totalTutorReferrals}</h3>
                      <p>Tutor Referrals</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-referral-card">
                    <div className="admin-referral-card-icon bg-success">
                      <i className="fas fa-user-graduate"></i>
                    </div>
                    <div className="admin-referral-card-content">
                      <h3>{referralData.analytics.totalStudentReferrals}</h3>
                      <p>Student Referrals</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-referral-card">
                    <div className="admin-referral-card-icon bg-warning">
                      <i className="fas fa-gift"></i>
                    </div>
                    <div className="admin-referral-card-content">
                      <h3>
                        {formatCurrency(
                          referralData.analytics.totalCreditsIssued
                        )}
                      </h3>
                      <p>Credits Issued</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-referral-card">
                    <div className="admin-referral-card-icon bg-info">
                      <i className="fas fa-percentage"></i>
                    </div>
                    <div className="admin-referral-card-content">
                      <h3>{referralData.analytics.conversionRate}%</h3>
                      <p>Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="admin-referral-tabs">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "tutor-referrals" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("tutor-referrals")}
                    >
                      <i className="fas fa-chalkboard-teacher me-2"></i>
                      Tutor → Student Referrals
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "student-referrals" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("student-referrals")}
                    >
                      <i className="fas fa-user-friends me-2"></i>
                      Student → Student Referrals
                    </button>
                  </li>
                </ul>
              </div>

              {/* Controls */}
              <div className="admin-referral-controls mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="admin-search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search referrals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6 text-end">
                    <div className="admin-referral-info">
                      <small className="text-muted">
                        Credit Amount: {formatCurrency(REFERRAL_CREDIT_AMOUNT)}{" "}
                        per completed referral
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="admin-referral-tab-content">
                {filteredData.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-gift text-muted mb-3"></i>
                    <h5>No referrals found</h5>
                    <p className="text-muted">
                      No referral data matches your current filters
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table admin-referral-table">
                      <thead>
                        <tr>
                          {activeTab === "tutor-referrals" ? (
                            <>
                              <th>Tutor</th>
                              <th>Referred Student</th>
                              <th>Referral Date</th>
                              <th>First Session</th>
                              <th>Credit Amount</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </>
                          ) : (
                            <>
                              <th>Referrer Student</th>
                              <th>Referred Student</th>
                              <th>Referral Date</th>
                              <th>First Paid Session</th>
                              <th>Credit Amount</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div>
                                <strong>
                                  {activeTab === "tutor-referrals"
                                    ? item.tutorName
                                    : item.referrerName}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {activeTab === "tutor-referrals"
                                    ? item.tutorEmail
                                    : item.referrerEmail}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>
                                  {activeTab === "tutor-referrals"
                                    ? item.referredStudentName
                                    : item.referredName}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {activeTab === "tutor-referrals"
                                    ? item.referredStudentEmail
                                    : item.referredEmail}
                                </small>
                              </div>
                            </td>
                            <td>{formatDate(item.referralDate)}</td>
                            <td>
                              {formatDate(
                                activeTab === "tutor-referrals"
                                  ? item.firstSessionDate
                                  : item.firstPaidSessionDate
                              )}
                            </td>
                            <td>{formatCurrency(item.creditAmount)}</td>
                            <td>{getStatusBadge(item.status)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleViewDetails(item)}
                              >
                                View Details
                              </button>
                              {item.status === "pending" && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleProcessCredit(item)}
                                >
                                  Process Credit
                                </button>
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
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedReferral && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Referral Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="text-primary">
                      {activeTab === "tutor-referrals"
                        ? "Tutor Information"
                        : "Referrer Information"}
                    </h6>
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">
                          {activeTab === "tutor-referrals"
                            ? selectedReferral.tutorName
                            : selectedReferral.referrerName}
                        </h6>
                        <p className="card-text">
                          <strong>Email:</strong>{" "}
                          {activeTab === "tutor-referrals"
                            ? selectedReferral.tutorEmail
                            : selectedReferral.referrerEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-success">
                      Referred Student Information
                    </h6>
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">
                          {activeTab === "tutor-referrals"
                            ? selectedReferral.referredStudentName
                            : selectedReferral.referredName}
                        </h6>
                        <p className="card-text">
                          <strong>Email:</strong>{" "}
                          {activeTab === "tutor-referrals"
                            ? selectedReferral.referredStudentEmail
                            : selectedReferral.referredEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <h6 className="text-info">Referral Information</h6>
                    <div className="card">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4">
                            <p>
                              <strong>Referral Date:</strong>
                              <br />
                              {formatDate(selectedReferral.referralDate)}
                            </p>
                          </div>
                          <div className="col-md-4">
                            <p>
                              <strong>First Session:</strong>
                              <br />
                              {formatDate(
                                activeTab === "tutor-referrals"
                                  ? selectedReferral.firstSessionDate
                                  : selectedReferral.firstPaidSessionDate
                              )}
                            </p>
                          </div>
                          <div className="col-md-4">
                            <p>
                              <strong>Credit Amount:</strong>
                              <br />
                              {formatCurrency(selectedReferral.creditAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p>
                            <strong>Status:</strong>{" "}
                            {getStatusBadge(selectedReferral.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Close
                </button>
                {selectedReferral.status === "pending" && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      closeModals();
                      handleProcessCredit(selectedReferral);
                    }}
                  >
                    Process Credit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Credit Modal */}
      {showProcessModal && selectedReferral && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-success">
                  <i className="fas fa-gift me-2"></i>
                  Process Referral Credit
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Credit Processing:</strong> This will mark the
                  referral as completed and issue the credit.
                </div>

                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Referral Summary</h6>
                    <p className="card-text">
                      <strong>Referrer:</strong>{" "}
                      {activeTab === "tutor-referrals"
                        ? selectedReferral.tutorName
                        : selectedReferral.referrerName}
                    </p>
                    <p className="card-text">
                      <strong>Referred:</strong>{" "}
                      {activeTab === "tutor-referrals"
                        ? selectedReferral.referredStudentName
                        : selectedReferral.referredName}
                    </p>
                    <p className="card-text">
                      <strong>Credit Amount:</strong>{" "}
                      {formatCurrency(selectedReferral.creditAmount)}
                    </p>
                    <p className="card-text">
                      <strong>Referral Date:</strong>{" "}
                      {formatDate(selectedReferral.referralDate)}
                    </p>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Note:</strong> This action will automatically set the
                  first session date to today and mark the referral as
                  completed.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmProcessCredit}
                >
                  <i className="fas fa-check me-2"></i>
                  Process Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReferral;
