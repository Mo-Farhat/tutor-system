import React, { useState, useEffect } from "react";
import {
  TUTOR_STATUS,
  TUTOR_STATUS_LABELS,
  TUTOR_STATUS_COLORS,
  TUTOR_TIERS,
  TUTOR_TIER_LABELS,
  TUTOR_TIER_COLORS,
  COMMON_SUBJECTS,
} from "../constants/adminConstants";
import TutorProfileModal from "./tutorProfile";
import adminService, {
  approveTutorApplication,
  rejectTutorApplication,
  makeTutorLive,
  makeTutorOffline,
  getTutorProfile,
} from "../../../../services/adminService";
import "../../../../css/dashboards/admin/tutors/tutors.css";

function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [sortBy, setSortBy] = useState("name_asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tutorProfiles, setTutorProfiles] = useState({});
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Mock tutor data with comprehensive information
  const mockTutors = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      status: TUTOR_STATUS.LIVE,
      tier: TUTOR_TIERS.PREMIUM,
      subjects: ["VCE Chemistry", "VCE Biology", "VCE Physics"],
      joinedDate: "2024-01-15",
      totalSessions: 156,
      rating: 4.8,
      phone: "+61 400 123 456",
      university: "University of Melbourne",
      atar: 96.5,
      wwccStatus: "approved",
      abnNumber: "12345678901",
      bankingVerified: true,
      contractSigned: true,
      profilePicture: null,
      intro:
        "Experienced tutor with 5 years of teaching experience specializing in VCE Chemistry.",
      qualifications: "Bachelor of Science (Chemistry), Master of Teaching",
      availability: "Monday-Friday 4PM-8PM, Saturday 9AM-5PM",
      hourlyRate: 65,
      completedLessons: 156,
      averageRating: 4.8,
      totalEarnings: 10140,
      lastActive: "2024-03-20",
      changeRequests: 2,
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      status: TUTOR_STATUS.PENDING_REVIEW,
      tier: TUTOR_TIERS.GOLD,
      subjects: ["HSC Mathematics Advanced", "HSC Physics"],
      joinedDate: "2024-03-20",
      totalSessions: 0,
      rating: null,
      phone: "+61 400 234 567",
      university: "University of Sydney",
      atar: 94.2,
      wwccStatus: "pending",
      abnNumber: null,
      bankingVerified: false,
      contractSigned: false,
      profilePicture: null,
      intro:
        "Recent graduate with strong mathematical background and passion for teaching.",
      qualifications: "Bachelor of Engineering (Honours)",
      availability: "Weekends only",
      hourlyRate: 45,
      completedLessons: 0,
      averageRating: null,
      totalEarnings: 0,
      lastActive: "2024-03-20",
      changeRequests: 0,
    },
    {
      id: 3,
      name: "Emma Thompson",
      email: "emma.thompson@email.com",
      status: TUTOR_STATUS.CHANGES_REQUESTED,
      tier: TUTOR_TIERS.ELITE,
      subjects: ["QCE English", "QCE Modern History", "QCE Legal Studies"],
      joinedDate: "2024-02-10",
      totalSessions: 89,
      rating: 4.9,
      phone: "+61 400 345 678",
      university: "University of Queensland",
      atar: 98.1,
      wwccStatus: "approved",
      abnNumber: "98765432109",
      bankingVerified: true,
      contractSigned: true,
      profilePicture: null,
      intro:
        "Experienced tutor with 6 years of teaching experience specializing in VCE Chemistry.",
      qualifications:
        "Bachelor of Arts (English Literature), Master of Education",
      availability: "Monday-Thursday 5PM-9PM",
      hourlyRate: 75,
      completedLessons: 89,
      averageRating: 4.9,
      totalEarnings: 6675,
      lastActive: "2024-03-19",
      changeRequests: 1,
    },
    {
      id: 4,
      name: "James Wilson",
      email: "james.wilson@email.com",
      status: TUTOR_STATUS.SUSPENDED,
      tier: TUTOR_TIERS.PREMIUM,
      subjects: ["VCE Mathematical Methods", "VCE Specialist Mathematics"],
      joinedDate: "2023-11-05",
      totalSessions: 234,
      rating: 4.6,
      phone: "+61 400 456 789",
      university: "Monash University",
      atar: 95.8,
      wwccStatus: "expired",
      abnNumber: "11223344556",
      bankingVerified: true,
      contractSigned: true,
      profilePicture: null,
      intro:
        "Mathematics specialist with extensive experience in VCE curriculum.",
      qualifications: "Bachelor of Mathematics, Graduate Diploma in Education",
      availability: "Monday-Friday 3PM-7PM",
      hourlyRate: 70,
      completedLessons: 234,
      averageRating: 4.6,
      totalEarnings: 16380,
      lastActive: "2024-03-15",
      changeRequests: 0,
    },
    {
      id: 5,
      name: "Dr. Jennifer Davis",
      email: "jennifer.davis@email.com",
      status: TUTOR_STATUS.LIVE,
      tier: TUTOR_TIERS.ELITE,
      subjects: ["VCE English Literature", "VCE Legal Studies", "UCAT"],
      joinedDate: "2023-08-20",
      totalSessions: 312,
      rating: 4.9,
      phone: "+61 400 567 890",
      university: "University of Melbourne",
      atar: 99.2,
      wwccStatus: "approved",
      abnNumber: "22334455667",
      bankingVerified: true,
      contractSigned: true,
      profilePicture: null,
      intro:
        "Doctorate in English Literature with 8 years of tutoring experience.",
      qualifications: "PhD English Literature, Master of Teaching",
      availability: "Monday-Sunday 6AM-10PM",
      hourlyRate: 85,
      completedLessons: 312,
      averageRating: 4.9,
      totalEarnings: 26520,
      lastActive: "2024-03-20",
      changeRequests: 0,
    },
  ];

  useEffect(() => {
    loadTutors();
  }, []);

  useEffect(() => {
    filterAndSortTutors();
  }, [
    tutors,
    searchTerm,
    selectedStatus,
    selectedTier,
    selectedSubjects,
    sortBy,
  ]);

  const loadTutors = async () => {
    try {
      setIsLoading(true);

      // Fetch both tutors and applications
      const [tutorsResponse, applicationsResponse] = await Promise.all([
        adminService.getUsers({ role: "tutor" }),
        adminService.getApplications({ status: "pending" }),
      ]);

      let allTutors = [];

      // Process existing tutors
      if (tutorsResponse.success && tutorsResponse.data) {
        const tutorsData = tutorsResponse.data.map((tutor) => ({
          id: tutor.id,
          userId: tutor.id,
          name: `${tutor.firstName} ${tutor.lastName}`,
          email: tutor.email,
          status: tutor.status || TUTOR_STATUS.PENDING_REVIEW,
          tier: tutor.tier || TUTOR_TIERS.BRONZE,
          subjects: tutor.subjects || [],
          joinedDate: tutor.createdAt,
          totalSessions: tutor.totalSessions || 0,
          rating: tutor.averageRating || null,
          phone: tutor.phone || "",
          university: tutor.university || "",
          atar: tutor.atar || null,
          wwccStatus: tutor.wwccStatus || "pending",
          abnNumber: tutor.abnNumber || null,
          bankingVerified: tutor.bankingVerified || false,
          contractSigned: tutor.contractSigned || false,
          profilePicture: tutor.profilePicture || null,
          intro: tutor.intro || "",
          qualifications: tutor.qualifications || "",
          availability: tutor.availability || "",
          hourlyRate: tutor.hourlyRate || 0,
          completedLessons: tutor.completedLessons || 0,
          averageRating: tutor.averageRating || null,
          totalEarnings: tutor.totalEarnings || 0,
          lastActive: tutor.lastActive || tutor.updatedAt,
          changeRequests: tutor.changeRequests || 0,
          // Add document status
          documentsUploaded: false, // Will be updated from profile data
          profileComplete: false, // Will be updated from profile data
          isLive: false, // Will be updated from profile data
          isApplication: false, // Mark as existing tutor
        }));

        allTutors = tutorsData;
      }

      // Process pending applications
      if (applicationsResponse.success && applicationsResponse.data) {
        const applicationsData = applicationsResponse.data.map((app) => ({
          id: `app_${app.id}`, // Prefix to avoid ID conflicts
          applicationId: app.applicationId,
          name: app.fullName,
          email: app.email,
          status: TUTOR_STATUS.PENDING_REVIEW,
          tier: TUTOR_TIERS.BRONZE,
          subjects: app.subjectsToTutor ? [app.subjectsToTutor] : [],
          joinedDate: app.createdAt,
          totalSessions: 0,
          rating: null,
          phone: app.phone || "",
          university: app.currentStudy || "",
          atar: app.atar || null,
          wwccStatus: app.hasWorkingWithChildrenCheck ? "approved" : "pending",
          abnNumber: null,
          bankingVerified: false,
          contractSigned: false,
          profilePicture: null,
          intro: app.motivation || "",
          qualifications: app.currentStudy || "",
          availability: "",
          hourlyRate: 0,
          completedLessons: 0,
          averageRating: null,
          totalEarnings: 0,
          lastActive: app.createdAt,
          changeRequests: 0,
          documentsUploaded: false,
          profileComplete: false,
          isLive: false,
          isApplication: true, // Mark as application
          applicationData: app, // Store original application data
        }));

        allTutors = [...allTutors, ...applicationsData];
      }

      // Fetch tutor profiles for document status (only for existing tutors)
      const profilePromises = allTutors
        .filter((tutor) => !tutor.isApplication)
        .map(async (tutor) => {
          try {
            const profileResponse = await getTutorProfile(tutor.id);
            if (
              profileResponse &&
              profileResponse.documents_uploaded !== undefined
            ) {
              return {
                ...tutor,
                documentsUploaded: profileResponse.documents_uploaded,
                profileComplete: profileResponse.is_profile_complete,
                isLive: profileResponse.is_live,
                tier: profileResponse.tier || tutor.tier,
                hourlyRate: profileResponse.hourly_rate || tutor.hourlyRate,
                bio: profileResponse.bio || tutor.intro,
                subjects: profileResponse.subjects || tutor.subjects,
              };
            }
            return tutor;
          } catch (error) {
            console.error(
              `Error fetching profile for tutor ${tutor.id}:`,
              error
            );
            return tutor;
          }
        });

      const tutorsWithProfiles = await Promise.all(profilePromises);
      const applications = allTutors.filter((tutor) => tutor.isApplication);

      setTutors([...tutorsWithProfiles, ...applications]);
    } catch (error) {
      console.error("Error loading tutors:", error);
      // Fallback to mock data on error
      setTutors(mockTutors);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTutors = () => {
    let filtered = [...tutors];

    // Pending applications filter
    if (showPendingOnly) {
      filtered = filtered.filter((tutor) => tutor.isApplication);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tutor) =>
          (tutor.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tutor.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tutor.applicationId &&
            tutor.applicationId
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((tutor) => tutor.status === selectedStatus);
    }

    // Tier filter
    if (selectedTier) {
      filtered = filtered.filter((tutor) => tutor.tier === selectedTier);
    }

    // Subjects filter
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter((tutor) =>
        tutor.subjects.some((subject) =>
          selectedSubjects.some((selected) =>
            subject.toLowerCase().includes(selected.toLowerCase())
          )
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "joined_newest":
          return new Date(b.joinedDate) - new Date(a.joinedDate);
        case "joined_oldest":
          return new Date(a.joinedDate) - new Date(b.joinedDate);
        case "sessions_high":
          return b.totalSessions - a.totalSessions;
        case "sessions_low":
          return a.totalSessions - b.totalSessions;
        default:
          return 0;
      }
    });

    setFilteredTutors(filtered);
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedTier("");
    setSelectedSubjects([]);
    setSortBy("name_asc");
    setShowPendingOnly(false);
  };

  const openTutorModal = (tutor) => {
    setSelectedTutor(tutor);
    setShowTutorModal(true);
  };

  const closeTutorModal = () => {
    setSelectedTutor(null);
    setShowTutorModal(false);
  };

  const handleTutorUpdate = (updatedTutor) => {
    setTutors((prevTutors) =>
      prevTutors.map((tutor) =>
        tutor.id === updatedTutor.id ? updatedTutor : tutor
      )
    );
  };

  // Approval and rejection handlers
  const handleApproveTutor = async (tutor) => {
    try {
      setIsProcessing(true);

      if (tutor.isApplication) {
        // Handle application approval
        await approveTutorApplication(tutor.applicationData.id, approvalNotes);

        // Remove from list (application becomes a tutor)
        setTutors((prevTutors) => prevTutors.filter((t) => t.id !== tutor.id));

        alert(
          "Tutor application approved successfully! The tutor will receive setup instructions via email."
        );
      } else {
        // Handle existing tutor approval (if needed)
        alert("This tutor is already approved.");
      }

      setShowApprovalModal(false);
      setApprovalNotes("");
    } catch (error) {
      console.error("Error approving tutor:", error);
      alert("Failed to approve tutor application. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectTutor = async (tutor) => {
    try {
      setIsProcessing(true);

      if (tutor.isApplication) {
        // Handle application rejection
        await rejectTutorApplication(tutor.applicationData.id, rejectionReason);

        // Update status to rejected
        setTutors((prevTutors) =>
          prevTutors.map((t) =>
            t.id === tutor.id ? { ...t, status: TUTOR_STATUS.REJECTED } : t
          )
        );

        alert(
          "Tutor application rejected. The applicant will be notified via email."
        );
      } else {
        alert("This is not an application.");
      }

      setShowRejectionModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting tutor:", error);
      alert("Failed to reject tutor application. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakeLive = async (tutor) => {
    try {
      setIsProcessing(true);
      await makeTutorLive(tutor.userId || tutor.id);

      // Update tutor status
      setTutors((prevTutors) =>
        prevTutors.map((t) =>
          t.id === tutor.id
            ? { ...t, isLive: true, status: TUTOR_STATUS.LIVE }
            : t
        )
      );

      alert("Tutor is now live and can receive bookings!");
    } catch (error) {
      console.error("Error making tutor live:", error);
      alert("Failed to make tutor live. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakeOffline = async (tutor) => {
    try {
      setIsProcessing(true);
      await makeTutorOffline(tutor.userId || tutor.id);

      // Update tutor status
      setTutors((prevTutors) =>
        prevTutors.map((t) =>
          t.id === tutor.id
            ? { ...t, isLive: false, status: TUTOR_STATUS.OFFLINE }
            : t
        )
      );

      alert("Tutor is now offline.");
    } catch (error) {
      console.error("Error making tutor offline:", error);
      alert("Failed to make tutor offline. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openApprovalModal = (tutor) => {
    setSelectedApplication(tutor);
    setShowApprovalModal(true);
  };

  const openRejectionModal = (tutor) => {
    setSelectedApplication(tutor);
    setShowRejectionModal(true);
  };

  const getStatusBadge = (status) => {
    const color = TUTOR_STATUS_COLORS[status];
    const label = TUTOR_STATUS_LABELS[status];
    return <span className={`badge bg-${color}`}>{label}</span>;
  };

  const getTierBadge = (tier) => {
    const color = TUTOR_TIER_COLORS[tier];
    const label = TUTOR_TIER_LABELS[tier];
    return <span className={`badge bg-${color}`}>{label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDocumentStatusBadge = (tutor) => {
    if (tutor.documentsUploaded) {
      return <span className="badge bg-success">Documents Complete</span>;
    } else {
      return <span className="badge bg-warning">Documents Pending</span>;
    }
  };

  const getActionButtons = (tutor) => {
    const buttons = [];

    // View Profile button (always available)
    buttons.push(
      <button
        key="view"
        className="btn btn-outline-primary btn-sm me-1"
        onClick={() => openTutorModal(tutor)}
      >
        <i className="fas fa-eye"></i> View
      </button>
    );

    // Application-specific actions
    if (tutor.isApplication && tutor.status === TUTOR_STATUS.PENDING_REVIEW) {
      buttons.push(
        <button
          key="approve"
          className="btn btn-success btn-sm me-1"
          onClick={() => openApprovalModal(tutor)}
          disabled={isProcessing}
        >
          <i className="fas fa-check"></i> Approve
        </button>
      );
      buttons.push(
        <button
          key="reject"
          className="btn btn-danger btn-sm me-1"
          onClick={() => openRejectionModal(tutor)}
          disabled={isProcessing}
        >
          <i className="fas fa-times"></i> Reject
        </button>
      );
    }
    // Tutor-specific actions (for existing tutors)
    else if (!tutor.isApplication) {
      if (tutor.status === TUTOR_STATUS.APPROVED && tutor.documentsUploaded) {
        if (tutor.isLive) {
          buttons.push(
            <button
              key="offline"
              className="btn btn-warning btn-sm me-1"
              onClick={() => handleMakeOffline(tutor)}
              disabled={isProcessing}
            >
              <i className="fas fa-pause"></i> Make Offline
            </button>
          );
        } else {
          buttons.push(
            <button
              key="live"
              className="btn btn-success btn-sm me-1"
              onClick={() => handleMakeLive(tutor)}
              disabled={isProcessing}
            >
              <i className="fas fa-play"></i> Make Live
            </button>
          );
        }
      }
    }

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="admin-tutors-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading tutors...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tutors-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-tutors-content">
              {/* Header */}
              <div className="admin-tutors-header">
                <div className="admin-tutors-title-section">
                  <h2 className="admin-tutors-title">Tutors Management</h2>
                  <p className="admin-tutors-subtitle text-muted">
                    Manage tutor applications, profiles, and compliance
                  </p>
                </div>
                <div className="admin-tutors-stats">
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {filteredTutors.length}
                    </span>
                    <span className="admin-stats-label">Total Shown</span>
                  </div>
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {tutors.filter((t) => t.isApplication).length}
                    </span>
                    <span className="admin-stats-label">
                      Pending Applications
                    </span>
                  </div>
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {tutors.filter((t) => !t.isApplication).length}
                    </span>
                    <span className="admin-stats-label">Active Tutors</span>
                  </div>
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {
                        tutors.filter((t) => !t.isApplication && t.isLive)
                          .length
                      }
                    </span>
                    <span className="admin-stats-label">Live Tutors</span>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="admin-tutors-controls">
                <div className="admin-controls-top">
                  <div className="admin-search-section">
                    <div className="admin-search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="admin-controls-actions">
                    <button
                      className={`btn ${
                        showPendingOnly ? "btn-warning" : "btn-outline-warning"
                      } me-2`}
                      onClick={() => setShowPendingOnly(!showPendingOnly)}
                    >
                      <i className="fas fa-clock me-2"></i>
                      {showPendingOnly ? "Show All" : "Pending Applications"}
                    </button>
                    <button
                      className={`btn ${
                        showFilters ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <i className="fas fa-filter me-2"></i>
                      Filters{" "}
                      {selectedStatus ||
                      selectedTier ||
                      selectedSubjects.length > 0
                        ? `(${
                            [
                              selectedStatus,
                              selectedTier,
                              ...selectedSubjects,
                            ].filter(Boolean).length
                          })`
                        : ""}
                    </button>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name_asc">Name A-Z</option>
                      <option value="name_desc">Name Z-A</option>
                      <option value="joined_newest">Newest First</option>
                      <option value="joined_oldest">Oldest First</option>
                      <option value="sessions_high">Most Sessions</option>
                      <option value="sessions_low">Least Sessions</option>
                    </select>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="admin-filters-panel">
                    <div className="row g-3">
                      <div className="col-12 col-md-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          {Object.entries(TUTOR_STATUS_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-12 col-md-3">
                        <label className="form-label">Tier</label>
                        <select
                          className="form-select"
                          value={selectedTier}
                          onChange={(e) => setSelectedTier(e.target.value)}
                        >
                          <option value="">All Tiers</option>
                          {Object.entries(TUTOR_TIER_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label">Subjects</label>
                        <div className="admin-subject-filters">
                          {[
                            "Chemistry",
                            "Biology",
                            "Physics",
                            "Mathematics",
                            "English",
                          ].map((subject) => (
                            <button
                              key={subject}
                              className={`btn btn-sm ${
                                selectedSubjects.includes(subject)
                                  ? "btn-primary"
                                  : "btn-outline-secondary"
                              }`}
                              onClick={() => handleSubjectToggle(subject)}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-12 col-md-2">
                        <label className="form-label">&nbsp;</label>
                        <button
                          className="btn btn-outline-danger w-100"
                          onClick={clearFilters}
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tutors Table */}
              <div className="admin-tutors-table-section">
                {filteredTutors.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-search text-muted mb-3"></i>
                    <h5>No tutors found</h5>
                    <p className="text-muted">
                      Try adjusting your search criteria or filters
                    </p>
                    <button className="btn btn-primary" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table admin-tutors-table">
                      <thead>
                        <tr>
                          <th>Tutor</th>
                          <th>Status</th>
                          <th>Tier</th>
                          <th>Documents</th>
                          <th>Subjects</th>
                          <th>Sessions</th>
                          <th>Rating</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTutors.map((tutor) => (
                          <tr key={tutor.id}>
                            <td>
                              <div className="admin-tutor-info">
                                <div className="admin-tutor-avatar">
                                  {tutor.profilePicture ? (
                                    <img
                                      src={tutor.profilePicture}
                                      alt={tutor.name}
                                    />
                                  ) : (
                                    <div className="admin-avatar-placeholder">
                                      {(tutor.name || "?")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </div>
                                  )}
                                </div>
                                <div className="admin-tutor-details">
                                  <div className="admin-tutor-name">
                                    {tutor.name}
                                    {tutor.isApplication && (
                                      <span className="badge bg-info ms-2">
                                        Application
                                      </span>
                                    )}
                                  </div>
                                  <div className="admin-tutor-email">
                                    {tutor.email}
                                  </div>
                                  {tutor.applicationId && (
                                    <div className="admin-application-id">
                                      <small className="text-muted">
                                        ID: <code>{tutor.applicationId}</code>
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>{getStatusBadge(tutor.status)}</td>
                            <td>{getTierBadge(tutor.tier)}</td>
                            <td>{getDocumentStatusBadge(tutor)}</td>
                            <td>
                              <div className="admin-subjects-list">
                                {tutor.subjects
                                  .slice(0, 2)
                                  .map((subject, index) => (
                                    <span
                                      key={index}
                                      className="admin-subject-tag"
                                    >
                                      {subject}
                                    </span>
                                  ))}
                                {tutor.subjects.length > 2 && (
                                  <span className="admin-subject-more">
                                    +{tutor.subjects.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="admin-sessions-count">
                                {tutor.totalSessions}
                              </span>
                            </td>
                            <td>
                              {tutor.rating ? (
                                <div className="admin-rating">
                                  <i className="fas fa-star text-warning"></i>
                                  <span>{tutor.rating}</span>
                                </div>
                              ) : (
                                <span className="text-muted">No rating</span>
                              )}
                            </td>
                            <td>
                              <span className="admin-joined-date">
                                {formatDate(tutor.joinedDate)}
                              </span>
                            </td>
                            <td>
                              <div className="admin-action-buttons">
                                {getActionButtons(tutor)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Profile Modal */}
      {showTutorModal && selectedTutor && (
        <TutorProfileModal
          tutor={selectedTutor}
          onClose={closeTutorModal}
          onUpdate={handleTutorUpdate}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Approve Tutor Application
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApprovalModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to approve{" "}
                  <strong>{selectedApplication.name}</strong>'s tutor
                  application?
                </p>
                <div className="mb-3">
                  <label htmlFor="approvalNotes" className="form-label">
                    Approval Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="approvalNotes"
                    rows="3"
                    placeholder="Add any notes about the approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  ></textarea>
                </div>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  This will send an approval email to the tutor with setup
                  instructions.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleApproveTutor(selectedApplication)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Approving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-1"></i>
                      Approve Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedApplication && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-times-circle text-danger me-2"></i>
                  Reject Tutor Application
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to reject{" "}
                  <strong>{selectedApplication.name}</strong>'s tutor
                  application?
                </p>
                <div className="mb-3">
                  <label htmlFor="rejectionReason" className="form-label">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="rejectionReason"
                    rows="3"
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  This will send a rejection email to the tutor with the reason
                  provided.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectionModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRejectTutor(selectedApplication)}
                  disabled={isProcessing || !rejectionReason.trim()}
                >
                  {isProcessing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times me-1"></i>
                      Reject Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTutors;
