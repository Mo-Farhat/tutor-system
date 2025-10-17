import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTutorById } from '../../services/authService';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
  const [message, setMessage] = useState('');

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
        // The backend returns { success: true, data: { user: {...}, ...tutorProfile } }
        // getTutorById wraps it again, so we need to check the structure
        const tutorData = result.data.data || result.data;
        console.log('Tutor data:', tutorData);
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

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await api.post('/auth/student/tutor-requests', {
        tutorId: parseInt(tutorId),
        message: message.trim() || null
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setMessage('');
      } else {
        setError(response.data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error sending request:', err);
      setError(err.response?.data?.error || 'Failed to send request. Please try again.');
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

  const tutorName = `${tutor.name || tutor.user?.first_name || ''} ${tutor.user?.last_name || ''}`.trim() || 'Tutor';
  const tutorEmail = tutor.email || tutor.user?.email || '';
  const hourlyRate = tutor.hourly_rate || tutor.rate || 0;
  const subjects = tutor.subjects || [];
  const locations = tutor.preferred_locations || [];
  const bio = tutor.bio || tutor.about || '';
  const profileImage = tutor.image || tutor.photo_url || getDefaultImage(tutorName);

  return (
    <div className="findt-request-page">
      <div className="container py-5">
        <div className="row">
          {/* Back Button */}
          <div className="col-12 mb-4">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/find-a-tutor')}>
              <i className="fas fa-arrow-left me-2"></i>
              Back to All Tutors
            </button>
          </div>

          {/* Tutor Profile Card */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <div className="tutor-profile-image mb-3">
                  <img 
                    src={profileImage}
                    alt={tutorName}
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = getDefaultImage(tutorName);
                    }}
                  />
                </div>
                <h3 className="card-title mb-2">{tutorName}</h3>
                {tutorEmail && (
                  <p className="text-muted mb-2">
                    <i className="fas fa-envelope me-1"></i>
                    {tutorEmail}
                  </p>
                )}
                <div className="tutor-rate mb-3">
                  <h4 className="text-primary mb-0">
                    ${Number(hourlyRate).toFixed(0)}<small className="text-muted">/hour</small>
                  </h4>
                </div>
                {tutor.atar && (
                  <div className="mb-2">
                    <span className="badge bg-success">
                      <i className="fas fa-graduation-cap me-1"></i>
                      ATAR: {tutor.atar}
                    </span>
                  </div>
                )}
                {tutor.status && (
                  <div className="mb-2">
                    <span className={`badge ${tutor.status.toLowerCase() === 'available' ? 'bg-success' : 'bg-warning'}`}>
                      {tutor.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tutor Details and Request Form */}
          <div className="col-lg-8">
            {submitSuccess ? (
              <div className="alert alert-success" role="alert">
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
            ) : (
              <>
                {/* About Section */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-user me-2"></i>
                      About {tutorName}
                    </h5>
                  </div>
                  <div className="card-body">
                    {bio ? (
                      <p className="card-text">{bio}</p>
                    ) : (
                      <p className="text-muted">No bio available</p>
                    )}
                  </div>
                </div>

                {/* Subjects Section */}
                {subjects.length > 0 && (
                  <div className="card shadow-sm mb-4">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="fas fa-book me-2"></i>
                        Subjects
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex flex-wrap gap-2">
                        {subjects.map((subject, index) => (
                          <span key={index} className="badge bg-primary">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Locations Section */}
                {locations.length > 0 && (
                  <div className="card shadow-sm mb-4">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        Preferred Locations
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex flex-wrap gap-2">
                        {locations.map((location, index) => (
                          <span key={index} className="badge bg-secondary">
                            <i className="fas fa-map-pin me-1"></i>
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Request Form */}
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Tutor Request
                    </h5>
                  </div>
                  <div className="card-body">
                    {!user ? (
                      <div className="alert alert-info" role="alert">
                        <i className="fas fa-info-circle me-2"></i>
                        Please <a href="/login" className="alert-link">login</a> or <a href="/signup" className="alert-link">sign up</a> to send a tutor request.
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitRequest}>
                        {error && (
                          <div className="alert alert-danger" role="alert">
                            {error}
                          </div>
                        )}
                        
                        <div className="mb-3">
                          <label htmlFor="message" className="form-label">
                            Message (Optional)
                          </label>
                          <textarea
                            className="form-control"
                            id="message"
                            rows="4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell the tutor about your learning goals, preferred schedule, or any questions you have..."
                          />
                          <div className="form-text">
                            Add a personal message to introduce yourself and explain what you're looking for.
                          </div>
                        </div>

                        <div className="d-grid gap-2">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </span>
                                Sending Request...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-paper-plane me-2"></i>
                                Send Request to {tutorName}
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindTutorRequest;
