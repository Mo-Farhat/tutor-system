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
  const [newLesson, setNewLesson] = useState({
    studentId: "",
    subject: "",
    startAt: "",
    endAt: "",
    zoomLink: "",
    prepNotes: "",
    homework: "",
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
  }, []);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
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
          zoomLink: "",
          prepNotes: "",
          homework: "",
        });
      } else {
        alert("Failed to create lesson: " + (res?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to create lesson: " + e.message);
    }
  };

  // Helper functions
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getLessonsForDate = (dateStr) => {
    return lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.startAt).toDateString();
      const targetDate = new Date(dateStr).toDateString();
      return lessonDate === targetDate;
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
                                    >
                                      <span className="tutor-calendar-lesson-title">
                                        {lesson.subject}
                                      </span>
                                      <span className="tutor-calendar-lesson-time ms-1">
                                        {formatTime(lesson.startAt)}
                                      </span>
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
                            </div>
                            <div className="tutor-calendar-upcoming-time text-muted small">
                              {formatDate(lesson.startAt)},{" "}
                              {formatTime(lesson.startAt)} -{" "}
                              {formatTime(lesson.endAt)}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
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
                            <label className="form-label">Start Time</label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={newLesson.startAt}
                              onChange={(e) =>
                                setNewLesson({
                                  ...newLesson,
                                  startAt: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">End Time</label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={newLesson.endAt}
                              onChange={(e) =>
                                setNewLesson({
                                  ...newLesson,
                                  endAt: e.target.value,
                                })
                              }
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorCalendar;
