import React, { useState, useEffect } from "react";
import { TUTOR_TIER_LABELS } from "../constants/adminConstants";
import {
  makeTutorLive,
  makeTutorOffline,
  getTutorProfile,
  getTutorDocuments,
  approveIntroVideo,
  rejectIntroVideo,
  changeTutorTier,
} from "../../../../services/adminService";
import ChangeRequestsTab from "./ChangeRequestsTab";
import SessionsTab from "./SessionsTab";
import CalendarTab from "./CalendarTab";
import "../../../../css/dashboards/admin/tutors/tutorProfile.css";

function TutorProfileModal({ tutor, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tutorData, setTutorData] = useState(tutor);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load tutor data and documents
  useEffect(() => {
    let isMounted = true; // Track if component is mounted

    const loadTutorData = async () => {
      if (!tutor?.id) return;

      setLoading(true);
      setError(null);

      try {
        // If this is an application, use the application data directly
        if (tutor.isApplication) {
          const applicationData = tutor.applicationData || tutor;

          if (isMounted) {
            setTutorData({
              ...applicationData,
              user: {
                firstName: applicationData.fullName?.split(" ")[0] || "",
                lastName:
                  applicationData.fullName?.split(" ").slice(1).join(" ") || "",
                email: applicationData.email,
                createdAt: applicationData.createdAt,
              },
              phone_number: applicationData.phone,
              university: applicationData.currentStudy,
              atar: applicationData.atar,
              bio: applicationData.motivation,
              subjects: applicationData.subjectsToTutor
                ? [applicationData.subjectsToTutor]
                : [],
              is_live: false,
              documents_uploaded: false,
              tier: "bronze",
              rating: null,
              hourly_rate: 0,
            });
            setDocuments([]); // Applications don't have documents yet
          }
        } else {
          // Load detailed tutor profile for existing tutors
          const profileResponse = await getTutorProfile(tutor.id);
          if (profileResponse && isMounted) {
            setTutorData({
              ...profileResponse,
              id: tutor.id, // Preserve the original user ID
            });
          }

          // Load tutor documents
          const documentsResponse = await getTutorDocuments(tutor.id);
          if (documentsResponse && isMounted) {
            setDocuments(
              Array.isArray(documentsResponse) ? documentsResponse : []
            );
          }
        }
      } catch (err) {
        console.error("Error loading tutor data:", err);
        if (isMounted) {
          setError("Failed to load tutor data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTutorData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [tutor?.id, tutor?.isApplication]);

  const handleSave = () => {
    setIsEditing(false);
    onUpdate(tutorData);
  };

  const handleTierChange = async (newTier) => {
    const userIdToUse = tutorData.userId || tutorData.id || tutor.id;
    if (!userIdToUse) {
      alert("Unable to identify tutor. Please refresh and try again.");
      return;
    }

    try {
      setIsProcessing(true);
      const result = await changeTutorTier(userIdToUse, newTier);
      if (result.success) {
        setTutorData((prev) => ({ ...prev, tier: newTier }));
        if (typeof onUpdate === "function") {
          onUpdate({ ...tutorData, tier: newTier });
        }
      } else {
        alert("Failed to change tier: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error changing tier:", err);
      alert("An error occurred while changing tier.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Make tutor live/offline handlers
  const handleMakeLive = async () => {
    // Validation
    if (!tutorData) {
      alert("Tutor data not loaded. Please try again.");
      return;
    }

    const userIdToUse = tutorData.id || tutorData.userId || tutor.id;
    if (!userIdToUse) {
      alert("Unable to identify tutor. Please refresh and try again.");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("🔍 Making tutor live:", userIdToUse);

      const response = await makeTutorLive(userIdToUse);

      // Validate response
      if (!response || !response.success) {
        throw new Error(response?.error || "Failed to make tutor live");
      }

      // Update tutor status
      const updatedTutor = {
        ...tutorData,
        is_live: true,
      };

      setTutorData(updatedTutor);

      // Only call onUpdate if it exists and is a function
      if (typeof onUpdate === "function") {
        onUpdate(updatedTutor);
      }

      alert("✅ Tutor is now live and can receive bookings!");
    } catch (error) {
      console.error("Error making tutor live:", error);
      const errorMessage =
        error?.message ||
        error?.error ||
        "Failed to make tutor live. Please try again.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakeOffline = async () => {
    // Validation
    if (!tutorData) {
      alert("Tutor data not loaded. Please try again.");
      return;
    }

    const userIdToUse = tutorData.id || tutorData.userId || tutor.id;
    if (!userIdToUse) {
      alert("Unable to identify tutor. Please refresh and try again.");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("🔍 Making tutor offline:", userIdToUse);

      const response = await makeTutorOffline(userIdToUse);

      // Validate response
      if (!response || !response.success) {
        throw new Error(response?.error || "Failed to make tutor offline");
      }

      // Update tutor status
      const updatedTutor = {
        ...tutorData,
        is_live: false,
      };

      setTutorData(updatedTutor);

      // Only call onUpdate if it exists and is a function
      if (typeof onUpdate === "function") {
        onUpdate(updatedTutor);
      }

      alert("✅ Tutor is now offline.");
    } catch (error) {
      console.error("Error making tutor offline:", error);
      const errorMessage =
        error?.message ||
        error?.error ||
        "Failed to make tutor offline. Please try again.";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOverviewTab = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading tutor profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      );
    }

    return (
      <div className="tutor-profile-overview">
        <div className="row">
          <div className="col-md-4">
            <div className="tutor-profile-card">
              <h6>Basic Information</h6>
              <div className="tutor-info-item">
                <strong>Name:</strong> {tutorData.user?.firstName}{" "}
                {tutorData.user?.lastName}
              </div>
              <div className="tutor-info-item">
                <strong>Email:</strong> {tutorData.user?.email}
              </div>
              <div className="tutor-info-item">
                <strong>Phone:</strong>{" "}
                {tutorData.phone_number || "Not provided"}
              </div>
              <div className="tutor-info-item">
                <strong>University:</strong>{" "}
                {tutorData.university || "Not provided"}
              </div>
              <div className="tutor-info-item">
                <strong>ATAR:</strong> {tutorData.atar || "Not provided"}
              </div>
              {tutor?.isApplication && (
                <>
                  <div className="tutor-info-item">
                    <strong>Year 12 State:</strong>{" "}
                    {tutorData.year12State || "Not provided"}
                  </div>
                  <div className="tutor-info-item">
                    <strong>Year 12 Completion:</strong>{" "}
                    {tutorData.year12CompletionYear || "Not provided"}
                  </div>
                  <div className="tutor-info-item">
                    <strong>Current State:</strong>{" "}
                    {tutorData.currentState || "Not provided"}
                  </div>
                </>
              )}
              <div className="tutor-info-item">
                <strong>{tutor?.isApplication ? "Applied:" : "Joined:"}</strong>{" "}
                {tutorData.user?.createdAt || tutorData.createdAt
                  ? new Date(
                      tutorData.user?.createdAt || tutorData.createdAt
                    ).toLocaleDateString("en-AU")
                  : "Unknown"}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="tutor-profile-card">
              <h6>Status & Tier</h6>
              <div className="tutor-info-item">
                <strong>Status:</strong>
                <span
                  className={`badge bg-${
                    tutorData.is_live ? "success" : "secondary"
                  } ms-2`}
                >
                  {tutorData.is_live ? "Live" : "Offline"}
                </span>
              </div>
              <div className="tutor-info-item">
                <strong>Tier:</strong>
                <select
                  className="form-select form-select-sm ms-2"
                  value={tutorData.tier}
                  onChange={(e) => handleTierChange(e.target.value)}
                  disabled={isProcessing || tutor?.isApplication}
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>
              </div>
              <div className="tutor-info-item">
                <strong>Documents Uploaded:</strong>
                <span
                  className={`badge bg-${
                    tutorData.documents_uploaded ? "success" : "warning"
                  } ms-2`}
                >
                  {tutorData.documents_uploaded ? "Yes" : "No"}
                </span>
              </div>
              <div className="tutor-info-item">
                <strong>Rating:</strong>{" "}
                {tutorData.rating ? `${tutorData.rating}/5` : "No rating"}
              </div>
              <div className="tutor-info-item">
                <strong>Hourly Rate:</strong> ${tutorData.hourly_rate || 0}
              </div>
              
              {/* Intro Video Section */}
              {!tutor?.isApplication && (
                <div className="mt-4">
                  <h6 className="d-flex align-items-center justify-content-between">
                    <span>Intro Video</span>
                    {tutorData.intro_video_status && tutorData.intro_video_status !== 'none' && (
                      <span className={`badge bg-${
                        tutorData.intro_video_status === 'pending' ? 'warning' :
                        tutorData.intro_video_status === 'approved' ? 'success' :
                        tutorData.intro_video_status === 'rejected' ? 'danger' : 'secondary'
                      }`}>
                        {tutorData.intro_video_status === 'pending' ? 'Pending Review' :
                         tutorData.intro_video_status === 'approved' ? 'Approved' :
                         tutorData.intro_video_status === 'rejected' ? 'Rejected' : 'None'}
                      </span>
                    )}
                  </h6>
                  {tutorData.intro_video_path ? (
                    <div className="video-preview-container">
                      <video 
                        controls 
                        src={tutorData.intro_video_path}
                        style={{ width: '100%', borderRadius: '8px', maxHeight: '200px' }}
                      >
                        Your browser does not support video playback.
                      </video>
                      {tutorData.intro_video_status === 'pending' && (
                        <div className="mt-2 d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={async () => {
                              try {
                                setIsProcessing(true);
                                const result = await approveIntroVideo(tutorData.userId || tutorData.id);
                                if (result.success) {
                                  setTutorData(prev => ({ ...prev, intro_video_status: 'approved' }));
                                  alert('Video approved successfully!');
                                } else {
                                  alert('Failed to approve video: ' + (result.error || 'Unknown error'));
                                }
                              } catch (err) {
                                console.error('Error approving video:', err);
                                alert('Failed to approve video. Please try again.');
                              } finally {
                                setIsProcessing(false);
                              }
                            }}
                            disabled={isProcessing}
                          >
                            <i className="fas fa-check me-1"></i> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                              const reason = window.prompt('Enter rejection reason (optional):');
                              try {
                                setIsProcessing(true);
                                const result = await rejectIntroVideo(tutorData.userId || tutorData.id, reason);
                                if (result.success) {
                                  setTutorData(prev => ({ ...prev, intro_video_status: 'rejected' }));
                                  alert('Video rejected.');
                                } else {
                                  alert('Failed to reject video: ' + (result.error || 'Unknown error'));
                                }
                              } catch (err) {
                                console.error('Error rejecting video:', err);
                                alert('Failed to reject video. Please try again.');
                              } finally {
                                setIsProcessing(false);
                              }
                            }}
                            disabled={isProcessing}
                          >
                            <i className="fas fa-times me-1"></i> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted small">No intro video uploaded</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className="tutor-profile-card">
              <h6>Subjects</h6>
              <div className="tutor-subjects-list">
                {tutorData.subjects && tutorData.subjects.length > 0 ? (
                  tutorData.subjects.map((subject, index) => (
                    <span key={index} className="badge bg-primary me-1 mb-1">
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No subjects selected</span>
                )}
              </div>
              {tutorData.bio && (
                <div className="mt-3">
                  <h6>{tutor?.isApplication ? "Motivation" : "Bio"}</h6>
                  <p className="text-muted">{tutorData.bio}</p>
                </div>
              )}
              {tutor?.isApplication && (
                <div className="mt-3">
                  <h6>Commitment Details</h6>
                  <div className="tutor-info-item">
                    <strong>3+ Hours/Week:</strong>{" "}
                    {tutorData.canCommit3Hours === "yes" ? "✓ Yes" : "✗ No"}
                  </div>
                  <div className="tutor-info-item">
                    <strong>1+ Year Commitment:</strong>{" "}
                    {tutorData.canCommit1Year === "yes" ? "✓ Yes" : "✗ No"}
                  </div>
                  <div className="tutor-info-item">
                    <strong>Most Weeks Available:</strong>{" "}
                    {tutorData.canTutorMostWeeks === "yes" ? "✓ Yes" : "✗ No"}
                  </div>
                  <div className="tutor-info-item">
                    <strong>Groups & 1-on-1:</strong>{" "}
                    {tutorData.canTutorGroups === "yes" ? "✓ Yes" : "✗ No"}
                  </div>
                  <div className="tutor-info-item">
                    <strong>WWCC Status:</strong>{" "}
                    {tutorData.hasWorkingWithChildrenCheck === "yes"
                      ? "✓ Has WWCC"
                      : "⚠ No WWCC"}
                  </div>
                </div>
              )}
              {/* Application Files Section */}
              {tutor?.isApplication && tutorData.files && (
                <div className="mt-4">
                  <h6>Application Files</h6>
                  {tutorData.files.resume && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Resume:</strong>
                        <a 
                          href={tutorData.files.resume} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-download me-1"></i> Download
                        </a>
                      </div>
                      {tutorData.files.resume.toLowerCase().endsWith('.pdf') && (
                        <iframe
                          src={tutorData.files.resume}
                          width="100%"
                          height="300"
                          style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                          title="Resume"
                        />
                      )}
                    </div>
                  )}
                  {tutorData.files.videoSubmission && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Video Submission:</strong>
                        <a 
                          href={tutorData.files.videoSubmission} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-download me-1"></i> Download
                        </a>
                      </div>
                      <video
                        controls
                        width="100%"
                        style={{ borderRadius: '8px', maxHeight: '300px' }}
                      >
                        <source src={tutorData.files.videoSubmission} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {!tutorData.files.resume && !tutorData.files.videoSubmission && (
                    <p className="text-muted">No files uploaded with application</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComplianceTab = () => {
    // Get documents by type
    const wwccDoc = documents.find((doc) => doc.type === "wwcc");
    const contractDoc = documents.find((doc) => doc.type === "contract");

    // Helper to get the correct URL from document
    const getDocUrl = (doc) => doc?.url || doc?.path || null;

    // Helper to check if URL is a PDF
    const isPdf = (url) =>
      url &&
      (url.toLowerCase().endsWith(".pdf") || url.includes("application/pdf"));

    // Helper to check if URL is a video
    const isVideo = (url) => url && /\.(mp4|mov|avi|wmv|webm)$/i.test(url);

    // Render embedded document preview
    const renderDocumentPreview = (doc, title) => {
      const url = getDocUrl(doc);
      if (!url) return null;

      if (isPdf(url)) {
        return (
          <div className="document-preview mt-3">
            <iframe
              src={url}
              width="100%"
              height="400"
              style={{ border: "1px solid #ddd", borderRadius: "8px" }}
              title={title}
            />
          </div>
        );
      }

      if (isVideo(url)) {
        return (
          <div className="document-preview mt-3">
            <video
              controls
              width="100%"
              style={{ borderRadius: "8px", maxHeight: "400px" }}
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      // For other file types, show a link
      return (
        <div className="document-preview mt-3">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-secondary"
          >
            <i className="fas fa-external-link-alt me-2"></i>
            Open Document
          </a>
        </div>
      );
    };

    return (
      <div className="tutor-profile-compliance">
        <div className="row">
          <div className="col-md-6">
            <div className="tutor-profile-card">
              <h6>Working With Children Check (WWCC)</h6>
              <div className="compliance-item">
                <strong>Status:</strong>
                <span
                  className={`badge bg-${wwccDoc ? "success" : "warning"} ms-2`}
                >
                  {wwccDoc ? "Uploaded" : "Not Uploaded"}
                </span>
              </div>
              <div className="compliance-item">
                <strong>Document:</strong>
                {wwccDoc && getDocUrl(wwccDoc) ? (
                  <button
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={() => window.open(getDocUrl(wwccDoc), "_blank")}
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                ) : (
                  <span className="text-muted ms-2">No document uploaded</span>
                )}
              </div>
              <div className="compliance-item">
                <strong>Uploaded:</strong>{" "}
                {wwccDoc
                  ? new Date(wwccDoc.uploadedAt).toLocaleDateString("en-AU")
                  : "Not uploaded"}
              </div>
              {renderDocumentPreview(wwccDoc, "WWCC Document")}
              <div className="compliance-item mt-3">
                {wwccDoc ? (
                  <button className="btn btn-sm btn-info">
                    <i className="fas fa-bell"></i> Send Expiry Reminder
                  </button>
                ) : (
                  <button className="btn btn-sm btn-warning">
                    <i className="fas fa-paper-plane"></i> Request Upload
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="tutor-profile-card">
              <h6>Contract Status</h6>
              <div className="compliance-item">
                <strong>Contract Status:</strong>
                <span
                  className={`badge bg-${
                    contractDoc ? "success" : "warning"
                  } ms-2`}
                >
                  {contractDoc ? "Uploaded" : "Not Uploaded"}
                </span>
              </div>
              <div className="compliance-item">
                <strong>Document:</strong>
                {contractDoc && getDocUrl(contractDoc) ? (
                  <button
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={() =>
                      window.open(getDocUrl(contractDoc), "_blank")
                    }
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                ) : (
                  <span className="text-muted ms-2">No document uploaded</span>
                )}
              </div>
              <div className="compliance-item">
                <strong>Uploaded:</strong>{" "}
                {contractDoc
                  ? new Date(contractDoc.uploadedAt).toLocaleDateString("en-AU")
                  : "Not uploaded"}
              </div>
              {renderDocumentPreview(contractDoc, "Contract Document")}
              <div className="compliance-item mt-3">
                {contractDoc ? (
                  <button className="btn btn-sm btn-primary me-2">
                    <i className="fas fa-check"></i> Approve Contract
                  </button>
                ) : (
                  <button className="btn btn-sm btn-warning me-2">
                    <i className="fas fa-paper-plane"></i> Send for Upload
                  </button>
                )}
                <button className="btn btn-sm btn-info">
                  <i className="fas fa-history"></i> View History
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <div className="tutor-profile-card">
              <h6>Document Summary</h6>
              <div className="compliance-item">
                <strong>Documents Uploaded:</strong>
                <span
                  className={`badge bg-${
                    tutorData.documents_uploaded ? "success" : "warning"
                  } ms-2`}
                >
                  {tutorData.documents_uploaded ? "Complete" : "Incomplete"}
                </span>
              </div>
              <div className="compliance-item">
                <strong>Total Documents:</strong> {documents.length}
              </div>
              <div className="compliance-item">
                <strong>WWCC Document:</strong>{" "}
                {wwccDoc ? "✓ Uploaded" : "✗ Missing"}
              </div>
              <div className="compliance-item">
                <strong>Contract Document:</strong>{" "}
                {contractDoc ? "✓ Uploaded" : "✗ Missing"}
              </div>
              <div className="compliance-item">
                <button className="btn btn-sm btn-primary me-2">
                  <i className="fas fa-refresh"></i> Refresh Documents
                </button>
                <button className="btn btn-sm btn-info">
                  <i className="fas fa-download"></i> Download All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChangeRequestsTab = () => <ChangeRequestsTab tutorId={tutorData?.userId || tutor?.id} />;

  const renderSessionsTab = () => <SessionsTab tutorId={tutorData?.userId || tutor?.id} />;

  const renderCalendarTab = () => <CalendarTab />;

  const tabs = [
    { id: "overview", label: "Overview", icon: "fas fa-user" },
    {
      id: "compliance",
      label: "Documents",
      icon: "fas fa-shield-alt",
    },
    { id: "changes", label: "Change Requests", icon: "fas fa-edit" },
    {
      id: "sessions",
      label: "Sessions & Lessons",
      icon: "fas fa-calendar-check",
    },
    { id: "calendar", label: "Calendar", icon: "fas fa-calendar-alt" },
  ];

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-user me-2"></i>
              {tutor?.isApplication
                ? "Tutor Application"
                : "Tutor Profile"} - {tutorData.name || tutorData.fullName}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-3">
              {tabs.map((tab) => (
                <li key={tab.id} className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`${tab.icon} me-1`}></i>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Tab Content */}
            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "compliance" && renderComplianceTab()}
            {activeTab === "changes" && renderChangeRequestsTab()}
            {activeTab === "sessions" && renderSessionsTab()}
            {activeTab === "calendar" && renderCalendarTab()}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>

            {/* Make Live/Offline Button - Only show for approved tutors with documents */}
            {!tutor?.isApplication &&
              !tutorData.isApplication &&
              tutorData.documents_uploaded && (
                <>
                  {tutorData.is_live ? (
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={handleMakeOffline}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Making Offline...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-pause me-1"></i>
                          Make Offline
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleMakeLive}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Making Live...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play me-1"></i>
                          Make Live
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

            {/* Edit Profile Button - Only show for existing tutors, not applications */}
            {!tutor?.isApplication && (
              <button
                type="button"
                className={`btn ${isEditing ? "btn-success" : "btn-primary"}`}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <i className="fas fa-save me-1"></i>
                    Save Changes
                  </>
                ) : (
                  <>
                    <i className="fas fa-edit me-1"></i>
                    Edit Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorProfileModal;
