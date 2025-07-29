import React from 'react';
import '../../../../css/dashboards/tutor/progress/progress.css';

function TutorProgress() {
    return (
        <div className="tutor-progress-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="tutor-progress-content">
                            {/* Current Tier Status */}
                            <div className="tutor-progress-section mb-4">
                                <h4 className="tutor-progress-section-title">Current Tier Status</h4>
                                <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                                    <div className="tutor-progress-tier-card text-center flex-fill p-3">
                                        <div className="tutor-progress-tier-icon mb-2"><i className="fas fa-medal"></i></div>
                                        <div className="tutor-progress-tier-title">Gold</div>
                                        <div className="tutor-progress-tier-desc">Starting Level</div>
                                        <span className="badge bg-light text-dark mt-2">Gold Tier</span>
                                    </div>
                                    <div className="tutor-progress-tier-card text-center flex-fill p-3">
                                        <div className="tutor-progress-tier-icon mb-2"><i className="fas fa-crown"></i></div>
                                        <div className="tutor-progress-tier-title">Premium</div>
                                        <div className="tutor-progress-tier-desc">Next Level</div>
                                    </div>
                                    <div className="tutor-progress-tier-card text-center flex-fill p-3">
                                        <div className="tutor-progress-tier-icon mb-2"><i className="fas fa-gem"></i></div>
                                        <div className="tutor-progress-tier-title">Elite</div>
                                        <div className="tutor-progress-tier-desc">Highest Level</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stellar Student Reviews */}
                            <div className="tutor-progress-section mb-4">
                                <h4 className="tutor-progress-section-title">Stellar Student Reviews</h4>
                                <div className="mb-2">Current: 1 five-star review <span className="float-end">Next milestone: 3 reviews</span></div>
                                <div className="progress mb-3" style={{height: '18px'}}>
                                    <div className="progress-bar bg-dark" role="progressbar" style={{width: '16%'}} aria-valuenow="1" aria-valuemin="0" aria-valuemax="6"></div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-6 col-md-4">
                                        <div className="tutor-progress-milestone-card p-3 h-100">
                                            <div className="fw-bold">Premium Tier</div>
                                            <div className="small">3+ reviews</div>
                                            <div className="small text-muted">Subject to approval after reaching milestone</div>
                                            <span className="badge bg-secondary mt-2">2 more needed</span>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4">
                                        <div className="tutor-progress-milestone-card p-3 h-100">
                                            <div className="fw-bold">Elite Tier</div>
                                            <div className="small">6+ reviews</div>
                                            <div className="small text-muted">Subject to approval after reaching milestone</div>
                                            <span className="badge bg-secondary mt-2">5 more needed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Years of Experience */}
                            <div className="tutor-progress-section mb-4">
                                <h4 className="tutor-progress-section-title">Years of Experience</h4>
                                <div className="mb-2">Current: 1.5 years <span className="float-end">Next milestone: 2 years</span></div>
                                <div className="progress mb-3" style={{height: '18px'}}>
                                    <div className="progress-bar bg-dark" role="progressbar" style={{width: '30%'}} aria-valuenow="1.5" aria-valuemin="0" aria-valuemax="5"></div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-4">
                                        <div className="tutor-progress-exp-card p-3 h-100 border border-dark border-2">
                                            <div className="fw-bold">Gold Tier</div>
                                            <div className="small">0-2 years</div>
                                            <span className="badge bg-dark mt-2">Current</span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="tutor-progress-exp-card p-3 h-100 border border-secondary">
                                            <div className="fw-bold">Premium Tier</div>
                                            <div className="small">2-4 years</div>
                                            <span className="badge bg-secondary mt-2">6 months remaining</span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="tutor-progress-exp-card p-3 h-100 border border-secondary">
                                            <div className="fw-bold">Elite Tier</div>
                                            <div className="small">5+ years</div>
                                            <span className="badge bg-secondary mt-2">3.5 years remaining</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tier Benefits & Requirements */}
                            <div className="tutor-progress-section mb-4">
                                <h4 className="tutor-progress-section-title">Tier Benefits & Requirements</h4>
                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <div className="tutor-progress-benefit-card p-3 h-100 text-center">
                                            <div className="tutor-progress-tier-icon mb-2"><i className="fas fa-medal"></i></div>
                                            <div className="fw-bold mb-2">Gold Tier</div>
                                            <ul className="list-unstyled small mb-0">
                                                <li>Basic profile visibility</li>
                                                <li>Standard commission rate</li>
                                                <li>0-2 years experience</li>
                                                <li>No review requirement</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="tutor-progress-benefit-card p-3 h-100 text-center">
                                            <div className="tutor-progress-tier-icon mb-2"><i className="fas fa-crown"></i></div>
                                            <div className="fw-bold mb-2">Premium Tier</div>
                                            <ul className="list-unstyled small mb-0">
                                                <li>Enhanced profile features</li>
                                                <li>Better commission rate</li>
                                                <li>2-4 years experience</li>
                                                <li>3+ five-star reviews</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="tutor-progress-benefit-card p-3 h-100 text-center">
                                            <div className="tutor-progress-tier-icon mb-2"><i className="fas fa-gem"></i></div>
                                            <div className="fw-bold mb-2">Elite Tier</div>
                                            <ul className="list-unstyled small mb-0">
                                                <li>Premium profile placement</li>
                                                <li>Highest commission rate</li>
                                                <li>5+ years experience</li>
                                                <li>6+ five-star reviews</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps to Advance */}
                            <div className="tutor-progress-section mb-4">
                                <h4 className="tutor-progress-section-title">Next Steps to Advance</h4>
                                <div className="tutor-progress-next-steps-card p-3 mb-2">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="fas fa-star text-warning me-2"></i>
                                        <span className="fw-bold">Collect 2 more five-star reviews</span>
                                    </div>
                                    <div className="small text-muted ms-4">Focus on delivering exceptional tutoring sessions</div>
                                </div>
                                <div className="tutor-progress-next-steps-card p-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <i className="fas fa-clock text-secondary me-2"></i>
                                        <span className="fw-bold">Continue gaining experience</span>
                                    </div>
                                    <div className="small text-muted ms-4">6 months until Premium tier eligibility</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorProgress;
