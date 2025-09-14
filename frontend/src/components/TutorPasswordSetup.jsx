import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyPasswordSetupToken, setupTutorPassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const TutorPasswordSetup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [tutorInfo, setTutorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    const result = await verifyPasswordSetupToken(token);
    
    if (result.success) {
      setTutorInfo(result.data);
    } else {
      setError(result.message || 'Invalid or expired setup link');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Clear custom validity
    const field = document.getElementById(name);
    if (field) {
      field.setCustomValidity('');
    }
  };

  const validateForm = () => {
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    // Clear previous custom validity
    if (passwordField) passwordField.setCustomValidity('');
    if (confirmPasswordField) confirmPasswordField.setCustomValidity('');
    
    if (!formData.password || formData.password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      if (passwordField) passwordField.setCustomValidity(errorMsg);
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      if (confirmPasswordField) confirmPasswordField.setCustomValidity(errorMsg);
      return false;
    }
    
    // Check for common password patterns
    if (/^\d+$/.test(formData.password)) {
      const errorMsg = 'Password cannot be entirely numeric';
      setError(errorMsg);
      if (passwordField) passwordField.setCustomValidity(errorMsg);
      return false;
    }
    
    // Check for too simple passwords
    const commonPasswords = ['password', '12345678', 'qwerty123', 'abcdefgh'];
    if (commonPasswords.includes(formData.password.toLowerCase())) {
      const errorMsg = 'Password is too common. Please choose a more secure password.';
      setError(errorMsg);
      if (passwordField) passwordField.setCustomValidity(errorMsg);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Clear any previous validation errors
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    if (passwordField) passwordField.setCustomValidity('');
    if (confirmPasswordField) confirmPasswordField.setCustomValidity('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    // Prepare data with correct field names for backend
    const passwordData = {
      password: formData.password,
      password_confirm: formData.confirmPassword
    };
    
    const result = await setupTutorPassword(token, passwordData);
    
    if (result.success) {
      // If the backend returned a token, automatically log the user in
      if (result.data && result.data.token) {
        // The authService already stored the token, so we can navigate directly to dashboard
        navigate('/dashboard/tutor/home', { 
          state: { 
            message: 'Welcome to StriveAcademy! Your password has been set successfully.'
          }
        });
      } else {
        // Fallback to login page if no token was returned
        navigate('/login', { 
          state: { 
            message: 'Password set successfully! Please log in with your new password.',
            email: result.data?.email || tutorInfo?.email,
            username: result.data?.username || tutorInfo?.username,
            isNewTutor: true
          }
        });
      }
    } else {
      // Show specific backend error message
      const errorMessage = result.error || result.data?.error || 'Failed to set password';
      setError(errorMessage);
      console.error('Password setup error:', result);
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Verifying setup link...</p>
        </div>
      </div>
    );
  }

  if (error && !tutorInfo) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <i className="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>
                  <h4 className="card-title text-danger">Invalid Setup Link</h4>
                  <p className="card-text">{error}</p>
                  <p className="text-muted">
                    This link may have expired or been used already. Please contact support if you need assistance.
                  </p>
                  <a href="mailto:tutors@striveacademy.com" className="btn btn-primary">
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-header bg-success text-white text-center">
                <h4 className="mb-0">
                  <i className="fas fa-check-circle me-2"></i>
                  Welcome to Strive Academy!
                </h4>
              </div>
              <div className="card-body p-4">
                {tutorInfo && (
                  <div className="alert alert-success" role="alert">
                    <strong>Congratulations {tutorInfo.firstName}!</strong> Your application has been approved.
                  </div>
                )}
                
                <div className="mb-3">
                  <h6 className="text-muted">Account Details:</h6>
                  <p className="mb-1"><strong>Name:</strong> {tutorInfo?.firstName} {tutorInfo?.lastName}</p>
                  <p className="mb-1"><strong>Email:</strong> {tutorInfo?.email}</p>
                  <p className="mb-3"><strong>University:</strong> {tutorInfo?.university}</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <h6 className="mb-3">Set Your Password</h6>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="8"
                      placeholder="Enter your password (min. 8 characters)"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Setting up your account...
                      </>
                    ) : (
                      'Complete Setup & Continue'
                    )}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    After setting your password, you'll be redirected to your tutor dashboard.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPasswordSetup; 