import React from 'react';
import '../../../../css/dashboards/tutor/earnings/earnings.css';

function TutorEarnings() {
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
                                <div className="tutor-earnings-summary-title">Total Earnings</div>
                                <div className="tutor-earnings-summary-value">$4,285.50</div>
                                <div className="tutor-earnings-summary-sub">+12.3% from last month</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card tutor-earnings-summary h-100">
                            <div className="card-body">
                                <div className="tutor-earnings-summary-title">This Month <span className="tutor-earnings-info-icon">?</span></div>
                                <div className="tutor-earnings-summary-value">$892.00</div>
                                <div className="tutor-earnings-summary-sub">18 sessions completed</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card tutor-earnings-summary h-100">
                            <div className="card-body">
                                <div className="tutor-earnings-summary-title">Sessions This Month <span className="tutor-earnings-info-icon">💬</span></div>
                                <div className="tutor-earnings-summary-value">18</div>
                                <div className="tutor-earnings-summary-sub">2.5 hrs avg per session</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card tutor-earnings-summary h-100">
                            <div className="card-body">
                                <div className="tutor-earnings-summary-title">Hourly Rate <span className="tutor-earnings-info-icon">⏺</span></div>
                                <div className="tutor-earnings-summary-value">$45.00</div>
                                <div className="tutor-earnings-summary-sub">Average rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mb-4 tutor-earnings-chart-card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="tutor-earnings-chart-title">Earnings Over Time</span>
                            <div className="btn-group tutor-earnings-chart-range" role="group">
                                <button type="button" className="btn btn-sm btn-outline-secondary active">6M</button>
                                <button type="button" className="btn btn-sm btn-outline-secondary">1Y</button>
                                <button type="button" className="btn btn-sm btn-outline-secondary">All</button>
                            </div>
                        </div>
                        <div className="tutor-earnings-chart-bargraph">
                            {/* Placeholder for bar chart */}
                            <div className="tutor-earnings-bargraph d-flex align-items-end">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => (
                                    <div key={month} className={`tutor-earnings-bar-col ${idx === 5 ? 'active' : ''}`}>
                                        <div className="tutor-earnings-bar" style={{height: `${40 + idx * 20}px`}}></div>
                                        <div className="tutor-earnings-bar-label">{month}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card tutor-earnings-sessions-card">
                    <div className="card-body">
                        <div className="tutor-earnings-sessions-title mb-3">Recent Sessions</div>
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
                                    <tr>
                                        <td>Jun 15, 2025</td>
                                        <td>
                                            <span className="tutor-earnings-avatar me-2">
                                                <img src="/public/Images/logo/logo1.png" alt="Sarah Johnson" width="28" height="28" />
                                            </span>
                                            Sarah Johnson
                                        </td>
                                        <td>Mathematics</td>
                                        <td>2.0 hrs</td>
                                        <td>$45/hr</td>
                                        <td>$90.00</td>
                                        <td><span className="badge bg-success tutor-earnings-status">Paid</span></td>
                                    </tr>
                                    <tr>
                                        <td>Jun 14, 2025</td>
                                        <td>
                                            <span className="tutor-earnings-avatar me-2">
                                                <img src="/public/Images/logo/logo1.png" alt="Mike Chen" width="28" height="28" />
                                            </span>
                                            Mike Chen
                                        </td>
                                        <td>Physics</td>
                                        <td>1.5 hrs</td>
                                        <td>$50/hr</td>
                                        <td>$75.00</td>
                                        <td><span className="badge bg-success tutor-earnings-status">Paid</span></td>
                                    </tr>
                                    <tr>
                                        <td>Jun 13, 2025</td>
                                        <td>
                                            <span className="tutor-earnings-avatar me-2">
                                                <img src="/public/Images/logo/logo1.png" alt="Emma Wilson" width="28" height="28" />
                                            </span>
                                            Emma Wilson
                                        </td>
                                        <td>Chemistry</td>
                                        <td>3.0 hrs</td>
                                        <td>$40/hr</td>
                                        <td>$120.00</td>
                                        <td><span className="badge bg-secondary tutor-earnings-status">Processing</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="tutor-earnings-view-all text-end mt-2">
                            <a href="#" className="tutor-earnings-view-link">View all sessions</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorEarnings;
