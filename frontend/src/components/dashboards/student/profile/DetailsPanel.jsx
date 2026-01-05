import React from "react";
import "../../../../css/dashboards/student/profile-details/profile-details.css";

function DetailsPanel({
  studentData,
  studentBadges = [],
  previousReports = [],
}) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < rating ? "text-warning" : "text-muted"}`}
      ></i>
    ));
  };

  return (
    <div className="student-profile-details-content">
      {/* Header (lightweight, without container wrappers) */}
      
     



      {/* Personal Information removed to avoid duplication */}

      <div className="student-profile-details-section">
        <div className="row">
          {typeof studentData.totalLessons !== "undefined" && (
            <div className="col-lg-4 col-md-12 mb-4">
              <div className="student-profile-details-card">
                <div className="student-profile-details-card-body">
                  <h6 className="student-profile-details-card-title">
                    Total Lessons
                  </h6>
                  <p className="student-profile-details-card-description">
                    Lessons completed to date
                  </p>
                  <div className="student-profile-details-stat-number">
                    {studentData.totalLessons}
                  </div>
                </div>
              </div>
            </div>
          )}

          {studentData.attendance && (
            <div className="col-lg-4 col-md-12 mb-4">
              <div className="student-profile-details-card">
                <div className="student-profile-details-card-body">
                  <h6 className="student-profile-details-card-title">
                    Attendance Rate
                  </h6>
                  <p className="student-profile-details-card-description">
                    Your attendance percentage
                  </p>
                  <div className="student-profile-details-stat-number">
                    {studentData.attendance}
                  </div>
                </div>
              </div>
            </div>
          )}

          {Array.isArray(studentBadges) && studentBadges.length > 0 && (
            <div className="col-lg-4 col-md-12 mb-4">
              <div className="student-profile-details-card">
                <div className="student-profile-details-card-body">
                  <h6 className="student-profile-details-card-title">
                    Badges Earned
                  </h6>
                  <p className="student-profile-details-card-description">
                    Achievement badges collected
                  </p>
                  <div className="student-profile-details-stat-number">
                    {studentBadges.reduce((sum, b) => sum + (b.count || 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="student-profile-details-section">
        <h4 className="student-profile-details-section-title">
          My Achievement Badges
        </h4>
        <div className="student-profile-details-card">
          <div className="student-profile-details-card-body">
            <div className="mb-3">
              <h6 className="student-profile-details-card-title">
                Your Achievements
              </h6>
              <p className="student-profile-details-card-description">
                Recognition badges you've earned through your hard work
              </p>
            </div>
            {Array.isArray(studentBadges) && studentBadges.length > 0 ? (
              <div className="row">
                {studentBadges.map((badge, index) => (
                  <div key={index} className="col-lg-4 col-md-6 col-12 mb-3">
                    <div className="student-profile-details-badge-card">
                      <div className="student-profile-details-badge-icon">
                        <i className="fas fa-award"></i>
                        {badge.count > 1 && (
                          <span className="student-profile-details-badge-count">
                            ×{badge.count}
                          </span>
                        )}
                      </div>
                      <div className="student-profile-details-badge-content">
                        <h6 className="student-profile-details-badge-name">
                          {badge.name}
                        </h6>
                        {Array.isArray(badge.dates) &&
                          badge.dates.length > 0 && (
                            <small className="text-muted">
                              Last earned: {badge.dates[badge.dates.length - 1]}
                            </small>
                          )}
                        {Array.isArray(badge.notes) && (
                          <div className="student-profile-details-badge-notes">
                            {badge.notes.slice(0, 2).map((note, noteIndex) => (
                              <small
                                key={noteIndex}
                                className="d-block text-muted"
                              >
                                • {note}
                              </small>
                            ))}
                            {badge.notes.length > 2 && (
                              <small className="text-muted">
                                • +{badge.notes.length - 2} more
                              </small>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="student-profile-details-empty-state">
                <i className="fas fa-award"></i>
                <p>
                  No badges earned yet. Keep working hard to earn your first
                  achievement!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="student-profile-details-section">
        <h4 className="student-profile-details-section-title">
          My Progress Reports
        </h4>
        <div className="student-profile-details-card">
          <div className="student-profile-details-card-body">
            <div className="mb-3">
              <h6 className="student-profile-details-card-title">
                Academic Progress
              </h6>
              <p className="student-profile-details-card-description">
                Your termly assessment reports and feedback from tutors
              </p>
            </div>
            {Array.isArray(previousReports) && previousReports.length > 0 ? (
              <div className="row">
                {previousReports.map((report, index) => (
                  <div key={index} className="col-lg-6 col-md-12 mb-3">
                    <div className="student-profile-details-report-card">
                      <div className="student-profile-details-report-header">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="student-profile-details-report-title">
                              {report.term} Report
                            </h6>
                            <small className="text-muted">
                              <i className="fas fa-calendar me-1"></i>
                              {report.date}
                            </small>
                          </div>
                          <div className="student-profile-details-report-rating">
                            {renderStars(report.overallRating || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="student-profile-details-report-summary">
                        <p>{report.progressSummary}</p>
                      </div>
                      <div className="student-profile-details-report-achievements">
                        <h6 className="mb-2">Key Achievements:</h6>
                        <ul className="mb-2">
                          {(report.keyAchievements || []).map(
                            (achievement, achIndex) => (
                              <li key={achIndex} className="small">
                                {achievement}
                              </li>
                            )
                          )}
                        </ul>
                        <h6 className="mb-2">Areas for Improvement:</h6>
                        <p className="small mb-0">{report.improvementAreas}</p>
                      </div>
                      <div className="student-profile-details-report-actions">
                        <button className="btn btn-outline-primary btn-sm me-2">
                          <i className="fas fa-eye me-1"></i>
                          View Full Report
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          <i className="fas fa-download me-1"></i>
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="student-profile-details-empty-state">
                <i className="fas fa-file-alt"></i>
                <p>
                  No progress reports yet. Your first report will appear here
                  after your first term!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsPanel;
