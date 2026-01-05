import React, { useState, useEffect, useRef } from "react";
import studentService from "../../../../services/studentService";
import authService from "../../../../services/authService";
import { useSubjects } from "../../../../contexts/SubjectsContext";
import "../../../../css/dashboards/student/profile/profile.css";
import DetailsPanel from "./DetailsPanel";
import PreferencesPanel from "./PreferencesPanel";

function StudentProfileManagement() {
  const { subjects: availableSubjects } = useSubjects();
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // Student profile data
  const [studentData, setStudentData] = useState({
    fullName: "",
    email: "",
    grade: "",
    stream: "",
    joinedDate: "",
    status: "",
    avatar: "",
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
          // Debug: Log the raw data to see what we're getting
          console.log('Profile data:', p);
          console.log('User data:', p.user);
          
          // Properly concatenate first_name and last_name
          const firstName = p.user?.first_name || '';
          const lastName = p.user?.last_name || '';
          const concatenatedName = `${firstName} ${lastName}`.trim();
          
          console.log('First name:', firstName);
          console.log('Last name:', lastName);
          console.log('Concatenated name:', concatenatedName);
          
          setStudentData((prev) => ({
            ...prev,
            fullName: concatenatedName || p.fullName || p.name || "Student",
            email: p.user?.email || p.email || "",
            grade: p.grade || "",
            stream: p.stream || p.studyStream || "",
            status: p.status || "Active",
            joinedDate: p.user?.created_at || p.joinedDate || "",
            avatar: p.photo_url

          }));
          setDetailsData({
            fullName: concatenatedName || p.fullName || p.name || "Student",
            email: p.user?.email || p.email || "",
            phoneNumber: p.phone_number || p.phone || p.phoneNumber || "",
            subjects: p.subjects || [],
            studentId: p.studentId || p.id || "",
            grade: p.grade || p.year_level || "",
            stream: p.stream || p.studyStream || "",
            dateOfBirth: p.dateOfBirth || "",
            address: p.address || "",
            totalLessons: p.totalLessons || 0,
            attendance: p.attendanceRate || "",
            bio: p.bio || "",
            currentSchool: p.current_school || "",
            yearLevel: p.year_level || p.grade || "",
            subjectsInterested: p.subjects_interested || [],
            preferredLocations: p.preferred_locations || [],
            learningGoals: p.learning_goals || "",
          });

          // Load preferences from profile if present
          setLearningPreferences({
            learningStyle: Array.isArray(p.learning_style)
              ? p.learning_style
              : p.learningPreferences?.learningStyle || [],
            bestTime: p.best_time || p.learningPreferences?.bestTime || "",
            sessionLength:
              p.session_length || p.learningPreferences?.sessionLength || "",
            additionalNotes:
              p.additional_notes || p.learningPreferences?.additionalNotes || "",
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
        learning_style: editingPreferences.learningStyle,
        best_time: editingPreferences.bestTime,
        session_length: editingPreferences.sessionLength,
        additional_notes: editingPreferences.additionalNotes,
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

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB.");
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", file);

      const result = await studentService.uploadStudentPhoto(formData);

      if (result.success) {
        setStudentData((prev) => ({
          ...prev,
          avatar: result.photoUrl,
        }));
        // Notify other components (like navbar) that profile has changed
        window.dispatchEvent(new Event('student-profile-updated'));
        alert("Profile photo updated successfully!");
      } else {
        alert(result.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("An error occurred while uploading photo");
    } finally {
      setUploadingPhoto(false);
    }
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
        // Notify other components (like navbar) that profile has changed
        window.dispatchEvent(new Event('student-profile-updated'));
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

  // Delete a goal
  const handleDeleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        const response = await studentService.deleteGoal(goalId);
        if (response.success) {
          setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));
        } else {
          console.error("Failed to delete goal:", response.error);
          alert("Failed to delete goal. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting goal:", error);
        alert("An error occurred while deleting the goal.");
      }
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
                  <div className="student-profile-avatar-container position-relative">
                    <div className="student-profile-avatar">
                      <img src={studentData.avatar} alt={studentData.fullName} />
                      {uploadingPhoto && (
                        <div className="student-profile-avatar-overlay">
                          <div className="spinner-border spinner-border-sm text-light"></div>
                        </div>
                      )}
                    </div>
                    <button 
                      className="btn btn-sm btn-primary student-profile-avatar-edit-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                    >
                      <i className="fas fa-camera"></i>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="student-profile-header-info">
                    {/* Debug: Log what we're actually displaying */}
                    {console.log('Rendering fullName:', studentData.fullName)}
                    <h4 className="student-profile-name">
                      {studentData.fullName || 'Student'}
                    </h4>
                    <p className="student-profile-details">
                      {studentData.grade && studentData.stream ? (
                        `${studentData.grade} • ${studentData.stream}`
                      ) : (
                        studentData.grade || studentData.stream || ''
                      )}
                    </p>
                    <div className="student-profile-badges">
                      {studentData.status && (
                        <span className="badge student-profile-status-badge">
                          {studentData.status}
                        </span>
                      )}
                      {studentData.joinedDate && (
                        <span className="student-profile-joined">
                          <i className="fas fa-clock me-1"></i>
                          Joined {new Date(studentData.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
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

        {/* Quick Stats Row */}
        <div className="row">
          {/* Left Column: Personal & Academic Info */}
          <div className="col-lg-8">
            {/* Personal Information */}
            <div className="student-profile-section">
              <div className="student-profile-card">
                <div className="student-profile-card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="student-profile-card-title mb-0">
                      <i className="fas fa-user me-2"></i>Personal Information
                    </h3>
                    <button 
                      className="btn btn-sm btn-link text-primary"
                      onClick={() => {
                        setEditingSection('personal');
                        setEditData({
                          phone_number: detailsData.phoneNumber,
                          bio: detailsData.bio
                        });
                      }}
                    >
                      <i className="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>

                  {editingSection === 'personal' ? (
                    <div className="student-profile-edit-form">
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
                          placeholder="Tell us about yourself..."
                        ></textarea>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveSectionChanges('personal')}
                          disabled={savingSection === 'personal'}
                        >
                          {savingSection === 'personal' ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEditing}
                          disabled={savingSection === 'personal'}
                        >
                          Cancel
                        </button>
                      </div>
                      {sectionError && <div className="text-danger mt-2 small">{sectionError}</div>}
                    </div>
                  ) : (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Phone Number</label>
                        <p className="mb-0">{detailsData.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div className="col-12">
                        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Bio</label>
                        <p className="mb-0">{detailsData.bio || 'Tell us a bit about yourself...'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="student-profile-section">
              <div className="student-profile-card">
                <div className="student-profile-card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="student-profile-card-title mb-0">
                      <i className="fas fa-graduation-cap me-2"></i>Academic Information
                    </h3>
                    <button 
                      className="btn btn-sm btn-link text-primary"
                      onClick={() => {
                        setEditingSection('academic');
                        setEditData({
                          current_school: detailsData.currentSchool,
                          year_level: detailsData.yearLevel,
                          subjects_interested: detailsData.subjectsInterested
                        });
                      }}
                    >
                      <i className="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>

                  {editingSection === 'academic' ? (
                    <div className="student-profile-edit-form">
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
                            <option value="">Select Year</option>
                            {[7, 8, 9, 10, 11, 12].map(y => (
                              <option key={y} value={`Year ${y}`}>Year {y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Subjects Interested</label>
                        <div className="d-flex flex-wrap gap-2">
                          {(availableSubjects?.flat || []).map((subject) => (
                            <div key={subject.id} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`subject-${subject.id}`}
                                checked={editData.subjects_interested?.includes(subject.name)}
                                onChange={(e) => {
                                  const current = editData.subjects_interested || [];
                                  const updated = e.target.checked
                                    ? [...current, subject.name]
                                    : current.filter(s => s !== subject.name);
                                  setEditData({ ...editData, subjects_interested: updated });
                                }}
                              />
                              <label className="form-check-label small" htmlFor={`subject-${subject.id}`}>
                                {subject.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveSectionChanges('academic')}
                          disabled={savingSection === 'academic'}
                        >
                          {savingSection === 'academic' ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEditing}
                          disabled={savingSection === 'academic'}
                        >
                          Cancel
                        </button>
                      </div>
                      {sectionError && <div className="text-danger mt-2 small">{sectionError}</div>}
                    </div>
                  ) : (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Current School</label>
                        <p className="mb-0">{detailsData.currentSchool || 'Not provided'}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Year Level</label>
                        <p className="mb-0">{detailsData.yearLevel || 'Not provided'}</p>
                      </div>
                      <div className="col-12">
                        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Subjects Interested</label>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {detailsData.subjectsInterested?.length > 0 ? (
                            detailsData.subjectsInterested.map((s, idx) => (
                              <span key={idx} className="badge bg-light text-dark border">{s}</span>
                            ))
                          ) : (
                            <span className="text-muted">No subjects selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="student-profile-section">
              <div className="student-profile-card">
                <div className="student-profile-card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="student-profile-card-title mb-0">
                      <i className="fas fa-brain me-2"></i>Learning Preferences
                    </h3>
                    <button 
                      className="btn btn-sm btn-link text-primary"
                      onClick={() => {
                        setEditingPreferences({ ...learningPreferences });
                        setShowPreferencesModal(true);
                      }}
                    >
                      <i className="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>

                  <div className="row g-4">
                    <div className="col-12">
                      <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Learning Styles</label>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {learningPreferences.learningStyle?.length > 0 ? (
                          learningPreferences.learningStyle.map((s, idx) => (
                            <span key={idx} className="badge bg-primary-subtle text-primary border-primary-subtle">{s}</span>
                          ))
                        ) : (
                          <span className="text-muted">No styles selected</span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Best Time for Sessions</label>
                      <p className="mb-0">{learningPreferences.bestTime || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Preferred Session Length</label>
                      <p className="mb-0">{learningPreferences.sessionLength || 'Not provided'}</p>
                    </div>
                    <div className="col-12">
                      <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Additional Notes</label>
                      <p className="mb-0">{learningPreferences.additionalNotes || 'No additional notes'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: SMART Goals */}
          <div className="col-lg-4">
            <div className="student-profile-section">
              <div className="student-profile-card">
                <div className="student-profile-card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="student-profile-card-title mb-0">
                      <i className="fas fa-bullseye me-2"></i>SMART Goals
                    </h3>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setEditingGoal({ id: null, subject: "", title: "", details: "", targetDate: "" });
                        setShowGoalModal(true);
                      }}
                    >
                      <i className="fas fa-plus me-1"></i>Add
                    </button>
                  </div>

                  <div className="student-profile-goals-list">
                    {goalsLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary"></div>
                      </div>
                    ) : goals.length > 0 ? (
                      goals.map((goal) => (
                        <div key={goal.id} className="student-profile-goal-item p-3 mb-3 border rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-info-subtle text-info small">{goal.subject}</span>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-link text-muted p-0" data-bs-toggle="dropdown">
                                <i className="fas fa-ellipsis-v"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                  <button 
                                    className="dropdown-item" 
                                    onClick={() => {
                                      setEditingGoal(goal);
                                      setShowGoalModal(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger" 
                                    onClick={() => handleDeleteGoal(goal.id)}
                                  >
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <h5 className="h6 mb-1">{goal.title}</h5>
                          <p className="small text-muted mb-2">{goal.details}</p>
                          <div className="d-flex align-items-center text-muted small">
                            <i className="fas fa-calendar-check me-1"></i>
                            Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="fas fa-tasks d-block mb-2 fs-4"></i>
                        <p className="small mb-0">No goals set yet. Start by adding one!</p>
                      </div>
                    )}
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
