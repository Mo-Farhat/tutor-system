import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import '../../../../css/dashboards/tutor/documents/documents.css';

function TutorDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const username = user?.username || 'notmanu23'; // Use logged in user or fallback to existing user
      const response = await fetch(`http://localhost:8000/api/auth/tutor/documents/?username=${username}`);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.data);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const username = user?.username || 'notmanu23'; // Use logged in user or fallback to existing user
      
      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('file', file);

      const response = await fetch(`http://localhost:8000/api/auth/tutor/documents/?username=${username}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Document uploaded successfully!');
        fetchDocuments(); // Refresh the documents list
      } else {
        setError('Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (documentType) => {
    const doc = documents.find(d => d.document_type === documentType);
    if (!doc) return 'not_uploaded';
    return doc.is_verified ? 'approved' : 'pending';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'not_uploaded':
        return <span className="badge bg-danger">Not Uploaded</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="tutor-documents-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="tutor-documents-content">
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading documents...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-documents-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="tutor-documents-content">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-documents-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="tutor-documents-content">
              
              {/* Page Title */}
              <h1 className="tutor-documents-title">Documents</h1>
              <p className="tutor-documents-description">
                Upload and manage your required documents for verification.
              </p>

              {/* Documents Grid */}
              <div className="row">
                {/* Tutor Contract */}
                <div className="col-md-6 mb-4">
                  <div className="tutor-documents-card">
                    <div className="tutor-documents-card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h3 className="tutor-documents-card-title">
                          <i className="fas fa-file-contract me-2"></i>
                          Tutor Contract
                        </h3>
                        {getStatusBadge(getDocumentStatus('contract'))}
                      </div>
                    </div>
                    <div className="tutor-documents-card-body">
                      <p className="tutor-documents-card-description">
                        Please download, sign, and upload the tutor contract agreement.
                      </p>
                      <div className="tutor-documents-upload-area">
                        <input
                          type="file"
                          id="contract-upload"
                          className="tutor-documents-file-input"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'contract')}
                          disabled={uploading}
                        />
                        <label htmlFor="contract-upload" className="tutor-documents-upload-label">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>{uploading ? 'Uploading...' : 'Upload Contract'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Working with Children Check */}
                <div className="col-md-6 mb-4">
                  <div className="tutor-documents-card">
                    <div className="tutor-documents-card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h3 className="tutor-documents-card-title">
                          <i className="fas fa-user-shield me-2"></i>
                          Working with Children Check
                        </h3>
                        {getStatusBadge(getDocumentStatus('wwcc'))}
                      </div>
                    </div>
                    <div className="tutor-documents-card-body">
                      <p className="tutor-documents-card-description">
                        Upload a clear copy of your valid WWCC certificate.
                      </p>
                      <div className="tutor-documents-upload-area">
                        <input
                          type="file"
                          id="wwcc-upload"
                          className="tutor-documents-file-input"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'wwcc')}
                          disabled={uploading}
                        />
                        <label htmlFor="wwcc-upload" className="tutor-documents-upload-label">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>{uploading ? 'Uploading...' : 'Upload WWCC'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other Documents */}
                <div className="col-md-6 mb-4">
                  <div className="tutor-documents-card">
                    <div className="tutor-documents-card-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <h3 className="tutor-documents-card-title">
                          <i className="fas fa-file-alt me-2"></i>
                          Other Documents
                        </h3>
                        {getStatusBadge(getDocumentStatus('other'))}
                      </div>
                    </div>
                    <div className="tutor-documents-card-body">
                      <p className="tutor-documents-card-description">
                        Upload any additional supporting documents.
                      </p>
                      <div className="tutor-documents-upload-area">
                        <input
                          type="file"
                          id="other-upload"
                          className="tutor-documents-file-input"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'other')}
                          disabled={uploading}
                        />
                        <label htmlFor="other-upload" className="tutor-documents-upload-label">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {documents.length > 0 && (
                <div className="tutor-documents-section">
                  <h2 className="tutor-documents-section-title">Uploaded Documents</h2>
                  <div className="tutor-documents-list">
                    {documents.map((doc, index) => (
                      <div key={index} className="tutor-documents-item">
                        <div className="tutor-documents-item-info">
                          <i className="fas fa-file-pdf text-danger me-3"></i>
                          <div className="tutor-documents-item-details">
                            <h6 className="tutor-documents-item-title">
                              {doc.document_type === 'contract' ? 'Tutor Contract' :
                               doc.document_type === 'wwcc' ? 'Working with Children Check' :
                               'Other Document'}
                            </h6>
                            <small className="text-muted">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <div className="tutor-documents-item-status">
                          {getStatusBadge(doc.is_verified ? 'approved' : 'pending')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Section */}
              <div className="tutor-documents-info">
                <div className="alert alert-info">
                  <h5><i className="fas fa-info-circle me-2"></i>Important Information</h5>
                  <ul className="mb-0">
                    <li>All documents must be clear and legible</li>
                    <li>PDF format is preferred for contracts</li>
                    <li>WWCC must be current and valid</li>
                    <li>Documents will be reviewed within 2-3 business days</li>
                    <li>You will be notified once documents are approved</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDocuments;
