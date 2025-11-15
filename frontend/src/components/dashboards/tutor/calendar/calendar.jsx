import React, { useState, useEffect } from "react";
import tutorService from "../../../../services/tutorService";
import "../../../../css/dashboards/tutor/calendar/calendar.css";

function getMonthMatrix(year, month) {
  // Returns a 2D array representing the weeks of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = firstDay.getDay();
  // Fill initial empty days
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let date = 1; date <= lastDay.getDate(); date++) {
    week.push(new Date(year, month, date));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  // Fill trailing empty days
  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

function TutorCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [updateRecurringSeries, setUpdateRecurringSeries] = useState(false);
  const [newLesson, setNewLesson] = useState({
    studentId: "",
    subject: "",
    startAt: "",
    endAt: "",
    duration: 60,
    zoomLink: "",
    prepNotes: "",
    homework: "",
    isRecurring: false,
    recurrenceType: "weekly", // 'weekly' or 'monthly'
    recurrenceEndDate: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthMatrix = getMonthMatrix(year, month);
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

  // Load lessons and students
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [lessonsRes, studentsRes] = await Promise.all([
          tutorService.getUpcomingLessons(),
          tutorService.getMyStudents(),
        ]);

        if (lessonsRes?.success && Array.isArray(lessonsRes.data)) {
          setLessons(lessonsRes.data);
        } else {
          setLessons([]);
        }

        if (studentsRes?.success && Array.isArray(studentsRes.data)) {
          setStudents(studentsRes.data);
        } else {
          setStudents([]);
        }
      } catch (e) {
        setError("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // Load once on mount - recurring instances are expanded client-side

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper function to set default lesson times
  const setDefaultTimes = (selectedDate) => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const now = new Date();
      
      // Set start time to next hour if today, or 9 AM if future date
      const startTime = new Date(date);
      if (date.toDateString() === now.toDateString()) {
        startTime.setHours(now.getHours() + 1, 0, 0, 0);
      } else {
        startTime.setHours(9, 0, 0, 0);
      }
      
      // Set end time to 1 hour after start time
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      
      setNewLesson(prev => ({
        ...prev,
        startAt: startTime.toISOString().slice(0, 16),
        endAt: endTime.toISOString().slice(0, 16),
        duration: 60
      }));
    }
  };

  // Helper function to calculate default recurrence end date (3 months from start)
  const getDefaultRecurrenceEndDate = (startDate) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split("T")[0];
  };

  // Create lesson
  const handleCreateLesson = async () => {
    try {
      const res = await tutorService.createLesson(newLesson);
      if (res?.success) {
        setLessons([res.data, ...lessons]);
        setShowCreateModal(false);
        setNewLesson({
          studentId: "",
          subject: "",
          startAt: "",
          endAt: "",
          duration: 60,
          zoomLink: "",
          prepNotes: "",
          homework: "",
          isRecurring: false,
          recurrenceType: "weekly",
          recurrenceEndDate: "",
        });
      } else {
        alert("Failed to create lesson: " + (res?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to create lesson: " + e.message);
    }
  };

  // Update lesson
  const handleUpdateLesson = async () => {
    if (!editingLesson) return;
    
    try {
      const updates = {
        subject: editingLesson.subject,
        startAt: editingLesson.startAt,
        endAt: editingLesson.endAt,
        zoomLink: editingLesson.zoomLink || "",
        prepNotes: editingLesson.prepNotes || "",
        homework: editingLesson.homework || "",
      };

      const res = await tutorService.updateLesson(editingLesson.id, {
        ...updates,
        updateRecurringSeries,
      });

      if (res?.success) {
        // Refresh lessons
        const lessonsRes = await tutorService.getUpcomingLessons();
        if (lessonsRes?.success && Array.isArray(lessonsRes.data)) {
          setLessons(lessonsRes.data);
        }
        setShowEditModal(false);
        setEditingLesson(null);
        setUpdateRecurringSeries(false);
        alert("Lesson updated successfully!");
      } else {
        alert("Failed to update lesson: " + (res?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to update lesson: " + e.message);
    }
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
      return "Invalid date";
    }
  };

  // Expand recurring lessons to show all instances on calendar
  const expandRecurringLessons = (lessons, viewStartDate, viewEndDate) => {
    const expanded = [];
    
    lessons.forEach((lesson) => {
      // Always include the original lesson
      expanded.push(lesson);
      
      // If lesson has recurrenceRule, expand it
      if (lesson.recurrenceRule && lesson.seriesId) {
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
      // Skip the original instance (already added)
      if (currentDate.getTime() !== startDate.getTime()) {
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
    
    // Get view boundaries (current month)
    const viewStart = new Date(year, month, 1);
    const viewEnd = new Date(year, month + 1, 0);
    
    // Expand recurring lessons
    const expandedLessons = expandRecurringLessons(lessons, viewStart, viewEnd);
    
    return expandedLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.startAt);
      const targetDate = new Date(dateStr);
      
      // Compare dates in Australia timezone
      const lessonDateStr = lessonDate.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
      const targetDateStr = targetDate.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
      
      return lessonDateStr === targetDateStr;
    });
  };

  return (
    <div className="tutor-calendar-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="tutor-calendar-content">
            {/* Calendar Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between tutor-calendar-header mb-3">
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-link tutor-calendar-nav-btn"
                  onClick={goToPreviousMonth}
                  aria-label="Previous Month"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h4 className="tutor-calendar-title mb-0">
                  {monthNames[month]} {year}
                </h4>
                <button
                  className="btn btn-link tutor-calendar-nav-btn"
                  onClick={goToNextMonth}
                  aria-label="Next Month"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus me-1"></i>
                  Schedule Lesson
                </button>
                <div
                  className="btn-group tutor-calendar-view-toggle"
                  role="group"
                >
                  <button className="btn btn-dark tutor-calendar-view-btn active">
                    Month
                  </button>
                  <button className="btn btn-outline-dark tutor-calendar-view-btn">
                    Week
                  </button>
                  <button className="btn btn-outline-dark tutor-calendar-view-btn">
                    Day
                  </button>
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

            {/* Calendar Table */}
            <div className="tutor-calendar-section tutor-calendar-calendar-section mb-4">
              <div className="alert alert-info mb-3" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Tip:</strong> Click on any date to quickly schedule a lesson for that day, or use the "Schedule Lesson" button for more control.
              </div>
              <div className="table-responsive">
                <table className="table tutor-calendar-table mb-0">
                  <thead>
                    <tr>
                      {daysShort.map((d) => (
                        <th key={d} className="tutor-calendar-th text-center">
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
                              className={`tutor-calendar-td align-top ${
                                date ? "" : "tutor-calendar-empty"
                              }`}
                              onClick={() => {
                                if (date) {
                                  setDefaultTimes(dateStr);
                                  setShowCreateModal(true);
                                }
                              }}
                              style={{ cursor: date ? 'pointer' : 'default' }}
                            >
                              {date && (
                                <div className="tutor-calendar-date-cell">
                                  <div className="tutor-calendar-date-num">
                                    {date.getDate()}
                                  </div>
                                  {dayLessons.map((lesson, idx) => (
                                    <div
                                      className="tutor-calendar-lesson-card mt-1"
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // If it's a recurring instance, edit the original lesson
                                        const lessonToEdit = lesson.isRecurringInstance 
                                          ? lessons.find(l => l.id === lesson.originalLessonId) || lesson
                                          : lesson;
                                        setEditingLesson(lessonToEdit);
                                        setUpdateRecurringSeries(false);
                                        setShowEditModal(true);
                                      }}
                                      style={{ cursor: 'pointer' }}
                                      title={`Click to edit lesson${lesson.isRecurringInstance ? ' (recurring)' : ''}`}
                                    >
                                      <span className="tutor-calendar-lesson-title">
                                        {lesson.subject}
                                      </span>
                                      <span className="tutor-calendar-lesson-time ms-1">
                                        {formatTime(lesson.startAt)}
                                      </span>
                                      {(lesson.seriesId || lesson.isRecurringInstance) && (
                                        <i className="fas fa-sync-alt tutor-calendar-lesson-icon ms-1 text-info" title="Recurring lesson"></i>
                                      )}
                                      {lesson.zoomLink && (
                                        <i className="fas fa-video tutor-calendar-lesson-icon ms-1"></i>
                                      )}
                                      <div className="text-muted small">
                                        {lesson.student?.firstName}{" "}
                                        {lesson.student?.lastName}
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

            {/* Upcoming Lessons Section */}
            <div className="tutor-calendar-section tutor-calendar-upcoming-section">
              <h4 className="tutor-calendar-section-title mb-3">
                Upcoming Lessons
              </h4>
              <div className="tutor-calendar-card tutor-calendar-upcoming-card">
                <div className="tutor-calendar-card-body">
                  {lessons.length === 0 && !loading ? (
                    <div className="text-muted text-center py-4">
                      No upcoming lessons scheduled. Click "Schedule Lesson" to
                      create one.
                    </div>
                  ) : (
                    lessons.slice(0, 5).map((lesson, idx) => (
                      <div
                        className="tutor-calendar-upcoming-item d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3"
                        key={idx}
                      >
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                          <span className="tutor-calendar-upcoming-dot me-2"></span>
                          <div>
                            <div className="tutor-calendar-upcoming-title">
                              {lesson.subject} - {lesson.student?.firstName}{" "}
                              {lesson.student?.lastName}
                              {lesson.seriesId && (
                                <span className="badge bg-info ms-2" title="Recurring lesson">
                                  <i className="fas fa-sync-alt me-1"></i>Recurring
                                </span>
                              )}
                            </div>
                            <div className="tutor-calendar-upcoming-time text-muted small">
                              {formatDate(lesson.startAt)},{" "}
                              {formatTime(lesson.startAt)} -{" "}
                              {formatTime(lesson.endAt)}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLesson(lesson);
                              setUpdateRecurringSeries(false);
                              setShowEditModal(true);
                            }}
                            title="Edit lesson"
                          >
                            <i className="fas fa-edit me-1"></i>Edit
                          </button>
                          {lesson.prepNotes && (
                            <span
                              className="text-muted small"
                              title={lesson.prepNotes}
                            >
                              <i className="fas fa-sticky-note"></i>
                            </span>
                          )}
                          {lesson.zoomLink ? (
                            <a
                              href={lesson.zoomLink}
                              className="btn btn-dark btn-sm tutor-calendar-join-btn"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-video me-1"></i>Join Zoom
                            </a>
                          ) : (
                            <span className="text-muted small">
                              No Zoom link
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Create Lesson Modal */}
            {showCreateModal && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Schedule New Lesson</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowCreateModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <form>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Student</label>
                            <select
                              className="form-select"
                              value={newLesson.studentId}
                              onChange={(e) =>
                                setNewLesson({
                                  ...newLesson,
                                  studentId: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Student</option>
                              {students.map((assignment) => (
                                <option
                                  key={assignment.id}
                                  value={assignment.student?.id}
                                >
                                  {assignment.student?.firstName}{" "}
                                  {assignment.student?.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Subject</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newLesson.subject}
                              onChange={(e) =>
                                setNewLesson({
                                  ...newLesson,
                                  subject: e.target.value,
                                })
                              }
                              placeholder="e.g., Mathematics"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={newLesson.startAt ? newLesson.startAt.split('T')[0] : ''}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                const currentTime = newLesson.startAt ? newLesson.startAt.split('T')[1] : '09:00';
                                const newStartAt = `${selectedDate}T${currentTime}`;
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(startDate);
                                endDate.setHours(endDate.getHours() + 1);
                                
                                setNewLesson({
                                  ...newLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString().slice(0, 16),
                                  recurrenceEndDate: newLesson.isRecurring && !newLesson.recurrenceEndDate
                                    ? getDefaultRecurrenceEndDate(newStartAt)
                                    : newLesson.recurrenceEndDate,
                                });
                              }}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Duration</label>
                            <select
                              className="form-select"
                              value={newLesson.duration || '60'}
                              onChange={(e) => {
                                const duration = parseInt(e.target.value);
                                const startTime = newLesson.startAt;
                                if (startTime) {
                                  const startDate = new Date(startTime);
                                  const endDate = new Date(startDate);
                                  endDate.setMinutes(endDate.getMinutes() + duration);
                                  
                                  setNewLesson({
                                    ...newLesson,
                                    duration: duration,
                                    endAt: endDate.toISOString().slice(0, 16)
                                  });
                                }
                              }}
                            >
                              <option value="30">30 minutes</option>
                              <option value="45">45 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                              <option value="120">2 hours</option>
                            </select>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Start Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={newLesson.startAt ? newLesson.startAt.split('T')[1] : ''}
                              onChange={(e) => {
                                const selectedTime = e.target.value;
                                const currentDate = newLesson.startAt ? newLesson.startAt.split('T')[0] : new Date().toISOString().split('T')[0];
                                const newStartAt = `${currentDate}T${selectedTime}`;
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(startDate);
                                endDate.setMinutes(endDate.getMinutes() + (parseInt(newLesson.duration) || 60));
                                
                                setNewLesson({
                                  ...newLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString().slice(0, 16)
                                });
                              }}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">End Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={newLesson.endAt ? newLesson.endAt.split('T')[1] : ''}
                              onChange={(e) => {
                                const selectedTime = e.target.value;
                                const currentDate = newLesson.endAt ? newLesson.endAt.split('T')[0] : new Date().toISOString().split('T')[0];
                                const newEndAt = `${currentDate}T${selectedTime}`;
                                
                                setNewLesson({
                                  ...newLesson,
                                  endAt: newEndAt
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isRecurring"
                              checked={newLesson.isRecurring}
                              onChange={(e) => {
                                const isRecurring = e.target.checked;
                                setNewLesson({
                                  ...newLesson,
                                  isRecurring,
                                  recurrenceEndDate: isRecurring && newLesson.startAt
                                    ? getDefaultRecurrenceEndDate(newLesson.startAt)
                                    : newLesson.recurrenceEndDate,
                                });
                              }}
                            />
                            <label className="form-check-label" htmlFor="isRecurring">
                              <strong>Recurring Lesson</strong>
                            </label>
                          </div>
                        </div>
                        {newLesson.isRecurring && (
                          <div className="mb-3 p-3 border rounded bg-light">
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Recurrence Type</label>
                                <select
                                  className="form-select"
                                  value={newLesson.recurrenceType}
                                  onChange={(e) =>
                                    setNewLesson({
                                      ...newLesson,
                                      recurrenceType: e.target.value,
                                    })
                                  }
                                >
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">End Date (Optional)</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={newLesson.recurrenceEndDate}
                                  min={newLesson.startAt ? newLesson.startAt.split('T')[0] : ''}
                                  onChange={(e) =>
                                    setNewLesson({
                                      ...newLesson,
                                      recurrenceEndDate: e.target.value,
                                    })
                                  }
                                />
                                <small className="text-muted">
                                  Leave empty for no end date. Default: 3 months from start.
                                </small>
                              </div>
                            </div>
                            {newLesson.startAt && (
                              <div className="mt-2">
                                <small className="text-info">
                                  <i className="fas fa-info-circle me-1"></i>
                                  This lesson will repeat {newLesson.recurrenceType === "weekly" ? "every week" : "every month"} on the same day and time
                                  {newLesson.recurrenceEndDate
                                    ? ` until ${new Date(newLesson.recurrenceEndDate).toLocaleDateString("en-AU", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}`
                                    : " indefinitely"}
                                </small>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">
                            Zoom Link (Optional)
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            value={newLesson.zoomLink}
                            onChange={(e) =>
                              setNewLesson({
                                ...newLesson,
                                zoomLink: e.target.value,
                              })
                            }
                            placeholder="https://zoom.us/j/..."
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Preparation Notes (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={newLesson.prepNotes}
                            onChange={(e) =>
                              setNewLesson({
                                ...newLesson,
                                prepNotes: e.target.value,
                              })
                            }
                            placeholder="What should the student prepare for this lesson?"
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Homework (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={newLesson.homework}
                            onChange={(e) =>
                              setNewLesson({
                                ...newLesson,
                                homework: e.target.value,
                              })
                            }
                            placeholder="Homework assignments for after the lesson"
                          ></textarea>
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleCreateLesson}
                        disabled={
                          !newLesson.studentId ||
                          !newLesson.subject ||
                          !newLesson.startAt ||
                          !newLesson.endAt
                        }
                      >
                        Schedule Lesson
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Lesson Modal */}
            {showEditModal && editingLesson && (
              <div
                className="modal fade show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Lesson</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingLesson(null);
                          setUpdateRecurringSeries(false);
                        }}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {editingLesson.seriesId && (
                        <div className="alert alert-warning mb-3">
                          <strong>
                            <i className="fas fa-sync-alt me-2"></i>This is a recurring lesson
                          </strong>
                          <div className="form-check mt-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="updateRecurringSeries"
                              checked={updateRecurringSeries}
                              onChange={(e) => setUpdateRecurringSeries(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="updateRecurringSeries">
                              Apply changes to all lessons in this recurring series
                            </label>
                          </div>
                          {!updateRecurringSeries && (
                            <small className="text-muted d-block mt-2">
                              If unchecked, only this lesson will be updated and it will be removed from the recurring series.
                            </small>
                          )}
                        </div>
                      )}
                      <form>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Subject</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editingLesson.subject || ""}
                              onChange={(e) =>
                                setEditingLesson({
                                  ...editingLesson,
                                  subject: e.target.value,
                                })
                              }
                              placeholder="e.g., Mathematics"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={editingLesson.startAt ? editingLesson.startAt.split('T')[0] : ''}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                const currentTime = editingLesson.startAt ? editingLesson.startAt.split('T')[1] : '09:00';
                                const newStartAt = `${selectedDate}T${currentTime}`;
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(editingLesson.endAt || newStartAt);
                                const duration = (endDate - startDate) / (1000 * 60);
                                endDate.setTime(startDate.getTime() + duration * 60 * 1000);
                                
                                setEditingLesson({
                                  ...editingLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString().slice(0, 16),
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Start Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={editingLesson.startAt ? editingLesson.startAt.split('T')[1] : ''}
                              onChange={(e) => {
                                const selectedTime = e.target.value;
                                const currentDate = editingLesson.startAt ? editingLesson.startAt.split('T')[0] : new Date().toISOString().split('T')[0];
                                const newStartAt = `${currentDate}T${selectedTime}`;
                                const startDate = new Date(newStartAt);
                                const endDate = new Date(editingLesson.endAt || newStartAt);
                                const duration = (endDate - startDate) / (1000 * 60);
                                endDate.setTime(startDate.getTime() + duration * 60 * 1000);
                                
                                setEditingLesson({
                                  ...editingLesson,
                                  startAt: newStartAt,
                                  endAt: endDate.toISOString().slice(0, 16),
                                });
                              }}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">End Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={editingLesson.endAt ? editingLesson.endAt.split('T')[1] : ''}
                              onChange={(e) => {
                                const selectedTime = e.target.value;
                                const currentDate = editingLesson.endAt ? editingLesson.endAt.split('T')[0] : new Date().toISOString().split('T')[0];
                                const newEndAt = `${currentDate}T${selectedTime}`;
                                
                                setEditingLesson({
                                  ...editingLesson,
                                  endAt: newEndAt,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Zoom Link (Optional)
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            value={editingLesson.zoomLink || ""}
                            onChange={(e) =>
                              setEditingLesson({
                                ...editingLesson,
                                zoomLink: e.target.value,
                              })
                            }
                            placeholder="https://zoom.us/j/..."
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Preparation Notes (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editingLesson.prepNotes || ""}
                            onChange={(e) =>
                              setEditingLesson({
                                ...editingLesson,
                                prepNotes: e.target.value,
                              })
                            }
                            placeholder="What should the student prepare for this lesson?"
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Homework (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editingLesson.homework || ""}
                            onChange={(e) =>
                              setEditingLesson({
                                ...editingLesson,
                                homework: e.target.value,
                              })
                            }
                            placeholder="Homework assignments for after the lesson"
                          ></textarea>
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingLesson(null);
                          setUpdateRecurringSeries(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpdateLesson}
                        disabled={
                          !editingLesson.subject ||
                          !editingLesson.startAt ||
                          !editingLesson.endAt
                        }
                      >
                        Update Lesson
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

export default TutorCalendar;
