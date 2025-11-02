import React, { useState, useEffect } from 'react';
import '../../css/find-tutor/tutor-request-modal.css';

const TutorRequestModal = ({ isOpen, onClose, tutorName, tutorSubjects, onSubmit, user, submitting, error: parentError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    if (!user && (!formData.password || formData.password.length < 8)) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!user && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!user && !formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    // Call parent's submit handler
    if (onSubmit) {
      try {
        await onSubmit(formData);
      } catch (err) {
        // Error is handled by parent, but we can set it here too if needed
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        }
      }
    }
  };

  return (
    <div className="tutor-request-modal-overlay" onClick={onClose}>
      <div className="tutor-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tutor-request-modal-header">
          <h3>Request Tutor</h3>
          <button className="tutor-request-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="tutor-request-modal-body">
          <form onSubmit={handleSubmit}>
            {(error || parentError) && (
              <div className="alert alert-danger" role="alert">
                {error || parentError}
              </div>
            )}

            <div className="row g-3">
              <div className="col-md-6">
                <div className="tutor-request-form-group">
                  <label htmlFor="modal-name" className="tutor-request-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="modal-name"
                    name="name"
                    className="tutor-request-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="tutor-request-form-group">
                  <label htmlFor="modal-email" className="tutor-request-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="modal-email"
                    name="email"
                    className="tutor-request-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="tutor-request-form-group">
                  <label htmlFor="modal-phone" className="tutor-request-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="modal-phone"
                    name="phone"
                    className="tutor-request-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="tutor-request-form-group">
                  <label htmlFor="modal-subject" className="tutor-request-label">
                    Subject *
                  </label>
                  <select
                    id="modal-subject"
                    name="subject"
                    className="tutor-request-select"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    {tutorSubjects && tutorSubjects.map((subject, idx) => (
                      <option key={idx} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!user && (
                <>
                  <div className="col-md-6">
                    <div className="tutor-request-form-group">
                      <label htmlFor="modal-password" className="tutor-request-label">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="modal-password"
                        name="password"
                        className="tutor-request-input"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="8"
                      />
                      <small className="tutor-request-help-text">Minimum 8 characters</small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="tutor-request-form-group">
                      <label htmlFor="modal-confirm-password" className="tutor-request-label">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        id="modal-confirm-password"
                        name="confirmPassword"
                        className="tutor-request-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="8"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="col-12">
                <div className="tutor-request-form-group">
                  <label className="tutor-request-label d-block">Preferred Contact Method *</label>
                  <div className="tutor-request-radio-group">
                    <div className="tutor-request-radio">
                      <input
                        type="radio"
                        id="modal-email-preference"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleChange}
                      />
                      <label htmlFor="modal-email-preference">Email</label>
                    </div>
                    <div className="tutor-request-radio">
                      <input
                        type="radio"
                        id="modal-phone-preference"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleChange}
                      />
                      <label htmlFor="modal-phone-preference">Phone</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="tutor-request-form-group">
                  <label htmlFor="modal-message" className="tutor-request-label">
                    Message *
                  </label>
                  <textarea
                    id="modal-message"
                    name="message"
                    className="tutor-request-textarea"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell the tutor about your learning goals, preferred schedule, or any questions you have..."
                  ></textarea>
                </div>
              </div>

              {!user && (
                <div className="col-12">
                  <div className="tutor-request-form-group">
                    <div className="tutor-request-terms">
                      <input
                        type="checkbox"
                        id="modal-terms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="modal-terms">
                        I agree to the <a href="/terms" target="_blank">Terms and Conditions</a>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="tutor-request-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary tutor-request-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Sending...
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
        </div>
      </div>
    </div>
  );
};

export default TutorRequestModal;

