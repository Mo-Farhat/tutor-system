import React, { useEffect, useState } from "react";
import tutorService from "../../../../services/tutorService";
import "../../../../css/dashboards/tutor/earnings/earnings.css";

function TutorEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loadingStripe, setLoadingStripe] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [earningsRes, stripeRes] = await Promise.all([
        tutorService.getEarnings(),
        tutorService.getStripeStatus()
      ]);

      if (earningsRes.success) {
        setEarnings(earningsRes.data);
      }
      if (stripeRes.success) {
        setStripeStatus(stripeRes.data);
      }
    }
    fetchData();

    // Check if we just returned from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe_return") || params.get("stripe_refresh")) {
      // Clear params and re-check status
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSetupStripe = async () => {
    try {
      setLoadingStripe(true);
      const res = await tutorService.setupStripeConnect();
      if (res.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert("Failed to start Stripe onboarding: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("An error occurred during Stripe setup");
    } finally {
      setLoadingStripe(false);
    }
  };

  // Use optional chaining with defaults
  const totalEarnings = earnings?.totalEarnings ?? 0;
  const monthlyEarnings = earnings?.monthlyEarnings ?? 0;
  const sessionsThisMonth = earnings?.sessionsThisMonth ?? 0;
  const hourlyRate = earnings?.hourlyRate ?? 0;
  const pendingAmount = earnings?.pendingAmount ?? 0;
  const recentSessions = earnings?.recentSessions ?? [];

  return (
    <div className="tutor-earnings-dashboard">
      <div className="tutor-earnings-content">
        <div className="tutor-earnings-section d-flex justify-content-between align-items-center">
          <h4 className="tutor-earnings-section-title">Earnings</h4>
          {stripeStatus?.onboardingComplete ? (
            <span className="badge bg-success py-2 px-3">
              <i className="fas fa-check-circle me-1"></i> Payouts Enabled
            </span>
          ) : (
            <span className="badge bg-warning text-dark py-2 px-3">
              <i className="fas fa-exclamation-triangle me-1"></i> Payouts Not Set Up
            </span>
          )}
        </div>

        {!stripeStatus?.onboardingComplete && (
          <div className="card mb-4 border-warning shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title text-warning mb-1">Set Up Your Payouts</h5>
                <p className="card-text text-muted small mb-0">
                  Connect your bank account via Stripe to receive your earnings automatically.
                </p>
              </div>
              <button 
                className="btn btn-warning fw-bold" 
                onClick={handleSetupStripe}
                disabled={loadingStripe}
              >
                {loadingStripe ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="fas fa-university me-2"></i>
                )}
                Set Up Now
              </button>
            </div>
          </div>
        )}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card tutor-earnings-summary h-100">
              <div className="card-body">
                <div className="tutor-earnings-summary-title">
                  Total Earnings
                </div>
                <div className="tutor-earnings-summary-value">
                  ${totalEarnings.toFixed(2)}
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
                  ${monthlyEarnings.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card tutor-earnings-summary h-100">
              <div className="card-body">
                <div className="tutor-earnings-summary-title">
                  Pending Payouts{" "}
                  <span className="tutor-earnings-info-icon">⏳</span>
                </div>
                <div className="tutor-earnings-summary-value">
                  ${pendingAmount.toFixed(2)}
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
                <div className="tutor-earnings-summary-value">
                  ${hourlyRate.toFixed(2)}
                </div>
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
