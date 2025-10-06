import React, { useEffect, useState } from "react";
import tutorService from "../../../../services/tutorService";
import "../../../../css/dashboards/tutor/earnings/earnings.css";

function TutorEarnings() {
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    async function fetchEarnings() {
      const res = await tutorService.getEarnings();
      setEarnings(res);
    }
    fetchEarnings();
  }, []);

  // Use optional chaining with defaults
  const totalEarnings = earnings?.totalEarnings ?? 0;
  const thisMonthEarnings = earnings?.thisMonth ?? 0;
  const sessionsThisMonth = earnings?.sessionsThisMonth ?? 0;
  const hourlyRate = earnings?.hourlyRate ?? 0;
  const recentSessions = earnings?.recentSessions ?? [];

  return (
    <div className="tutor-earnings-dashboard">
      <div className="tutor-earnings-content">
        <div className="tutor-earnings-section">
          <h4 className="tutor-earnings-section-title">Earnings</h4>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card tutor-earnings-summary h-100">
              <div className="card-body">
                <div className="tutor-earnings-summary-title">
                  Total Earnings
                </div>
                <div className="tutor-earnings-summary-value">
                  {totalEarnings}
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card tutor-earnings-summary h-100">
              <div className="card-body">
                <div className="tutor-earnings-summary-title">
                  This Month <span className="tutor-earnings-info-icon">?</span>
                </div>
                <div className="tutor-earnings-summary-value">
                  {thisMonthEarnings}
                </div>
                <div className="tutor-earnings-summary-sub">
                  {sessionsThisMonth} sessions completed
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card tutor-earnings-summary h-100">
              <div className="card-body">
                <div className="tutor-earnings-summary-title">
                  Sessions This Month{" "}
                  <span className="tutor-earnings-info-icon">💬</span>
                </div>
                <div className="tutor-earnings-summary-value">
                  {sessionsThisMonth}
                </div>
                <div className="tutor-earnings-summary-sub">
                  2.5 hrs avg per session
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card tutor-earnings-summary h-100">
              <div className="card-body">
                <div className="tutor-earnings-summary-title">
                  Hourly Rate{" "}
                  <span className="tutor-earnings-info-icon">⏺</span>
                </div>
                <div className="tutor-earnings-summary-value">{hourlyRate}</div>
                <div className="tutor-earnings-summary-sub">Average rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4 tutor-earnings-chart-card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="tutor-earnings-chart-title">
                Earnings Over Time
              </span>
              <div
                className="btn-group tutor-earnings-chart-range"
                role="group"
              >
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary active"
                >
                  6M
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                >
                  1Y
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                >
                  All
                </button>
              </div>
            </div>
            <div className="tutor-earnings-chart-bargraph">
              <div className="tutor-earnings-bargraph d-flex align-items-end">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                  (month, idx) => (
                    <div
                      key={month}
                      className={`tutor-earnings-bar-col ${
                        idx === 5 ? "active" : ""
                      }`}
                    >
                      <div
                        className="tutor-earnings-bar"
                        style={{ height: `${40 + idx * 20}px` }}
                      ></div>
                      <div className="tutor-earnings-bar-label">{month}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card tutor-earnings-sessions-card">
          <div className="card-body">
            <div className="tutor-earnings-sessions-title mb-3">
              Recent Sessions
            </div>
            <div className="table-responsive">
              <table className="table table-borderless tutor-earnings-sessions-table mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Duration</th>
                    <th>Rate</th>
                    <th>Earnings</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.length > 0 ? (
                    recentSessions.map((session, idx) => (
                      <tr key={idx}>
                        <td>{session.date}</td>
                        <td>
                          <span className="tutor-earnings-avatar me-2">
                            <img
                              src={
                                session.avatarUrl ||
                                "/public/Images/logo/logo1.png"
                              }
                              alt={session.student}
                              width="28"
                              height="28"
                            />
                          </span>
                          {session.student}
                        </td>
                        <td>{session.subject}</td>
                        <td>{session.duration}</td>
                        <td>{session.rate}</td>
                        <td>{session.earnings}</td>
                        <td>
                          <span
                            className={`badge ${
                              session.status === "Paid"
                                ? "bg-success"
                                : "bg-secondary"
                            } tutor-earnings-status`}
                          >
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No recent sessions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="tutor-earnings-view-all text-end mt-2">
              <a href="#" className="tutor-earnings-view-link">
                View all sessions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorEarnings;
