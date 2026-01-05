import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/tutor/progress/progress.css';
import profileService from '../../../../services/profileService';

// Helper to capitalize first letter (backend uses lowercase tiers)
const capitalizeFirst = (str) => {
    if (!str) return 'Gold';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function TutorProgress() {
    // Tutor progress state
    const [tutorData, setTutorData] = useState({
        currentTier: 'Gold',
        yearsOfExperience: 1.5,
        initialExperience: 0.5, // When they started
        fiveStarReviews: 2,
        studentRetention: 88,
        onboardingRate: 97,
        professionalCommunication: true,
        contributionsBeyondTutoring: false,
        probationEndDate: '2024-06-15', // 3 months from start
        isEligibleForReview: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);

    // Fetch tutor profile to get real tier data
    useEffect(() => {
        const fetchTutorProfile = async () => {
            try {
                const result = await profileService.getMyTutorProfile();
                if (result?.success && result?.data?.profile?.tier) {
                    setTutorData(prev => ({
                        ...prev,
                        currentTier: capitalizeFirst(result.data.profile.tier)
                    }));
                }
            } catch (error) {
                console.error('Error fetching tutor profile for tier:', error);
                // Keep default tier on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchTutorProfile();
    }, []);

    // Tier requirements
    const tierRequirements = {
        Premium: {
            experience: 2,
            reviews: 3,
            retention: 90,
            onboarding: 95,
            communication: true,
            contributions: false
        },
        Elite: {
            experience: 4,
            reviews: 8,
            retention: 90,
            onboarding: 95,
            communication: true,
            contributions: true
        }
    };

    // Calculate progress percentages
    const calculateExperienceProgress = () => {
        if (tutorData.currentTier === 'Gold') {
            return Math.min((tutorData.yearsOfExperience / 2) * 100, 100);
        } else if (tutorData.currentTier === 'Premium') {
            return Math.min(((tutorData.yearsOfExperience - 2) / 2) * 100, 100);
        }
        return 100;
    };

    const calculateReviewsProgress = () => {
        if (tutorData.currentTier === 'Gold') {
            return Math.min((tutorData.fiveStarReviews / 3) * 100, 100);
        } else if (tutorData.currentTier === 'Premium') {
            return Math.min((tutorData.fiveStarReviews / 8) * 100, 100);
        }
        return 100;
    };

    const calculateOverallProgress = () => {
        const expProgress = calculateExperienceProgress();
        const reviewProgress = calculateReviewsProgress();
        return (expProgress + reviewProgress) / 2;
    };

    const getNextTierRequirement = (type) => {
        const nextTier = tutorData.currentTier === 'Gold' ? 'Premium' : 'Elite';
        return tierRequirements[nextTier][type];
    };

    const isRequirementMet = (type) => {
        const requirement = getNextTierRequirement(type);
        switch (type) {
            case 'experience':
                return tutorData.yearsOfExperience >= requirement;
            case 'reviews':
                return tutorData.fiveStarReviews >= requirement;
            case 'retention':
                return tutorData.studentRetention >= requirement;
            case 'onboarding':
                return tutorData.onboardingRate >= requirement;
            case 'communication':
                return tutorData.professionalCommunication === requirement;
            case 'contributions':
                return tutorData.contributionsBeyondTutoring === requirement;
            default:
                return false;
        }
    };

    const checkEligibilityForReview = () => {
        return ['experience', 'reviews', 'retention', 'onboarding', 'communication', 'contributions']
            .every(req => isRequirementMet(req));
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 'Gold':
                return '#ffd700';
            case 'Premium':
                return '#c0392b';
            case 'Elite':
                return '#8e44ad';
            default:
                return '#6c757d';
        }
    };

    const getTierIcon = (tier) => {
        switch (tier) {
            case 'Gold':
                return 'fas fa-medal';
            case 'Premium':
                return 'fas fa-crown';
            case 'Elite':
                return 'fas fa-gem';
            default:
                return 'fas fa-user';
        }
    };

    const isProbationPeriod = () => {
        const today = new Date();
        const probationEnd = new Date(tutorData.probationEndDate);
        return today < probationEnd;
    };

    const getDaysUntilProbationEnd = () => {
        const today = new Date();
        const probationEnd = new Date(tutorData.probationEndDate);
        const diffTime = probationEnd - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="tutor-progress-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="tutor-progress-content">
                            
                            {/* Current Tier Status */}
                            <div className="tutor-progress-section">
                                <h4 className="tutor-progress-section-title">Current Tier Status</h4>
                                <div className="tutor-progress-card">
                                    <div className="tutor-progress-card-body">
                                        <div className="row">
                                            <div className="col-lg-8 col-md-12 mb-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="tutor-progress-tier-badge me-3" style={{ backgroundColor: getTierColor(tutorData.currentTier) }}>
                                                        <i className={getTierIcon(tutorData.currentTier)}></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="tutor-progress-card-title">{tutorData.currentTier} Tier</h6>
                                                        <p className="tutor-progress-card-description">
                                                            Your current membership level
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 col-md-12 mb-4">
                                                {isProbationPeriod() && (
                                                    <div className="tutor-progress-probation-notice">
                                                        <i className="fas fa-clock me-2"></i>
                                                        <span>Probation ends in {getDaysUntilProbationEnd()} days</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Overall Progress */}
                                        <div className="tutor-progress-overall-section">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span>Overall Progress to Next Tier</span>
                                                <span>{Math.round(calculateOverallProgress())}%</span>
                                            </div>
                                            <div className="progress tutor-progress-bar">
                                                <div 
                                                    className="progress-bar bg-dark" 
                                                    style={{ width: `${calculateOverallProgress()}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Criteria */}
                            <div className="tutor-progress-section">
                                <h4 className="tutor-progress-section-title">Progress Criteria</h4>
                                
                                {/* Time-Based Progress */}
                                <div className="row mb-4">
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-progress-card">
                                            <div className="tutor-progress-card-body">
                                                <h6 className="tutor-progress-card-title">Years of Experience</h6>
                                                <p className="tutor-progress-card-description">Auto-calculated from your start date</p>
                                                
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>Current: {tutorData.yearsOfExperience} years</span>
                                                    <span>Required: {getNextTierRequirement('experience')} years</span>
                                                </div>
                                                <div className="progress tutor-progress-bar">
                                                    <div 
                                                        className={`progress-bar ${isRequirementMet('experience') ? 'bg-success' : 'bg-secondary'}`}
                                                        style={{ width: `${calculateExperienceProgress()}%` }}
                                                    ></div>
                                                </div>
                                                {isRequirementMet('experience') && (
                                                    <div className="tutor-progress-met-indicator">
                                                        <i className="fas fa-check-circle text-success me-2"></i>
                                                        Requirement met
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-progress-card">
                                            <div className="tutor-progress-card-body">
                                                <h6 className="tutor-progress-card-title">Five-Star Reviews</h6>
                                                <p className="tutor-progress-card-description">From completed student feedback</p>
                                                
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>Current: {tutorData.fiveStarReviews} reviews</span>
                                                    <span>Required: {getNextTierRequirement('reviews')} reviews</span>
                                                </div>
                                                <div className="progress tutor-progress-bar">
                                                    <div 
                                                        className={`progress-bar ${isRequirementMet('reviews') ? 'bg-success' : 'bg-secondary'}`}
                                                        style={{ width: `${calculateReviewsProgress()}%` }}
                                                    ></div>
                                                </div>
                                                {isRequirementMet('reviews') && (
                                                    <div className="tutor-progress-met-indicator">
                                                        <i className="fas fa-check-circle text-success me-2"></i>
                                                        Requirement met
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Milestones */}
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-progress-card">
                                            <div className="tutor-progress-card-body">
                                                <h6 className="tutor-progress-card-title">Student Retention</h6>
                                                <p className="tutor-progress-card-description">Students with 5+ completed sessions</p>
                                                
                                                <div className="tutor-progress-metric-display">
                                                    <div className="tutor-progress-metric-value">
                                                        {tutorData.studentRetention}%
                                                    </div>
                                                    <div className="tutor-progress-metric-requirement">
                                                        Required: ≥{getNextTierRequirement('retention')}%
                                                    </div>
                                                </div>
                                                
                                                {isRequirementMet('retention') ? (
                                                    <div className="tutor-progress-status-met">
                                                        <i className="fas fa-check-circle me-2"></i>
                                                        Requirement met
                                                    </div>
                                                ) : (
                                                    <div className="tutor-progress-status-pending">
                                                        <i className="fas fa-clock me-2"></i>
                                                        {getNextTierRequirement('retention') - tutorData.studentRetention}% more needed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-progress-card">
                                            <div className="tutor-progress-card-body">
                                                <h6 className="tutor-progress-card-title">24-Hour Onboarding</h6>
                                                <p className="tutor-progress-card-description">Students onboarded within 24 hours</p>
                                                
                                                <div className="tutor-progress-metric-display">
                                                    <div className="tutor-progress-metric-value">
                                                        {tutorData.onboardingRate}%
                                                    </div>
                                                    <div className="tutor-progress-metric-requirement">
                                                        Required: ≥{getNextTierRequirement('onboarding')}%
                                                    </div>
                                                </div>
                                                
                                                {isRequirementMet('onboarding') ? (
                                                    <div className="tutor-progress-status-met">
                                                        <i className="fas fa-check-circle me-2"></i>
                                                        Requirement met
                                                    </div>
                                                ) : (
                                                    <div className="tutor-progress-status-pending">
                                                        <i className="fas fa-clock me-2"></i>
                                                        {getNextTierRequirement('onboarding') - tutorData.onboardingRate}% more needed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Assessments */}
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-progress-card">
                                            <div className="tutor-progress-card-body">
                                                <h6 className="tutor-progress-card-title">Professional Communication</h6>
                                                <p className="tutor-progress-card-description">Admin-assessed communication standards</p>
                                                
                                                {isRequirementMet('communication') ? (
                                                    <div className="tutor-progress-status-met">
                                                        <i className="fas fa-check-circle me-2"></i>
                                                        Assessment passed
                                                    </div>
                                                ) : (
                                                    <div className="tutor-progress-status-pending">
                                                        <i className="fas fa-clock me-2"></i>
                                                        Pending admin assessment
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-lg-6 col-md-12 mb-4">
                                        <div className="tutor-progress-card">
                                            <div className="tutor-progress-card-body">
                                                <h6 className="tutor-progress-card-title">Contributions Beyond Tutoring</h6>
                                                <p className="tutor-progress-card-description">Admin-assessed additional contributions</p>
                                                
                                                {isRequirementMet('contributions') ? (
                                                    <div className="tutor-progress-status-met">
                                                        <i className="fas fa-check-circle me-2"></i>
                                                        Assessment passed
                                                    </div>
                                                ) : (
                                                    <div className="tutor-progress-status-pending">
                                                        <i className="fas fa-clock me-2"></i>
                                                        {tutorData.currentTier === 'Premium' ? 'Required for Elite tier' : 'Not required for next tier'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tier Benefits */}
                            <div className="tutor-progress-section">
                                <h4 className="tutor-progress-section-title">Tier Benefits & Requirements</h4>
                                <div className="row">
                                    {['Gold', 'Premium', 'Elite'].map((tier, index) => (
                                        <div key={tier} className="col-lg-4 col-md-12 mb-4">
                                            <div className={`tutor-progress-card ${tutorData.currentTier === tier ? 'tutor-progress-current-tier' : ''}`}>
                                                <div className="tutor-progress-card-body text-center">
                                                    <div className="tutor-progress-tier-icon mb-3" style={{ color: getTierColor(tier) }}>
                                                        <i className={getTierIcon(tier)}></i>
                                                    </div>
                                                    <h6 className="tutor-progress-card-title">{tier} Tier</h6>
                                                    {tutorData.currentTier === tier && (
                                                        <span className="badge bg-dark mb-3">Current Tier</span>
                                                    )}
                                                    
                                                    <div className="tutor-progress-tier-benefits">
                                                        {tier === 'Gold' && (
                                                            <ul className="list-unstyled">
                                                                <li>Basic profile visibility</li>
                                                                <li>Standard commission rate</li>
                                                                <li>0-2 years experience</li>
                                                                <li>No review requirement</li>
                                                            </ul>
                                                        )}
                                                        {tier === 'Premium' && (
                                                            <ul className="list-unstyled">
                                                                <li>Enhanced profile features</li>
                                                                <li>Better commission rate</li>
                                                                <li>2+ years experience</li>
                                                                <li>3+ five-star reviews</li>
                                                                <li>90%+ retention & onboarding</li>
                                                            </ul>
                                                        )}
                                                        {tier === 'Elite' && (
                                                            <ul className="list-unstyled">
                                                                <li>Premium profile placement</li>
                                                                <li>Highest commission rate</li>
                                                                <li>4+ years experience</li>
                                                                <li>8+ five-star reviews</li>
                                                                <li>All performance metrics</li>
                                                                <li>Additional contributions</li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Next Steps or Eligibility */}
                            <div className="tutor-progress-section">
                                <h4 className="tutor-progress-section-title">Next Steps</h4>
                                <div className="tutor-progress-card">
                                    <div className="tutor-progress-card-body">
                                        {checkEligibilityForReview() ? (
                                            <div className="text-center">
                                                <div className="tutor-progress-eligible-notice mb-3">
                                                    <i className="fas fa-trophy text-warning me-2"></i>
                                                    <span className="fw-bold">Congratulations! You're eligible for tier review.</span>
                                                </div>
                                                <button 
                                                    className="btn btn-dark tutor-progress-btn"
                                                    onClick={() => setShowEligibilityModal(true)}
                                                >
                                                    <i className="fas fa-star me-2"></i>
                                                    Request Tier Review
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <h6 className="tutor-progress-card-title">Requirements to Complete</h6>
                                                <div className="tutor-progress-next-steps">
                                                    {!isRequirementMet('experience') && (
                                                        <div className="tutor-progress-next-step">
                                                            <i className="fas fa-clock text-secondary me-2"></i>
                                                            <span>Continue gaining experience ({getNextTierRequirement('experience') - tutorData.yearsOfExperience} years remaining)</span>
                                                        </div>
                                                    )}
                                                    {!isRequirementMet('reviews') && (
                                                        <div className="tutor-progress-next-step">
                                                            <i className="fas fa-star text-warning me-2"></i>
                                                            <span>Collect {getNextTierRequirement('reviews') - tutorData.fiveStarReviews} more five-star reviews</span>
                                                        </div>
                                                    )}
                                                    {!isRequirementMet('retention') && (
                                                        <div className="tutor-progress-next-step">
                                                            <i className="fas fa-users text-info me-2"></i>
                                                            <span>Improve student retention to {getNextTierRequirement('retention')}%</span>
                                                        </div>
                                                    )}
                                                    {!isRequirementMet('onboarding') && (
                                                        <div className="tutor-progress-next-step">
                                                            <i className="fas fa-handshake text-info me-2"></i>
                                                            <span>Improve onboarding rate to {getNextTierRequirement('onboarding')}%</span>
                                                        </div>
                                                    )}
                                                    {!isRequirementMet('communication') && (
                                                        <div className="tutor-progress-next-step">
                                                            <i className="fas fa-comments text-primary me-2"></i>
                                                            <span>Complete professional communication assessment</span>
                                                        </div>
                                                    )}
                                                    {tutorData.currentTier === 'Premium' && !isRequirementMet('contributions') && (
                                                        <div className="tutor-progress-next-step">
                                                            <i className="fas fa-hands-helping text-success me-2"></i>
                                                            <span>Complete contributions beyond tutoring assessment</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Eligibility Modal */}
            {showEligibilityModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-trophy me-2"></i>
                                    Tier Review Request
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setShowEligibilityModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="tutor-progress-modal-content">
                                    <div className="text-center mb-4">
                                        <div className="tutor-progress-celebration-icon">
                                            <i className="fas fa-star text-warning"></i>
                                        </div>
                                        <h6>Congratulations on meeting all requirements!</h6>
                                        <p className="text-muted">Your progress will be reviewed by our team within 3-5 business days.</p>
                                    </div>
                                    
                                    <div className="tutor-progress-completed-criteria">
                                        <h6>Completed Criteria:</h6>
                                        <div className="list-group list-group-flush">
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>Years of Experience</span>
                                                <i className="fas fa-check-circle text-success"></i>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>Five-Star Reviews</span>
                                                <i className="fas fa-check-circle text-success"></i>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>Student Retention</span>
                                                <i className="fas fa-check-circle text-success"></i>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>24-Hour Onboarding</span>
                                                <i className="fas fa-check-circle text-success"></i>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>Professional Communication</span>
                                                <i className="fas fa-check-circle text-success"></i>
                                            </div>
                                            {tutorData.currentTier === 'Premium' && (
                                                <div className="list-group-item d-flex justify-content-between align-items-center">
                                                    <span>Contributions Beyond Tutoring</span>
                                                    <i className="fas fa-check-circle text-success"></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowEligibilityModal(false)}
                                >
                                    Close
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        console.log('Tier review requested');
                                        setShowEligibilityModal(false);
                                    }}
                                >
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Submit Review Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TutorProgress;
