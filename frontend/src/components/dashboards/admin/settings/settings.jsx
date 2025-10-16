import React, { useState, useEffect } from "react";
import {
  YEAR_LEVELS,
  YEAR_11_12_CURRICULA,
  YEAR_1_10_STATES,
  COMMON_SUBJECTS,
  AUSTRALIAN_STATES,
} from "../constants/adminConstants";
import "../../../../css/dashboards/admin/settings/settings.css";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("subjects");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Subjects & Years Management State
  const [subjects, setSubjects] = useState([]);
  const [yearLevels, setYearLevels] = useState([
    { name: "Year 1", active: true },
    { name: "Year 2", active: true },
    { name: "Year 3", active: true },
    { name: "Year 4", active: true },
    { name: "Year 5", active: true },
    { name: "Year 6", active: true },
    { name: "Year 7", active: true },
    { name: "Year 8", active: true },
    { name: "Year 9", active: true },
    { name: "Year 10", active: true },
    { name: "Year 11", active: true },
    { name: "Year 12", active: true },
  ]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [showEditYearModal, setShowEditYearModal] = useState(false);
  const [editingYearIndex, setEditingYearIndex] = useState(null);
  const [newSubject, setNewSubject] = useState({
    name: "",
    yearLevel: "",
    curriculum: "",
    state: "",
    active: true,
  });
  const [newYear, setNewYear] = useState({
    name: "",
    active: true,
  });

  // Policy Management State
  const [policies, setPolicies] = useState({
    privacy: {
      title: "Privacy Policy",
      content:
        "<h2>Privacy Policy</h2><p>Your privacy is important to us...</p>",
      lastUpdated: "2024-03-15",
      published: true,
    },
    terms: {
      title: "Terms & Conditions",
      content:
        "<h2>Terms & Conditions</h2><p>These terms govern your use of our service...</p>",
      lastUpdated: "2024-03-15",
      published: true,
    },
  });
  const [selectedPolicy, setSelectedPolicy] = useState("privacy");
  const [policyContent, setPolicyContent] = useState("");
  const [showPolicyPreview, setShowPolicyPreview] = useState(false);

  // Site Configuration State
  const [siteConfig, setSiteConfig] = useState({
    siteName: "Strive Academics",
    supportEmail: "support@striveacademy.com",
    referralCreditAmount: 20,
    packageDiscountAmount: 50,
    sessionReminder: {
      enabled: true,
      hoursBeforeSession: 24,
    },
    maintenanceMode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (selectedPolicy && policies[selectedPolicy]) {
      setPolicyContent(policies[selectedPolicy].content);
    }
  }, [selectedPolicy, policies]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Simulate API call to load settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock subjects data
      const mockSubjects = [
        {
          id: 1,
          name: "Chemistry",
          yearLevel: "Year 11/12",
          curriculum: "VCE",
          state: "VIC",
          active: true,
        },
        {
          id: 2,
          name: "Biology",
          yearLevel: "Year 11/12",
          curriculum: "VCE",
          state: "VIC",
          active: true,
        },
        {
          id: 3,
          name: "Physics",
          yearLevel: "Year 11/12",
          curriculum: "VCE",
          state: "VIC",
          active: true,
        },
        {
          id: 4,
          name: "Mathematics",
          yearLevel: "Year 1-10",
          curriculum: "",
          state: "VIC",
          active: true,
        },
        {
          id: 5,
          name: "English",
          yearLevel: "Year 11/12",
          curriculum: "HSC",
          state: "NSW",
          active: true,
        },
        {
          id: 6,
          name: "Legal Studies",
          yearLevel: "Year 11/12",
          curriculum: "QCE",
          state: "QLD",
          active: false,
        },
      ];
      setSubjects(mockSubjects);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) return;

    const subject = {
      id: Date.now(),
      ...newSubject,
      name: newSubject.name.trim(),
    };

    setSubjects((prev) => [...prev, subject]);
    setNewSubject({
      name: "",
      yearLevel: "",
      curriculum: "",
      state: "",
      active: true,
    });
    setShowAddSubjectModal(false);
    showSuccess();
  };

  const handleDeleteSubject = (subjectId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      showSuccess();
    }
  };

  const handleToggleSubjectStatus = (subjectId) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, active: !s.active } : s))
    );
    showSuccess();
  };

  const handleAddYear = () => {
    if (!newYear.name.trim()) return;

    const year = {
      ...newYear,
      name: newYear.name.trim(),
    };

    setYearLevels((prev) => [...prev, year]);
    setNewYear({
      name: "",
      active: true,
    });
    setShowAddYearModal(false);
    showSuccess();
  };

  const handleEditYear = (index) => {
    const year = yearLevels[index];
    setNewYear({
      name: year.name,
      active: year.active,
    });
    setEditingYearIndex(index);
    setShowEditYearModal(true);
  };

  const handleUpdateYear = () => {
    if (!newYear.name.trim()) return;

    setYearLevels((prev) =>
      prev.map((year, index) =>
        index === editingYearIndex
          ? { ...year, name: newYear.name.trim(), active: newYear.active }
          : year
      )
    );

    setNewYear({
      name: "",
      active: true,
    });
    setEditingYearIndex(null);
    setShowEditYearModal(false);
    showSuccess();
  };

  const handleToggleYearStatus = (index) => {
    setYearLevels((prev) =>
      prev.map((year, i) =>
        i === index ? { ...year, active: !year.active } : year
      )
    );
    showSuccess();
  };

  const handleDeleteYear = (index) => {
    if (window.confirm("Are you sure you want to delete this year level?")) {
      setYearLevels((prev) => prev.filter((_, i) => i !== index));
      showSuccess();
    }
  };

  const handleSavePolicy = () => {
    setPolicies((prev) => ({
      ...prev,
      [selectedPolicy]: {
        ...prev[selectedPolicy],
        content: policyContent,
        lastUpdated: new Date().toISOString().split("T")[0],
      },
    }));
    showSuccess();
  };

  const handlePublishPolicy = () => {
    setPolicies((prev) => ({
      ...prev,
      [selectedPolicy]: {
        ...prev[selectedPolicy],
        published: !prev[selectedPolicy].published,
      },
    }));
    showSuccess();
  };

  const handleSaveConfig = () => {
    // In real implementation, this would save to API
    showSuccess();
  };

  const showSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="admin-settings-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-settings-content">
              {/* Header */}
              <div className="admin-settings-header">
                <h2 className="admin-settings-title">System Settings</h2>
                <p className="admin-settings-subtitle text-muted">
                  Manage subjects, policies, and site configuration
                </p>
                {showSuccessMessage && (
                  <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    Settings saved successfully!
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowSuccessMessage(false)}
                    ></button>
                  </div>
                )}
              </div>

              {/* Tabs Navigation */}
              <div className="admin-settings-tabs">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "subjects" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("subjects")}
                    >
                      <i className="fas fa-book me-2"></i>
                      Subjects
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "years" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("years")}
                    >
                      <i className="fas fa-calendar-alt me-2"></i>
                      Years
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "policies" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("policies")}
                    >
                      <i className="fas fa-gavel me-2"></i>
                      Policies & Legal
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "config" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("config")}
                    >
                      <i className="fas fa-cogs me-2"></i>
                      Site Configuration
                    </button>
                  </li>
                </ul>
              </div>

              {/* Tab Content */}
              <div className="admin-settings-content-area">
                {/* Subjects Tab */}
                {activeTab === "subjects" && (
                  <div className="admin-settings-section">
                    <div className="admin-section-header">
                      <h4>Subjects Management</h4>
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowAddSubjectModal(true)}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Subject
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="table admin-subjects-table">
                        <thead>
                          <tr>
                            <th>Subject Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((subject) => (
                            <tr key={subject.id}>
                              <td>
                                <strong>{subject.name}</strong>
                              </td>
                              <td>
                                <button
                                  className={`btn btn-sm ${
                                    subject.active
                                      ? "btn-success"
                                      : "btn-outline-secondary"
                                  }`}
                                  onClick={() =>
                                    handleToggleSubjectStatus(subject.id)
                                  }
                                >
                                  {subject.active ? "Active" : "Inactive"}
                                </button>
                              </td>
                              <td>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() =>
                                    handleDeleteSubject(subject.id)
                                  }
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Years Tab */}
                {activeTab === "years" && (
                  <div className="admin-settings-section">
                    <div className="admin-section-header">
                      <h4>Years Management</h4>
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowAddYearModal(true)}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Year
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="table admin-years-table">
                        <thead>
                          <tr>
                            <th>Year</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearLevels.map((year, index) => (
                            <tr key={index}>
                              <td>
                                <strong>{year.name}</strong>
                              </td>
                              <td>
                                <button
                                  className={`btn btn-sm ${
                                    year.active
                                      ? "btn-success"
                                      : "btn-outline-secondary"
                                  }`}
                                  onClick={() => handleToggleYearStatus(index)}
                                >
                                  {year.active ? "Active" : "Inactive"}
                                </button>
                              </td>
                              <td>
                                <div className="btn-group">
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleEditYear(index)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDeleteYear(index)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Policies Tab */}
                {activeTab === "policies" && (
                  <div className="admin-settings-section">
                    <div className="row">
                      <div className="col-12 col-lg-4">
                        <div className="admin-policy-sidebar">
                          <h5>Available Policies</h5>
                          <div className="list-group">
                            {Object.entries(policies).map(([key, policy]) => (
                              <button
                                key={key}
                                className={`list-group-item list-group-item-action ${
                                  selectedPolicy === key ? "active" : ""
                                }`}
                                onClick={() => setSelectedPolicy(key)}
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1">{policy.title}</h6>
                                    <small>
                                      Updated: {formatDate(policy.lastUpdated)}
                                    </small>
                                  </div>
                                  <span
                                    className={`badge ${
                                      policy.published
                                        ? "bg-success"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {policy.published ? "Published" : "Draft"}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-lg-8">
                        <div className="admin-policy-editor">
                          <div className="admin-policy-editor-header">
                            <h5>{policies[selectedPolicy]?.title} Editor</h5>
                            <div className="btn-group">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setShowPolicyPreview(!showPolicyPreview)
                                }
                              >
                                <i className="fas fa-eye me-2"></i>
                                {showPolicyPreview ? "Edit" : "Preview"}
                              </button>
                              <button
                                className="btn btn-primary"
                                onClick={handleSavePolicy}
                              >
                                <i className="fas fa-save me-2"></i>
                                Save Draft
                              </button>
                              <button
                                className={`btn ${
                                  policies[selectedPolicy]?.published
                                    ? "btn-warning"
                                    : "btn-success"
                                }`}
                                onClick={handlePublishPolicy}
                              >
                                <i
                                  className={`fas ${
                                    policies[selectedPolicy]?.published
                                      ? "fa-pause"
                                      : "fa-play"
                                  } me-2`}
                                ></i>
                                {policies[selectedPolicy]?.published
                                  ? "Unpublish"
                                  : "Publish"}
                              </button>
                            </div>
                          </div>

                          {showPolicyPreview ? (
                            <div className="admin-policy-preview">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: policyContent,
                                }}
                              />
                            </div>
                          ) : (
                            <textarea
                              className="form-control admin-policy-textarea"
                              value={policyContent}
                              onChange={(e) => setPolicyContent(e.target.value)}
                              placeholder="Enter policy content here..."
                              rows={20}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Tab */}
                {activeTab === "config" && (
                  <div className="admin-settings-section">
                    <div className="row g-4">
                      <div className="col-12 col-lg-6">
                        <div className="admin-config-card">
                          <h5>General Settings</h5>
                          <div className="mb-3">
                            <label className="form-label">Site Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={siteConfig.siteName}
                              onChange={(e) =>
                                setSiteConfig((prev) => ({
                                  ...prev,
                                  siteName: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Support Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={siteConfig.supportEmail}
                              onChange={(e) =>
                                setSiteConfig((prev) => ({
                                  ...prev,
                                  supportEmail: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={siteConfig.maintenanceMode}
                              onChange={(e) =>
                                setSiteConfig((prev) => ({
                                  ...prev,
                                  maintenanceMode: e.target.checked,
                                }))
                              }
                            />
                            <label className="form-check-label">
                              Maintenance Mode
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-lg-6">
                        <div className="admin-config-card">
                          <h5>Business Settings</h5>
                          <div className="mb-3">
                            <label className="form-label">
                              Referral Credit Amount ($)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={siteConfig.referralCreditAmount}
                              onChange={(e) =>
                                setSiteConfig((prev) => ({
                                  ...prev,
                                  referralCreditAmount: Number(e.target.value),
                                }))
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              10-Hour Package Discount ($)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={siteConfig.packageDiscountAmount}
                              onChange={(e) =>
                                setSiteConfig((prev) => ({
                                  ...prev,
                                  packageDiscountAmount: Number(e.target.value),
                                }))
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              Session Reminder (hours before)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={
                                siteConfig.sessionReminder.hoursBeforeSession
                              }
                              onChange={(e) =>
                                setSiteConfig((prev) => ({
                                  ...prev,
                                  sessionReminder: {
                                    ...prev.sessionReminder,
                                    hoursBeforeSession: Number(e.target.value),
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={siteConfig.sessionReminder.enabled}
                              onChange={(e) =>
                                setSiteConfig((prev) => ({
                                  ...prev,
                                  sessionReminder: {
                                    ...prev.sessionReminder,
                                    enabled: e.target.checked,
                                  },
                                }))
                              }
                            />
                            <label className="form-check-label">
                              Enable Session Reminders
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="admin-config-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveConfig}
                      >
                        <i className="fas fa-save me-2"></i>
                        Save Configuration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Subject</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddSubjectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Subject Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Chemistry"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Year Level</label>
                  <select
                    className="form-select"
                    value={newSubject.yearLevel}
                    onChange={(e) =>
                      setNewSubject((prev) => ({
                        ...prev,
                        yearLevel: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Year Level</option>
                    {YEAR_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                {newSubject.yearLevel === "Year 11/12" && (
                  <div className="mb-3">
                    <label className="form-label">Curriculum</label>
                    <select
                      className="form-select"
                      value={newSubject.curriculum}
                      onChange={(e) =>
                        setNewSubject((prev) => ({
                          ...prev,
                          curriculum: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Curriculum</option>
                      {YEAR_11_12_CURRICULA.map((curriculum) => (
                        <option key={curriculum} value={curriculum}>
                          {curriculum}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">State</label>
                  <select
                    className="form-select"
                    value={newSubject.state}
                    onChange={(e) =>
                      setNewSubject((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select State</option>
                    {(newSubject.yearLevel === "Year 11/12"
                      ? YEAR_11_12_CURRICULA
                      : YEAR_1_10_STATES
                    ).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddSubjectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddSubject}
                  disabled={
                    !newSubject.name.trim() ||
                    !newSubject.yearLevel ||
                    !newSubject.state
                  }
                >
                  Add Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Year Modal */}
      {showAddYearModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Year</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddYearModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Year Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newYear.name}
                    onChange={(e) =>
                      setNewYear((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Year 7-8"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddYearModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddYear}
                  disabled={!newYear.name.trim()}
                >
                  Add Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Year Modal */}
      {showEditYearModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Year</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditYearModal(false);
                    setEditingYearIndex(null);
                    setNewYear({
                      name: "",
                      active: true,
                    });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Year Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newYear.name}
                    onChange={(e) =>
                      setNewYear((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Year 7-8"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditYearModal(false);
                    setEditingYearIndex(null);
                    setNewYear({
                      name: "",
                      active: true,
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateYear}
                  disabled={!newYear.name.trim()}
                >
                  Update Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
