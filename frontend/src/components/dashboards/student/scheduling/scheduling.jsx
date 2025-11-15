import React, { useState, useEffect } from "react";
import studentService from "../../../../services/studentService";
import "../../../../css/dashboards/student/scheduling/scheduling.css";

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = firstDay.getDay();

  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let date = 1; date <= lastDay.getDate(); date++) {
    week.push(new Date(year, month, date));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

function StudentScheduling() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [feedback, setFeedback] = useState({ rating: "", comment: "" });
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const [hasShownAutoPrompt, setHasShownAutoPrompt] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthMatrix = getMonthMatrix(year, month);
  
  // Get year and month for recurring expansion
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load lessons from API
  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError(null);

        const [upcomingRes, completedRes] = await Promise.all([
          studentService.getUpcomingLessons(),
          studentService.getCompletedLessons(),
        ]);

        if (upcomingRes?.success && Array.isArray(upcomingRes.data)) {
          setUpcomingLessons(upcomingRes.data);
        } else {
          setUpcomingLessons([]);
        }

        if (completedRes?.success && Array.isArray(completedRes.data)) {
          setCompletedLessons(completedRes.data);
          
          // Calculate pending feedback count
          const pending = completedRes.data.filter(lesson => !lesson.feedback);
          setPendingFeedbackCount(pending.length);
          
          // Show auto-prompt for first lesson without feedback if not already shown
          if (pending.length > 0 && !hasShownAutoPrompt) {
            // Show prompt for the most recent lesson without feedback
            const mostRecentPending = pending[0];
            setSelectedLesson(mostRecentPending);
            setFeedback({ rating: "", comment: "" });
            setShowFeedbackModal(true);
            setHasShownAutoPrompt(true);
          }
        } else {
          setCompletedLessons([]);
          setPendingFeedbackCount(0);
        }
      } catch (e) {
        setError("Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, []);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper function to get timezone abbreviation (AEST/AEDT)
  const getTimezoneAbbr = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const formatter = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney",
        timeZoneName: "short",
      });
      const parts = formatter.formatToParts(date);
      const tzPart = parts.find((part) => part.type === "timeZoneName");
      return tzPart ? tzPart.value : "AEST";
    } catch (e) {
      return "AEST";
    }
  };

  // Helper functions
  const formatTime = (dateStr) => {
    if (!dateStr) return "Invalid time";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid time";
      const timeStr = date.toLocaleTimeString("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const tzAbbr = getTimezoneAbbr(dateStr);
      return `${timeStr} ${tzAbbr}`;
    } catch (e) {
      console.error("Error formatting time:", e, "for dateStr:", dateStr);
      return "Invalid time";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Invalid date";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid date";
      
      // Create dates in Australia timezone for comparison
      const now = new Date();
      const today = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const lessonDate = new Date(date.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
      
      if (lessonDate.toDateString() === today.toDateString()) return "Today";
      if (lessonDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
      
      return date.toLocaleDateString("en-AU", {
        timeZone: "Australia/Sydney",
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e, "for dateStr:", dateStr);
      return "Invalid date";
    }
  };

  // Expand recurring lessons to show all instances on calendar
  const expandRecurringLessons = (lessons, viewStartDate, viewEndDate) => {
    const expanded = [];
    
    lessons.forEach((lesson) => {
      // Always include the original lesson
      expanded.push(lesson);
      
      // If lesson has recurrenceRule, expand it (only for upcoming lessons, not completed)
      if (lesson.recurrenceRule && lesson.seriesId && lesson.status === "scheduled") {
        const instances = generateRecurringInstances(lesson, viewStartDate, viewEndDate);
        expanded.push(...instances);
      }
    });
    
    return expanded;
  };

  // Generate recurring instances based on RRULE
  const generateRecurringInstances = (lesson, viewStartDate, viewEndDate) => {
    const instances = [];
    const startDate = new Date(lesson.startAt);
    const endDate = new Date(lesson.endAt);
    const duration = endDate - startDate;
    
    // Parse RRULE
    const rrule = lesson.recurrenceRule;
    if (!rrule) return instances;
    
    // Extract frequency
    const freqMatch = rrule.match(/FREQ=(\w+)/);
    if (!freqMatch) return instances;
    
    const frequency = freqMatch[1].toLowerCase();
    
    // Extract UNTIL date if present
    const untilMatch = rrule.match(/UNTIL=([^;]+)/);
    let untilDate = null;
    if (untilMatch) {
      const untilStr = untilMatch[1];
      // Parse YYYYMMDDTHHMMSSZ format
      if (untilStr.length >= 15) {
        const year = untilStr.substring(0, 4);
        const month = untilStr.substring(4, 6);
        const day = untilStr.substring(6, 8);
        untilDate = new Date(`${year}-${month}-${day}T23:59:59Z`);
      }
    }
    
    // Set view boundaries (3 months ahead for calendar display)
    const now = new Date();
    const maxDate = viewEndDate || new Date(now.getFullYear(), now.getMonth() + 3, 0);
    const endBoundary = untilDate && untilDate < maxDate ? untilDate : maxDate;
    
    // Generate instances
    let currentDate = new Date(startDate);
    let iteration = 0;
    const maxIterations = frequency === 'weekly' ? 52 : 12; // Prevent infinite loops
    
    while (currentDate <= endBoundary && iteration < maxIterations) {
      // Skip the original instance (already added) and only show future instances
      if (currentDate.getTime() !== startDate.getTime() && currentDate >= now) {
        const instanceEnd = new Date(currentDate.getTime() + duration);
        
        // Only include if within view range
        if (currentDate >= viewStartDate && currentDate <= endBoundary) {
          instances.push({
            ...lesson,
            id: `${lesson.id}-recur-${iteration}`, // Unique ID for display
            startAt: currentDate.toISOString(),
            endAt: instanceEnd.toISOString(),
            isRecurringInstance: true, // Flag to identify expanded instances
            originalLessonId: lesson.id,
          });
        }
      }
      
      // Move to next occurrence
      if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        break; // Unknown frequency
      }
      
      iteration++;
    }
    
    return instances;
  };

  const getLessonsForDate = (dateStr) => {
    if (!dateStr) return [];
    try {
      const targetDate = new Date(dateStr);
      if (isNaN(targetDate.getTime())) return [];
      
      // Get view boundaries (current month)
      const viewStart = new Date(currentYear, currentMonth, 1);
      const viewEnd = new Date(currentYear, currentMonth + 1, 0);
      
      // Expand recurring lessons (only for upcoming lessons)
      const expandedUpcoming = expandRecurringLessons(upcomingLessons, viewStart, viewEnd);
      
      // Combine expanded upcoming with completed (completed don't need expansion)
      const allLessons = [...expandedUpcoming, ...completedLessons];
      
      return allLessons.filter((lesson) => {
        if (!lesson.startAt) return false;
        try {
          const lessonDate = new Date(lesson.startAt);
          if (isNaN(lessonDate.getTime())) return false;
          
          // Compare dates in Australia timezone
          const lessonDateStr = lessonDate.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
          const targetDateStr = targetDate.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
          
          return lessonDateStr === targetDateStr;
        } catch (e) {
          console.error("Error processing lesson date:", e, "for lesson:", lesson);
          return false;
        }
      });
    } catch (e) {
      console.error("Error processing target date:", e, "for dateStr:", dateStr);
      return [];
    }
  };

  const handleJoinSession = (lesson) => {
    if (lesson.zoomLink) {
      window.open(lesson.zoomLink, "_blank");
    } else {
      alert("No Zoom link available for this session");
    }
  };

  const handleGiveFeedback = (lesson) => {
    setSelectedLesson(lesson);
    setFeedback({ rating: "", comment: "" });
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    try {
      const res = await studentService.giveLessonFeedback(
        selectedLesson.id,
        feedback
      );
      if (res?.success) {
        alert("Feedback submitted successfully!");
        setShowFeedbackModal(false);
        setSelectedLesson(null);
        setFeedback({ rating: "", comment: "" });
        // Refresh completed lessons to show updated feedback
        const completedRes = await studentService.getCompletedLessons();
        if (completedRes?.success && Array.isArray(completedRes.data)) {
          setCompletedLessons(completedRes.data);
          
          // Update pending feedback count
          const pending = completedRes.data.filter(lesson => !lesson.feedback);
          setPendingFeedbackCount(pending.length);
        }
      } else {
        alert("Failed to submit feedback: " + (res?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to submit feedback: " + e.message);
    }
  };

  const downloadCalendar = async (lesson) => {
    if (!lesson || !lesson.id) {
      alert("Invalid lesson data");
      return;
    }
    
    try {
      const response = await fetch(
        `/api/auth/student/lessons/${lesson.id}/ics`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lesson-${lesson.id}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download calendar file");
      }
    } catch (e) {
      console.error("Error downloading calendar:", e);
      alert("Failed to download calendar file: " + e.message);
    }
  };

  return (
    <div className="student-scheduling-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="student-scheduling-content">
            {/* Header */}
            <div className="student-scheduling-header mb-4">
              <h2 className="student-scheduling-page-title mb-0">
                My Scheduling
              </h2>
            </div>

            {/* Calendar View - Always Visible */}
            <div className="student-scheduling-section">
              <div className="d-flex flex-wrap align-items-center justify-content-between student-scheduling-calendar-header mb-3">
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-link student-scheduling-nav-btn"
                    onClick={goToPreviousMonth}
                    aria-label="Previous Month"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <h4 className="student-scheduling-title mb-0">
                    {monthNames[month]} {year}
                  </h4>
                  <button
                    className="btn btn-link student-scheduling-nav-btn"
                    onClick={goToNextMonth}
                    aria-label="Next Month"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="student-scheduling-calendar-section mb-4">
                <div className="table-responsive">
                  <table className="table student-scheduling-table mb-0">
                    <thead>
                      <tr>
                        {daysShort.map((d) => (
                          <th
                            key={d}
                            className="student-scheduling-th text-center"
                          >
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthMatrix.map((week, i) => (
                        <tr key={i}>
                          {week.map((date, j) => {
                            const dateStr = date
                              ? `${date.getFullYear()}-${String(
                                  date.getMonth() + 1
                                ).padStart(2, "0")}-${String(
                                  date.getDate()
                                ).padStart(2, "0")}`
                              : "";
                            const dayLessons = date
                              ? getLessonsForDate(dateStr)
                              : [];
                            return (
                              <td
                                key={j}
                                className={`student-scheduling-td align-top ${
                                  date ? "" : "student-scheduling-empty"
                                }`}
                              >
                                {date && (
                                  <div className="student-scheduling-date-cell">
                                    <div className="student-scheduling-date-num">
                                      {date.getDate()}
                                    </div>
                                    {dayLessons.map((lesson, idx) => (
                                      <div
                                        className="student-scheduling-session-card mt-1"
                                        key={idx}
                                      >
                                        <span className="student-scheduling-session-title">
                                          {lesson.subject || "No subject"}
                                        </span>
                                        <span className="student-scheduling-session-time ms-1">
                                          {formatTime(lesson.startAt)}
                                        </span>
                                        {lesson.status === "completed" ? (
                                          <i className="fas fa-check-circle student-scheduling-session-icon ms-1 text-success"></i>
                                        ) : (
                                          <i className="fas fa-clock student-scheduling-session-icon ms-1 text-warning"></i>
                                        )}
                                        {(lesson.seriesId || lesson.isRecurringInstance) && (
                                          <i className="fas fa-sync-alt student-scheduling-session-icon ms-1 text-info" title="Recurring lesson"></i>
                                        )}
                                        <div className="text-muted small">
                                          {lesson.tutor?.firstName || "Unknown"}{" "}
                                          {lesson.tutor?.lastName || "Tutor"}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Upcoming Sessions Section */}
            <div className="student-scheduling-section">
              <h4 className="student-scheduling-section-title">
                Upcoming Sessions
              </h4>
              <div className="student-scheduling-card student-scheduling-upcoming-card">
                <div className="student-scheduling-card-body">
                  {upcomingLessons.length === 0 && !loading ? (
                    <div className="text-muted text-center py-4">
                      No upcoming sessions scheduled. Your tutor will schedule
                      sessions for you.
                    </div>
                  ) : (
                    upcomingLessons.slice(0, 5).map((lesson, idx) => (
                      <div
                        className="student-scheduling-upcoming-item d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3"
                        key={idx}
                      >
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                          <span className="student-scheduling-upcoming-dot me-3 student-scheduling-dot-confirmed"></span>
                          <div>
                            <div className="student-scheduling-upcoming-title">
                              {lesson.subject || "No subject"}
                              {(lesson.seriesId || lesson.isRecurringInstance) && (
                                <span className="badge bg-info ms-2" title="Recurring lesson">
                                  <i className="fas fa-sync-alt me-1"></i>Recurring
                                </span>
                              )}
                            </div>
                            <div className="student-scheduling-upcoming-tutor text-muted small">
                              with {lesson.tutor?.firstName || "Unknown"}{" "}
                              {lesson.tutor?.lastName || "Tutor"}
                            </div>
                            <div className="student-scheduling-upcoming-time text-muted small">
                              {formatDate(lesson.startAt)},{" "}
                              {formatTime(lesson.startAt)} -{" "}
                              {formatTime(lesson.endAt)}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge bg-success student-scheduling-status-badge">
                            scheduled
                          </span>
                          {lesson.prepNotes && (
                            <span
                              className="text-muted small"
                              title={lesson.prepNotes}
                            >
                              <i className="fas fa-sticky-note"></i>
                            </span>
                          )}
                          {lesson.zoomLink ? (
                            <button
                              className="btn btn-dark btn-sm student-scheduling-join-btn"
                              onClick={() => handleJoinSession(lesson)}
                            >
                              <i className="fas fa-video me-1"></i>Join Session
                            </button>
                          ) : (
                            <span className="text-muted small">
                              No Zoom link
                            </span>
                          )}
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => downloadCalendar(lesson)}
                            title="Download to Calendar"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Completed Sessions Section */}
            {completedLessons.length > 0 && (
              <div className="student-scheduling-section">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="student-scheduling-section-title mb-0">
                    Recent Sessions
                  </h4>
                  {pendingFeedbackCount > 0 && (
                    <span className="badge bg-warning text-dark">
                      {pendingFeedbackCount} {pendingFeedbackCount === 1 ? 'feedback' : 'feedbacks'} pending
                    </span>
                  )}
                </div>
                <div className="student-scheduling-card student-scheduling-upcoming-card">
                  <div className="student-scheduling-card-body">
                    {completedLessons.slice(0, 3).map((lesson, idx) => (
                      <div
                        className="student-scheduling-upcoming-item d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3"
                        key={idx}
                      >
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                          <span className="student-scheduling-upcoming-dot me-3 student-scheduling-dot-confirmed"></span>
                          <div>
                            <div className="student-scheduling-upcoming-title">
                              {lesson.subject || "No subject"}
                              {lesson.seriesId && (
                                <span className="badge bg-info ms-2" title="Recurring lesson">
                                  <i className="fas fa-sync-alt me-1"></i>Recurring
                                </span>
                              )}
                            </div>
                            <div className="student-scheduling-upcoming-tutor text-muted small">
                              with {lesson.tutor?.firstName || "Unknown"}{" "}
                              {lesson.tutor?.lastName || "Tutor"}
                            </div>
                            <div className="student-scheduling-upcoming-time text-muted small">
                              {formatDate(lesson.startAt)},{" "}
                              {formatTime(lesson.startAt)} -{" "}
                              {formatTime(lesson.endAt)}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge bg-secondary student-scheduling-status-badge">
                            completed
                          </span>
                          {lesson.feedback ? (
                            <span className="text-success small">
                              <i className="fas fa-star"></i> Feedback given
                            </span>
                          ) : (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleGiveFeedback(lesson)}
                            >
                              <i className="fas fa-star me-1"></i>Give Feedback
                              <span className="badge bg-warning text-dark ms-2">!</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && selectedLesson && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Give Feedback</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowFeedbackModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-info mb-3">
                        <strong>Please provide feedback for your tutor.</strong>
                        <p className="mb-0 mt-2">Is there anything you'd like to share to help improve future sessions?</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Rating (1-5)</label>
                        <select
                          className="form-select"
                          value={feedback.rating}
                          onChange={(e) =>
                            setFeedback({ ...feedback, rating: e.target.value })
                          }
                        >
                          <option value="">Select rating</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very Good</option>
                          <option value="5">5 - Excellent</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Comment (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={feedback.comment}
                          onChange={(e) =>
                            setFeedback({
                              ...feedback,
                              comment: e.target.value,
                            })
                          }
                          placeholder="Share your thoughts about the lesson..."
                        ></textarea>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowFeedbackModal(false);
                          setSelectedLesson(null);
                          setFeedback({ rating: "", comment: "" });
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={submitFeedback}
                        disabled={!feedback.rating && !feedback.comment}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentScheduling;
