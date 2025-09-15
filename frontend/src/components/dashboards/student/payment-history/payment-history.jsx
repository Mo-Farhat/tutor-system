import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/student/payment-history/payment-history.css';

function StudentPaymentHistory() {
    return (
        <div className="student-payment-history-dashboard">
            <div className="student-payment-history-content">
                <div className="student-payment-history-section">
                    <h4 className="student-payment-history-section-title">Payment History & Package Management</h4>
                </div>

                {/* Purchase 10-Hour Package Section */}
                <div className="student-payment-history-section">
                    <h5 className="student-payment-history-subsection-title">Purchase 10-Hour Package</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-4">
                            <div className="card student-payment-history-package-card h-100">
                                <div className="card-body">
                                    <div className="student-payment-history-package-icon">
                                        <span className="student-payment-history-math-icon">√x</span>
                                    </div>
                                    <h6 className="student-payment-history-package-title">Mathematics</h6>
                                    <p className="student-payment-history-package-description">
                                        10 hours of Mathematics tutoring with $50 discount
                                    </p>
                                    <div className="student-payment-history-package-price">$450</div>
                                    <button className="btn student-payment-history-btn-math w-100">
                                        Purchase Package
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card student-payment-history-package-card h-100">
                                <div className="card-body">
                                    <div className="student-payment-history-package-icon">
                                        <span className="student-payment-history-english-icon">📚</span>
                                    </div>
                                    <h6 className="student-payment-history-package-title">English</h6>
                                    <p className="student-payment-history-package-description">
                                        10 hours of English tutoring with $50 discount
                                    </p>
                                    <div className="student-payment-history-package-price">$450</div>
                                    <button className="btn student-payment-history-btn-english w-100">
                                        Purchase Package
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card student-payment-history-package-card h-100">
                                <div className="card-body">
                                    <div className="student-payment-history-package-icon">
                                        <span className="student-payment-history-science-icon">⚗️</span>
                                    </div>
                                    <h6 className="student-payment-history-package-title">Science</h6>
                                    <p className="student-payment-history-package-description">
                                        10 hours of Science tutoring with $50 discount
                                    </p>
                                    <div className="student-payment-history-package-price">$450</div>
                                    <button className="btn student-payment-history-btn-science w-100">
                                        Purchase Package
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Packages Section */}
                <div className="student-payment-history-section">
                    <h5 className="student-payment-history-subsection-title">Active Packages</h5>
                    <div className="card student-payment-history-active-card mb-4">
                        <div className="card-body">
                            <div className="row align-items-center mb-3">
                                <div className="col-12 col-sm-8">
                                    <div className="d-flex align-items-center">
                                        <span className="student-payment-history-math-icon me-2">√x</span>
                                        <span className="student-payment-history-active-title">Mathematics Package</span>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-4 text-sm-end">
                                    <span className="student-payment-history-remaining">7 hours remaining</span>
                                </div>
                            </div>
                            <div className="student-payment-history-progress-container">
                                <div className="progress student-payment-history-progress">
                                    <div className="progress-bar student-payment-history-progress-math" 
                                         role="progressbar" 
                                         style={{width: '70%'}} 
                                         aria-valuenow="70" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card student-payment-history-active-card mb-4">
                        <div className="card-body">
                            <div className="row align-items-center mb-3">
                                <div className="col-12 col-sm-8">
                                    <div className="d-flex align-items-center">
                                        <span className="student-payment-history-english-icon me-2">📚</span>
                                        <span className="student-payment-history-active-title">English Package</span>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-4 text-sm-end">
                                    <span className="student-payment-history-remaining">4 hours remaining</span>
                                </div>
                            </div>
                            <div className="student-payment-history-progress-container">
                                <div className="progress student-payment-history-progress">
                                    <div className="progress-bar student-payment-history-progress-english" 
                                         role="progressbar" 
                                         style={{width: '40%'}} 
                                         aria-valuenow="40" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History Section */}
                <div className="card student-payment-history-history-card">
                    <div className="card-body">
                        <div className="student-payment-history-history-title mb-3">Payment History</div>
                        <div className="table-responsive">
                            <table className="table table-borderless student-payment-history-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Apr 25, 2025</td>
                                        <td>Mathematics Package (10 hours)</td>
                                        <td>$450.00</td>
                                        <td>
                                            <a href="#" className="student-payment-history-download-link">
                                                📥 Download
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Apr 20, 2025</td>
                                        <td>English Package (10 hours)</td>
                                        <td>$450.00</td>
                                        <td>
                                            <a href="#" className="student-payment-history-download-link">
                                                📥 Download
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Apr 15, 2025</td>
                                        <td>Individual Session - Science</td>
                                        <td>$50.00</td>
                                        <td>
                                            <a href="#" className="student-payment-history-download-link">
                                                📥 Download
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentPaymentHistory;
