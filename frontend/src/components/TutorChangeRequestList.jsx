import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import tutorService from '../services/tutorService';

const TutorChangeRequestList = ({ refreshTrigger }) => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchChangeRequests();
  }, [refreshTrigger]);

  const fetchChangeRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await tutorService.getMyChangeRequests();
      
      if (response.success) {
        // Sort by most recent first
        const sortedRequests = (response.data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setChangeRequests(sortedRequests);
      } else {
        throw new Error(response.error || 'Failed to fetch change requests');
      }
    } catch (err) {
      console.error('Error fetching change requests:', err);
      setError(err.message || 'Failed to load your change requests');
      setChangeRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending Review' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFieldName = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 mb-0">Loading your change requests...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">My Change Requests</h5>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={fetchChangeRequests}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
              <Button 
                variant="link" 
                className="p-0 ms-2"
                onClick={fetchChangeRequests}
              >
                Try again
              </Button>
            </Alert>
          )}

          {changeRequests.length === 0 && !error ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">You haven't submitted any change requests yet.</p>
              <small className="text-muted">
                Use the form above to request changes to your profile information.
              </small>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Requested Change</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {changeRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{formatFieldName(request.type)}</strong>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {request.newValue}
                        </div>
                        {request.newValue.length > 50 && (
                          <small className="text-muted">
                            (Click "View" to see full text)
                          </small>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(request.status)}
                      </td>
                      <td>
                        <small>{formatDate(request.createdAt)}</small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Change Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <div className="row mb-3">
                <div className="col-sm-3"><strong>Field:</strong></div>
                <div className="col-sm-9">{formatFieldName(selectedRequest.type)}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3"><strong>Status:</strong></div>
                <div className="col-sm-9">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3"><strong>Submitted:</strong></div>
                <div className="col-sm-9">{formatDate(selectedRequest.createdAt)}</div>
              </div>
              
              {selectedRequest.reviewedAt && (
                <div className="row mb-3">
                  <div className="col-sm-3"><strong>Reviewed:</strong></div>
                  <div className="col-sm-9">{formatDate(selectedRequest.reviewedAt)}</div>
                </div>
              )}
              
              {selectedRequest.oldValue && (
                <div className="row mb-3">
                  <div className="col-sm-3"><strong>Previous Value:</strong></div>
                  <div className="col-sm-9">
                    <div className="bg-light p-2 rounded">
                      <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
                        {selectedRequest.oldValue}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="row mb-3">
                <div className="col-sm-3"><strong>Requested Value:</strong></div>
                <div className="col-sm-9">
                  <div className="bg-primary bg-opacity-10 p-2 rounded border">
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
                      {selectedRequest.newValue}
                    </pre>
                  </div>
                </div>
              </div>
              
              {selectedRequest.comments && (
                <div className="row mb-3">
                  <div className="col-sm-3"><strong>Admin Comments:</strong></div>
                  <div className="col-sm-9">
                    <div className={`p-2 rounded ${
                      selectedRequest.status === 'approved' 
                        ? 'bg-success bg-opacity-10 border border-success-subtle' 
                        : selectedRequest.status === 'rejected'
                        ? 'bg-danger bg-opacity-10 border border-danger-subtle'
                        : 'bg-light'
                    }`}>
                      <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
                        {selectedRequest.comments}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TutorChangeRequestList;