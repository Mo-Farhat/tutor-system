import React, { useState, useEffect } from "react";
import studentService from "../../../../services/studentService";
import "../../../../css/dashboards/student/profile/profile.css";

function StudentProfileManagement() {
  // Student profile data
  const [studentData, setStudentData] = useState({
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    grade: "Grade 11",
    stream: "Science Stream",
    joinedDate: "Jan 2025",
    status: "Active Student",
    avatar: "/public/Images/logo/logo1.png",
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Learning preferences
  const [learningPreferences, setLearningPreferences] = useState({
    learningStyle: ["Visual", "Interactive"],
    bestTime: "Weekday Evenings (4 PM - 7 PM)",
    sessionLength: "60-90 minutes",
    additionalNotes:
      "Prefer structured lessons with regular breaks. Need extra focus on problem-solving exercises.",
  });

  // SMART Goals (API-backed)
  const [goals, setGoals] = useState([]); // flat array: {id, subject, title, details, targetDate}
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState(null);

  // Current subjects
  const [currentSubjects] = useState([
    { name: "Advanced Mathematics", icon: "🔢", status: "Active" },
    { name: "Physics", icon: "⚛️", status: "Active" },
    { name: "Chemistry", icon: "🧪", status: "Pending" },
  ]);

  // Available learning styles
  const learningStyleOptions = [
    "Visual",
    "Auditory",
    "Kinesthetic",
    "Interactive",
    "Reading/Writing",
  ];

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState({
    id: null,
    subject: "",
    title: "",
    details: "",
    targetDate: "",
  });
  const [editingPreferences, setEditingPreferences] = useState({
    ...learningPreferences,
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Load goals from API
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setGoalsLoading(true);
        setGoalsError(null);
        const res = await studentService.getGoals();
        if (res?.success && Array.isArray(res.data)) {
          setGoals(res.data);
        } else {
          setGoals([]);
        }
      } catch (e) {
        setGoalsError("Failed to load goals");
      } finally {
        setGoalsLoading(false);
      }
    };
    loadGoals();
  }, []);

  // Handle goal editing (open modal)
  const handleEditGoal = (subject, goalId = null) => {
    if (goalId) {
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        setEditingGoal({
          id: goal.id,
          subject: goal.subject || subject || "",
          title: goal.title || "",
          details: goal.details || "",
          targetDate: goal.targetDate ? goal.targetDate.split("T")[0] : "",
        });
      }
    } else {
      setEditingGoal({
        id: null,
        subject: subject || "",
        title: "",
        details: "",
        targetDate: "",
      });
    }
    setShowGoalModal(true);
  };

  // Create / Update goal via API
  const saveGoal = async () => {
    try {
      const payload = {
        subject: editingGoal.subject,
        title: editingGoal.title,
        details: editingGoal.details || undefined,
        targetDate: editingGoal.targetDate || undefined,
      };
      if (editingGoal.id) {
        const res = await studentService.updateGoal(editingGoal.id, payload);
        if (res?.success) {
          setGoals(goals.map((g) => (g.id === editingGoal.id ? res.data : g)));
        }
      } else {
        const res = await studentService.createGoal(payload);
        if (res?.success) {
          setGoals([res.data, ...goals]);
        }
      }
      setShowGoalModal(false);
      setEditingGoal({
        id: null,
        subject: "",
        title: "",
        details: "",
        targetDate: "",
      });
    } catch (e) {
      console.error("Save goal failed", e);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const res = await studentService.deleteGoal(goalId);
      if (res?.success) setGoals(goals.filter((g) => g.id !== goalId));
    } catch (e) {
      console.error("Delete goal failed", e);
    }
  };

  // Helpers
  const goalsBySubject = goals.reduce((acc, g) => {
    const key = g.subject || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {});
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  // Save preferences
  const savePreferences = () => {
    setLearningPreferences(editingPreferences);
    setShowPreferencesModal(false);
  };

  // Handle learning style toggle
  const toggleLearningStyle = (style) => {
    const newStyles = editingPreferences.learningStyle.includes(style)
      ? editingPreferences.learningStyle.filter((s) => s !== style)
      : [...editingPreferences.learningStyle, style];
    setEditingPreferences({ ...editingPreferences, learningStyle: newStyles });
  };

  // Handle password change
  const handlePasswordChange = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    // Here you would typically send the password change request to your backend
    console.log("Password change request:", passwordData);
    alert("Password updated successfully!");
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  // Reset password modal
  const resetPasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  return (
    <div className="student-profile-dashboard">
      <div className="student-profile-content">
        {/* Profile Header */}
        <div className="student-profile-section">
          <div className="card student-profile-header-card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="student-profile-avatar">
                    <img src={studentData.avatar} alt={studentData.fullName} />
                  </div>
                </div>
                <div className="col">
                  <h4 className="student-profile-name">
                    {studentData.fullName}
                  </h4>
                  <p className="student-profile-details">
                    {studentData.grade} • {studentData.stream}
                  </p>
                  <div className="student-profile-badges">
                    <span className="badge student-profile-status-badge">
                      {studentData.status}
                    </span>
                    <span className="student-profile-joined">
                      <i className="fas fa-clock me-1"></i>
                      Joined {studentData.joinedDate}
                    </span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn student-profile-edit-btn"
                      onClick={() => setShowEditModal(true)}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Profile
                    </button>
                    <button
                      className="btn student-profile-password-btn"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <i className="fas fa-lock me-2"></i>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* SMART Goals Section */}
          <div className="col-lg-8 col-md-12">
            <div className="student-profile-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="student-profile-section-title">
                  SMART Goals by Subject
                </h5>
                <button
                  className="btn student-profile-add-btn"
                  onClick={() => handleEditGoal("")}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Goal
                </button>
              </div>

              {goalsLoading && (
                <div className="text-muted">Loading goals...</div>
              )}
              {goalsError && <div className="text-danger">{goalsError}</div>}
              {Object.entries(goalsBySubject).map(([subject, list]) => (
                <div
                  key={subject}
                  className="card student-profile-goals-card mb-3"
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="student-profile-subject-title">
                        {subject}
                      </h6>
                      <button
                        className="btn student-profile-edit-subject-btn"
                        onClick={() => handleEditGoal(subject)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                    <div className="student-profile-goals-list">
                      {list.map((g) => (
                        <div key={g.id} className="student-profile-goal-item">
                          <div className="student-profile-goal-content">
                            <span className="student-profile-goal-text">
                              {g.title}
                            </span>
                            {g.details && (
                              <div className="text-muted small">
                                {g.details}
                              </div>
                            )}
                            {g.targetDate && (
                              <div className="text-muted small">
                                Target: {formatDate(g.targetDate)}
                              </div>
                            )}
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn student-profile-goal-edit-btn"
                              onClick={() => handleEditGoal(g.subject, g.id)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => deleteGoal(g.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {!goalsLoading && goals.length === 0 && (
                <div className="text-muted">
                  No goals yet. Click "Add Goal" to create one.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4 col-md-12">
            {/* Learning Preferences */}
            <div className="student-profile-section">
              <div className="card student-profile-preferences-card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="student-profile-card-title">
                      Learning Preferences
                    </h6>
                    <button
                      className="btn student-profile-edit-icon-btn"
                      onClick={() => {
                        setEditingPreferences({ ...learningPreferences });
                        setShowPreferencesModal(true);
                      }}
                    >
                      <i className="fas fa-external-link-alt"></i>
                    </button>
                  </div>

                  <div className="student-profile-preference-item">
                    <div className="student-profile-preference-label">
                      Preferred Learning Style
                    </div>
                    <div className="student-profile-preference-tags">
                      {learningPreferences.learningStyle.map((style) => (
                        <span
                          key={style}
                          className="student-profile-preference-tag"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="student-profile-preference-item">
                    <div className="student-profile-preference-label">
                      Best Time for Sessions
                    </div>
                    <div className="student-profile-preference-value">
                      {learningPreferences.bestTime}
                    </div>
                  </div>

                  <div className="student-profile-preference-item">
                    <div className="student-profile-preference-label">
                      Preferred Session Length
                    </div>
                    <div className="student-profile-preference-value">
                      {learningPreferences.sessionLength}
                    </div>
                  </div>

                  <div className="student-profile-preference-item">
                    <div className="student-profile-preference-label">
                      Additional Notes
                    </div>
                    <div className="student-profile-preference-value">
                      {learningPreferences.additionalNotes}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Subjects */}
            <div className="student-profile-section">
              <div className="card student-profile-subjects-card">
                <div className="card-body">
                  <h6 className="student-profile-card-title mb-3">
                    Current Subjects
                  </h6>
                  <div className="student-profile-subjects-list">
                    {currentSubjects.map((subject, index) => (
                      <div key={index} className="student-profile-subject-item">
                        <div className="student-profile-subject-icon">
                          {subject.icon}
                        </div>
                        <div className="student-profile-subject-name">
                          {subject.name}
                        </div>
                        <span
                          className={`badge student-profile-subject-status ${subject.status.toLowerCase()}`}
                        >
                          {subject.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentData.fullName}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={studentData.email}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Grade</label>
                    <select
                      className="form-select"
                      value={studentData.grade}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          grade: e.target.value,
                        })
                      }
                    >
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stream</label>
                    <select
                      className="form-select"
                      value={studentData.stream}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          stream: e.target.value,
                        })
                      }
                    >
                      <option value="Science Stream">Science Stream</option>
                      <option value="Commerce Stream">Commerce Stream</option>
                      <option value="Arts Stream">Arts Stream</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowEditModal(false)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingGoal.id ? "Edit Goal" : "Add New Goal"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowGoalModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingGoal.subject}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          subject: e.target.value,
                        })
                      }
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingGoal.title}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          title: e.target.value,
                        })
                      }
                      placeholder="Describe your goal succinctly"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Details</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingGoal.details}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          details: e.target.value,
                        })
                      }
                      placeholder="Any specific steps or notes..."
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Target Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editingGoal.targetDate}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          targetDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGoalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveGoal}
                  disabled={!editingGoal.subject || !editingGoal.title}
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Preferences Modal */}
      {showPreferencesModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Learning Preferences</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPreferencesModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-4">
                    <label className="form-label">
                      Preferred Learning Style
                    </label>
                    <div className="student-profile-learning-style-options">
                      {learningStyleOptions.map((style) => (
                        <div
                          key={style}
                          className="form-check form-check-inline"
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={editingPreferences.learningStyle.includes(
                              style
                            )}
                            onChange={() => toggleLearningStyle(style)}
                          />
                          <label className="form-check-label">{style}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Best Time for Sessions</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingPreferences.bestTime}
                      onChange={(e) =>
                        setEditingPreferences({
                          ...editingPreferences,
                          bestTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Preferred Session Length
                    </label>
                    <select
                      className="form-select"
                      value={editingPreferences.sessionLength}
                      onChange={(e) =>
                        setEditingPreferences({
                          ...editingPreferences,
                          sessionLength: e.target.value,
                        })
                      }
                    >
                      <option value="30-45 minutes">30-45 minutes</option>
                      <option value="45-60 minutes">45-60 minutes</option>
                      <option value="60-90 minutes">60-90 minutes</option>
                      <option value="90+ minutes">90+ minutes</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingPreferences.additionalNotes}
                      onChange={(e) =>
                        setEditingPreferences({
                          ...editingPreferences,
                          additionalNotes: e.target.value,
                        })
                      }
                      placeholder="Any specific preferences or requirements..."
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPreferencesModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={savePreferences}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetPasswordModal}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className={`form-control ${
                        passwordErrors.currentPassword ? "is-invalid" : ""
                      }`}
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        });
                        if (passwordErrors.currentPassword) {
                          setPasswordErrors({
                            ...passwordErrors,
                            currentPassword: "",
                          });
                        }
                      }}
                      placeholder="Enter your current password"
                    />
                    {passwordErrors.currentPassword && (
                      <div className="invalid-feedback">
                        {passwordErrors.currentPassword}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className={`form-control ${
                        passwordErrors.newPassword ? "is-invalid" : ""
                      }`}
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        });
                        if (passwordErrors.newPassword) {
                          setPasswordErrors({
                            ...passwordErrors,
                            newPassword: "",
                          });
                        }
                      }}
                      placeholder="Enter your new password"
                    />
                    {passwordErrors.newPassword && (
                      <div className="invalid-feedback">
                        {passwordErrors.newPassword}
                      </div>
                    )}
                    <div className="form-text">
                      Password must be at least 8 characters long
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className={`form-control ${
                        passwordErrors.confirmPassword ? "is-invalid" : ""
                      }`}
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        });
                        if (passwordErrors.confirmPassword) {
                          setPasswordErrors({
                            ...passwordErrors,
                            confirmPassword: "",
                          });
                        }
                      }}
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <div className="invalid-feedback">
                        {passwordErrors.confirmPassword}
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetPasswordModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePasswordChange}
                >
                  <i className="fas fa-save me-2"></i>
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfileManagement;
