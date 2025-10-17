import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';

const TutorRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    tutorId: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/student/tutor-requests');
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.tutorId.trim()) {
      setError('Please enter a tutor ID');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await api.post('/auth/student/tutor-requests', {
        tutorId: parseInt(newRequest.tutorId),
        message: newRequest.message.trim() || null
      });

      if (response.data.success) {
        // Add the new request to the list
        setRequests(prev => [response.data.data, ...prev]);
        setNewRequest({ tutorId: '', message: '' });
        setShowNewRequestForm(false);
      } else {
        setError(response.data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error sending request:', err);
      setError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      rejected: 'badge-danger'
    };
    
    const statusText = {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected'
    };

    return (
      <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>
        {statusText[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="tutor-requests-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-requests-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h3 mb-0">Tutor Requests</h2>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchRequests}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewRequestForm(!showNewRequestForm)}
                >
                  <i className="fas fa-plus me-1"></i>
                  New Request
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
                <button 
                  className="btn btn-sm btn-outline-danger ms-2" 
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* New Request Form */}
            {showNewRequestForm && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Send New Tutor Request</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmitRequest}>
                    <div className="mb-3">
                      <label htmlFor="tutorId" className="form-label">
                        Tutor ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="tutorId"
                        value={newRequest.tutorId}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, tutorId: e.target.value }))}
                        placeholder="Enter tutor ID"
                        required
                      />
                      <div className="form-text">
                        You can find tutor IDs in the tutor directory or from your tutor's profile.
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">Message (Optional)</label>
                      <textarea
                        className="form-control"
                        id="message"
                        rows="3"
                        value={newRequest.message}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Add a personal message to your request..."
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-1"></i>
                            Send Request
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowNewRequestForm(false);
                          setNewRequest({ tutorId: '', message: '' });
                          setError(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Requests List */}
            {requests.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-paper-plane fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">No Tutor Requests</h4>
                <p className="text-muted">You haven't sent any tutor requests yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowNewRequestForm(true)}
                >
                  <i className="fas fa-plus me-1"></i>
                  Send Your First Request
                </button>
              </div>
            ) : (
              <div className="row">
                {requests.map((request) => (
                  <div key={request.id} className="col-lg-6 col-xl-4 mb-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                          {request.tutor.firstName} {request.tutor.lastName}
                        </h6>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="fas fa-envelope me-1"></i>
                            {request.tutor.email}
                          </small>
                        </div>
                        
                        {request.tutor.username && (
                          <div className="mb-3">
                            <small className="text-muted">
                              <i className="fas fa-user me-1"></i>
                              @{request.tutor.username}
                            </small>
                          </div>
                        )}

                        {request.message && (
                          <div className="mb-3">
                            <h6 className="text-muted mb-2">Your Message:</h6>
                            <p className="card-text small">{request.message}</p>
                          </div>
                        )}

                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            Sent {formatDate(request.createdAt)}
                          </small>
                        </div>

                        {request.status === 'accepted' && (
                          <div className="alert alert-success alert-sm mb-0">
                            <i className="fas fa-check-circle me-1"></i>
                            <strong>Request Accepted!</strong> You can now schedule lessons with this tutor.
                          </div>
                        )}

                        {request.status === 'rejected' && (
                          <div className="alert alert-danger alert-sm mb-0">
                            <i className="fas fa-times-circle me-1"></i>
                            <strong>Request Declined</strong> This tutor is not available at the moment.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorRequests;
