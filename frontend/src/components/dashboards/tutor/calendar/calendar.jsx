import React from 'react';
import '../../../../css/dashboards/tutor/calendar/calendar.css';

const calendarData = [
  // Example data for January 2025
  { date: '2025-01-06', lessons: [{ title: 'Math - Grade 5', time: '9:00 AM', type: 'zoom' }] },
  { date: '2025-01-08', lessons: [{ title: 'Science Lab', time: '2:00 PM', type: 'zoom' }] },
  { date: '2025-01-13', lessons: [{ title: 'Math - Grade 5', time: '9:00 AM', type: 'zoom' }] },
  { date: '2025-01-15', lessons: [
    { title: 'English Lit', time: '10:30 AM', type: 'zoom' },
    { title: 'Science Lab', time: '2:00 PM', type: 'zoom' },
  ] },
  { date: '2025-01-20', lessons: [{ title: 'Math - Grade 5', time: '9:00 AM', type: 'zoom' }] },
  { date: '2025-01-22', lessons: [{ title: 'Science Lab', time: '2:00 PM', type: 'zoom' }] },
  { date: '2025-01-27', lessons: [{ title: 'Math - Grade 5', time: '9:00 AM', type: 'zoom' }] },
  { date: '2025-01-29', lessons: [
    { title: 'English Lit', time: '10:30 AM', type: 'zoom' },
    { title: 'Science Lab', time: '2:00 PM', type: 'zoom' },
  ] },
];

const upcomingLessons = [
  {
    title: 'Math - Grade 5',
    date: 'Today',
    time: '9:00 AM - 10:00 AM',
    recurring: 'Weekly',
    joinUrl: '#',
  },
  {
    title: 'Science Lab',
    date: 'Today',
    time: '2:00 PM - 3:30 PM',
    recurring: 'Bi-weekly',
    joinUrl: '#',
  },
  {
    title: 'English Literature',
    date: 'Tomorrow',
    time: '10:30 AM - 12:00 PM',
    recurring: 'Weekly',
    joinUrl: '#',
  },
];

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

function getLessonsForDate(dateStr) {
  const found = calendarData.find((d) => d.date === dateStr);
  return found ? found.lessons : [];
}

function TutorCalendar() {
  const year = 2025;
  const month = 0; // January
  const monthMatrix = getMonthMatrix(year, month);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="tutor-calendar-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="tutor-calendar-content">
            {/* Calendar Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between tutor-calendar-header mb-3">
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-link tutor-calendar-nav-btn" aria-label="Previous Month">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h4 className="tutor-calendar-title mb-0">{monthNames[month]} {year}</h4>
                <button className="btn btn-link tutor-calendar-nav-btn" aria-label="Next Month">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <div className="btn-group tutor-calendar-view-toggle" role="group">
                <button className="btn btn-dark tutor-calendar-view-btn active">Month</button>
                <button className="btn btn-outline-dark tutor-calendar-view-btn">Week</button>
                <button className="btn btn-outline-dark tutor-calendar-view-btn">Day</button>
                <button className="btn btn-outline-secondary tutor-calendar-filter-btn ms-2">
                  <i className="fas fa-filter"></i> <span className="d-none d-sm-inline">Filter</span>
                </button>
              </div>
            </div>

            {/* Calendar Table */}
            <div className="tutor-calendar-section tutor-calendar-calendar-section mb-4">
              <div className="table-responsive">
                <table className="table tutor-calendar-table mb-0">
                  <thead>
                    <tr>
                      {daysShort.map((d) => (
                        <th key={d} className="tutor-calendar-th text-center">{d}</th>
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
                          const lessons = date ? getLessonsForDate(dateStr) : [];
                          return (
                            <td key={j} className={`tutor-calendar-td align-top ${date ? '' : 'tutor-calendar-empty'}`}> 
                              {date && (
                                <div className="tutor-calendar-date-cell">
                                  <div className="tutor-calendar-date-num">{date.getDate()}</div>
                                  {lessons.map((lesson, idx) => (
                                    <div className="tutor-calendar-lesson-card mt-1" key={idx}>
                                      <span className="tutor-calendar-lesson-title">{lesson.title}</span>
                                      <span className="tutor-calendar-lesson-time ms-1">{lesson.time}</span>
                                      {lesson.type === 'zoom' && (
                                        <i className="fas fa-video tutor-calendar-lesson-icon ms-1"></i>
                                      )}
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
              <h4 className="tutor-calendar-section-title mb-3">Upcoming Lessons</h4>
              <div className="tutor-calendar-card tutor-calendar-upcoming-card">
                <div className="tutor-calendar-card-body">
                  {upcomingLessons.map((lesson, idx) => (
                    <div className="tutor-calendar-upcoming-item d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3" key={idx}>
                      <div className="d-flex align-items-center mb-2 mb-md-0">
                        <span className="tutor-calendar-upcoming-dot me-2"></span>
                        <div>
                          <div className="tutor-calendar-upcoming-title">{lesson.title}</div>
                          <div className="tutor-calendar-upcoming-time text-muted small">{lesson.date}, {lesson.time}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="tutor-calendar-upcoming-recurring text-muted small">Recurring: {lesson.recurring}</span>
                        <a href={lesson.joinUrl} className="btn btn-dark btn-sm tutor-calendar-join-btn" target="_blank" rel="noopener noreferrer">
                          <i className="fas fa-video me-1"></i>Join Zoom
                        </a>
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

export default TutorCalendar;
