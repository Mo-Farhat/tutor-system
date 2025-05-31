import React from 'react';
import { Link } from 'react-router-dom';
import "../../css/tutor/tutor-top.css";

function TutorTop({ tutorData, getDefaultImage }) {
    if (!tutorData) {
        return null;
    }

    const tutorName = `${tutorData.user?.first_name || ''} ${tutorData.user?.last_name || ''}`.trim() || 'Tutor';
    const profileImage = tutorData.user?.profile_picture || getDefaultImage?.(tutorName) || 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png';
    const hourlyRate = tutorData.hourly_rate || '30';
    const rating = tutorData.rating || '0.00';
    const atar = tutorData.atar || 'N/A';
    const status = "Available"; // You can make this dynamic based on tutor availability

    return (
        <section className="row container-fluid section d-flex justify-content-center g-0 tutor-top-main" id="tutor-top">
            <div className="row col-lg-10 col-md-11 col-sm-12 d-flex tutor-top-sec">
                <div className="tutor-top-content g-0">
                    <div className="tutor-top-banner">
                        <div className="tutor-top-banner-text">
                            Achieve your goals with a Strive tutor.
                        </div>
                    </div>
                    
                    <div className="tutor-top-profile container">
                        <div className="tutor-top-profile-left">
                            <div className="tutor-top-avatar-container">
                                <img 
                                    src={profileImage} 
                                    alt="Tutor avatar" 
                                    className="tutor-top-avatar"
                                    onError={(e) => {
                                        e.target.src = getDefaultImage?.(tutorName) || 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png';
                                    }}
                                />
                                <div className="tutor-top-status">{status}</div>
                            </div>
                            
                            <div className="tutor-top-info">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <h1 className="tutor-top-name m-0">{tutorName}</h1>
                                    <span className="tutor-top-badge">Gold (${hourlyRate}/h)</span>
                                </div>
                                <Link to="/tutor/contact" className="tutor-top-contact">Contact Me</Link>
                            </div>
                        </div>
                        
                        <div className="tutor-top-profile-right mb-3">
                            <div className="tutor-top-rating">
                                <span className="tutor-top-score">{atar}</span>
                                <span className="tutor-top-label">ATAR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TutorTop;