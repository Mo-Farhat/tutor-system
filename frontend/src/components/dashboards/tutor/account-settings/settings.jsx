import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/tutor/account-settings/settings.css';

function TutorSettings() {
    const [isAvailable, setIsAvailable] = useState(true);
    const [referralLink] = useState('https://striveacademics.com/start?ref=tutor123');

    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        // You can add a toast notification here
    };

    return (
        <div className="tutor-settings-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="tutor-settings-content">
                            
                            {/* Account Settings Section */}
                            <div className="tutor-settings-section">
                                <h4 className="tutor-settings-section-title">Account Settings</h4>
                                
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-settings-card">
                                            <div className="tutor-settings-card-body">
                                                <h6 className="tutor-settings-card-title">Email & Password</h6>
                                                <p className="tutor-settings-card-description">Update your login credentials</p>
                                                <button className="btn btn-dark tutor-settings-btn">
                                                    <i className="fas fa-pencil-alt me-2"></i>
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-settings-card">
                                            <div className="tutor-settings-card-body">
                                                <h6 className="tutor-settings-card-title">Notification Preferences</h6>
                                                <p className="tutor-settings-card-description">Manage how you receive notifications</p>
                                                <button className="btn btn-dark tutor-settings-btn">
                                                    <i className="fas fa-cog me-2"></i>
                                                    Configure
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Availability Status Section */}
                            <div className="tutor-settings-section">
                                <h4 className="tutor-settings-section-title">Availability Status</h4>
                                <div className="tutor-settings-card">
                                    <div className="tutor-settings-card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="tutor-settings-card-title mb-1">Current Status: Available</h6>
                                                <p className="tutor-settings-card-description mb-0">Toggle between Available and Fully Booked</p>
                                            </div>
                                            <div className="tutor-settings-toggle">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input tutor-settings-switch" 
                                                        type="checkbox" 
                                                        id="availabilityToggle"
                                                        checked={isAvailable}
                                                        onChange={(e) => setIsAvailable(e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor="availabilityToggle"></label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Refer & Earn Section */}
                            <div className="tutor-settings-section">
                                <div className="tutor-settings-card tutor-settings-refer-card">
                                    <div className="tutor-settings-card-body">
                                        <div className="text-center mb-4">
                                            <h3 className="tutor-settings-refer-title">Refer & Earn</h3>
                                            <h5 className="tutor-settings-refer-subtitle">Refer a Student & Earn $20</h5>
                                            <p className="tutor-settings-refer-message">Help More Students, Get Rewarded.</p>
                                        </div>
                                        
                                        <div className="tutor-settings-refer-description">
                                            <p>Know someone who could benefit from high-quality tutoring? Refer them to Strive Academics and earn $20 for each student who completes their first paid lesson.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* How It Works Section */}
                            <div className="tutor-settings-section">
                                <h4 className="tutor-settings-section-title">How It Works</h4>
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 mb-4">
                                        <div className="tutor-settings-step-card">
                                            <div className="tutor-settings-step-number">1</div>
                                            <h6 className="tutor-settings-step-title">Share Your Unique Referral Link</h6>
                                            <p className="tutor-settings-step-description">Send your personalised link to new parents, students, or friends.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-lg-4 col-md-6 mb-4">
                                        <div className="tutor-settings-step-card">
                                            <div className="tutor-settings-step-number">2</div>
                                            <h6 className="tutor-settings-step-title">They Book a 20-Minute Free Academic Consultation</h6>
                                            <p className="tutor-settings-step-description">The referred student must use your link to book their consultation with us.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-lg-4 col-md-6 mb-4">
                                        <div className="tutor-settings-step-card">
                                            <div className="tutor-settings-step-number">3</div>
                                            <h6 className="tutor-settings-step-title">They Complete Their First Paid Lesson</h6>
                                            <p className="tutor-settings-step-description">Once the student completes their first paid lesson, you receive $20, paid directly to your account.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Your Referral Link Section */}
                            <div className="tutor-settings-section">
                                <h4 className="tutor-settings-section-title">Your Referral Link</h4>
                                <div className="tutor-settings-card">
                                    <div className="tutor-settings-card-body">
                                        <div className="input-group mb-3">
                                            <input 
                                                type="text" 
                                                className="form-control tutor-settings-link-input" 
                                                value={referralLink}
                                                readOnly
                                            />
                                            <button 
                                                className="btn btn-dark tutor-settings-copy-btn"
                                                onClick={copyReferralLink}
                                            >
                                                <i className="fas fa-copy me-2"></i>
                                                Copy Link
                                            </button>
                                        </div>
                                        <small className="text-muted">(This link is unique to your account)</small>
                                    </div>
                                </div>
                            </div>

                            {/* Track Your Referrals Section */}
                            <div className="tutor-settings-section">
                                <h4 className="tutor-settings-section-title">Track Your Referrals</h4>
                                <div className="tutor-settings-card">
                                    <div className="tutor-settings-card-body">
                                        <div className="table-responsive">
                                            <table className="table tutor-settings-table">
                                                <thead>
                                                    <tr>
                                                        <th>Student Name</th>
                                                        <th>Consultation Status</th>
                                                        <th>First Paid Lesson</th>
                                                        <th>Bonus Paid</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Mia L.</td>
                                                        <td><span className="tutor-settings-status-success">✓ Completed</span></td>
                                                        <td><span className="tutor-settings-status-success">✓ Yes</span></td>
                                                        <td><span className="tutor-settings-bonus-paid">✔ $20</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>James K.</td>
                                                        <td><span className="tutor-settings-status-failed">× Not Booked</span></td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Clara T.</td>
                                                        <td><span className="tutor-settings-status-success">✓ Completed</span></td>
                                                        <td><span className="tutor-settings-status-pending">◷ Pending</span></td>
                                                        <td>-</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Conditions Section */}
                            <div className="tutor-settings-section">
                                <h4 className="tutor-settings-section-title">Terms & Conditions</h4>
                                <div className="tutor-settings-card">
                                    <div className="tutor-settings-card-body">
                                        <ul className="tutor-settings-terms-list">
                                            <li>Referrals must use the unique link.</li>
                                            <li>Bonus is paid only after the first paid lesson.</li>
                                            <li>Referred students must be new to Strive Academics.</li>
                                            <li>Bonuses are tracked and appear in the Earnings tab.</li>
                                            <li>Strive Academics reserves the right to amend or discontinue the program.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorSettings;
