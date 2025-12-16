/**
 * SubjectSelector - Multi-subject selector with year level and curriculum cascading
 * Used in tutor application form for selecting subjects to tutor
 */
import React, { useState } from "react";
import { useSubjects } from "../../contexts/SubjectsContext";

function SubjectSelector({ selectedSubjects = [], onChange, error }) {
  const {
    subjects,
    isLoading,
    error: loadError,
    getSubjectsFor,
    getCurriculaFor,
    getYearLevels,
  } = useSubjects();

  const [currentSelection, setCurrentSelection] = useState({
    yearLevel: "",
    curriculum: "",
    subject: "",
  });

  // Get available options based on current selection
  const yearLevels = getYearLevels();
  const curricula = currentSelection.yearLevel
    ? getCurriculaFor(currentSelection.yearLevel)
    : [];
  const availableSubjects =
    currentSelection.yearLevel && currentSelection.curriculum
      ? getSubjectsFor(currentSelection.curriculum, currentSelection.yearLevel)
      : [];

  // Handle year level change
  const handleYearLevelChange = (e) => {
    setCurrentSelection({
      yearLevel: e.target.value,
      curriculum: "",
      subject: "",
    });
  };

  // Handle curriculum change
  const handleCurriculumChange = (e) => {
    setCurrentSelection((prev) => ({
      ...prev,
      curriculum: e.target.value,
      subject: "",
    }));
  };

  // Handle subject change
  const handleSubjectChange = (e) => {
    setCurrentSelection((prev) => ({
      ...prev,
      subject: e.target.value,
    }));
  };

  // Add selected subject
  const handleAddSubject = () => {
    if (
      !currentSelection.yearLevel ||
      !currentSelection.curriculum ||
      !currentSelection.subject
    ) {
      return;
    }

    // Create unique key for the subject
    const subjectKey = `${currentSelection.subject}|${currentSelection.curriculum}|${currentSelection.yearLevel}`;

    // Check if already added
    if (selectedSubjects.some((s) => s.key === subjectKey)) {
      alert("This subject is already added");
      return;
    }

    const newSubject = {
      key: subjectKey,
      name: currentSelection.subject,
      curriculum: currentSelection.curriculum,
      yearLevel: currentSelection.yearLevel,
      display: `${currentSelection.subject} (${currentSelection.curriculum}, ${currentSelection.yearLevel})`,
    };

    onChange([...selectedSubjects, newSubject]);

    // Reset selection for easy adding of more subjects
    setCurrentSelection((prev) => ({
      ...prev,
      subject: "",
    }));
  };

  // Remove a subject
  const handleRemoveSubject = (subjectKey) => {
    onChange(selectedSubjects.filter((s) => s.key !== subjectKey));
  };

  if (isLoading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading subjects...</span>
        </div>
        <span className="ms-2">Loading subjects...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="alert alert-warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Could not load subjects. Please try again later.
      </div>
    );
  }

  return (
    <div className="subject-selector">
      {/* Selected Subjects */}
      {selectedSubjects.length > 0 && (
        <div className="selected-subjects mb-3">
          <label className="form-label fw-bold">Selected Subjects:</label>
          <div className="d-flex flex-wrap gap-2">
            {selectedSubjects.map((subject) => (
              <span
                key={subject.key}
                className="badge bg-primary d-flex align-items-center gap-1"
                style={{ fontSize: "0.85rem", padding: "0.5em 0.8em" }}
              >
                {subject.display}
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: "0.6rem" }}
                  onClick={() => handleRemoveSubject(subject.key)}
                  aria-label="Remove"
                ></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Subject Form */}
      <div className="add-subject-form">
        <div className="row g-2 mb-2">
          <div className="col-md-4">
            <label className="form-label">Year Level</label>
            <select
              className="form-select"
              value={currentSelection.yearLevel}
              onChange={handleYearLevelChange}
            >
              <option value="">Select Year Level</option>
              {yearLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              {currentSelection.yearLevel === "Year 1-10" ? "State" : "Curriculum"}
            </label>
            <select
              className="form-select"
              value={currentSelection.curriculum}
              onChange={handleCurriculumChange}
              disabled={!currentSelection.yearLevel}
            >
              <option value="">
                Select {currentSelection.yearLevel === "Year 1-10" ? "State" : "Curriculum"}
              </option>
              {curricula.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={currentSelection.subject}
              onChange={handleSubjectChange}
              disabled={!currentSelection.curriculum}
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={handleAddSubject}
          disabled={
            !currentSelection.yearLevel ||
            !currentSelection.curriculum ||
            !currentSelection.subject
          }
        >
          <i className="fas fa-plus me-1"></i>
          Add Subject
        </button>

        {availableSubjects.length === 0 && currentSelection.curriculum && (
          <div className="text-muted mt-2" style={{ fontSize: "0.85rem" }}>
            <i className="fas fa-info-circle me-1"></i>
            No subjects available for this curriculum. Contact admin to add subjects.
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="invalid-feedback d-block mt-2">{error}</div>
      )}

      {/* Help text */}
      <div className="form-text mt-2">
        Select subjects you would like to tutor. You can add multiple subjects from different year levels and curricula.
      </div>
    </div>
  );
}

export default SubjectSelector;
