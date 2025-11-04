import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import { parseTutorRequestMessage } from '../../../../utils/messageParser';

const StudentRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);

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
                      
                      <div className="card-footer bg-transparent">
                        <div className="d-flex gap-2 flex-column">
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <i className="fas fa-info-circle me-1"></i>
                            More Info
                          </button>
                          {request.status === 'pending' && (
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
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* More Info Modal */}
      {selectedRequest && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedRequest(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Request Details - {selectedRequest.student.firstName} {selectedRequest.student.lastName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedRequest(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {(() => {
                  const parsed = parseTutorRequestMessage(selectedRequest.message);
                  return (
                    <>
                      {/* Student Information */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">
                          <i className="fas fa-user me-2"></i>
                          Student Information
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div>
                              <small className="text-muted d-block">Name</small>
                              <div className="fw-semibold">
                                {selectedRequest.student.firstName} {selectedRequest.student.lastName}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div>
                              <small className="text-muted d-block">Email</small>
                              <div className="fw-semibold">
                                <i className="fas fa-envelope me-1 text-muted"></i>
                                {selectedRequest.student.email}
                              </div>
                            </div>
                          </div>
                          {selectedRequest.student.username && (
                            <div className="col-md-6">
                              <div>
                                <small className="text-muted d-block">Username</small>
                                <div className="fw-semibold">
                                  <i className="fas fa-at me-1 text-muted"></i>
                                  @{selectedRequest.student.username}
                                </div>
                              </div>
                            </div>
                          )}
                          {parsed.phone && (
                            <div className="col-md-6">
                              <div>
                                <small className="text-muted d-block">Phone Number</small>
                                <div className="fw-semibold">
                                  <i className="fas fa-phone me-1 text-muted"></i>
                                  {parsed.phone}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <hr />

                      {/* Request Details */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          Request Details
                        </h6>
                        <div className="row g-3">
                          {parsed.subject && (
                            <div className="col-12">
                              <div>
                                <small className="text-muted d-block mb-1">Subject</small>
                                <div className="fw-semibold">
                                  <i className="fas fa-book me-1 text-muted"></i>
                                  {parsed.subject}
                                </div>
                              </div>
                            </div>
                          )}
                          {parsed.preferredContact && (
                            <div className="col-md-6">
                              <div>
                                <small className="text-muted d-block mb-1">Preferred Contact Method</small>
                                <div className="fw-semibold">
                                  <i className={`fas fa-${parsed.preferredContact === 'email' ? 'envelope' : 'phone'} me-1 text-muted`}></i>
                                  {parsed.preferredContact.charAt(0).toUpperCase() + parsed.preferredContact.slice(1)}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="col-md-6">
                            <div>
                              <small className="text-muted d-block mb-1">Request Date</small>
                              <div className="fw-semibold">
                                <i className="fas fa-clock me-1 text-muted"></i>
                                {formatDate(selectedRequest.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="col-12">
                            <div>
                              <small className="text-muted d-block mb-2">Status</small>
                              {getStatusBadge(selectedRequest.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Availability */}
                      {parsed.availability && (
                        <>
                          <hr />
                          <div className="mb-4">
                            <h6 className="text-muted mb-3">
                              <i className="fas fa-calendar-alt me-2"></i>
                              Preferred Availability
                            </h6>
                            <div className="table-responsive">
                              <table className="table table-bordered table-sm">
                                <thead>
                                  <tr>
                                    <th></th>
                                    <th>Mon</th>
                                    <th>Tue</th>
                                    <th>Wed</th>
                                    <th>Thu</th>
                                    <th>Fri</th>
                                    <th>Sat</th>
                                    <th>Sun</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="fw-semibold">Morning</td>
                                    <td className="text-center">
                                      {parsed.availability.morning?.mon ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.morning?.tue ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.morning?.wed ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.morning?.thu ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.morning?.fri ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.morning?.sat ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.morning?.sun ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="fw-semibold">Afternoon</td>
                                    <td className="text-center">
                                      {parsed.availability.afternoon?.mon ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.afternoon?.tue ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.afternoon?.wed ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.afternoon?.thu ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.afternoon?.fri ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.afternoon?.sat ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.afternoon?.sun ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="fw-semibold">Night</td>
                                    <td className="text-center">
                                      {parsed.availability.night?.mon ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.night?.tue ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.night?.wed ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.night?.thu ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.night?.fri ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.night?.sat ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                    <td className="text-center">
                                      {parsed.availability.night?.sun ? (
                                        <i className="fas fa-check text-success"></i>
                                      ) : (
                                        <i className="fas fa-times text-muted"></i>
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Availability Notes */}
                      {parsed.availabilityNotes && (
                        <>
                          <hr />
                          <div className="mb-4">
                            <h6 className="text-muted mb-2">
                              <i className="fas fa-sticky-note me-2"></i>
                              Availability Notes
                            </h6>
                            <div className="bg-light p-3 rounded">
                              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                {parsed.availabilityNotes}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Message */}
                      {parsed.message && (
                        <>
                          <hr />
                          <div>
                            <h6 className="text-muted mb-3">
                              <i className="fas fa-comment me-2"></i>
                              Message
                            </h6>
                            <div className="bg-light p-3 rounded">
                              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                {parsed.message}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Fallback: Show original message if parsing didn't extract message separately */}
                      {!parsed.message && selectedRequest.message && (
                        <>
                          <hr />
                          <div>
                            <h6 className="text-muted mb-3">
                              <i className="fas fa-comment me-2"></i>
                              Full Message
                            </h6>
                            <div className="bg-light p-3 rounded">
                              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedRequest.message}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="modal-footer">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleRespond(selectedRequest.id, 'accept');
                        setSelectedRequest(null);
                      }}
                      disabled={actionLoading[selectedRequest.id]}
                    >
                      {actionLoading[selectedRequest.id] ? (
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      ) : (
                        <i className="fas fa-check me-1"></i>
                      )}
                      Accept Request
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleRespond(selectedRequest.id, 'reject');
                        setSelectedRequest(null);
                      }}
                      disabled={actionLoading[selectedRequest.id]}
                    >
                      {actionLoading[selectedRequest.id] ? (
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      ) : (
                        <i className="fas fa-times me-1"></i>
                      )}
                      Reject Request
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRequests;
