import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/tutor/home/home.css';

function TutorHome() {
    const [onboardingSteps] = useState([
        {
            id: 1,
            name: 'Tutor Training',
            status: 'passed',
            statusText: 'Passed',
            action: 'View',
            actionType: 'view'
        },
        {
            id: 2,
            name: 'Tutor Profile',
            status: 'incomplete',
            statusText: 'Incomplete',
            action: 'Edit',
            actionType: 'edit'
        },
        {
            id: 3,
            name: 'Tutor Preferences',
            status: 'incomplete',
            statusText: 'Incomplete',
            action: 'Edit',
            actionType: 'edit'
        },
        {
            id: 4,
            name: 'Tutor Community',
            status: 'joined',
            statusText: 'Joined',
            action: 'View',
            actionType: 'view'
        },
        {
            id: 5,
            name: 'Availability',
            status: 'incomplete',
            statusText: 'Incomplete',
            action: 'Add',
            actionType: 'add',
            details: [
                '5.00 weekly hours still available',
                '0 available time slots'
            ]
        }
    ]);

    const handleActionClick = (step) => {
        // Handle different action types
        switch (step.actionType) {
            case 'view':
                console.log(`Viewing ${step.name}`);
                break;
            case 'edit':
                console.log(`Editing ${step.name}`);
                break;
            case 'add':
                console.log(`Adding to ${step.name}`);
                break;
            default:
                break;
        }
    };

    return (
        <div className="tutor-home-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="tutor-home-content">
                            
                            {/* Archived Section Header */}
                            <div className="tutor-home-section">
                                <h4 className="tutor-home-section-title">Archived</h4>
                                <h5 className="tutor-home-subtitle">Onboarding Steps</h5>
                            </div>

                            {/* Onboarding Steps Card */}
                            <div className="tutor-home-section">
                                <div className="tutor-home-card">
                                    <div className="tutor-home-card-body">
                                        <div className="tutor-home-steps-list">
                                            {onboardingSteps.map((step) => (
                                                <div key={step.id} className="tutor-home-step-item">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="tutor-home-step-info">
                                                            <h6 className="tutor-home-step-name">{step.name}</h6>
                                                            <div className="tutor-home-step-status">
                                                                <span className={`tutor-home-status-indicator ${step.status}`}></span>
                                                                <span className="tutor-home-status-text">{step.statusText}</span>
                                                            </div>
                                                            {step.details && (
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
