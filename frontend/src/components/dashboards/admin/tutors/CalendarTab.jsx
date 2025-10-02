import React, { useState } from "react";

const CALENDAR_VIEWS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

const CalendarTab = () => {
  const [calendarView, setCalendarView] = useState(CALENDAR_VIEWS.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock sessions data
  const sessions = [
    {
      id: 1,
      studentName: "John Smith",
      subject: "VCE Chemistry",
      date: new Date(2024, 2, 20, 14, 0),
      duration: 60,
      status: "completed",
    },
    {
      id: 2,
      studentName: "Emily Chen",
      subject: "VCE Biology",
      date: new Date(2024, 2, 21, 16, 0),
      duration: 90,
      status: "completed",
    },
    {
      id: 3,
      studentName: "David Lee",
      subject: "VCE Chemistry",
      date: new Date(2024, 2, 22, 10, 0),
      duration: 60,
      status: "scheduled",
    },
    {
      id: 4,
      studentName: "Sophie Wilson",
      subject: "VCE Biology",
      date: new Date(2024, 2, 25, 15, 30),
      duration: 60,
      status: "completed",
    },
    {
      id: 5,
      studentName: "Alex Thompson",
      subject: "VCE Physics",
      date: new Date(2024, 2, 28, 11, 0),
      duration: 90,
      status: "scheduled",
    },
  ];

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
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const renderDayView = () => {
    const daySessions = getSessionsForDate(selectedDate);
    const dayName = selectedDate.toLocaleDateString("en-AU", {
      weekday: "long",
    });
    const dayNumber = selectedDate.getDate();
    const monthName = selectedDate.toLocaleDateString("en-AU", {
      month: "long",
    });
    const year = selectedDate.getFullYear();

    return (
      <div className="calendar-day-view">
        <div className="calendar-day-header mb-3">
          <h5 className="mb-0">
            {dayName}, {monthName} {dayNumber}, {year}
          </h5>
        </div>
        <div className="calendar-day-sessions">
          {daySessions.length > 0 ? (
            daySessions.map((session, idx) => (
              <div key={idx} className="calendar-session-card mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{session.studentName}</h6>
                    <p className="text-muted mb-1">{session.subject}</p>
                    <small className="text-primary">
                      {session.date.toLocaleTimeString("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      - {session.duration} minutes
                    </small>
                  </div>
                  <span
                    className={`badge bg-${
                      session.status === "completed"
                        ? "success"
                        : session.status === "scheduled"
                        ? "primary"
                        : "secondary"
                    }`}
                  >
                    {session.status.charAt(0).toUpperCase() +
                      session.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-4">
              <i className="fas fa-calendar-times fa-2x mb-2"></i>
              <p>No sessions scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="calendar-week-view">
        <div className="calendar-week-header mb-3">
          <h5 className="mb-0">
            Week of{" "}
            {startOfWeek.toLocaleDateString("en-AU", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekDays[6].toLocaleDateString("en-AU", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h5>
        </div>
        <div className="table-responsive">
          <table className="table table-sm tutor-calendar-table">
            <thead>
              <tr>
                {weekDays.map((day, idx) => (
                  <th key={idx} className="text-center">
                    <div>{daysShort[day.getDay()]}</div>
                    <div className="fw-bold">{day.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDays.map((day, idx) => {
                  const daySessions = getSessionsForDate(day);
                  return (
                    <td
                      key={idx}
                      className="align-top"
                      style={{ height: "200px" }}
                    >
                      {daySessions.map((session, sessionIdx) => (
                        <div
                          key={sessionIdx}
                          className="session-indicator mb-1"
                        >
                          <small className="text-primary">
                            {session.date.toLocaleTimeString("en-AU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                          <div className="session-title">
                            {session.studentName} - {session.subject}
                          </div>
                        </div>
                      ))}
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

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const monthMatrix = getMonthMatrix(year, month);
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="calendar-month-view">
        <div className="table-responsive">
          <table className="table table-sm tutor-calendar-table">
            <thead>
              <tr>
                {daysShort.map((d) => (
                  <th key={d} className="text-center">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthMatrix.map((week, i) => (
                <tr key={i}>
                  {week.map((date, j) => {
                    const daySessions = getSessionsForDate(date);
                    return (
                      <td
                        key={j}
                        className={`align-top ${date ? "" : "bg-light"}`}
                      >
                        {date && (
                          <div>
                            <div className="fw-bold">{date.getDate()}</div>
                            {daySessions.map((session, idx) => (
                              <div key={idx} className="session-indicator mt-1">
                                <small className="text-primary">
                                  {session.date.toLocaleTimeString("en-AU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                                <div className="session-title">
                                  {session.studentName} - {session.subject}
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
    );
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

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  return (
    <div className="tutor-profile-calendar">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Tutor Calendar - Available Classes</h6>
        <div className="btn-group">
          {Object.values(CALENDAR_VIEWS).map((view) => (
            <button
              key={view}
              className={`btn btn-sm ${
                calendarView === view ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCalendarView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-navigation mb-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              const newDate = new Date(selectedDate);
              if (calendarView === CALENDAR_VIEWS.DAY) {
                newDate.setDate(selectedDate.getDate() - 1);
              } else if (calendarView === CALENDAR_VIEWS.WEEK) {
                newDate.setDate(selectedDate.getDate() - 7);
              } else {
                newDate.setMonth(selectedDate.getMonth() - 1);
              }
              setSelectedDate(newDate);
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h5 className="mb-0">
            {calendarView === CALENDAR_VIEWS.DAY
              ? `${monthNames[month]} ${selectedDate.getDate()}, ${year}`
              : calendarView === CALENDAR_VIEWS.WEEK
              ? `Week of ${monthNames[month]} ${year}`
              : `${monthNames[month]} ${year}`}
          </h5>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              const newDate = new Date(selectedDate);
              if (calendarView === CALENDAR_VIEWS.DAY) {
                newDate.setDate(selectedDate.getDate() + 1);
              } else if (calendarView === CALENDAR_VIEWS.WEEK) {
                newDate.setDate(selectedDate.getDate() + 7);
              } else {
                newDate.setMonth(selectedDate.getMonth() + 1);
              }
              setSelectedDate(newDate);
            }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {calendarView === CALENDAR_VIEWS.DAY && renderDayView()}
      {calendarView === CALENDAR_VIEWS.WEEK && renderWeekView()}
      {calendarView === CALENDAR_VIEWS.MONTH && renderMonthView()}
    </div>
  );
};

export default CalendarTab;


