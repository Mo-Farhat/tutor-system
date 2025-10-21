import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';

const StudentRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/tutor/tutor-requests');
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

  const handleRespond = async (requestId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      const response = await api.post(`/auth/tutor/tutor-requests/${requestId}/respond`, {
        action
      });
      
      if (response.data.success) {
        // Update the request in the local state
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' }
              : req
          )
        );
      } else {
        setError(response.data.error || 'Failed to respond to request');
      }
    } catch (err) {
      console.error('Error responding to request:', err);
      setError('Failed to respond to request');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
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
      <div className="student-requests-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-requests-container">
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-2" 
            onClick={fetchRequests}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-requests-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h3 mb-0">Student Requests</h2>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchRequests}
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">No Student Requests</h4>
                <p className="text-muted">You haven't received any student requests yet.</p>
              </div>
            ) : (
              <div className="row">
                {requests.map((request) => (
                  <div key={request.id} className="col-lg-6 col-xl-4 mb-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                          {request.student.firstName} {request.student.lastName}
                        </h6>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="fas fa-envelope me-1"></i>
                            {request.student.email}
                          </small>
                        </div>
                        
                        {request.student.username && (
                          <div className="mb-3">
                            <small className="text-muted">
                              <i className="fas fa-user me-1"></i>
                              @{request.student.username}
                            </small>
                          </div>
                        )}

                        {request.message && (
                          <div className="mb-3">
                            <h6 className="text-muted mb-2">Message:</h6>
                            <p className="card-text small">{request.message}</p>
                          </div>
                        )}

                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {formatDate(request.createdAt)}
                          </small>
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="card-footer bg-transparent">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm flex-fill"
                              onClick={() => handleRespond(request.id, 'accept')}
                              disabled={actionLoading[request.id]}
                            >
                              {actionLoading[request.id] ? (
                                <span className="spinner-border spinner-border-sm me-1" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </span>
                              ) : (
                                <i className="fas fa-check me-1"></i>
                              )}
                              Accept
                            </button>
                            <button
                              className="btn btn-danger btn-sm flex-fill"
                              onClick={() => handleRespond(request.id, 'reject')}
                              disabled={actionLoading[request.id]}
                            >
                              {actionLoading[request.id] ? (
                                <span className="spinner-border spinner-border-sm me-1" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </span>
                              ) : (
                                <i className="fas fa-times me-1"></i>
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
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

export default StudentRequests;
