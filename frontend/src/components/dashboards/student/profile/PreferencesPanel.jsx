import React from "react";

function PreferencesPanel({ learningPreferences, onEdit }) {
  return (
    <div className="student-profile-section">
      <div className="card student-profile-preferences-card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="student-profile-card-title">Learning Preferences</h6>
            <button
              className="btn student-profile-edit-icon-btn"
              onClick={onEdit}
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
                <span key={style} className="student-profile-preference-tag">
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
  );
}

export default PreferencesPanel;
