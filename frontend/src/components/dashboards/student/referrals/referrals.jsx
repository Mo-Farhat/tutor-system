import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/student/referrals/referrals.css';

function StudentReferrals() {
    const [referralLink, setReferralLink] = useState('https://striveacademy.com/join?ref=STU12345');
    const [copySuccess, setCopySuccess] = useState(false);

    // Copy referral link to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    // Share referral link (Web Share API or fallback)
    const shareReferralLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Strive Academics',
                    text: 'Get quality tutoring with Strive Academics! Use my referral link to get started.',
                    url: referralLink
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to copy
            copyToClipboard();
        }
    };

    return (
        <div className="student-referrals-dashboard">
            <div className="student-referrals-content">
                <div className="student-referrals-section">
                    <h4 className="student-referrals-section-title">Referrals</h4>
                </div>

                {/* Referral Stats Summary */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="card student-referrals-summary h-100">
                            <div className="card-body">
                                <div className="student-referrals-summary-title">Total Referrals</div>
                                <div className="student-referrals-summary-value">12</div>
                                <div className="student-referrals-summary-sub">+3 this month</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card student-referrals-summary h-100">
                            <div className="card-body">
                                <div className="student-referrals-summary-title">Active Referrals <span className="student-referrals-info-icon">👥</span></div>
                                <div className="student-referrals-summary-value">8</div>
                                <div className="student-referrals-summary-sub">Currently enrolled</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card student-referrals-summary h-100">
                            <div className="card-body">
                                <div className="student-referrals-summary-title">Rewards Earned <span className="student-referrals-info-icon">🎁</span></div>
                                <div className="student-referrals-summary-value">$160</div>
                                <div className="student-referrals-summary-sub">$20 per referral</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card student-referrals-summary h-100">
                            <div className="card-body">
                                <div className="student-referrals-summary-title">Conversion Rate <span className="student-referrals-info-icon">📊</span></div>
                                <div className="student-referrals-summary-value">67%</div>
                                <div className="student-referrals-summary-sub">8 of 12 converted</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral Link Section */}
                <div className="card mb-4 student-referrals-link-card">
                    <div className="card-body">
                        <div className="student-referrals-link-title mb-3">Your Referral Link</div>
                        <p className="student-referrals-link-description">
                            Share this link with friends and family. When they sign up and complete their first paid session, 
                            you'll earn $20 in credits and they'll get a 20% discount on their first package!
                        </p>
                        
                        <div className="student-referrals-link-container">
                            <div className="student-referrals-link-input-group">
                                <input 
                                    type="text" 
                                    value={referralLink} 
                                    readOnly 
                                    className="student-referrals-link-input"
                                    onClick={(e) => e.target.select()}
                                />
                                <button 
                                    className="btn student-referrals-copy-btn"
                                    onClick={copyToClipboard}
                                >
                                    {copySuccess ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="student-referrals-share-buttons mt-3">
                            <button 
                                className="btn student-referrals-share-btn"
                                onClick={shareReferralLink}
                            >
                                🔗 Share Link
                            </button>
                            <button 
                                className="btn student-referrals-email-btn"
                                onClick={() => window.open(`mailto:?subject=Join Strive Academics&body=Hi! I wanted to share this amazing tutoring platform with you. Use my referral link to get started: ${referralLink}`)}
                            >
                                ✉️ Email
                            </button>
                            <button 
                                className="btn student-referrals-whatsapp-btn"
                                onClick={() => window.open(`https://wa.me/?text=Check out Strive Academics for quality tutoring! Use my referral link: ${referralLink}`)}
                            >
                                💬 WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                {/* Referral Activity Chart */}
                <div className="card mb-4 student-referrals-chart-card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="student-referrals-chart-title">Referral Activity</span>
                            <div className="btn-group student-referrals-chart-range" role="group">
                                <button type="button" className="btn btn-sm btn-outline-secondary active">3M</button>
                                <button type="button" className="btn btn-sm btn-outline-secondary">6M</button>
                                <button type="button" className="btn btn-sm btn-outline-secondary">1Y</button>
                            </div>
                        </div>
                        <div className="student-referrals-chart-bargraph">
                            <div className="student-referrals-bargraph d-flex align-items-end">
                                {[
                                    { month: 'Oct', count: 2 },
                                    { month: 'Nov', count: 4 },
                                    { month: 'Dec', count: 3 },
                                    { month: 'Jan', count: 1 },
                                    { month: 'Feb', count: 2 },
                                    { month: 'Mar', count: 0 }
                                ].map((data, idx) => (
                                    <div key={data.month} className={`student-referrals-bar-col ${idx === 1 ? 'active' : ''}`}>
                                        <div className="student-referrals-bar" style={{height: `${20 + data.count * 25}px`}}></div>
                                        <div className="student-referrals-bar-label">{data.month}</div>
                                        <div className="student-referrals-bar-count">{data.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Referrals */}
                <div className="card student-referrals-activity-card">
                    <div className="card-body">
                        <div className="student-referrals-activity-title mb-3">Recent Referral Activity</div>
                        <div className="table-responsive">
                            <table className="table table-borderless student-referrals-activity-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Reward</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Mar 15, 2025</td>
                                        <td>
                                            <span className="student-referrals-avatar me-2">
                                                <img src="/public/Images/logo/logo1.png" alt="Sarah Wilson" width="28" height="28" />
                                            </span>
                                            Sarah Wilson
                                        </td>
                                        <td><span className="badge bg-success student-referrals-status">Completed</span></td>
                                        <td>$20.00</td>
                                        <td>
                                            <button className="btn btn-sm student-referrals-view-btn">View</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Mar 12, 2025</td>
                                        <td>
                                            <span className="student-referrals-avatar me-2">
                                                <img src="/public/Images/logo/logo1.png" alt="Mike Johnson" width="28" height="28" />
                                            </span>
                                            Mike Johnson
                                        </td>
                                        <td><span className="badge bg-warning student-referrals-status">Pending</span></td>
                                        <td>-</td>
                                        <td>
                                            <button className="btn btn-sm student-referrals-remind-btn">Remind</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Mar 10, 2025</td>
                                        <td>
                                            <span className="student-referrals-avatar me-2">
                                                <img src="/public/Images/logo/logo1.png" alt="Emma Davis" width="28" height="28" />
                                            </span>
                                            Emma Davis
                                        </td>
                                        <td><span className="badge bg-success student-referrals-status">Completed</span></td>
                                        <td>$20.00</td>
                                        <td>
                                            <button className="btn btn-sm student-referrals-view-btn">View</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Mar 08, 2025</td>
                                        <td>
                                            <span className="student-referrals-avatar me-2">
                                                <img src="/public/Images/logo/logo1.png" alt="Alex Chen" width="28" height="28" />
                                            </span>
                                            Alex Chen
                                        </td>
                                        <td><span className="badge bg-secondary student-referrals-status">Signed Up</span></td>
                                        <td>-</td>
                                        <td>
                                            <button className="btn btn-sm student-referrals-contact-btn">Contact</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="student-referrals-view-all text-end mt-2">
                            <a href="#" className="student-referrals-view-link">View all referrals</a>
                        </div>
                    </div>
                </div>

                {/* Referral Program Info */}
                <div className="card mt-4 student-referrals-info-card">
                    <div className="card-body">
                        <div className="student-referrals-info-title mb-3">How the Referral Program Works</div>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <div className="student-referrals-step">
                                    <div className="student-referrals-step-number">1</div>
                                    <h6 className="student-referrals-step-title">Share Your Link</h6>
                                    <p className="student-referrals-step-description">
                                        Share your unique referral link with friends, family, or on social media.
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-3">
                                <div className="student-referrals-step">
                                    <div className="student-referrals-step-number">2</div>
                                    <h6 className="student-referrals-step-title">They Sign Up</h6>
                                    <p className="student-referrals-step-description">
                                        Your friend creates an account and has their first paid session.
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-3">
                                <div className="student-referrals-step">
                                    <div className="student-referrals-step-number">3</div>
                                    <h6 className="student-referrals-step-title">You Get Rewarded</h6>
                                    <p className="student-referrals-step-description">
                                        As soon as they have their first paid session, you will receive $20 in credits that can be used for your sessions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentReferrals;
