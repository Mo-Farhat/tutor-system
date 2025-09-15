import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/student/scheduling/scheduling.css';

const upcomingSessions = [
  {
    title: 'Math Tutoring',
    tutor: 'Dr. Sarah Johnson',
    date: 'Today',
    time: '3:00 PM - 4:00 PM',
    subject: 'Algebra',
    joinUrl: '#',
    status: 'confirmed'
  },
  {
    title: 'Science Lab Session',
    tutor: 'Prof. Michael Chen',
    date: 'Tomorrow',
    time: '10:00 AM - 11:30 AM',
    subject: 'Physics',
    joinUrl: '#',
    status: 'confirmed'
  },
  {
    title: 'Essay Writing Workshop',
    tutor: 'Ms. Emily Davis',
    date: 'Jan 8, 2025',
    time: '2:00 PM - 3:30 PM',
    subject: 'English',
    joinUrl: '#',
    status: 'pending'
  }
];

const sessionHistory = [
  { date: '2025-01-06', lessons: [{ title: 'Math - Algebra', time: '3:00 PM', tutor: 'Dr. Sarah Johnson', status: 'completed' }] },
  { date: '2025-01-04', lessons: [{ title: 'Science Lab', time: '10:00 AM', tutor: 'Prof. Michael Chen', status: 'completed' }] },
  { date: '2025-01-02', lessons: [{ title: 'Essay Writing', time: '2:00 PM', tutor: 'Ms. Emily Davis', status: 'completed' }] },
];

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

function getSessionsForDate(dateStr) {
  const found = sessionHistory.find((d) => d.date === dateStr);
  return found ? found.lessons : [];
}

function StudentScheduling() {
  const year = 2025;
  const month = 0; // January
  const monthMatrix = getMonthMatrix(year, month);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="student-scheduling-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="student-scheduling-content">
            
            {/* Header */}
            <div className="student-scheduling-header mb-4">
              <h2 className="student-scheduling-page-title mb-0">My Scheduling</h2>
            </div>

            {/* Calendar View - Always Visible */}
            <div className="student-scheduling-section">
              <div className="d-flex flex-wrap align-items-center justify-content-between student-scheduling-calendar-header mb-3">
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-link student-scheduling-nav-btn" aria-label="Previous Month">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <h4 className="student-scheduling-title mb-0">{monthNames[month]} {year}</h4>
                  <button className="btn btn-link student-scheduling-nav-btn" aria-label="Next Month">
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
                          <th key={d} className="student-scheduling-th text-center">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthMatrix.map((week, i) => (
                        <tr key={i}>
                          {week.map((date, j) => {
                            const dateStr = date
                              ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                              : '';
                            const sessions = date ? getSessionsForDate(dateStr) : [];
                            return (
                              <td key={j} className={`student-scheduling-td align-top ${date ? '' : 'student-scheduling-empty'}`}> 
                                {date && (
                                  <div className="student-scheduling-date-cell">
                                    <div className="student-scheduling-date-num">{date.getDate()}</div>
                                    {sessions.map((session, idx) => (
                                      <div className="student-scheduling-session-card mt-1" key={idx}>
                                        <span className="student-scheduling-session-title">{session.title}</span>
                                        <span className="student-scheduling-session-time ms-1">{session.time}</span>
                                        <i className="fas fa-check-circle student-scheduling-session-icon ms-1"></i>
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

            {/* Upcoming Sessions Section */}
            <div className="student-scheduling-section">
              <h4 className="student-scheduling-section-title">Upcoming Sessions</h4>
              <div className="student-scheduling-card student-scheduling-upcoming-card">
                <div className="student-scheduling-card-body">
                  {upcomingSessions.map((session, idx) => (
                    <div className="student-scheduling-upcoming-item d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3" key={idx}>
                      <div className="d-flex align-items-center mb-2 mb-md-0">
                        <span className={`student-scheduling-upcoming-dot me-3 ${session.status === 'confirmed' ? 'student-scheduling-dot-confirmed' : 'student-scheduling-dot-pending'}`}></span>
                        <div>
                          <div className="student-scheduling-upcoming-title">{session.title}</div>
                          <div className="student-scheduling-upcoming-tutor text-muted small">with {session.tutor}</div>
                          <div className="student-scheduling-upcoming-time text-muted small">{session.date}, {session.time}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className={`badge ${session.status === 'confirmed' ? 'bg-success' : 'bg-warning'} student-scheduling-status-badge`}>
                          {session.status}
                        </span>
                        <span className="student-scheduling-upcoming-subject text-muted small">{session.subject}</span>
                        {session.status === 'confirmed' && (
                          <a href={session.joinUrl} className="btn btn-dark btn-sm student-scheduling-join-btn">
                            <i className="fas fa-video me-1"></i>Join Session
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentScheduling;
