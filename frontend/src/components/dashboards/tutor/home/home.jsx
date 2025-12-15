import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import authService from '../../../../services/authService';
import '../../../../css/dashboards/tutor/home/home.css';

function TutorHome() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [completionStatus, setCompletionStatus] = useState(null);
    const [onboardingSteps, setOnboardingSteps] = useState([]);

    useEffect(() => {
        if (user?.username) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const token = authService.getAccessToken();
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Fetch profile data
            const profileResponse = await fetch(
                `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/profile/?username=${user.username}`,
                { headers }
            );
            const profileResult = await profileResponse.json();

            // Fetch completion status
            const completionResponse = await fetch(
                `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/tutor/completion-status/?username=${user.username}`,
                { headers }
            );
            const completionResult = await completionResponse.json();

            if (profileResult.success) {
                setProfileData(profileResult.data);
            }
            if (completionResult.success) {
                setCompletionStatus(completionResult.data);
            }

            // Build onboarding steps based on real data
            buildOnboardingSteps(profileResult.data, completionResult.data);
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoading(false);
        }
    };

    const buildOnboardingSteps = (profile, completion) => {
        const missingItems = completion?.missing_items || [];
        const isProfileComplete = completion?.fully_complete || false;
        const completionPercentage = completion?.completion_percentage || 0;

        const steps = [
            {
                id: 1,
                name: 'Profile Information',
                status: !missingItems.includes('bio') && !missingItems.includes('phone_number') && !missingItems.includes('hourly_rate') ? 'complete' : 'incomplete',
                statusText: !missingItems.includes('bio') && !missingItems.includes('phone_number') && !missingItems.includes('hourly_rate') ? 'Complete' : 'Incomplete',
                action: !missingItems.includes('bio') ? 'View' : 'Complete',
                actionType: !missingItems.includes('bio') ? 'view' : 'edit',
                route: '/dashboard/tutor/profile',
                details: missingItems.filter(item => ['bio', 'phone_number', 'hourly_rate'].includes(item)).map(item => {
                    const labels = { bio: 'Add your bio', phone_number: 'Add phone number', hourly_rate: 'Set hourly rate' };
                    return labels[item] || item;
                })
            },
            {
                id: 2,
                name: 'Subjects & Locations',
                status: !missingItems.includes('subjects_selected') && !missingItems.includes('preferred_locations') ? 'complete' : 'incomplete',
                statusText: !missingItems.includes('subjects_selected') && !missingItems.includes('preferred_locations') ? 'Complete' : 'Incomplete',
                action: !missingItems.includes('subjects_selected') && !missingItems.includes('preferred_locations') ? 'View' : 'Add',
                actionType: !missingItems.includes('subjects_selected') && !missingItems.includes('preferred_locations') ? 'view' : 'edit',
                route: '/dashboard/tutor/profile',
                details: missingItems.filter(item => ['subjects_selected', 'preferred_locations'].includes(item)).map(item => {
                    const labels = { subjects_selected: 'Select subjects you tutor', preferred_locations: 'Add preferred locations' };
                    return labels[item] || item;
                })
            },
            {
                id: 3,
                name: 'Required Documents',
                status: !missingItems.includes('documents_uploaded') ? 'complete' : 'incomplete',
                statusText: !missingItems.includes('documents_uploaded') ? 'Uploaded' : 'Pending',
                action: !missingItems.includes('documents_uploaded') ? 'View' : 'Upload',
                actionType: !missingItems.includes('documents_uploaded') ? 'view' : 'add',
                route: '/dashboard/tutor/profile',
                details: missingItems.includes('documents_uploaded') ? ['Upload contract and WWCC documents'] : []
            },
            {
                id: 4,
                name: 'WWCC Verification',
                status: !missingItems.includes('wwcc_valid') ? 'complete' : 'incomplete',
                statusText: !missingItems.includes('wwcc_valid') ? 'Verified' : 'Pending',
                action: !missingItems.includes('wwcc_valid') ? 'View' : 'Submit',
                actionType: !missingItems.includes('wwcc_valid') ? 'view' : 'add',
                route: '/dashboard/tutor/profile',
                details: missingItems.includes('wwcc_valid') ? ['Submit valid WWCC for verification'] : []
            },
            {
                id: 5,
                name: 'Profile Status',
                status: profile?.is_live ? 'live' : isProfileComplete ? 'pending' : 'incomplete',
                statusText: profile?.is_live ? 'Live' : isProfileComplete ? 'Pending Approval' : `${completionPercentage}% Complete`,
                action: profile?.is_live ? 'View Public Profile' : 'View Progress',
                actionType: 'view',
                route: profile?.is_live ? `/find-a-tutor/request?tutorId=${profile?.userId}` : '/dashboard/tutor/profile',
                details: profile?.is_live 
                    ? ['Your profile is visible to students'] 
                    : isProfileComplete 
                        ? ['Waiting for admin approval']
                        : [`Complete all steps to go live`]
            }
        ];

        setOnboardingSteps(steps.filter(step => step.details?.length > 0 || step.status !== 'complete' || step.id === 5));
    };

    const handleActionClick = (step) => {
        if (step.route) {
            if (step.route.startsWith('/find-a-tutor')) {
                window.open(step.route, '_blank');
            } else {
                navigate(step.route);
            }
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'complete':
            case 'live':
                return 'complete';
            case 'pending':
                return 'pending';
            default:
                return 'incomplete';
        }
    };

    if (loading) {
        return (
            <div className="tutor-home-container">
                <div className="container-fluid">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tutor-home-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="tutor-home-content">
                            
                            {/* Welcome Section */}
                            <div className="tutor-home-section">
                                <h4 className="tutor-home-section-title">
                                    Welcome{profileData?.user?.first_name ? `, ${profileData.user.first_name}` : ''}!
                                </h4>
                                <h5 className="tutor-home-subtitle">
                                    {completionStatus?.fully_complete 
                                        ? profileData?.is_live 
                                            ? 'Your profile is live and visible to students'
                                            : 'Your profile is complete and pending approval'
                                        : 'Complete your onboarding to start tutoring'}
                                </h5>
                            </div>

                            {/* Progress Overview */}
                            {completionStatus && (
                                <div className="tutor-home-section">
                                    <div className="tutor-home-card">
                                        <div className="tutor-home-card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="fw-semibold">Profile Completion</span>
                                                <span className="fw-bold text-primary">{completionStatus.completion_percentage}%</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px' }}>
                                                <div 
                                                    className={`progress-bar ${completionStatus.completion_percentage === 100 ? 'bg-success' : 'bg-primary'}`}
                                                    role="progressbar" 
                                                    style={{ width: `${completionStatus.completion_percentage}%` }}
                                                    aria-valuenow={completionStatus.completion_percentage} 
                                                    aria-valuemin="0" 
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Onboarding Steps Card */}
                            <div className="tutor-home-section">
                                <h5 className="tutor-home-subtitle mb-3">Onboarding Steps</h5>
                                <div className="tutor-home-card">
                                    <div className="tutor-home-card-body">
                                        <div className="tutor-home-steps-list">
                                            {onboardingSteps.map((step) => (
                                                <div key={step.id} className="tutor-home-step-item">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="tutor-home-step-info">
                                                            <h6 className="tutor-home-step-name">{step.name}</h6>
                                                            <div className="tutor-home-step-status">
                                                                <span className={`tutor-home-status-indicator ${getStatusClass(step.status)}`}></span>
                                                                <span className="tutor-home-status-text">{step.statusText}</span>
                                                            </div>
                                                            {step.details && step.details.length > 0 && (
                                                                <div className="tutor-home-step-details">
                                                                    {step.details.map((detail, index) => (
                                                                        <div key={index} className="tutor-home-detail-item">
                                                                            <span className="tutor-home-bullet">•</span>
                                                                            <span className="tutor-home-detail-text">{detail}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button 
                                                            className={`btn tutor-home-action-btn tutor-home-action-${step.actionType}`}
                                                            onClick={() => handleActionClick(step)}
                                                        >
                                                            {step.action}
                                                        </button>
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
            </div>
        </div>
    );
}

export default TutorHome;
