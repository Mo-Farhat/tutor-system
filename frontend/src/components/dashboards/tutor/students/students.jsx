import React, { useEffect, useState } from "react";
import "../../../../css/dashboards/tutor/students/students.css";
import tutorService from "../../../../services/tutorService";

function TutorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    type: "lesson",
    subject: "",
    starRating: null,
    progressSummary: "",
    overview: "",
    keyAchievements: [""],
    skillsCovered: [""],
    areasToImprove: [""],
    nextTermGoals: [""],
    homeworkCompletion: "",
    engagement: "",
    attendanceNote: "",
    nextGoal: "",
    term: "",
    overallProgress: "",
  });
  const [reportId, setReportId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await tutorService.getMyStudents();
      if (res.success) {
        setStudents(res.data || []);
      } else {
        setError(res.error || "Failed to load students");
      }
    } catch (e) {
      setError(e.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportModal = (student, pair) => {
    setSelectedStudent({ ...student, pairId: pair.id, subject: pair.subject });
    setReportFormData({
      type: "lesson",
      subject: pair.subject || "",
      starRating: null,
      progressSummary: "",
      overview: "",
      keyAchievements: [""],
      skillsCovered: [""],
      areasToImprove: [""],
      nextTermGoals: [""],
      homeworkCompletion: "",
      engagement: "",
      attendanceNote: "",
      nextGoal: "",
      term: "",
      overallProgress: "",
    });
    setIsEditMode(false);
    setReportId(null);
    setReportError("");
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedStudent(null);
    setReportError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setReportFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddArrayItem = (field) => {
    setReportFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setReportFormData((prev) => {
      const newArray = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: newArray.length > 0 ? newArray : [""] };
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setReportError("");

    // Validation - All fields required
    if (!reportFormData.subject.trim()) {
      setReportError("Subject is required");
      return;
    }
    if (!reportFormData.term.trim()) {
      setReportError("Term is required");
      return;
    }
    if (!reportFormData.starRating) {
      setReportError("Star rating is required");
      return;
    }
    if (!reportFormData.progressSummary.trim()) {
      setReportError("Progress summary is required");
      return;
    }
    if (!reportFormData.overview.trim()) {
      setReportError("Overview is required");
      return;
    }
    if (reportFormData.keyAchievements.filter(item => item.trim()).length === 0) {
      setReportError("At least one key achievement is required");
      return;
    }
    if (reportFormData.skillsCovered.filter(item => item.trim()).length === 0) {
      setReportError("At least one skill covered is required");
      return;
    }
    if (reportFormData.areasToImprove.filter(item => item.trim()).length === 0) {
      setReportError("At least one area to improve is required");
      return;
    }
    if (reportFormData.nextTermGoals.filter(item => item.trim()).length === 0) {
      setReportError("At least one next term goal is required");
      return;
    }
    if (!reportFormData.homeworkCompletion.trim()) {
      setReportError("Homework completion is required");
      return;
    }
    if (!reportFormData.engagement.trim()) {
      setReportError("Engagement level is required");
      return;
    }
    if (!reportFormData.attendanceNote.trim()) {
      setReportError("Attendance note is required");
      return;
    }
    if (!reportFormData.nextGoal.trim()) {
      setReportError("Next goal is required");
      return;
    }
    if (!reportFormData.overallProgress.trim()) {
      setReportError("Overall progress is required");
      return;
    }

    try {
      setSubmitting(true);

      // Filter out empty strings from arrays
      const cleanedData = {
        studentId: selectedStudent.id,
        type: reportFormData.type,
        subject: reportFormData.subject.trim(),
        starRating: parseInt(reportFormData.starRating),
        progressSummary: reportFormData.progressSummary.trim(),
        overview: reportFormData.overview.trim(),
        keyAchievements: reportFormData.keyAchievements.filter((item) => item.trim()),
        skillsCovered: reportFormData.skillsCovered.filter((item) => item.trim()),
        areasToImprove: reportFormData.areasToImprove.filter((item) => item.trim()),
        nextTermGoals: reportFormData.nextTermGoals.filter((item) => item.trim()),
        homeworkCompletion: reportFormData.homeworkCompletion.trim(),
        engagement: reportFormData.engagement.trim(),
        attendanceNote: reportFormData.attendanceNote.trim(),
        nextGoal: reportFormData.nextGoal.trim(),
        term: reportFormData.term.trim(),
        overallProgress: reportFormData.overallProgress.trim(),
      };

      let result;
      if (isEditMode && reportId) {
        result = await tutorService.updateReport(reportId, cleanedData);
      } else {
        result = await tutorService.createReport(cleanedData);
      }

      if (result.success) {
        alert(`Report ${isEditMode ? "updated" : "created"} successfully!`);
        handleCloseReportModal();
      } else {
        setReportError(result.error || "Failed to submit report");
      }
    } catch (err) {
      setReportError(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenProfileModal = async (pair) => {
    setProfileError("");
    setShowProfileModal(true);
    setProfileLoading(true);

    try {
      const result = await tutorService.getStudentProfile(pair.id);
      if (result.success) {
        setSelectedStudentProfile(result.data);
      } else {
        setProfileError(result.error || "Failed to load student profile");
      }
    } catch (err) {
      setProfileError(err.message || "Failed to load student profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedStudentProfile(null);
    setProfileError("");
  };

  if (loading) {
    return (
      <div className="tutor-students-container container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="tutor-students-content text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 mb-0">Loading assigned students...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-students-container container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="tutor-students-content py-4">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
              <button
                className="btn btn-primary"
                onClick={loadStudents}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-students-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="tutor-students-content">
            <h3 className="tutor-students-section-title mb-4">
              Your Assigned Students
            </h3>
            {students.length === 0 ? (
              <div className="alert alert-info">No students assigned yet.</div>
            ) : (
              <div className="row g-4">
                {students.map((pair) => {
                  const s = pair.student || {};
                  const name =
                    [s.firstName, s.lastName].filter(Boolean).join(" ") ||
                    s.username ||
                    "Student";
                  return (
                    <div className="col-12 col-md-6" key={pair.id}>
                      <div className="tutor-students-card p-3">
                        <div className="d-flex align-items-center mb-3">
                          <div className="tutor-students-avatar me-3 flex-shrink-0">
                            <div
                              className="tutor-students-avatar-img placeholder rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: 64, height: 64 }}
                            >
                              <i className="fas fa-user"></i>
                            </div>
                          </div>
                          <div className="tutor-students-card-body flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
                              <div className="tutor-students-card-title">
                                {name}
                              </div>
                              <span
                                className={`badge bg-${pair.status === "active"
                                  ? "success"
                                  : pair.status === "paused"
                                    ? "warning"
                                    : "secondary"
                                  }`}
                              >
                                {pair.status}
                              </span>
                            </div>
                            <div className="tutor-students-card-degree mb-2">
                              {pair.subject || "General Tutoring"}
                            </div>
                            <div className="tutor-students-card-contact d-flex flex-wrap align-items-center gap-3">
                              {s.email && (
                                <span className="tutor-students-card-email">
                                  <i className="fas fa-envelope me-1"></i>{" "}
                                  {s.email}
                                </span>
                              )}
                              {s.username && (
                                <span className="tutor-students-card-phone">
                                  <i className="fas fa-user me-1"></i> @
                                  {s.username}
                                </span>
                              )}
                              {s.studentProfile?.phone_number && (
                                <span className="tutor-students-card-phone">
                                  <i className="fas fa-phone me-1"></i>
                                  {s.studentProfile.phone_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary flex-grow-1"
                            onClick={() => handleOpenProfileModal(pair)}
                          >
                            <i className="fas fa-user-circle me-1"></i>
                            View Profile & Goals
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleOpenReportModal(s, pair)}
                          >
                            <i className="fas fa-file-alt me-1"></i>
                            Create Report
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleCloseReportModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditMode ? "Edit" : "Create"} Progress Report for{" "}
                  {selectedStudent?.firstName} {selectedStudent?.lastName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseReportModal}
                ></button>
              </div>
              <form onSubmit={handleSubmitReport}>
                <div className="modal-body">
                  {reportError && (
                    <div className="alert alert-danger">{reportError}</div>
                  )}

                  {/* Report Type */}
                  <div className="mb-3">
                    <label className="form-label">
                      Report Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="type"
                      value={reportFormData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="lesson">Lesson Report</option>
                      <option value="termly">Termly Report</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="mb-3">
                    <label className="form-label">
                      Subject <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={reportFormData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Term */}
                  <div className="mb-3">
                    <label className="form-label">Term <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="term"
                      value={reportFormData.term}
                      onChange={handleInputChange}
                      placeholder="e.g., Term 1 2025"
                      required
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="mb-3">
                    <label className="form-label">Star Rating (1-5) <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      name="starRating"
                      value={reportFormData.starRating || ""}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>

                  {/* Progress Summary */}
                  <div className="mb-3">
                    <label className="form-label">Progress Summary <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      name="progressSummary"
                      value={reportFormData.progressSummary}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Summarize the student's progress..."
                      required
                    ></textarea>
                  </div>

                  {/* Overview */}
                  <div className="mb-3">
                    <label className="form-label">Overview <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      name="overview"
                      value={reportFormData.overview}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="General overview of the session/term..."
                      required
                    ></textarea>
                  </div>

                  {/* Key Achievements */}
                  <div className="mb-3">
                    <label className="form-label">Key Achievements <span className="text-danger">*</span></label>
                    {reportFormData.keyAchievements.map((achievement, index) => (
                      <div key={index} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={achievement}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "keyAchievements",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Achievement..."
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() =>
                            handleRemoveArrayItem("keyAchievements", index)
                          }
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleAddArrayItem("keyAchievements")}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Add Achievement
                    </button>
                  </div>

                  {/* Skills Covered */}
                  <div className="mb-3">
                    <label className="form-label">Skills Covered <span className="text-danger">*</span></label>
                    {reportFormData.skillsCovered.map((skill, index) => (
                      <div key={index} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={skill}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "skillsCovered",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Skill..."
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() =>
                            handleRemoveArrayItem("skillsCovered", index)
                          }
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleAddArrayItem("skillsCovered")}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Add Skill
                    </button>
                  </div>

                  {/* Areas to Improve */}
                  <div className="mb-3">
                    <label className="form-label">Areas to Improve <span className="text-danger">*</span></label>
                    {reportFormData.areasToImprove.map((area, index) => (
                      <div key={index} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={area}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "areasToImprove",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Area to improve..."
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() =>
                            handleRemoveArrayItem("areasToImprove", index)
                          }
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleAddArrayItem("areasToImprove")}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Add Area
                    </button>
                  </div>

                  {/* Next Term Goals */}
                  <div className="mb-3">
                    <label className="form-label">Next Term Goals <span className="text-danger">*</span></label>
                    {reportFormData.nextTermGoals.map((goal, index) => (
                      <div key={index} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={goal}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "nextTermGoals",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Goal..."
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() =>
                            handleRemoveArrayItem("nextTermGoals", index)
                          }
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleAddArrayItem("nextTermGoals")}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Add Goal
                    </button>
                  </div>

                  {/* Homework Completion */}
                  <div className="mb-3">
                    <label className="form-label">Homework Completion <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="homeworkCompletion"
                      value={reportFormData.homeworkCompletion}
                      onChange={handleInputChange}
                      placeholder="e.g., 90%, Excellent, Needs improvement"
                      required
                    />
                  </div>

                  {/* Engagement */}
                  <div className="mb-3">
                    <label className="form-label">Engagement Level <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="engagement"
                      value={reportFormData.engagement}
                      onChange={handleInputChange}
                      placeholder="e.g., High, Moderate, Low"
                      required
                    />
                  </div>

                  {/* Attendance Note */}
                  <div className="mb-3">
                    <label className="form-label">Attendance Note <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="attendanceNote"
                      value={reportFormData.attendanceNote}
                      onChange={handleInputChange}
                      placeholder="Any attendance-related notes..."
                      required
                    />
                  </div>

                  {/* Next Goal */}
                  <div className="mb-3">
                    <label className="form-label">Next Goal <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      name="nextGoal"
                      value={reportFormData.nextGoal}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="What should the student focus on next?"
                      required
                    ></textarea>
                  </div>

                  {/* Overall Progress */}
                  <div className="mb-3">
                    <label className="form-label">Overall Progress <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      name="overallProgress"
                      value={reportFormData.overallProgress}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Overall assessment of progress..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseReportModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Submitting...
                      </>
                    ) : (
                      <>{isEditMode ? "Update" : "Create"} Report</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showProfileModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleCloseProfileModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-circle me-2"></i>
                  Student Profile & Learning Goals
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseProfileModal}
                ></button>
              </div>
              <div className="modal-body">
                {profileLoading && (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading student profile...</p>
                  </div>
                )}

                {profileError && (
                  <div className="alert alert-danger">{profileError}</div>
                )}

                {!profileLoading && !profileError && selectedStudentProfile && (
                  <div>
                    {/* Student Info */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2 mb-3">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        Student Information
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted">Full Name</label>
                          <p className="mb-0">{selectedStudentProfile.firstName} {selectedStudentProfile.lastName}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted">Email</label>
                          <p className="mb-0">
                            <a href={`mailto:${selectedStudentProfile.email}`}>
                              {selectedStudentProfile.email}
                            </a>
                          </p>
                        </div>
                        {selectedStudentProfile.studentProfile?.phone_number && (
                          <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted">Phone Number</label>
                            <p className="mb-0">
                              <a href={`tel:${selectedStudentProfile.studentProfile.phone_number}`}>
                                {selectedStudentProfile.studentProfile.phone_number}
                              </a>
                            </p>
                          </div>
                        )}
                        {selectedStudentProfile.studentProfile?.current_school && (
                          <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted">Current School</label>
                            <p className="mb-0">{selectedStudentProfile.studentProfile.current_school}</p>
                          </div>
                        )}
                        {selectedStudentProfile.studentProfile?.year_level && (
                          <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted">Year Level</label>
                            <p className="mb-0">{selectedStudentProfile.studentProfile.year_level}</p>
                          </div>
                        )}
                        {selectedStudentProfile.studentProfile?.tier && (
                          <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted">Tier</label>
                            <p className="mb-0">
                              <span className="badge bg-secondary text-capitalize">
                                {selectedStudentProfile.studentProfile.tier}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Learning Goals */}
                    {selectedStudentProfile.studentProfile?.learning_goals && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2 mb-3">
                          <i className="fas fa-bullseye me-2 text-success"></i>
                          Learning Goals
                        </h6>
                        <div className="alert alert-light">
                          {selectedStudentProfile.studentProfile.learning_goals}
                        </div>
                      </div>
                    )}

                    {/* Student Goals (from StudentGoal table) */}
                    {selectedStudentProfile.goals && selectedStudentProfile.goals.length > 0 && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2 mb-3">
                          <i className="fas fa-tasks me-2 text-warning"></i>
                          Set Goals
                        </h6>
                        <div className="list-group">
                          {selectedStudentProfile.goals.map((goal) => (
                            <div key={goal.id} className="list-group-item">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">{goal.title} - {goal.subject}</h6>
                                {goal.targetDate && (
                                  <small className="text-muted">
                                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                                  </small>
                                )}
                              </div>
                              {goal.details && (
                                <p className="mb-0 small">{goal.details}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subjects Interested */}
                    {selectedStudentProfile.studentProfile?.subjects_interested &&
                      selectedStudentProfile.studentProfile.subjects_interested.length > 0 && (
                        <div className="mb-4">
                          <h6 className="border-bottom pb-2 mb-3">
                            <i className="fas fa-book me-2 text-info"></i>
                            Subjects of Interest
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {selectedStudentProfile.studentProfile.subjects_interested.map((subject, idx) => (
                              <span key={idx} className="badge bg-info">{subject}</span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Preferred Locations */}
                    {selectedStudentProfile.studentProfile?.preferred_locations &&
                      selectedStudentProfile.studentProfile.preferred_locations.length > 0 && (
                        <div className="mb-4">
                          <h6 className="border-bottom pb-2 mb-3">
                            <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                            Preferred Locations
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {selectedStudentProfile.studentProfile.preferred_locations.map((location, idx) => (
                              <span key={idx} className="badge bg-secondary">{location}</span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Bio */}
                    {selectedStudentProfile.studentProfile?.bio && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2 mb-3">
                          <i className="fas fa-align-left me-2 text-secondary"></i>
                          About
                        </h6>
                        <p className="mb-0">{selectedStudentProfile.studentProfile.bio}</p>
                      </div>
                    )}

                    {!selectedStudentProfile.studentProfile && (
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        This student hasn't completed their profile yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseProfileModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorStudents;
