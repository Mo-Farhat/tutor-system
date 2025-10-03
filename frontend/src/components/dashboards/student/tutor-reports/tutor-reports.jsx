import React, { useState, useEffect } from "react";
import studentService from "../../../../services/studentService";
import "../../../../css/dashboards/student/tutor-reports/tutor-reports.css";

function TutorReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterTutor, setFilterTutor] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const reportsResult = await studentService.getReports();

      if (reportsResult.success && Array.isArray(reportsResult.data)) {
        setReports(reportsResult.data);
      } else {
        setReports([]);
        setError(reportsResult.error || "Failed to load reports");
      }
    } catch (err) {
      console.error("Error loading tutor reports:", err);
      setError("Failed to load reports. Please try again.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const numRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < numRating ? "text-warning" : "text-muted"
        }`}
      ></i>
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleDownloadReport = async (report) => {
    try {
      // If there's a download URL in the report, use it
      if (report.downloadUrl) {
        const link = document.createElement("a");
        link.href = report.downloadUrl;
        link.download = `Report_${report.term || "Report"}_${
          report.subject || ""
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Otherwise, try to get the report details and generate a PDF
        console.log("Downloading report:", report);
        alert("Download functionality will be implemented soon.");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  // Get unique tutors and subjects for filtering
  const tutors = [...new Set(reports.map((r) => r.tutorName).filter(Boolean))];
  const subjects = [...new Set(reports.map((r) => r.subject).filter(Boolean))];

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter((report) => {
      if (filterTutor && report.tutorName !== filterTutor) return false;
      if (filterSubject && report.subject !== filterSubject) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date || 0) - new Date(a.date || 0);
        case "tutor":
          return (a.tutorName || "").localeCompare(b.tutorName || "");
        case "subject":
          return (a.subject || "").localeCompare(b.subject || "");
        case "rating":
          return (
            (Number(b.overallRating) || 0) - (Number(a.overallRating) || 0)
          );
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="tutor-reports-container">
        <div className="tutor-reports-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your tutor reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-reports-container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Reports</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={loadReports}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-reports-container">
      <div className="tutor-reports-content-wrapper">
        <div className="tutor-reports-header">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="tutor-reports-title">Tutor Reports</h2>
              <p className="tutor-reports-subtitle">
                Academic progress reports and feedback from your tutors
              </p>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadReports}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh
            </button>
          </div>

          {/* Filters and Sorting */}
          <div className="tutor-reports-filters card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="filterTutor" className="form-label">
                    Filter by Tutor
                  </label>
                  <select
                    id="filterTutor"
                    className="form-select form-select-sm"
                    value={filterTutor}
                    onChange={(e) => setFilterTutor(e.target.value)}
                  >
                    <option value="">All Tutors</option>
                    {tutors.map((tutor, index) => (
                      <option key={index} value={tutor}>
                        {tutor}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="filterSubject" className="form-label">
                    Filter by Subject
                  </label>
                  <select
                    id="filterSubject"
                    className="form-select form-select-sm"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="sortBy" className="form-label">
                    Sort by
                  </label>
                  <select
                    id="sortBy"
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Date (Newest First)</option>
                    <option value="tutor">Tutor Name</option>
                    <option value="subject">Subject</option>
                    <option value="rating">Rating (Highest First)</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary btn-sm w-100"
                    onClick={() => {
                      setFilterTutor("");
                      setFilterSubject("");
                      setSortBy("date");
                    }}
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="tutor-reports-content">
          {filteredAndSortedReports.length > 0 ? (
            <div className="row g-4">
              {filteredAndSortedReports.map((report, index) => (
                <div key={index} className="col-lg-6 col-md-12">
                  <div className="tutor-reports-card">
                    <div className="tutor-reports-card-header">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h5 className="tutor-reports-card-title">
                            {report.term || "Progress Report"}
                          </h5>
                          <div className="tutor-reports-card-meta">
                            <div className="d-flex flex-wrap gap-2 small text-muted">
                              <span>
                                <i className="fas fa-calendar me-1"></i>
                                {formatDate(report.date)}
                              </span>
                              {report.tutorName && (
                                <span>
                                  <i className="fas fa-user-graduate me-1"></i>
                                  {report.tutorName}
                                </span>
                              )}
                              {report.subject && (
                                <span>
                                  <i className="fas fa-book me-1"></i>
                                  {report.subject}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {report.overallRating && (
                          <div className="tutor-reports-rating">
                            {renderStars(report.overallRating)}
                            <span className="ms-2 small text-muted">
                              ({report.overallRating}/5)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="tutor-reports-card-body">
                      {report.progressSummary && (
                        <div className="tutor-reports-summary">
                          <p className="mb-3">{report.progressSummary}</p>
                        </div>
                      )}

                      {report.keyAchievements &&
                        report.keyAchievements.length > 0 && (
                          <div className="tutor-reports-achievements mb-3">
                            <h6 className="small text-success mb-2">
                              <i className="fas fa-trophy me-1"></i>
                              Key Achievements:
                            </h6>
                            <ul className="list-unstyled mb-0">
                              {report.keyAchievements
                                .slice(0, 2)
                                .map((achievement, achIndex) => (
                                  <li
                                    key={achIndex}
                                    className="small text-muted mb-1"
                                  >
                                    <i className="fas fa-check text-success me-2"></i>
                                    {achievement}
                                  </li>
                                ))}
                              {report.keyAchievements.length > 2 && (
                                <li className="small text-muted">
                                  <i className="fas fa-plus me-2"></i>+
                                  {report.keyAchievements.length - 2} more
                                  achievements
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                      {report.improvementAreas && (
                        <div className="tutor-reports-improvements mb-3">
                          <h6 className="small text-info mb-2">
                            <i className="fas fa-target me-1"></i>
                            Areas for Improvement:
                          </h6>
                          <p className="small text-muted mb-0">
                            {report.improvementAreas.length > 100
                              ? report.improvementAreas.substring(0, 100) +
                                "..."
                              : report.improvementAreas}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="tutor-reports-card-actions">
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleViewReport(report)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        View Full Report
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <i className="fas fa-download me-1"></i>
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tutor-reports-empty">
              <div className="text-center py-5">
                <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">No Reports Found</h4>
                <p className="text-muted">
                  {reports.length === 0
                    ? "No progress reports yet. Your first report will appear here after your first term!"
                    : "No reports match your current filters. Try adjusting your search criteria."}
                </p>
                {reports.length > 0 && (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setFilterTutor("");
                      setFilterSubject("");
                      setSortBy("date");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedReport && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-file-alt me-2"></i>
                    {selectedReport.term || "Progress Report"} -{" "}
                    {selectedReport.subject}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetailModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="tutor-reports-detail-content">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <h6>Report Details</h6>
                        <ul className="list-unstyled">
                          <li>
                            <strong>Date:</strong>{" "}
                            {formatDate(selectedReport.date)}
                          </li>
                          {selectedReport.tutorName && (
                            <li>
                              <strong>Tutor:</strong> {selectedReport.tutorName}
                            </li>
                          )}
                          {selectedReport.subject && (
                            <li>
                              <strong>Subject:</strong> {selectedReport.subject}
                            </li>
                          )}
                          {selectedReport.term && (
                            <li>
                              <strong>Term:</strong> {selectedReport.term}
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="col-md-6">
                        {selectedReport.overallRating && (
                          <div className="text-center">
                            <h6>Overall Rating</h6>
                            <div className="mb-2">
                              {renderStars(selectedReport.overallRating)}
                            </div>
                            <span className="text-muted">
                              {selectedReport.overallRating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedReport.progressSummary && (
                      <div className="mb-4">
                        <h6>Progress Summary</h6>
                        <p>{selectedReport.progressSummary}</p>
                      </div>
                    )}

                    {selectedReport.keyAchievements &&
                      selectedReport.keyAchievements.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-success">
                            <i className="fas fa-trophy me-2"></i>
                            Key Achievements
                          </h6>
                          <ul>
                            {selectedReport.keyAchievements.map(
                              (achievement, achIndex) => (
                                <li key={achIndex} className="mb-1">
                                  {achievement}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {selectedReport.improvementAreas && (
                      <div className="mb-4">
                        <h6 className="text-info">
                          <i className="fas fa-target me-2"></i>
                          Areas for Improvement
                        </h6>
                        <p>{selectedReport.improvementAreas}</p>
                      </div>
                    )}

                    {selectedReport.nextSteps && (
                      <div className="mb-4">
                        <h6 className="text-primary">
                          <i className="fas fa-arrow-right me-2"></i>
                          Next Steps
                        </h6>
                        <p>{selectedReport.nextSteps}</p>
                      </div>
                    )}

                    {selectedReport.tutorComments && (
                      <div className="mb-4">
                        <h6>
                          <i className="fas fa-comment me-2"></i>
                          Tutor Comments
                        </h6>
                        <p className="fst-italic">
                          "{selectedReport.tutorComments}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleDownloadReport(selectedReport)}
                  >
                    <i className="fas fa-download me-1"></i>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorReports;
