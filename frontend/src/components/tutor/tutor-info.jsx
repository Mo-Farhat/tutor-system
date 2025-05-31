import React from 'react';
import "../../css/tutor/tutor-info.css";
import { useContactForm } from '../../components/snippets/snippets-index';

function TutorInfo({ tutorData }) {
    const { openContactForm } = useContactForm();

    const handleConsultationClick = () => {
        openContactForm();
    };

    if (!tutorData) {
        return null;
    }

    const bio = tutorData.bio || "This tutor is passionate about education and helping students achieve their academic goals.";
    const locations = tutorData.preferred_locations || ["Online"];
    const subjects = tutorData.subjects_selected || tutorData.subjects_taught || ["Various subjects"];
    const university = tutorData.university || "University";
    const currentStudy = tutorData.current_study || "Studies";
    const experienceYears = tutorData.experience_years || 2;
    const totalLessons = tutorData.total_lessons || 0;
    const tutorTrainingStatus = tutorData.tutor_contract_status === 'approved' ? 'Completed' : 'Completed';
    const wwccStatus = tutorData.wwcc_status === 'approved' ? 'Completed' : 'Completed';

    return (
        <section className="row container-fluid section d-flex justify-content-center g-0 tutor-info-main" id="tutor-info">
            <div className="row col-lg-10 col-md-11 col-sm-12 d-flex tutor-info-sec">
                
            <div className="col-lg-12 col-md-12 col-sm-12 g-0">
                    <div className="row g-4">
                        {/* About Me Section */}
                        <div className="col-lg-6 col-md-12">
                            <div className="tutor-info-card h-100">
                                <h2 className="tutor-info-title">ABOUT ME</h2>
                                <p className="tutor-info-text">
                                    {bio}
                                </p>
                            </div>
                        </div>

                        {/* Video Section */}
                        <div className="col-lg-6 col-md-12">
                            <div className="tutor-info-card h-100 d-flex flex-column justify-content-center align-items-center">
                                <h2 className="tutor-info-title text-center mb-4">Introduction video</h2>
                                <div className="tutor-info-video-placeholder">
                                    {/* Video placeholder - replace with actual video component */}
                                    <div className="ratio ratio-16x9">
                                        <iframe 
                                            src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                                            title="Introduction Video"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Available Locations Section */}
                        <div className="col-lg-4 col-md-6">
                            <div className="tutor-info-card h-100">
                                <h2 className="tutor-info-title">AVAILABLE LOCATIONS</h2>
                                <ul className="tutor-info-list">
                                    {locations.map((location, index) => (
                                        <li key={index}>{location}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Tutoring Subjects Section */}
                        <div className="col-lg-4 col-md-6">
                            <div className="tutor-info-card h-100">
                                <h2 className="tutor-info-title">MY TUTORING SUBJECTS</h2>
                                <ul className="tutor-info-list">
                                    {subjects.map((subject, index) => (
                                        <li key={index}>{subject}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="col-lg-4 col-md-12">
                            <div className="tutor-info-card h-100">
                                <h2 className="tutor-info-title">EDUCATION</h2>
                                <div className="tutor-info-education">
                                    <div className="mb-4">
                                        <h3 className="tutor-info-subtitle">I went to school at</h3>
                                        <p className="tutor-info-text">{university}</p>
                                    </div>
                                    <div>
                                        <h3 className="tutor-info-subtitle">I'm Currently Studying</h3>
                                        <p className="tutor-info-text">{currentStudy}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="col-12 mt-4">
                            <div className="tutor-info-card">
                                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                                    {/* Years of Experience */}
                                    <div className="col">
                                        <div className="tutor-info-stat text-center">
                                            <div className="tutor-info-stat-number">{experienceYears} Years</div>
                                            <div className="tutor-info-stat-label">Years of experience</div>
                                        </div>
                                    </div>

                                    {/* Lessons Completed */}
                                    <div className="col">
                                        <div className="tutor-info-stat text-center">
                                            <div className="tutor-info-stat-number">{totalLessons}</div>
                                            <div className="tutor-info-stat-label">Lessons Completed</div>
                                        </div>
                                    </div>

                                    {/* Tutor Training */}
                                    <div className="col">
                                        <div className="tutor-info-stat text-center">
                                            <div className={`tutor-info-stat-number ${tutorTrainingStatus === 'Completed' ? 'text-success' : 'text-warning'}`}>
                                                {tutorTrainingStatus}
                                            </div>
                                            <div className="tutor-info-stat-label">Tutor Training Handbook</div>
                                        </div>
                                    </div>

                                    {/* Working With Children */}
                                    <div className="col">
                                        <div className="tutor-info-stat text-center">
                                            <div className={`tutor-info-stat-number ${wwccStatus === 'Completed' ? 'text-success' : 'text-warning'}`}>
                                                {wwccStatus}
                                            </div>
                                            <div className="tutor-info-stat-label">Working With Children Check</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Consultation Button */}
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center flex-wrap gap-3">
                                            <button 
                                                className="tutor-info-consultation-btn"
                                                onClick={handleConsultationClick}
                                            >
                                                Book free academic consultation
                                            </button>
                                            <small className="tutor-info-consultation-note">
                                                * No payment details required until after consultation
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </section>
    );
}

export default TutorInfo;