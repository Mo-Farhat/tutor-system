import React, { useState, useEffect } from "react";
import studentService from "../../../../services/studentService";
import authService from "../../../../services/authService";
import "../../../../css/dashboards/student/profile/profile.css";
import DetailsPanel from "./DetailsPanel";
import PreferencesPanel from "./PreferencesPanel";

function StudentProfileManagement() {
  // Student profile data
  const [studentData, setStudentData] = useState({
    fullName: "",
    email: "",
    grade: "",
    stream: "",
    joinedDate: "",
    status: "",
    avatar: "/public/Images/logo/logo1.png",
  });

  // Enriched details data compatible with DetailsPanel
  const [detailsData, setDetailsData] = useState({});

  const [studentBadges, setStudentBadges] = useState([]);

  const [previousReports, setPreviousReports] = useState([]);

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Learning preferences
  const [learningPreferences, setLearningPreferences] = useState({
    learningStyle: [],
    bestTime: "",
    sessionLength: "",
    additionalNotes: "",
  });

  // SMART Goals (API-backed)
  const [goals, setGoals] = useState([]); // flat array: {id, subject, title, details, targetDate}
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState(null);

  // Inline editing states
  const [editingSection, setEditingSection] = useState(null); // 'personal', 'academic', 'subjects'
  const [editData, setEditData] = useState({});
  const [savingSection, setSavingSection] = useState(null);
  const [sectionError, setSectionError] = useState("");

  // Current subjects
  const [currentSubjects, setCurrentSubjects] = useState([]);

  // Available learning styles
  const learningStyleOptions = [
    "Visual",
    "Auditory",
    "Kinesthetic",
    "Interactive",
    "Reading/Writing",
  ];

  // Modal states
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
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load goals from API
  useEffect(() => {
    const loadAll = async () => {
      try {
        setGoalsLoading(true);
        setGoalsError(null);

        const [profileRes, goalsRes, achievementsRes, reportsRes] =
          await Promise.all([
            studentService.getMyProfile(),
            studentService.getGoals(),
            studentService.getAchievements(),
            studentService.getReports(),
          ]);

        if (profileRes?.success && profileRes.data) {
          const p = profileRes.data;
          setStudentData((prev) => ({
            ...prev,
            fullName: p.fullName || p.name || "",
            email: p.email || "",
            grade: p.grade || "",
            stream: p.stream || p.studyStream || "",
            joinedDate: p.joinedDate || p.createdAt || "",
            status: p.status || "",
            avatar: p.avatarUrl || prev.avatar,
          }));
          setDetailsData({
            fullName: p.fullName || p.name || "",
            email: p.email || "",
            phoneNumber: p.phone || p.phoneNumber || "",
            subjects: p.subjects || [],
            studentId: p.studentId || p.id || "",
            grade: p.grade || "",
            stream: p.stream || p.studyStream || "",
            dateOfBirth: p.dateOfBirth || "",
            address: p.address || "",
            totalLessons: p.totalLessons || 0,
            attendance: p.attendanceRate || "",
          });

          // Load preferences from profile if present
          setLearningPreferences({
            learningStyle: Array.isArray(p.learningStyle)
              ? p.learningStyle
              : p.learningPreferences?.learningStyle || [],
            bestTime: p.bestTime || p.learningPreferences?.bestTime || "",
            sessionLength:
              p.sessionLength || p.learningPreferences?.sessionLength || "",
            additionalNotes:
              p.additionalNotes || p.learningPreferences?.additionalNotes || "",
          });
        }

        if (goalsRes?.success && Array.isArray(goalsRes.data)) {
          setGoals(goalsRes.data);
        } else {
          setGoals([]);
        }

        if (achievementsRes?.success && Array.isArray(achievementsRes.data)) {
          setStudentBadges(achievementsRes.data);
        } else {
          setStudentBadges([]);
        }

        if (reportsRes?.success && Array.isArray(reportsRes.data)) {
          setPreviousReports(reportsRes.data);
        } else {
          setPreviousReports([]);
        }
      } catch (e) {
        setGoalsError("Failed to load data");
      } finally {
        setGoalsLoading(false);
      }
    };
    loadAll();
  }, []);

  // Load current subjects from lessons
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const [upcoming, completed] = await Promise.all([
          studentService.getUpcomingLessons(),
          studentService.getCompletedLessons(),
        ]);
        const lessons = [];
        if (upcoming?.success && Array.isArray(upcoming.data))
          lessons.push(...upcoming.data);
        if (completed?.success && Array.isArray(completed.data))
          lessons.push(...completed.data);
        const subjectMap = new Map();
        lessons.forEach((l) => {
          const name = l.subject || l.course || l.topic;
          if (!name) return;
          if (!subjectMap.has(name)) {
            subjectMap.set(name, {
              name,
              icon: "📘",
              status: (l.status || "Active").toString(),
            });
          }
        });
        setCurrentSubjects(Array.from(subjectMap.values()));
      } catch (e) {
        setCurrentSubjects([]);
      }
    };
    loadSubjects();
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
  const savePreferences = async () => {
    try {
      const payload = {
        learningStyle: editingPreferences.learningStyle,
        bestTime: editingPreferences.bestTime,
        sessionLength: editingPreferences.sessionLength,
        additionalNotes: editingPreferences.additionalNotes,
      };
      const res = await studentService.updateMyProfile(payload);
      if (res?.success) {
        setLearningPreferences(editingPreferences);
        setShowPreferencesModal(false);
      } else {
        alert(res?.error || "Failed to save preferences");
      }
    } catch (e) {
      alert("Failed to save preferences");
    }
  };

  // Handle learning style toggle
  const toggleLearningStyle = (style) => {
    const newStyles = editingPreferences.learningStyle.includes(style)
      ? editingPreferences.learningStyle.filter((s) => s !== style)
      : [...editingPreferences.learningStyle, style];
    setEditingPreferences({ ...editingPreferences, learningStyle: newStyles });
  };

  // Handle password change
  const handlePasswordChange = async () => {
    const errors = {};

    // Trim whitespace from passwords to avoid issues with copy/paste
    const currentPassword = passwordData.currentPassword.trim();
    const newPassword = passwordData.newPassword.trim();
    const confirmPassword = passwordData.confirmPassword.trim();

    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordErrors({});

      const result = await authService.changeStudentPassword(
        currentPassword,
        newPassword
      );

      if (result.success) {
        alert("Password updated successfully!");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({});
      } else {
        setPasswordErrors({
          general: result.error || "Failed to update password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordErrors({
        general: "An error occurred while changing password",
      });
    } finally {
      setPasswordLoading(false);
    }
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

  // Start editing a section
  const startEditingSection = (section) => {
    setSectionError("");
    if (section === 'personal') {
      setEditData({
        phone_number: detailsData.phoneNumber || "",
        bio: detailsData.bio || "",
      });
    } else if (section === 'academic') {
      setEditData({
        current_school: detailsData.currentSchool || "",
        year_level: detailsData.yearLevel || "",
        subjects_interested: detailsData.subjectsInterested || [],
        preferred_locations: detailsData.preferredLocations || [],
        learning_goals: detailsData.learningGoals || "",
      });
    }
    setEditingSection(section);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSection(null);
    setEditData({});
    setSectionError("");
  };

  // Save section changes
  const saveSectionChanges = async (section) => {
    try {
      setSavingSection(section);
      setSectionError("");

      // Validate bio if provided (must be at least 10 characters for validation middleware)
      if (editData.bio && editData.bio.trim() && editData.bio.trim().length < 10) {
        setSectionError("Bio must be at least 10 characters long (or leave empty)");
        return;
      }

      // Remove bio from payload if it's empty to avoid validation error
      const payload = { ...editData };
      if (!payload.bio || !payload.bio.trim()) {
        delete payload.bio;
      }

      const result = await studentService.updateMyProfile(payload);

      if (result.success) {
        // Update local state
        setDetailsData(prev => ({
          ...prev,
          phoneNumber: editData.phone_number || prev.phoneNumber,
          bio: editData.bio || prev.bio,
          currentSchool: editData.current_school || prev.currentSchool,
          yearLevel: editData.year_level || prev.yearLevel,
          subjectsInterested: editData.subjects_interested || prev.subjectsInterested,
          preferredLocations: editData.preferred_locations || prev.preferredLocations,
          learningGoals: editData.learning_goals || prev.learningGoals,
        }));

        if (editData.year_level) {
          setStudentData(prev => ({
            ...prev,
            grade: editData.year_level,
          }));
        }

        setEditingSection(null);
        setEditData({});
        alert("Profile updated successfully!");
      } else {
        setSectionError(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSectionError("An error occurred while updating profile");
    } finally {
      setSavingSection(null);
    }
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

        <div className="row">
          {/* SMART Goals Section and Details combined layout */}
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

            {/* Personal Information Section */}
            <div className="student-profile-section mt-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="student-profile-card-title mb-0">
                      <i className="fas fa-user me-2"></i>
                      Personal Information
                    </h6>
                    {editingSection !== 'personal' && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => startEditingSection('personal')}
                      >
                        <i className="fas fa-edit me-1"></i>
                        Edit
                      </button>
                    )}
                  </div>

                  {sectionError && editingSection === 'personal' && (
                    <div className="alert alert-danger alert-sm">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {sectionError}
                    </div>
                  )}

                  {editingSection === 'personal' ? (
                    <div>
                      <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={editData.phone_number || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, phone_number: e.target.value })
                          }
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Bio</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editData.bio || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, bio: e.target.value })
                          }
                          placeholder="Tell us about yourself... (minimum 10 characters or leave empty)"
                        ></textarea>
                        <div className="form-text">
                          {editData.bio ? `${editData.bio.length} characters` : '0 characters'} (minimum 10 required if provided)
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveSectionChanges('personal')}
                          disabled={savingSection === 'personal'}
                        >
                          {savingSection === 'personal' ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-1"></i>
                              Save
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEditing}
                          disabled={savingSection === 'personal'}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small">Phone Number</label>
                          <div>{detailsData.phoneNumber || 'Not provided'}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-0">
                          <label className="form-label text-muted small">Bio</label>
                          <div>{detailsData.bio || 'Not provided'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="student-profile-section mt-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="student-profile-card-title mb-0">
                      <i className="fas fa-graduation-cap me-2"></i>
                      Academic Information
                    </h6>
                    {editingSection !== 'academic' && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => startEditingSection('academic')}
                      >
                        <i className="fas fa-edit me-1"></i>
                        Edit
                      </button>
                    )}
                  </div>

                  {sectionError && editingSection === 'academic' && (
                    <div className="alert alert-danger alert-sm">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {sectionError}
                    </div>
                  )}

                  {editingSection === 'academic' ? (
                    <div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Current School</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editData.current_school || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, current_school: e.target.value })
                            }
                            placeholder="Enter your school name"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Year Level</label>
                          <select
                            className="form-select"
                            value={editData.year_level || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, year_level: e.target.value })
                            }
                          >
                            <option value="">Select year level</option>
                            <option value="Year 7">Year 7</option>
                            <option value="Year 8">Year 8</option>
                            <option value="Year 9">Year 9</option>
                            <option value="Year 10">Year 10</option>
                            <option value="Year 11">Year 11</option>
                            <option value="Year 12">Year 12</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Subjects Interested</label>
                        <input
                          type="text"
                          className="form-control"
                          value={Array.isArray(editData.subjects_interested) 
                            ? editData.subjects_interested.join(", ") 
                            : ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              subjects_interested: e.target.value
                                .split(",")
                                .map(s => s.trim())
                                .filter(s => s),
                            })
                          }
                          placeholder="Enter subjects separated by commas (e.g., Math, Science, English)"
                        />
                        <div className="form-text">Separate multiple subjects with commas</div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Preferred Locations</label>
                        <input
                          type="text"
                          className="form-control"
                          value={Array.isArray(editData.preferred_locations)
                            ? editData.preferred_locations.join(", ")
                            : ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              preferred_locations: e.target.value
                                .split(",")
                                .map(s => s.trim())
                                .filter(s => s),
                            })
                          }
                          placeholder="Enter locations separated by commas (e.g., Online, Sydney CBD)"
                        />
                        <div className="form-text">Separate multiple locations with commas</div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Learning Goals</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editData.learning_goals || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, learning_goals: e.target.value })
                          }
                          placeholder="What do you want to achieve through tutoring?"
                        ></textarea>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveSectionChanges('academic')}
                          disabled={savingSection === 'academic'}
                        >
                          {savingSection === 'academic' ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-1"></i>
                              Save
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEditing}
                          disabled={savingSection === 'academic'}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small">Current School</label>
                          <div>{detailsData.currentSchool || 'Not provided'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small">Year Level</label>
                          <div>{detailsData.yearLevel || 'Not provided'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small">Subjects Interested</label>
                          <div>
                            {Array.isArray(detailsData.subjectsInterested) && detailsData.subjectsInterested.length > 0
                              ? detailsData.subjectsInterested.map(subject => (
                                  <span key={subject} className="badge bg-primary me-1 mb-1">{subject}</span>
                                ))
                              : 'Not provided'}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small">Preferred Locations</label>
                          <div>
                            {Array.isArray(detailsData.preferredLocations) && detailsData.preferredLocations.length > 0
                              ? detailsData.preferredLocations.map(location => (
                                  <span key={location} className="badge bg-info me-1 mb-1">{location}</span>
                                ))
                              : 'Not provided'}
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-0">
                          <label className="form-label text-muted small">Learning Goals</label>
                          <div>{detailsData.learningGoals || 'Not provided'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details panel below (achievements and reports) */}
            <DetailsPanel
              studentData={detailsData}
              studentBadges={studentBadges}
              previousReports={previousReports}
            />
          </div>

          {/* Sidebar */}
          <div className="col-lg-4 col-md-12">
            <PreferencesPanel
              learningPreferences={learningPreferences}
              onEdit={() => {
                setEditingPreferences({ ...learningPreferences });
                setShowPreferencesModal(true);
              }}
            />

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
                {passwordErrors.general && (
                  <div className="alert alert-danger">
                    {passwordErrors.general}
                  </div>
                )}
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
                      disabled={passwordLoading}
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
                        const newValue = e.target.value;
                        setPasswordData({
                          ...passwordData,
                          newPassword: newValue,
                        });

                        // Clear errors when user starts typing
                        const newErrors = { ...passwordErrors };
                        if (passwordErrors.newPassword) {
                          delete newErrors.newPassword;
                        }

                        // Check confirm password match if it exists
                        if (
                          passwordData.confirmPassword &&
                          newValue !== passwordData.confirmPassword
                        ) {
                          newErrors.confirmPassword = "Passwords do not match";
                        } else if (
                          passwordData.confirmPassword &&
                          newValue === passwordData.confirmPassword
                        ) {
                          delete newErrors.confirmPassword;
                        }

                        setPasswordErrors(newErrors);
                      }}
                      placeholder="Enter your new password"
                      disabled={passwordLoading}
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
                        passwordErrors.confirmPassword
                          ? "is-invalid"
                          : passwordData.newPassword &&
                            passwordData.confirmPassword &&
                            passwordData.newPassword ===
                              passwordData.confirmPassword
                          ? "is-valid"
                          : ""
                      }`}
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        const confirmValue = e.target.value;
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: confirmValue,
                        });

                        // Real-time password match validation
                        const newErrors = { ...passwordErrors };
                        if (
                          passwordData.newPassword &&
                          confirmValue !== passwordData.newPassword
                        ) {
                          newErrors.confirmPassword = "Passwords do not match";
                        } else {
                          delete newErrors.confirmPassword;
                        }

                        setPasswordErrors(newErrors);
                      }}
                      placeholder="Confirm your new password"
                      disabled={passwordLoading}
                    />
                    {passwordErrors.confirmPassword && (
                      <div className="invalid-feedback">
                        {passwordErrors.confirmPassword}
                      </div>
                    )}
                    {!passwordErrors.confirmPassword &&
                      passwordData.newPassword &&
                      passwordData.confirmPassword &&
                      passwordData.newPassword ===
                        passwordData.confirmPassword && (
                        <div className="valid-feedback">✓ Passwords match</div>
                      )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetPasswordModal}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Update Password
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
}

export default StudentProfileManagement;
