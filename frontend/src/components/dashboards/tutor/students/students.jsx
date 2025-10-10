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

    // Validation
    if (!reportFormData.subject.trim()) {
      setReportError("Subject is required");
      return;
    }

    try {
      setSubmitting(true);

      // Filter out empty strings from arrays
      const cleanedData = {
        studentId: selectedStudent.id,
        type: reportFormData.type,
        subject: reportFormData.subject.trim(),
        starRating: reportFormData.starRating ? parseInt(reportFormData.starRating) : null,
        progressSummary: reportFormData.progressSummary.trim() || null,
        overview: reportFormData.overview.trim() || null,
        keyAchievements: reportFormData.keyAchievements.filter((item) => item.trim()),
        skillsCovered: reportFormData.skillsCovered.filter((item) => item.trim()),
        areasToImprove: reportFormData.areasToImprove.filter((item) => item.trim()),
        nextTermGoals: reportFormData.nextTermGoals.filter((item) => item.trim()),
        homeworkCompletion: reportFormData.homeworkCompletion.trim() || null,
        engagement: reportFormData.engagement.trim() || null,
        attendanceNote: reportFormData.attendanceNote.trim() || null,
        nextGoal: reportFormData.nextGoal.trim() || null,
        term: reportFormData.term.trim() || null,
        overallProgress: reportFormData.overallProgress.trim() || null,
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
                                className={`badge bg-${
                                  pair.status === "active"
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
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary flex-grow-1"
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
                    <label className="form-label">Term</label>
                    <input
                      type="text"
                      className="form-control"
                      name="term"
                      value={reportFormData.term}
                      onChange={handleInputChange}
                      placeholder="e.g., Term 1 2025"
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="mb-3">
                    <label className="form-label">Star Rating (1-5)</label>
                    <select
                      className="form-select"
                      name="starRating"
                      value={reportFormData.starRating || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">No rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>

                  {/* Progress Summary */}
                  <div className="mb-3">
                    <label className="form-label">Progress Summary</label>
                    <textarea
                      className="form-control"
                      name="progressSummary"
                      value={reportFormData.progressSummary}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Summarize the student's progress..."
                    ></textarea>
                  </div>

                  {/* Overview */}
                  <div className="mb-3">
                    <label className="form-label">Overview</label>
                    <textarea
                      className="form-control"
                      name="overview"
                      value={reportFormData.overview}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="General overview of the session/term..."
                    ></textarea>
                  </div>

                  {/* Key Achievements */}
                  <div className="mb-3">
                    <label className="form-label">Key Achievements</label>
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
                    <label className="form-label">Skills Covered</label>
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
                    <label className="form-label">Areas to Improve</label>
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
                    <label className="form-label">Next Term Goals</label>
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
                    <label className="form-label">Homework Completion</label>
                    <input
                      type="text"
                      className="form-control"
                      name="homeworkCompletion"
                      value={reportFormData.homeworkCompletion}
                      onChange={handleInputChange}
                      placeholder="e.g., 90%, Excellent, Needs improvement"
                    />
                  </div>

                  {/* Engagement */}
                  <div className="mb-3">
                    <label className="form-label">Engagement Level</label>
                    <input
                      type="text"
                      className="form-control"
                      name="engagement"
                      value={reportFormData.engagement}
                      onChange={handleInputChange}
                      placeholder="e.g., High, Moderate, Low"
                    />
                  </div>

                  {/* Attendance Note */}
                  <div className="mb-3">
                    <label className="form-label">Attendance Note</label>
                    <input
                      type="text"
                      className="form-control"
                      name="attendanceNote"
                      value={reportFormData.attendanceNote}
                      onChange={handleInputChange}
                      placeholder="Any attendance-related notes..."
                    />
                  </div>

                  {/* Next Goal */}
                  <div className="mb-3">
                    <label className="form-label">Next Goal</label>
                    <textarea
                      className="form-control"
                      name="nextGoal"
                      value={reportFormData.nextGoal}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="What should the student focus on next?"
                    ></textarea>
                  </div>

                  {/* Overall Progress */}
                  <div className="mb-3">
                    <label className="form-label">Overall Progress</label>
                    <textarea
                      className="form-control"
                      name="overallProgress"
                      value={reportFormData.overallProgress}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Overall assessment of progress..."
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
    </div>
  );
}

export default TutorStudents;
