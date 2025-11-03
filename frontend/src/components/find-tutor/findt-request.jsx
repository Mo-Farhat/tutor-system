import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTutorById } from '../../services/authService';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import TutorRequestModal from './TutorRequestModal';
import '../../css/find-tutor/findt-request.css';

const FindTutorRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tutorId = searchParams.get('tutorId');

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [faqOpen, setFaqOpen] = useState({});

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

  const handleModalSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      // If user is not authenticated, redirect to signup/login
      if (!user) {
        // Store form data in sessionStorage for after signup
        sessionStorage.setItem('pendingTutorRequest', JSON.stringify({
          tutorId: parseInt(tutorId),
          formData: formData
        }));
        navigate('/signup?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }

      // Build formatted message from form data in structured order
      const messageParts = [];
      
      if (formData.subject) {
        messageParts.push(`Subject: ${formData.subject}`);
      }
      
      if (formData.phone) {
        messageParts.push(`Phone: ${formData.phone}`);
      }
      
      if (formData.preferredContact) {
        messageParts.push(`Preferred Contact: ${formData.preferredContact}`);
      }
      
      if (formData.message) {
        messageParts.push('');
        messageParts.push('Message:');
        messageParts.push(formData.message);
      }
      
      const messageText = messageParts.join('\n').trim();

      const response = await api.post('/auth/student/tutor-requests', {
        tutorId: parseInt(tutorId),
        message: messageText || null
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setShowModal(false);
      } else {
        setError(response.data.error || 'Failed to send request');
        throw new Error(response.data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error sending request:', err);
      const errorMsg = err.response?.data?.error || 'Failed to send request. Please try again.';
      setError(errorMsg);
      throw err; // Re-throw so modal can handle it
    } finally {
      setSubmitting(false);
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

  const renderStars = (rating) => {
    const numRating = Number(rating) || 0;
    if (numRating === 0) return null;
    
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="tutor-details-rating-inline">
        <span className="tutor-details-rating-value-inline">{numRating.toFixed(1)}</span>
        <span className="tutor-details-rating-label-inline">star</span>
        <div className="tutor-details-stars-inline">
          {Array.from({ length: fullStars }).map((_, i) => (
            <i key={i} className="fas fa-star tutor-details-star-filled"></i>
          ))}
          {hasHalfStar && (
            <i className="fas fa-star-half-alt tutor-details-star-filled"></i>
          )}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <i key={`empty-${i}`} className="far fa-star tutor-details-star-empty"></i>
          ))}
        </div>
      </div>
    );
  };

  const formatTierBadge = (tier, hourlyRate) => {
    const tierNames = {
      gold: 'Gold',
      silver: 'Silver',
      bronze: 'Bronze'
    };
    const tierName = tierNames[tier] || tier;
    const rate = hourlyRate ? `$${Number(hourlyRate).toFixed(0)}/hr` : '';
    return `${tierName} ${rate ? `(${rate})` : ''}`;
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="findt-request-page">
        <div className="container py-5">
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
    );
  }

  if (error && !tutor) {
    return (
      <div className="findt-request-page">
        <div className="container py-5">
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
    );
  }

  if (!tutor) {
    return (
      <div className="findt-request-page">
        <div className="container py-5">
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
    );
  }

  const tutorName = `${tutor.name || tutor.user?.first_name || tutor.first_name || ''} ${tutor.user?.last_name || tutor.last_name || ''}`.trim() || 'Tutor';
  const hourlyRate = tutor.hourly_rate || tutor.rate || 0;
  const subjects = tutor.subjects || [];
  const locations = tutor.preferred_locations || [];
  const bio = tutor.bio || tutor.about || '';
  const profileImage = tutor.photo_url || tutor.image || getDefaultImage(tutorName);
  const rating = tutor.rating || 0;
  const atar = tutor.atar || null;
  const tier = tutor.tier || 'gold';
  const university = tutor.university || '';
  const currentStudies = tutor.current_studies || [];
  const schoolsAttended = tutor.schools_attended || [];
  const isLive = tutor.is_live !== false;
  const videoUrl = getVideoUrl(tutor);

  // FAQ data
  const faqs = [
    {
      question: `Does ${tutorName} tutor ${subjects[0] || 'this subject'}?`,
      answer: `Yes, ${tutorName} is experienced in tutoring ${subjects[0] || 'this subject'} and has a proven track record of helping students succeed.`
    },
    {
      question: `Why is ${tutorName} a good choice for ${subjects[0] || 'tutoring'}?`,
      answer: `${tutorName} brings expertise, personalized teaching methods, and a commitment to student success. With ${rating > 0 ? `a ${rating.toFixed(1)} star rating` : 'excellent reviews'} and ${tier} tier certification, they are well-equipped to help you achieve your academic goals.`
    },
    {
      question: 'What is Private Tutoring?',
      answer: 'Private tutoring provides one-on-one personalized learning sessions tailored to your specific needs, learning style, and pace. It offers focused attention and customized lesson plans to help you excel in your studies.'
    },
    {
      question: 'How do payments work?',
      answer: 'Payments are processed securely through our platform. You can pay per session or purchase packages. All payments are handled through secure payment methods, and you will receive invoices for your records.'
    },
    {
      question: 'What if I need to cancel a lesson?',
      answer: 'You can cancel or reschedule lessons up to 24 hours in advance through your dashboard. Cancellations made with less than 24 hours notice may be subject to our cancellation policy.'
    }
  ];

  return (
    <div className="findt-request-page">
      {/* Banner Section with Background */}
      <div 
        className="tutor-details-banner"
        style={{
          backgroundImage: `url('/Images/site-images/com/site-top-sec.png'), linear-gradient(to bottom, rgba(13, 35, 113, 0.9), rgba(13, 35, 113, 0.95))`
        }}
      >
        <div className="tutor-details-banner-pattern"></div>
        <div className="container tutor-details-banner-content">
          <h1 className="tutor-details-banner-text">
            Achieve <span className="tutor-details-banner-highlight">your</span> academic potential
          </h1>
        </div>
      </div>

      <div className="container tutor-details-container">
        {/* Back Button */}
        <div className="tutor-details-back-btn-wrapper">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/find-a-tutor')}>
            <i className="fas fa-arrow-left me-2"></i>
            Back to All Tutors
          </button>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="alert alert-success mb-4" role="alert">
            <h4 className="alert-heading">
              <i className="fas fa-check-circle me-2"></i>
              Request Sent Successfully!
            </h4>
            <p>
              Your request has been sent to {tutorName}. They will review your request and respond soon.
            </p>
            <hr />
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={() => navigate('/dashboard/student/tutor-requests')}>
                View My Requests
              </button>
              <button className="btn btn-outline-primary" onClick={() => navigate('/find-a-tutor')}>
                Find More Tutors
              </button>
            </div>
          </div>
        )}

        {/* Main White Card */}
        <div className="tutor-details-main-card">
          {/* Top Section: Profile Info */}
          <div className="tutor-details-profile-header">
            <div className="tutor-details-profile-header-left">
              <img 
                src={profileImage}
                alt={tutorName}
                className="tutor-details-profile-img"
                onError={(e) => {
                  e.target.src = getDefaultImage(tutorName);
                }}
              />
              <div className="tutor-details-profile-info">
                <h2 className="tutor-details-name-main">{tutorName}</h2>
                {rating > 0 && renderStars(rating)}
              </div>
            </div>
            <div className="tutor-details-profile-badges-row">
              {isLive && (
                <span className="tutor-details-badge-small tutor-details-badge-trusted-small">
                  <i className="fas fa-check-circle me-1"></i>
                  Trusted by Strive Academics
                </span>
              )}
              {atar && (
                <span className="tutor-details-badge-small tutor-details-badge-atar-small">
                  <i className="fas fa-graduation-cap me-1"></i>
                  {atar} ATAR
                </span>
              )}
              {schoolsAttended.length > 0 && (
                <span className="tutor-details-badge-small tutor-details-badge-school-small">
                  <i className="fas fa-school me-1"></i>
                  {schoolsAttended[0]}
                </span>
              )}
              <span className="tutor-details-badge-small tutor-details-badge-tier-small">
                <i className="fas fa-medal me-1"></i>
                {formatTierBadge(tier, hourlyRate)}
              </span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="tutor-details-bio-section">
            <p className="tutor-details-bio-greeting">Hello, Guys! 👋</p>
            <div className="tutor-details-bio-text">
              {bio ? (
                bio.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && (
                    <p key={idx}>{paragraph}</p>
                  )
                ))
              ) : (
                <p>{tutorName} is a qualified and experienced tutor dedicated to helping students achieve their academic goals.</p>
              )}
            </div>
            {(university || currentStudies.length > 0 || schoolsAttended.length > 0) && (
              <div className="tutor-details-education-info">
                {currentStudies.length > 0 && (
                  <p>
                    <strong>Currently studying:</strong> {currentStudies.join(', ')}
                    {university && ` at ${university}`}
                  </p>
                )}
                {schoolsAttended.length > 0 && (
                  <p>
                    <strong>Graduated from:</strong> {schoolsAttended.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="tutor-details-stats-row">
            <div className="tutor-details-stat-item">
              <div className="tutor-details-stat-label">Total Students</div>
              <div className="tutor-details-stat-value">4+ Students</div>
            </div>
            <div className="tutor-details-stat-item">
              <div className="tutor-details-stat-label">Verified Reviews</div>
              <div className="tutor-details-stat-value">
                {rating > 0 ? (
                  <>
                    <div className="tutor-details-stars-inline mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < Math.floor(rating) ? 'tutor-details-star-filled' : 'tutor-details-star-empty'}`}></i>
                      ))}
                    </div>
                    <span>{rating.toFixed(1)}</span>
                  </>
                ) : (
                  'No reviews yet'
                )}
              </div>
            </div>
            <div className="tutor-details-stat-item">
              <div className="tutor-details-stat-label">Hourly Rate</div>
              <div className="tutor-details-stat-value">{formatTierBadge(tier, hourlyRate)}</div>
            </div>
          </div>

          {/* Content Row: Video/Bio Left, More Info Right */}
          <div className="tutor-details-content-row">
            <div className="tutor-details-content-left">
              {/* Introduction Video */}
              <div className="tutor-details-video-section mb-4">
                <h3 className="tutor-details-section-title">Introduction Video</h3>
                {videoUrl ? (
                  <div className="ratio ratio-16x9">
                    <video
                      controls
                      src={videoUrl}
                      className="w-100"
                      style={{ borderRadius: '8px' }}
                      onError={(e) => {
                        console.warn('Video load error:', e);
                        // Show fallback on error
                        const videoContainer = e.target.parentElement;
                        if (videoContainer) {
                          videoContainer.innerHTML = `
                            <div class="tutor-details-video-placeholder-content">
                              <div class="tutor-details-video-placeholder-icon">
                                <i class="fas fa-video fa-3x"></i>
                              </div>
                              <p class="tutor-details-video-placeholder-text">Video not available</p>
                              <p class="tutor-details-video-placeholder-subtext">This tutor has not uploaded an introduction video yet.</p>
                            </div>
                          `;
                        }
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="ratio ratio-16x9 tutor-details-video-placeholder">
                    <div className="tutor-details-video-placeholder-content">
                      <div className="tutor-details-video-placeholder-icon">
                        <i className="fas fa-video fa-3x"></i>
                      </div>
                      <p className="tutor-details-video-placeholder-text">No introduction video available</p>
                      <p className="tutor-details-video-placeholder-subtext">This tutor has not uploaded an introduction video yet.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: More Info */}
            <div className="tutor-details-more-info">
              {/* Availability Notice */}
              {!isLive && (
                <div className="tutor-details-availability-box">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>{tutorName} isn't taking on new students at the moment.</strong>
                  <p className="mb-0 mt-2">This tutor is no longer available for tutoring. Find an alternative tutor.</p>
                  <a href="/find-a-tutor" className="tutor-details-help-link">Can't find a tutor? Let us help.</a>
                </div>
              )}

              {/* Subjects Offered */}
              {subjects.length > 0 && (
                <div className="tutor-details-info-section">
                  <h4 className="tutor-details-info-title">Subjects Offered</h4>
                  <ul className="tutor-details-info-list">
                    {subjects.map((subject, index) => (
                      <li key={index}>{subject}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Locations */}
              {locations.length > 0 && (
                <div className="tutor-details-info-section">
                  <h4 className="tutor-details-info-title">Locations</h4>
                  <ul className="tutor-details-info-list">
                    {locations.map((location, index) => (
                      <li key={index}>{location}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Request Button */}
              <button
                className="btn tutor-details-request-btn"
                onClick={() => setShowModal(true)}
                disabled={!isLive}
              >
                Request Tutor
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="tutor-details-faq-section">
          <div className="tutor-details-faq-header">
            <h2 className="tutor-details-faq-title">Get started and find your perfect tutor!</h2>
            <button className="btn tutor-details-faq-cta-btn" onClick={() => navigate('/find-a-tutor')}>
              Find a Tutor
            </button>
          </div>
          <div className="tutor-details-faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="tutor-details-faq-item">
                <button
                  className="tutor-details-faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <i className={`fas fa-chevron-${faqOpen[index] ? 'up' : 'down'}`}></i>
                </button>
                {faqOpen[index] && (
                  <div className="tutor-details-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="tutor-details-footer-cta">
        <div className="container">
          <div className="tutor-details-footer-content">
            <h3 className="tutor-details-footer-title">Ready to achieve your academic potential?</h3>
            <p className="tutor-details-footer-text">
              Connect with expert tutors who are committed to your success.
            </p>
            <button className="btn tutor-details-footer-btn" onClick={() => navigate('/find-a-tutor')}>
              Find Your Perfect Tutor
            </button>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <TutorRequestModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setError(null);
        }}
        tutorName={tutorName}
        tutorSubjects={subjects}
        onSubmit={handleModalSubmit}
        user={user}
        submitting={submitting}
        error={error}
      />
    </div>
  );
};

export default FindTutorRequest;
