import React, { useState, useEffect } from "react";
import {
  SESSION_STATUS,
  SESSION_STATUS_LABELS,
  CALENDAR_VIEWS,
  COMMON_SUBJECTS,
} from "../constants/adminConstants";
import "../../../../css/dashboards/admin/calendar/calendar.css";

function AdminCalendar() {
  const [currentView, setCurrentView] = useState(CALENDAR_VIEWS.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFilters, setSelectedFilters] = useState({
    tutor: "",
    subject: "",
    status: "",
  });
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showZoomRegistry, setShowZoomRegistry] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionMaterials, setSessionMaterials] = useState([]);
  const [zoomLinks, setZoomLinks] = useState([]);

  // Mock session data
  useEffect(() => {
    const mockSessions = [
      // March 2024 sessions
      {
        id: 1,
        title: "VCE Chemistry - John Smith",
        tutor: "Sarah Johnson",
        student: "John Smith",
        studentEmail: "john.smith@email.com",
        subject: "Chemistry",
        date: new Date(2024, 2, 20, 14, 0), // March 20, 2024, 2:00 PM
        duration: 60,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/123456789",
        zoomLinkType: "recurring",
        notes: "Review organic chemistry concepts",
        materials: [
          { name: "Organic Chemistry Slides", type: "PDF", url: "#" },
          { name: "Practice Problems", type: "PDF", url: "#" },
        ],
        isRecurring: false,
        recurringPattern: null,
        tutorEmail: "sarah.johnson@email.com",
        zoomLinkVerified: true,
        studentNotified: true,
        tutorReminded: false,
      },
      {
        id: 2,
        title: "Mathematics Methods - Emily Chen",
        tutor: "Michael Brown",
        student: "Emily Chen",
        subject: "Mathematics",
        date: new Date(2024, 2, 20, 16, 30), // March 20, 2024, 4:30 PM
        duration: 90,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/987654321",
        notes: "Practice calculus problems",
      },
      {
        id: 3,
        title: "Physics - David Lee",
        tutor: "Sarah Johnson",
        student: "David Lee",
        subject: "Physics",
        date: new Date(2024, 2, 21, 10, 0), // March 21, 2024, 10:00 AM
        duration: 60,
        status: SESSION_STATUS.COMPLETED,
        zoomLink: "https://zoom.us/j/456789123",
        notes: "Completed mechanics review",
      },
      {
        id: 4,
        title: "English Literature - Olivia Wilson",
        tutor: "Jennifer Davis",
        student: "Olivia Wilson",
        subject: "English",
        date: new Date(2024, 2, 21, 15, 0), // March 21, 2024, 3:00 PM
        duration: 75,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/789123456",
        notes: "Essay writing techniques",
      },
      {
        id: 5,
        title: "Biology - James Green",
        tutor: "Michael Brown",
        student: "James Green",
        subject: "Biology",
        date: new Date(2024, 2, 22, 11, 30), // March 22, 2024, 11:30 AM
        duration: 60,
        status: SESSION_STATUS.CANCELLED,
        zoomLink: "",
        notes: "Cancelled due to illness",
      },
      {
        id: 6,
        title: "UCAT Prep - Alex Taylor",
        tutor: "Dr. Sarah Johnson",
        student: "Alex Taylor",
        subject: "UCAT",
        date: new Date(2024, 2, 25, 9, 0), // March 25, 2024, 9:00 AM
        duration: 120,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/111222333",
        notes: "Verbal reasoning practice",
      },
      {
        id: 7,
        title: "Legal Studies - Mia Rodriguez",
        tutor: "Jennifer Davis",
        student: "Mia Rodriguez",
        subject: "Legal Studies",
        date: new Date(2024, 2, 26, 13, 0), // March 26, 2024, 1:00 PM
        duration: 60,
        status: SESSION_STATUS.COMPLETED,
        zoomLink: "https://zoom.us/j/444555666",
        notes: "Constitutional law review",
      },
      {
        id: 8,
        title: "Economics - Ryan Kim",
        tutor: "Michael Brown",
        student: "Ryan Kim",
        subject: "Economics",
        date: new Date(2024, 2, 27, 16, 0), // March 27, 2024, 4:00 PM
        duration: 90,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/777888999",
        notes: "Microeconomics concepts",
      },

      // September 2025 sessions (current month in the image)
      {
        id: 9,
        title: "VCE Chemistry - Emma Thompson",
        tutor: "Dr. Sarah Johnson",
        student: "Emma Thompson",
        subject: "Chemistry",
        date: new Date(2025, 8, 5, 14, 0), // September 5, 2025, 2:00 PM
        duration: 60,
        status: SESSION_STATUS.COMPLETED,
        zoomLink: "https://zoom.us/j/555666777",
        notes: "Organic chemistry fundamentals",
      },
      {
        id: 10,
        title: "Mathematics Methods - Liam O'Connor",
        tutor: "Michael Brown",
        student: "Liam O'Connor",
        subject: "Mathematics",
        date: new Date(2025, 8, 8, 16, 0), // September 8, 2025, 4:00 PM
        duration: 90,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/888999000",
        notes: "Calculus integration techniques",
      },
      {
        id: 11,
        title: "Physics - Sophie Chen",
        tutor: "Dr. Sarah Johnson",
        student: "Sophie Chen",
        subject: "Physics",
        date: new Date(2025, 8, 10, 10, 30), // September 10, 2025, 10:30 AM
        duration: 60,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/111222444",
        notes: "Quantum mechanics introduction",
      },
      {
        id: 12,
        title: "English Literature - Noah Patel",
        tutor: "Jennifer Davis",
        student: "Noah Patel",
        subject: "English",
        date: new Date(2025, 8, 10, 15, 0), // September 10, 2025, 3:00 PM
        duration: 75,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/333444555",
        notes: "Shakespeare analysis techniques",
      },
      {
        id: 13,
        title: "Biology - Isabella Rodriguez",
        tutor: "Michael Brown",
        student: "Isabella Rodriguez",
        subject: "Biology",
        date: new Date(2025, 8, 12, 11, 0), // September 12, 2025, 11:00 AM
        duration: 60,
        status: SESSION_STATUS.COMPLETED,
        zoomLink: "https://zoom.us/j/666777888",
        notes: "Cell division and mitosis",
      },
      {
        id: 14,
        title: "UCAT Prep - Ethan Williams",
        tutor: "Dr. Sarah Johnson",
        student: "Ethan Williams",
        subject: "UCAT",
        date: new Date(2025, 8, 15, 9, 30), // September 15, 2025, 9:30 AM
        duration: 120,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/999000111",
        notes: "Abstract reasoning practice",
      },
      {
        id: 15,
        title: "Legal Studies - Ava Singh",
        tutor: "Jennifer Davis",
        student: "Ava Singh",
        subject: "Legal Studies",
        date: new Date(2025, 8, 18, 13, 30), // September 18, 2025, 1:30 PM
        duration: 60,
        status: SESSION_STATUS.CANCELLED,
        zoomLink: "",
        notes: "Cancelled - student emergency",
      },
      {
        id: 16,
        title: "Economics - Mason Lee",
        tutor: "Michael Brown",
        student: "Mason Lee",
        subject: "Economics",
        date: new Date(2025, 8, 20, 16, 30), // September 20, 2025, 4:30 PM
        duration: 90,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/222333444",
        notes: "Macroeconomics principles",
      },
      {
        id: 17,
        title: "Psychology - Charlotte Brown",
        tutor: "Jennifer Davis",
        student: "Charlotte Brown",
        subject: "Psychology",
        date: new Date(2025, 8, 22, 14, 0), // September 22, 2025, 2:00 PM
        duration: 60,
        status: SESSION_STATUS.COMPLETED,
        zoomLink: "https://zoom.us/j/555666777",
        notes: "Cognitive development theories",
      },
      {
        id: 18,
        title: "History - Oliver Taylor",
        tutor: "Dr. Sarah Johnson",
        student: "Oliver Taylor",
        subject: "History",
        date: new Date(2025, 8, 25, 11, 30), // September 25, 2025, 11:30 AM
        duration: 75,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/888999111",
        notes: "World War II analysis",
      },
      {
        id: 19,
        title: "Geography - Grace Wilson",
        tutor: "Michael Brown",
        student: "Grace Wilson",
        subject: "Geography",
        date: new Date(2025, 8, 28, 15, 0), // September 28, 2025, 3:00 PM
        duration: 60,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/111222333",
        notes: "Climate change impacts",
      },

      // October 2025 sessions
      {
        id: 20,
        title: "VCE Chemistry - Jack Anderson",
        tutor: "Dr. Sarah Johnson",
        student: "Jack Anderson",
        subject: "Chemistry",
        date: new Date(2025, 9, 2, 14, 0), // October 2, 2025, 2:00 PM
        duration: 60,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/444555666",
        notes: "Chemical bonding review",
      },
      {
        id: 21,
        title: "Mathematics Methods - Ruby Chen",
        tutor: "Michael Brown",
        student: "Ruby Chen",
        subject: "Mathematics",
        date: new Date(2025, 9, 5, 16, 0), // October 5, 2025, 4:00 PM
        duration: 90,
        status: SESSION_STATUS.SCHEDULED,
        zoomLink: "https://zoom.us/j/777888999",
        notes: "Trigonometric functions",
      },
      {
        id: 22,
        title: "Physics - Lucas Martinez",
        tutor: "Dr. Sarah Johnson",
        student: "Lucas Martinez",
        subject: "Physics",
        date: new Date(2025, 9, 8, 10, 0), // October 8, 2025, 10:00 AM
        duration: 60,
        status: SESSION_STATUS.COMPLETED,
        zoomLink: "https://zoom.us/j/000111222",
        notes: "Electromagnetic waves",
      },
    ];
    setSessions(mockSessions);

    // Mock Zoom links registry
    const mockZoomLinks = [
      {
        id: 1,
        tutor: "Sarah Johnson",
        tutorEmail: "sarah.johnson@email.com",
        recurringLink: "https://zoom.us/j/123456789",
        oneTimeLinks: [
          {
            id: 1,
            link: "https://zoom.us/j/111111111",
            used: false,
            sessionId: null,
          },
          {
            id: 2,
            link: "https://zoom.us/j/222222222",
            used: true,
            sessionId: 1,
          },
        ],
        lastUpdated: "2024-03-15",
        isActive: true,
        totalSessions: 45,
        upcomingSessions: 3,
      },
      {
        id: 2,
        tutor: "Michael Brown",
        tutorEmail: "michael.brown@email.com",
        recurringLink: "https://zoom.us/j/987654321",
        oneTimeLinks: [
          {
            id: 3,
            link: "https://zoom.us/j/333333333",
            used: false,
            sessionId: null,
          },
          {
            id: 4,
            link: "https://zoom.us/j/444444444",
            used: false,
            sessionId: null,
          },
        ],
        lastUpdated: "2024-03-10",
        isActive: true,
        totalSessions: 32,
        upcomingSessions: 2,
      },
      {
        id: 3,
        tutor: "Jennifer Davis",
        tutorEmail: "jennifer.davis@email.com",
        recurringLink: "",
        oneTimeLinks: [
          {
            id: 5,
            link: "https://zoom.us/j/555555555",
            used: true,
            sessionId: 4,
          },
          {
            id: 6,
            link: "https://zoom.us/j/666666666",
            used: false,
            sessionId: null,
          },
        ],
        lastUpdated: "2024-03-05",
        isActive: false,
        totalSessions: 18,
        upcomingSessions: 1,
      },
    ];
    setZoomLinks(mockZoomLinks);
  }, []);

  const getMonthMatrix = (year, month) => {
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
  };

  const getSessionsForDate = (date) => {
    if (!date) return [];
    return getFilteredSessions().filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const getFilteredSessions = () => {
    return sessions.filter((session) => {
      const matchesTutor =
        !selectedFilters.tutor || session.tutor === selectedFilters.tutor;
      const matchesSubject =
        !selectedFilters.subject || session.subject === selectedFilters.subject;
      const matchesStatus =
        !selectedFilters.status || session.status === selectedFilters.status;
      return matchesTutor && matchesSubject && matchesStatus;
    });
  };

  const getUniqueTutors = () => {
    return [...new Set(sessions.map((session) => session.tutor))];
  };

  const getUniqueSubjects = () => {
    return [...new Set(sessions.map((session) => session.subject))];
  };

  const handleSessionStatusChange = (sessionId, newStatus) => {
    setSessions(
      sessions.map((session) =>
        session.id === sessionId ? { ...session, status: newStatus } : session
      )
    );
  };

  const handleSessionUpdate = (updatedSession) => {
    setSessions(
      sessions.map((session) =>
        session.id === updatedSession.id ? updatedSession : session
      )
    );
    setEditingSession(null);
    setIsEditingSession(false);
  };

  const handleDuplicateSession = (session) => {
    const newSession = {
      ...session,
      id: Math.max(...sessions.map((s) => s.id)) + 1,
      date: new Date(session.date.getTime() + 7 * 24 * 60 * 60 * 1000), // Add 1 week
      status: SESSION_STATUS.SCHEDULED,
      title: `${session.title} (Copy)`,
    };
    setSessions([...sessions, newSession]);
    setShowDuplicateModal(false);
  };

  const handleRescheduleSession = (sessionId, newDate) => {
    setSessions(
      sessions.map((session) =>
        session.id === sessionId ? { ...session, date: newDate } : session
      )
    );
    setShowRescheduleModal(false);
  };

  const handleZoomLinkUpdate = (tutorId, newLink) => {
    setZoomLinks(
      zoomLinks.map((link) =>
        link.id === tutorId
          ? {
              ...link,
              recurringLink: newLink,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : link
      )
    );
  };

  const handleNotifyStudent = (sessionId) => {
    setSessions(
      sessions.map((session) =>
        session.id === sessionId
          ? { ...session, studentNotified: true }
          : session
      )
    );
  };

  const handleRemindTutor = (sessionId) => {
    setSessions(
      sessions.map((session) =>
        session.id === sessionId ? { ...session, tutorReminded: true } : session
      )
    );
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setShowSessionDetail(true);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (currentView === CALENDAR_VIEWS.DAY) {
      newDate.setDate(newDate.getDate() + direction);
    } else if (currentView === CALENDAR_VIEWS.WEEK) {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (currentView === CALENDAR_VIEWS.MONTH) {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

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

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const monthMatrix = getMonthMatrix(year, month);

    return (
      <div className="admin-calendar-month-view">
        <div className="table-responsive">
          <table className="table admin-calendar-table mb-0">
            <thead>
              <tr>
                {daysShort.map((d) => (
                  <th key={d} className="admin-calendar-th text-center">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthMatrix.map((week, i) => (
                <tr key={i}>
                  {week.map((date, j) => {
                    const sessions = date ? getSessionsForDate(date) : [];
                    return (
                      <td
                        key={j}
                        className={`admin-calendar-td align-top ${
                          date ? "" : "admin-calendar-empty"
                        }`}
                      >
                        {date && (
                          <div className="admin-calendar-date-cell">
                            <div className="admin-calendar-date-num">
                              {date.getDate()}
                            </div>
                            {sessions.map((session, idx) => (
                              <div
                                className={`admin-calendar-session-card mt-1 ${session.status}`}
                                key={idx}
                                onClick={() => handleSessionClick(session)}
                              >
                                <div className="admin-calendar-session-content">
                                  <span className="admin-calendar-session-title">
                                    {session.title}
                                  </span>
                                  <span className="admin-calendar-session-time">
                                    {session.date.toLocaleTimeString("en-AU", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <i
                                  className={`fas ${
                                    session.status === SESSION_STATUS.COMPLETED
                                      ? "fa-check-circle"
                                      : session.status ===
                                        SESSION_STATUS.SCHEDULED
                                      ? "fa-clock"
                                      : "fa-times-circle"
                                  } 
                                  admin-calendar-session-icon`}
                                ></i>
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
    );
  };

  const renderDayView = () => {
    const daySessions = getSessionsForDate(selectedDate);

    return (
      <div className="admin-calendar-day-view">
        <div className="admin-calendar-day-header">
          <h5>
            {selectedDate.toLocaleDateString("en-AU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h5>
        </div>
        <div className="admin-calendar-day-sessions">
          {daySessions.length === 0 ? (
            <div className="admin-calendar-empty-day">
              <p className="text-muted">No sessions scheduled for this day</p>
            </div>
          ) : (
            daySessions.map((session) => (
              <div
                key={session.id}
                className={`admin-calendar-session-card-detailed ${session.status}`}
                onClick={() => handleSessionClick(session)}
              >
                <div className="admin-calendar-session-time">
                  {session.date.toLocaleTimeString("en-AU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="admin-calendar-session-details">
                  <div className="admin-calendar-session-title">
                    {session.title}
                  </div>
                  <div className="admin-calendar-session-tutor">
                    {session.tutor}
                  </div>
                  <div className="admin-calendar-session-duration">
                    {session.duration} min
                  </div>
                </div>
                <div className="admin-calendar-session-status">
                  <span
                    className={`badge bg-${
                      session.status === SESSION_STATUS.SCHEDULED
                        ? "primary"
                        : session.status === SESSION_STATUS.COMPLETED
                        ? "success"
                        : "danger"
                    }`}
                  >
                    {SESSION_STATUS_LABELS[session.status]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="admin-calendar-week-view">
        <div className="table-responsive">
          <table className="table admin-calendar-table mb-0">
            <thead>
              <tr>
                {weekDays.map((day, index) => (
                  <th key={index} className="admin-calendar-th text-center">
                    <div className="admin-calendar-week-day-name">
                      {day.toLocaleDateString("en-AU", { weekday: "short" })}
                    </div>
                    <div className="admin-calendar-week-day-number">
                      {day.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDays.map((day, index) => {
                  const daySessions = getSessionsForDate(day);
                  return (
                    <td key={index} className="admin-calendar-td align-top">
                      <div className="admin-calendar-date-cell">
                        {daySessions.map((session, idx) => (
                          <div
                            className={`admin-calendar-session-card-week ${session.status}`}
                            key={idx}
                            onClick={() => handleSessionClick(session)}
                          >
                            <span className="admin-calendar-session-title-small">
                              {session.title}
                            </span>
                            <span className="admin-calendar-session-time-small">
                              {session.date.toLocaleTimeString("en-AU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-calendar-container">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="admin-calendar-content">
              {/* Header */}
              <div className="admin-calendar-header mb-4">
                <h2 className="admin-calendar-page-title mb-0">
                  Session Calendar
                </h2>
              </div>

              {/* Filters */}
              <div className="admin-calendar-filters mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <i className="fas fa-filter me-1"></i>
                      Filters
                    </button>
                    <button
                      className="btn btn-outline-info"
                      onClick={() => setShowZoomRegistry(true)}
                    >
                      <i className="fas fa-video me-1"></i>
                      Zoom Registry
                    </button>
                  </div>
                  <div className="admin-calendar-stats">
                    <span className="badge bg-primary me-2">
                      Total: {sessions.length}
                    </span>
                    <span className="badge bg-success me-2">
                      Scheduled:{" "}
                      {
                        sessions.filter(
                          (s) => s.status === SESSION_STATUS.SCHEDULED
                        ).length
                      }
                    </span>
                    <span className="badge bg-warning">
                      No Zoom Link:{" "}
                      {
                        sessions.filter((s) => !s.zoomLink || s.zoomLink === "")
                          .length
                      }
                    </span>
                  </div>
                </div>

                {showFilters && (
                  <div className="admin-calendar-filters-panel mt-3 p-3 bg-light rounded">
                    <div className="row">
                      <div className="col-md-4">
                        <label className="form-label">Tutor</label>
                        <select
                          className="form-select"
                          value={selectedFilters.tutor}
                          onChange={(e) =>
                            setSelectedFilters({
                              ...selectedFilters,
                              tutor: e.target.value,
                            })
                          }
                        >
                          <option value="">All Tutors</option>
                          {getUniqueTutors().map((tutor) => (
                            <option key={tutor} value={tutor}>
                              {tutor}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Subject</label>
                        <select
                          className="form-select"
                          value={selectedFilters.subject}
                          onChange={(e) =>
                            setSelectedFilters({
                              ...selectedFilters,
                              subject: e.target.value,
                            })
                          }
                        >
                          <option value="">All Subjects</option>
                          {getUniqueSubjects().map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={selectedFilters.status}
                          onChange={(e) =>
                            setSelectedFilters({
                              ...selectedFilters,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="">All Statuses</option>
                          <option value={SESSION_STATUS.SCHEDULED}>
                            Scheduled
                          </option>
                          <option value={SESSION_STATUS.COMPLETED}>
                            Completed
                          </option>
                          <option value={SESSION_STATUS.CANCELLED}>
                            Cancelled
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          setSelectedFilters({
                            tutor: "",
                            subject: "",
                            status: "",
                          })
                        }
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Calendar View */}
              <div className="admin-calendar-section">
                <div className="d-flex flex-wrap align-items-center justify-content-between admin-calendar-calendar-header mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-link admin-calendar-nav-btn"
                      aria-label="Previous"
                      onClick={() => navigateDate(-1)}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <h4 className="admin-calendar-title mb-0">
                      {currentView === CALENDAR_VIEWS.MONTH
                        ? `${
                            monthNames[selectedDate.getMonth()]
                          } ${selectedDate.getFullYear()}`
                        : currentView === CALENDAR_VIEWS.WEEK
                        ? `Week of ${selectedDate.toLocaleDateString("en-AU", {
                            month: "short",
                            day: "numeric",
                          })}`
                        : selectedDate.toLocaleDateString("en-AU", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                    </h4>
                    <button
                      className="btn btn-link admin-calendar-nav-btn"
                      aria-label="Next"
                      onClick={() => navigateDate(1)}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>

                  <div className="admin-calendar-view-controls">
                    <div className="btn-group">
                      {Object.values(CALENDAR_VIEWS).map((view) => (
                        <button
                          key={view}
                          className={`btn ${
                            currentView === view
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => setCurrentView(view)}
                        >
                          {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="admin-calendar-calendar-section mb-4">
                  {currentView === CALENDAR_VIEWS.DAY && renderDayView()}
                  {currentView === CALENDAR_VIEWS.WEEK && renderWeekView()}
                  {currentView === CALENDAR_VIEWS.MONTH && renderMonthView()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {showSessionDetail && selectedSession && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Session Details - {selectedSession.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSessionDetail(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="admin-calendar-session-info">
                      <h6>Session Information</h6>
                      <div className="session-detail-item">
                        <strong>Title:</strong> {selectedSession.title}
                      </div>
                      <div className="session-detail-item">
                        <strong>Tutor:</strong> {selectedSession.tutor}
                      </div>
                      <div className="session-detail-item">
                        <strong>Student:</strong> {selectedSession.student}
                      </div>
                      <div className="session-detail-item">
                        <strong>Subject:</strong> {selectedSession.subject}
                      </div>
                      <div className="session-detail-item">
                        <strong>Date:</strong>{" "}
                        {selectedSession.date.toLocaleDateString("en-AU")}
                      </div>
                      <div className="session-detail-item">
                        <strong>Time:</strong>{" "}
                        {selectedSession.date.toLocaleTimeString("en-AU")}
                      </div>
                      <div className="session-detail-item">
                        <strong>Duration:</strong> {selectedSession.duration}{" "}
                        minutes
                      </div>
                      <div className="session-detail-item">
                        <strong>Status:</strong>
                        <span
                          className={`badge bg-${
                            selectedSession.status === SESSION_STATUS.SCHEDULED
                              ? "primary"
                              : selectedSession.status ===
                                SESSION_STATUS.COMPLETED
                              ? "success"
                              : "danger"
                          } ms-2`}
                        >
                          {SESSION_STATUS_LABELS[selectedSession.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-calendar-session-details">
                      <h6>Zoom & Communication</h6>
                      <div className="session-detail-item">
                        <strong>Zoom Link:</strong>
                        {selectedSession.zoomLink ? (
                          <div className="d-flex align-items-center gap-2">
                            <a
                              href={selectedSession.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fas fa-video me-1"></i>Join Session
                            </a>
                            <span
                              className={`badge bg-${
                                selectedSession.zoomLinkVerified
                                  ? "success"
                                  : "warning"
                              }`}
                            >
                              {selectedSession.zoomLinkVerified
                                ? "Verified"
                                : "Unverified"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-danger">No link provided</span>
                        )}
                      </div>
                      <div className="session-detail-item">
                        <strong>Student Notified:</strong>
                        <span
                          className={`badge bg-${
                            selectedSession.studentNotified
                              ? "success"
                              : "warning"
                          } ms-2`}
                        >
                          {selectedSession.studentNotified ? "Yes" : "No"}
                        </span>
                        {!selectedSession.studentNotified && (
                          <button
                            className="btn btn-sm btn-outline-info ms-2"
                            onClick={() =>
                              handleNotifyStudent(selectedSession.id)
                            }
                          >
                            <i className="fas fa-envelope me-1"></i>Notify
                          </button>
                        )}
                      </div>
                      <div className="session-detail-item">
                        <strong>Tutor Reminded:</strong>
                        <span
                          className={`badge bg-${
                            selectedSession.tutorReminded
                              ? "success"
                              : "warning"
                          } ms-2`}
                        >
                          {selectedSession.tutorReminded ? "Yes" : "No"}
                        </span>
                        {!selectedSession.tutorReminded && (
                          <button
                            className="btn btn-sm btn-outline-warning ms-2"
                            onClick={() =>
                              handleRemindTutor(selectedSession.id)
                            }
                          >
                            <i className="fas fa-bell me-1"></i>Remind
                          </button>
                        )}
                      </div>
                      <div className="session-detail-item">
                        <strong>Notes:</strong>
                        <div className="session-notes">
                          {selectedSession.notes}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSession.materials &&
                  selectedSession.materials.length > 0 && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <h6>Session Materials</h6>
                        <div className="session-materials">
                          {selectedSession.materials.map((material, index) => (
                            <div key={index} className="material-item">
                              <div className="material-info">
                                <div className="material-name">
                                  {material.name}
                                </div>
                                <div className="material-type">
                                  {material.type}
                                </div>
                              </div>
                              <div className="material-actions">
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="fas fa-download me-1"></i>
                                  Download
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  <i className="fas fa-eye me-1"></i>View
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSessionDetail(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingSession(selectedSession);
                    setIsEditingSession(true);
                  }}
                >
                  <i className="fas fa-edit me-1"></i>Edit Session
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => setShowRescheduleModal(true)}
                >
                  <i className="fas fa-calendar-plus me-1"></i>Reschedule
                </button>
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={() => setShowDuplicateModal(true)}
                >
                  <i className="fas fa-copy me-1"></i>Duplicate
                </button>
                <div className="btn-group">
                  <button
                    type="button"
                    className={`btn ${
                      selectedSession.status === SESSION_STATUS.COMPLETED
                        ? "btn-outline-success"
                        : "btn-success"
                    }`}
                    onClick={() =>
                      handleSessionStatusChange(
                        selectedSession.id,
                        SESSION_STATUS.COMPLETED
                      )
                    }
                    disabled={
                      selectedSession.status === SESSION_STATUS.COMPLETED
                    }
                  >
                    <i className="fas fa-check me-1"></i>Mark Completed
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      selectedSession.status === SESSION_STATUS.CANCELLED
                        ? "btn-outline-danger"
                        : "btn-danger"
                    }`}
                    onClick={() =>
                      handleSessionStatusChange(
                        selectedSession.id,
                        SESSION_STATUS.CANCELLED
                      )
                    }
                    disabled={
                      selectedSession.status === SESSION_STATUS.CANCELLED
                    }
                  >
                    <i className="fas fa-times me-1"></i>Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Registry Modal */}
      {showZoomRegistry && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-video me-2"></i>
                  Zoom Link Registry
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowZoomRegistry(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="zoom-registry-stats mb-4">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-number">{zoomLinks.length}</div>
                        <div className="stat-label">Total Tutors</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-number">
                          {zoomLinks.filter((z) => z.isActive).length}
                        </div>
                        <div className="stat-label">Active Links</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-number">
                          {zoomLinks.filter((z) => !z.recurringLink).length}
                        </div>
                        <div className="stat-label">Missing Recurring</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-number">
                          {zoomLinks.reduce(
                            (sum, z) => sum + z.upcomingSessions,
                            0
                          )}
                        </div>
                        <div className="stat-label">Upcoming Sessions</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="zoom-registry-list">
                  {zoomLinks.map((zoomLink) => (
                    <div key={zoomLink.id} className="zoom-link-item">
                      <div className="zoom-link-header">
                        <div className="zoom-link-tutor">
                          <h6>{zoomLink.tutor}</h6>
                          <small className="text-muted">
                            {zoomLink.tutorEmail}
                          </small>
                        </div>
                        <div className="zoom-link-status">
                          <span
                            className={`badge bg-${
                              zoomLink.isActive ? "success" : "danger"
                            }`}
                          >
                            {zoomLink.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="zoom-link-content">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="zoom-link-section">
                              <h6>Recurring Link</h6>
                              {zoomLink.recurringLink ? (
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={zoomLink.recurringLink}
                                    readOnly
                                  />
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-copy"></i>
                                  </button>
                                  <button className="btn btn-sm btn-outline-warning">
                                    <i className="fas fa-edit"></i>
                                  </button>
                                </div>
                              ) : (
                                <div className="alert alert-warning">
                                  <i className="fas fa-exclamation-triangle me-2"></i>
                                  No recurring link set. Tutor needs to add one.
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="zoom-link-section">
                              <h6>One-Time Links</h6>
                              <div className="one-time-links">
                                {zoomLink.oneTimeLinks.map((link) => (
                                  <div
                                    key={link.id}
                                    className="one-time-link-item"
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={link.link}
                                        readOnly
                                      />
                                      <span
                                        className={`badge bg-${
                                          link.used ? "secondary" : "success"
                                        }`}
                                      >
                                        {link.used ? "Used" : "Available"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="zoom-link-footer">
                          <div className="zoom-link-stats">
                            <span className="stat-item">
                              <strong>Total Sessions:</strong>{" "}
                              {zoomLink.totalSessions}
                            </span>
                            <span className="stat-item">
                              <strong>Upcoming:</strong>{" "}
                              {zoomLink.upcomingSessions}
                            </span>
                            <span className="stat-item">
                              <strong>Last Updated:</strong>{" "}
                              {zoomLink.lastUpdated}
                            </span>
                          </div>
                          <div className="zoom-link-actions">
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="fas fa-sync me-1"></i>Reset Links
                            </button>
                            <button className="btn btn-sm btn-outline-success">
                              <i className="fas fa-plus me-1"></i>Add One-Time
                            </button>
                            <button className="btn btn-sm btn-outline-info">
                              <i className="fas fa-envelope me-1"></i>Remind
                              Tutor
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowZoomRegistry(false)}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-download me-1"></i>Export Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedSession && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reschedule Session</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRescheduleModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">New Date</label>
                  <input
                    type="date"
                    className="form-control"
                    defaultValue={
                      selectedSession.date.toISOString().split("T")[0]
                    }
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">New Time</label>
                  <input
                    type="time"
                    className="form-control"
                    defaultValue={selectedSession.date
                      .toTimeString()
                      .slice(0, 5)}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Reason for Reschedule</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter reason for rescheduling..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    // Handle reschedule logic
                    setShowRescheduleModal(false);
                  }}
                >
                  Reschedule Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && selectedSession && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Duplicate Session</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDuplicateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  This will create a copy of the session "
                  {selectedSession.title}" scheduled for one week later.
                </p>
                <div className="form-group mb-3">
                  <label className="form-label">New Date</label>
                  <input
                    type="date"
                    className="form-control"
                    defaultValue={
                      new Date(
                        selectedSession.date.getTime() + 7 * 24 * 60 * 60 * 1000
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">New Time</label>
                  <input
                    type="time"
                    className="form-control"
                    defaultValue={selectedSession.date
                      .toTimeString()
                      .slice(0, 5)}
                  />
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="recurringSeries"
                  />
                  <label className="form-check-label" htmlFor="recurringSeries">
                    Create recurring series (weekly)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDuplicateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleDuplicateSession(selectedSession)}
                >
                  Duplicate Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCalendar;
