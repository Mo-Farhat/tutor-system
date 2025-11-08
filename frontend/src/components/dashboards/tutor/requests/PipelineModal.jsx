import React, { useState, useEffect } from 'react';
import pipelineService from '../../../../services/pipelineService';

const PipelineModal = ({ show, onHide, studentId, studentName }) => {
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (show && studentId) {
      fetchPipeline();
    }
  }, [show, studentId]);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pipelineService.getTutorStudentPipeline(studentId);
      
      if (response.success) {
        setPipeline(response.data.stages || []);
      } else {
        setError(response.error || 'Failed to fetch pipeline');
      }
    } catch (err) {
      console.error('Error fetching pipeline:', err);
      setError('Failed to fetch pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (stageKey, newStatus) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await pipelineService.updateTutorStudentPipelineStage(
        studentId,
        stageKey,
        { status: newStatus }
      );

      if (response.success) {
        // Update the local state
        setPipeline(prevPipeline => 
          prevPipeline.map(stage => 
            stage.key === stageKey 
              ? { 
                  ...stage, 
                  status: newStatus,
                  date: newStatus === 'completed' ? new Date().toISOString() : stage.date
                }
              : stage
          )
        );
        setSuccess(response.message || 'Pipeline updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update pipeline');
      }
    } catch (err) {
      console.error('Error updating pipeline:', err);
      setError('Failed to update pipeline');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: 'fa-check-circle',
      in_progress: 'fa-clock',
      pending: 'fa-circle',
    };
    return icons[status] || 'fa-circle';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      in_progress: 'primary',
      pending: 'secondary',
    };
    return colors[status] || 'secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!show) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onHide}
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-tasks me-2"></i>
              Lesson Pipeline - {studentName}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button 
                  className="btn btn-sm btn-outline-danger ms-2" 
                  onClick={fetchPipeline}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Retry
                </button>
              </div>
            ) : (
              <>
                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSuccess(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <div className="pipeline-stages">
                  {pipeline.map((stage, index) => (
                    <div key={stage.key} className="mb-4">
                      <div className="d-flex align-items-start">
                        {/* Status Icon */}
                        <div className="me-3" style={{ minWidth: '40px' }}>
                          <div 
                            className={`rounded-circle d-flex align-items-center justify-content-center bg-${getStatusColor(stage.status)}`}
                            style={{ width: '40px', height: '40px' }}
                          >
                            <i className={`fas ${getStatusIcon(stage.status)} text-white`}></i>
                          </div>
                          {index < pipeline.length - 1 && (
                            <div 
                              className="mx-auto mt-2"
                              style={{
                                width: '2px',
                                height: '30px',
                                backgroundColor: '#dee2e6',
                              }}
                            ></div>
                          )}
                        </div>

                        {/* Stage Details */}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{stage.name}</h6>
                              <small className="text-muted">
                                <i className="fas fa-calendar me-1"></i>
                                {formatDate(stage.date)}
                              </small>
                            </div>
                            <span className={`badge bg-${getStatusColor(stage.status)}`}>
                              {stage.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Status Dropdown */}
                          <div className="mt-2">
                            <label className="form-label small text-muted mb-1">
                              Update Status
                            </label>
                            <select
                              className="form-select form-select-sm"
                              value={stage.status}
                              onChange={(e) => handleStatusChange(stage.key, e.target.value)}
                              disabled={updating}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>

                          {stage.notes && (
                            <div className="mt-2">
                              <small className="text-muted">
                                <i className="fas fa-sticky-note me-1"></i>
                                {stage.notes}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pipeline Progress Summary */}
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-2">
                    <i className="fas fa-chart-line me-2"></i>
                    Progress Summary
                  </h6>
                  <div className="progress" style={{ height: '25px' }}>
                    {(() => {
                      const completedCount = pipeline.filter(s => s.status === 'completed').length;
                      const inProgressCount = pipeline.filter(s => s.status === 'in_progress').length;
                      const totalCount = pipeline.length;
                      const completedPercent = (completedCount / totalCount) * 100;
                      const inProgressPercent = (inProgressCount / totalCount) * 100;

                      return (
                        <>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${completedPercent}%` }}
                            aria-valuenow={completedPercent} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          >
                            {completedCount > 0 && `${completedCount} Completed`}
                          </div>
                          <div 
                            className="progress-bar bg-primary" 
                            role="progressbar" 
                            style={{ width: `${inProgressPercent}%` }}
                            aria-valuenow={inProgressPercent} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          >
                            {inProgressCount > 0 && `${inProgressCount} In Progress`}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <small className="text-muted mt-2 d-block">
                    {pipeline.filter(s => s.status === 'completed').length} of {pipeline.length} stages completed
                  </small>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button 
              className="btn btn-secondary" 
              onClick={onHide}
              disabled={updating}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineModal;

