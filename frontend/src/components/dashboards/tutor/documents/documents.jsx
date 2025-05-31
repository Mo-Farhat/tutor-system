import React, { useState, useEffect } from 'react';
import { getTutorDocuments, uploadTutorDocuments } from '../../../../services/authService';
import { useAuth } from '../../../../contexts/AuthContext';
import "../../../../css/dashboards/tutor/documents/documents.css";

function TutorDocuments() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState({
        tutorContract: {
            file: null,
            status: 'not_uploaded',
            fileName: '',
            uploaded: false,
            fileUrl: null
        },
        wwcc: {
            file: null,
            status: 'not_uploaded',
            fileName: '',
            uploaded: false,
            fileUrl: null
        }
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [accountLive, setAccountLive] = useState(false);
    const [abnNumber, setAbnNumber] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const result = await getTutorDocuments();
            
            if (result.success) {
                const data = result.data;
                setDocuments({
                    tutorContract: {
                        file: null,
                        status: data.tutor_contract.status,
                        fileName: data.tutor_contract.uploaded ? 'Tutor Contract' : '',
                        uploaded: data.tutor_contract.uploaded,
                        fileUrl: data.tutor_contract.file_url
                    },
                    wwcc: {
                        file: null,
                        status: data.wwcc_document.status,
                        fileName: data.wwcc_document.uploaded ? 'WWCC Document' : '',
                        uploaded: data.wwcc_document.uploaded,
                        fileUrl: data.wwcc_document.file_url
                    }
                });
                setAccountLive(data.account_live);
                // Set ABN if it exists in the response
                if (data.abn) {
                    setAbnNumber(data.abn);
                }
            } else {
                setError(result.error || 'Failed to load documents');
            }
        } catch (err) {
            setError('Error loading documents: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (documentType, e) => {
        const file = e.target.files[0];
        if (file) {
            setDocuments(prev => ({
                ...prev,
                [documentType]: {
                    ...prev[documentType],
                    file: file,
                    fileName: file.name
                }
            }));
            setError('');
            setSuccess('');
        }
    };

    const handleUploadSubmit = async () => {
        const uploadData = {};
        
        if (documents.tutorContract.file) {
            uploadData.tutorContract = documents.tutorContract.file;
        }
        
        if (documents.wwcc.file) {
            uploadData.wwccDocument = documents.wwcc.file;
        }
        
        if (Object.keys(uploadData).length === 0) {
            setError('Please select at least one file to upload');
            return;
        }

        try {
            setUploading(true);
            const result = await uploadTutorDocuments(uploadData);
            
            if (result.success) {
                setSuccess('Documents uploaded successfully! They will be reviewed by our team.');
                // Refresh document status
                await fetchDocuments();
                // Clear file inputs
                setDocuments(prev => ({
                    tutorContract: {
                        ...prev.tutorContract,
                        file: null
                    },
                    wwcc: {
                        ...prev.wwcc,
                        file: null
                    }
                }));
            } else {
                setError(result.error || 'Failed to upload documents');
            }
        } catch (err) {
            setError('Error uploading documents: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleAbnChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 11) { // ABN is 11 digits
            setAbnNumber(value);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'approved':
                return <span className="status-badge approved">
                    <i className="fas fa-check-circle"></i> Approved
                </span>;
            case 'pending':
                return <span className="status-badge pending">
                    <i className="fas fa-clock"></i> Pending Approval
                </span>;
            case 'rejected':
                return <span className="status-badge rejected">
                    <i className="fas fa-times-circle"></i> Rejected
                </span>;
            default:
                return <span className="status-badge not-uploaded">
                    <i className="fas fa-exclamation-circle"></i> Not Uploaded
                </span>;
        }
    };

    if (loading) {
        return (
            <div className="tutor-documents-main">
                <div className="documents-container">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading documents...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tutor-documents-main">
            <div className="documents-container">
                <div className="documents-header">
                    <h1>
                        <i className="fas fa-file-alt"></i> Required Documents
                    </h1>
                    <p className="documents-subtitle">Please upload the following required documents to complete your profile</p>
                    
                    {accountLive && (
                        <div className="alert alert-success mt-3" role="alert">
                            <i className="fas fa-check-circle me-2"></i>
                            <strong>Congratulations!</strong> Your account is now live and you can start tutoring.
                        </div>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" role="alert">
                        <i className="fas fa-check-circle me-2"></i>
                        {success}
                    </div>
                )}

                <div className="documents-content">
                    {/* Tutor Contract Upload Section */}
                    <div className="document-section">
                        <div className="document-header">
                            <h3>
                                <i className="fas fa-file-signature"></i> Tutor Contract
                            </h3>
                            {getStatusBadge(documents.tutorContract.status)}
                        </div>
                        <div className="document-upload-container">
                            {documents.tutorContract.uploaded && documents.tutorContract.fileUrl ? (
                                <div className="uploaded-file-info">
                                    <div className="file-info">
                                        <i className="fas fa-file-pdf"></i>
                                        <span>Tutor Contract Uploaded</span>
                                        <a href={documents.tutorContract.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                            <i className="fas fa-download"></i> View
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="upload-box">
                                    <input
                                        type="file"
                                        id="tutorContract"
                                        className="file-input"
                                        onChange={(e) => handleFileUpload('tutorContract', e)}
                                        accept=".pdf,.doc,.docx"
                                    />
                                    <label htmlFor="tutorContract" className="upload-label">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span className="upload-text">
                                            {documents.tutorContract.fileName || 'Click to upload Tutor Contract'}
                                        </span>
                                        <span className="upload-hint">PDF, DOC, or DOCX</span>
                                    </label>
                                </div>
                            )}
                            <div className="document-info">
                                <p><i className="fas fa-info-circle"></i> Please download the Tutor Contract form from your dashboard, sign it, and upload it here.</p>
                            </div>
                        </div>
                    </div>

                    {/* WWCC Upload Section */}
                    <div className="document-section">
                        <div className="document-header">
                            <h3>
                                <i className="fas fa-id-card"></i> Working with Children Check (WWCC)
                            </h3>
                            {getStatusBadge(documents.wwcc.status)}
                        </div>
                        <div className="document-upload-container">
                            {documents.wwcc.uploaded && documents.wwcc.fileUrl ? (
                                <div className="uploaded-file-info">
                                    <div className="file-info">
                                        <i className="fas fa-file-image"></i>
                                        <span>WWCC Document Uploaded</span>
                                        <a href={documents.wwcc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                            <i className="fas fa-download"></i> View
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="upload-box">
                                    <input
                                        type="file"
                                        id="wwcc"
                                        className="file-input"
                                        onChange={(e) => handleFileUpload('wwcc', e)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <label htmlFor="wwcc" className="upload-label">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span className="upload-text">
                                            {documents.wwcc.fileName || 'Click to upload WWCC document'}
                                        </span>
                                        <span className="upload-hint">PDF, JPG, or PNG</span>
                                    </label>
                                </div>
                            )}
                            <div className="document-info">
                                <p><i className="fas fa-info-circle"></i> Please upload a clear copy of your valid Working with Children Check certificate.</p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Button */}
                    {(documents.tutorContract.file || documents.wwcc.file) && (
                        <div className="upload-actions">
                            <button 
                                className="btn btn-primary btn-lg"
                                onClick={handleUploadSubmit}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-upload me-2"></i>
                                        Upload Documents
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* ABN Input Section */}
                    <div className="document-section">
                        <div className="document-header">
                            <h3>
                                <i className="fas fa-briefcase"></i> Australian Business Number (ABN)
                            </h3>
                        </div>
                        <div className="document-upload-container">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={abnNumber}
                                    onChange={handleAbnChange}
                                    placeholder="Enter your 11-digit ABN"
                                    maxLength="11"
                                />
                                <small className="form-text text-muted">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Please enter your valid 11-digit Australian Business Number
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorDocuments;
