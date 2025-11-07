import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTutorById } from '../../services/authService';
import '../../css/tutor/tutor-info.css';
import '../../css/tutor/tutor-top.css';

const FindTutorRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tutorId = searchParams.get('tutorId');

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tutorId) {
      setError('No tutor ID provided');
      setLoading(false);
      return;
    }
    fetchTutorProfile();
  }, [tutorId]);

  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
          const result = await getTutorById(tutorId);
          
          console.log('Tutor fetch result:', result);
          
          if (result.success && result.data) {
            const tutorData = result.data.data || result.data;
            console.log('Tutor data:', tutorData);
            console.log('Video path in tutor data:', tutorData.intro_video_path || 'not found');
            setTutor(tutorData);
      } else {
        setError(result.error || 'Failed to load tutor profile');
      }
    } catch (err) {
      console.error('Error fetching tutor:', err);
      setError('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };


  const getDefaultImage = (name) => {
    const safeName = typeof name === 'string' && name.length > 0 ? name : 'Tutor';
    const seed = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarId = (seed % 99) + 1;
    const gender = seed % 2 === 0 ? 'women' : 'men';
    return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
  };

  const getVideoUrl = (tutorData) => {
    if (!tutorData) {
      console.log('No tutor data provided for video URL');
      return null;
    }
    
    // Try multiple possible property names for the video path
    const videoPath = tutorData.intro_video_path || tutorData.introVideoPath || tutorData.intro_video;
    
    if (!videoPath) {
      console.log('No video path found in tutor data:', tutorData);
      return null;
    }
    
    console.log('Found video path:', videoPath);
    
    // If it's already a full URL, return it
    if (typeof videoPath === 'string' && /^https?:\/\//i.test(videoPath)) {
      console.log('Video URL is already a full URL:', videoPath);
      return videoPath;
    }
    
    // Construct full URL from relative path
    if (typeof videoPath === 'string') {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      let fullUrl;
      
      // Check if path contains /uploads/
      const idx = videoPath.lastIndexOf('/uploads/');
      if (idx !== -1) {
        fullUrl = `${backendUrl}${videoPath.slice(idx)}`;
      } else if (videoPath.startsWith('/uploads/')) {
        fullUrl = `${backendUrl}${videoPath}`;
      } else if (videoPath.startsWith('/')) {
        fullUrl = `${backendUrl}${videoPath}`;
      } else {
        fullUrl = `${backendUrl}/uploads/${videoPath}`;
      }
      
      console.log('Constructed video URL:', fullUrl);
      return fullUrl;
    }
    
    console.log('Video path is not a string:', typeof videoPath);
    return null;
  };


  if (loading) {
    return (
      <section className="row container-fluid section d-flex justify-content-center g-0 tutor-info-main">
        <div className="row col-lg-10 col-md-11 col-sm-12 d-flex tutor-info-sec">
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading tutor profile...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !tutor) {
    return (
      <section className="row container-fluid section d-flex justify-content-center g-0 tutor-info-main">
        <div className="row col-lg-10 col-md-11 col-sm-12 d-flex tutor-info-sec">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {error}
              <div className="mt-3">
                <button className="btn btn-primary me-2" onClick={fetchTutorProfile}>
                  Try Again
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/find-a-tutor')}>
                  Back to Tutors
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!tutor) {
    return (
      <section className="row container-fluid section d-flex justify-content-center g-0 tutor-info-main">
        <div className="row col-lg-10 col-md-11 col-sm-12 d-flex tutor-info-sec">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              Tutor not found
              <div className="mt-3">
                <button className="btn btn-primary" onClick={() => navigate('/find-a-tutor')}>
                  Back to Tutors
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Extract data for top section
  const isLive = tutor.is_live !== false;
  
  // Build full name - handle both user object and direct properties, and both snake_case and camelCase
  const firstName = tutor.user?.first_name || tutor.user?.firstName || tutor.first_name || tutor.firstName || "";
  const lastName = tutor.user?.last_name || tutor.user?.lastName || tutor.last_name || tutor.lastName || "";
  const tutorName = `${firstName} ${lastName}`.trim() || 'Tutor';
  
  const profileImage = tutor.photo_url || tutor.image || tutor.user?.profile_picture || getDefaultImage(tutorName);
  const hourlyRate = tutor.hourly_rate || tutor.rate || 0;
  const tier = tutor.tier || 'gold';
  const atar = tutor.atar || 'N/A';
  const status = isLive ? "Available" : "Not Available";
  
  // Format tier badge
  const tierNames = {
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze'
  };
  const tierName = tierNames[tier.toLowerCase()] || tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  const tierBadgeText = `${tierName} ($${Number(hourlyRate).toFixed(0)}/h)`;

  // Map data to match tutor-info.jsx structure
  const bio = tutor.bio || tutor.about || "This tutor is passionate about education and helping students achieve their academic goals.";
  const locations = tutor.preferred_locations || ["Online"];
  const subjects = tutor.subjects || tutor.subjects_selected || tutor.subjects_taught || ["Various subjects"];
  
  // Handle multiple education entries with fallback
  const schools = tutor.schools_attended && tutor.schools_attended.length > 0
    ? tutor.schools_attended
    : tutor.school
    ? [tutor.school]
    : ["School not specified"];

  const currentStudies = tutor.current_studies && tutor.current_studies.length > 0
    ? tutor.current_studies
    : tutor.university
    ? [tutor.university]
    : ["University not specified"];

  const experienceYears = tutor.experience_years || 2;
  const totalLessons = tutor.total_lessons || 0;
  const tutorTrainingStatus = tutor.tutor_contract_status === "approved" ? "Completed" : "Completed";
  const wwccStatus = tutor.wwcc_status === "approved" ? "Completed" : "Completed";
  
  const videoUrl = getVideoUrl(tutor);

  return (
    <>
      {/* Top Section - Banner, Profile, ATAR */}
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
                      e.target.src = getDefaultImage(tutorName);
                    }}
                  />
                  <div className="tutor-top-status">{status}</div>
                </div>
                
                <div className="tutor-top-info">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <h1 className="tutor-top-name m-0">{tutorName}</h1>
                    <span className="tutor-top-badge">{tierBadgeText}</span>
                  </div>
                  <button
                    className="tutor-top-contact"
                    onClick={() => navigate(`/tutor/contact?id=${tutorId}`)}
                    disabled={!isLive}
                  >
                    Contact Me
                  </button>
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

      {/* Main Content Section */}
      <section
        className="row container-fluid section d-flex justify-content-center g-0 tutor-info-main"
        id="tutor-info"
      >
        <div className="row col-lg-10 col-md-11 col-sm-12 d-flex tutor-info-sec">
          <div className="col-lg-12 col-md-12 col-sm-12 g-0">
            <div className="row g-4">
            {/* About Me Section */}
            <div className="col-lg-6 col-md-12">
              <div className="tutor-info-card h-100">
                <h2 className="tutor-info-title">ABOUT ME</h2>
                <p className="tutor-info-text">{bio}</p>
              </div>
            </div>

            {/* Video Section */}
            <div className="col-lg-6 col-md-12">
              <div className="tutor-info-card h-100 d-flex flex-column justify-content-center align-items-center">
                <h2 className="tutor-info-title text-center mb-4">
                  Introduction video
                </h2>
                <div className="tutor-info-video-placeholder">
                  {videoUrl ? (
                    <div className="ratio ratio-16x9">
                      <video
                        controls
                        src={videoUrl}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          console.warn("Video load error:", e);
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="ratio ratio-16x9 d-flex align-items-center justify-content-center bg-light">
                      <div className="text-center text-muted">
                        <i className="fas fa-video fa-3x mb-3"></i>
                        <p>No introduction video available</p>
                      </div>
                    </div>
                  )}
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
                    <p className="tutor-info-text">{schools.join(", ")}</p>
                  </div>
                  <div>
                    <h3 className="tutor-info-subtitle">
                      I'm Currently Studying
                    </h3>
                    <p className="tutor-info-text">
                      {currentStudies.join(", ")}
                    </p>
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
                      <div className="tutor-info-stat-number">
                        {experienceYears} Years
                      </div>
                      <div className="tutor-info-stat-label">
                        Years of experience
                      </div>
                    </div>
                  </div>

                  {/* Lessons Completed */}
                  <div className="col">
                    <div className="tutor-info-stat text-center">
                      <div className="tutor-info-stat-number">
                        {totalLessons}
                      </div>
                      <div className="tutor-info-stat-label">
                        Lessons Completed
                      </div>
                    </div>
                  </div>

                  {/* Tutor Training */}
                  <div className="col">
                    <div className="tutor-info-stat text-center">
                      <div
                        className={`tutor-info-stat-number ${
                          tutorTrainingStatus === "Completed"
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {tutorTrainingStatus}
                      </div>
                      <div className="tutor-info-stat-label">
                        Tutor Training Handbook
                      </div>
                    </div>
                  </div>

                  {/* Working With Children */}
                  <div className="col">
                    <div className="tutor-info-stat text-center">
                      <div
                        className={`tutor-info-stat-number ${
                          wwccStatus === "Completed"
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {wwccStatus}
                      </div>
                      <div className="tutor-info-stat-label">
                        Working With Children Check
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consultation Button */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex flex-column align-items-center">
                      <button
                        className="tutor-info-consultation-btn mb-2"
                        onClick={() => navigate(`/tutor/contact?id=${tutorId}`)}
                        disabled={!isLive}
                      >
                        Book 20-Minute Free Academic Consultation
                      </button>
                      <small className="tutor-info-consultation-note text-center">
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
    </>
  );
};

export default FindTutorRequest;
