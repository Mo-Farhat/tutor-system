import React, { useState, useEffect } from "react";
import studentTutorService from "../../../../services/studentTutorService";
import adminService, { getAssignments } from "../../../../services/adminService";
import "../../../../css/dashboards/admin/assignments/assignments.css";

function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
 const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    studentId: "",
    tutorId: "",
    subject: "",
    status: "active",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Load assignments, students, and tutors
  useEffect(() => {
    loadAssignments();
    loadStudents();
    loadTutors();
  }, []);

  useEffect(() => {
    filterAndSortAssignments();
  }, [assignments, searchTerm, selectedStatus, sortBy]);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
  
      // Fetch assignments from API using admin service
      const response = await getAssignments();
      
      // Transform the response to match the expected assignment format
      const transformedAssignments = response.data.map(assignment => ({
        id: assignment.id,
        student: {
          id: assignment.student.id,
          name: `${assignment.student.firstName} ${assignment.student.lastName}`,
          email: assignment.student.email
        },
        tutor: {
          id: assignment.tutor.id,
          name: `${assignment.tutor.firstName} ${assignment.tutor.lastName}`,
          email: assignment.tutor.email
        },
        subject: assignment.subject,
        status: assignment.status,
        assignedDate: assignment.createdAt,
        endDate: assignment.endedAt,
        notes: assignment.notes || ''
      }));
  
      setAssignments(transformedAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
      // Set empty array instead of mock data
      setAssignments([]);
    } finally {
      setIsLoading(false);
   }
  };

  const loadStudents = async () => {
    try {
      const response = await adminService.getUsers({ role: "student" });
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const loadTutors = async () => {
    try {
      const response = await adminService.getUsers({ role: "tutor" });
      if (response.success && response.data) {
        setTutors(response.data);
      }
    } catch (error) {
      console.error("Error loading tutors:", error);
    }
 };

  const filterAndSortAssignments = () => {
    let filtered = [...assignments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(
        (assignment) => assignment.status === selectedStatus
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return (a.student?.name || "").localeCompare(b.student?.name || "");
        case "name_desc":
          return (b.student?.name || "").localeCompare(a.student?.name || "");
        case "assigned_newest":
          return new Date(b.assignedDate) - new Date(a.assignedDate);
        case "assigned_oldest":
          return new Date(a.assignedDate) - new Date(b.assignedDate);
        case "subject_asc":
          return (a.subject || "").localeCompare(b.subject || "");
        case "subject_desc":
          return (b.subject || "").localeCompare(a.subject || "");
        default:
          return 0;
      }
    });

    setFilteredAssignments(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSortBy("name_asc");
 };

  const openAssignmentModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const closeAssignmentModal = () => {
    setSelectedAssignment(null);
    setShowAssignmentModal(false);
  };

  const openCreateModal = () => {
    setNewAssignment({
      studentId: "",
      tutorId: "",
      subject: "",
      status: "active",
    });
    setShowCreateModal(true);
 };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateAssignment = async () => {
    try {
      setIsProcessing(true);

      // Validate input
      if (!newAssignment.studentId || !newAssignment.tutorId || !newAssignment.subject) {
        alert("Please fill in all required fields");
        return;
      }

      // Create assignment using the service
      const assignmentData = {
        studentId: parseInt(newAssignment.studentId),
        tutorId: parseInt(newAssignment.tutorId),
        subject: newAssignment.subject,
        status: newAssignment.status,
      };

      const response = await studentTutorService.createAssignment(assignmentData);
      
      if (response && !response.error) {
        // Refresh assignments list
        loadAssignments();
        closeCreateModal();
        alert("Assignment created successfully!");
      } else {
        alert(response?.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Error creating assignment: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAssignment = async (assignmentId, updates) => {
    try {
      setIsProcessing(true);
      
      const response = await studentTutorService.updateAssignment(assignmentId, updates);
      
      if (response && !response.error) {
        // Refresh assignments list
        loadAssignments();
        closeAssignmentModal();
        alert("Assignment updated successfully!");
      } else {
        alert(response?.error || "Failed to update assignment");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("Error updating assignment: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

 const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await studentTutorService.deleteAssignment(assignmentId);
      
      if (response && (response.ok || !response.error)) {
        // Refresh assignments list
        loadAssignments();
        closeAssignmentModal();
        alert("Assignment deleted successfully!");
      } else {
        alert(response?.error || "Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment: " + error.message);
    } finally {
      setIsProcessing(false);
    }
 };

  const getStatusBadge = (status) => {
    const colors = {
      active: "success",
      paused: "warning",
      ended: "secondary",
    };
    const color = colors[status] || "secondary";
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`badge bg-${color}`}>{label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
 };

  if (isLoading) {
    return (
      <div className="admin-assignments-container">
        <div className="admin-assignments-content">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}
          >
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading assignments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-assignments-container">
      <div className="admin-assignments-content">
              {/* Header */}
              <div className="admin-assignments-header">
                <div className="admin-assignments-title-section">
                  <h2 className="admin-assignments-title">Student-Tutor Assignments</h2>
                  <p className="admin-assignments-subtitle text-muted">
                    Manage student-tutor relationships and assignments
                  </p>
                </div>
                <div className="admin-assignments-stats">
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {filteredAssignments.length}
                    </span>
                    <span className="admin-stats-label">Total Shown</span>
                  </div>
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {assignments.filter((a) => a.status === "active").length}
                    </span>
                    <span className="admin-stats-label">Active</span>
                  </div>
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {assignments.filter((a) => a.status === "ended").length}
                    </span>
                    <span className="admin-stats-label">Ended</span>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="admin-assignments-controls">
                <div className="admin-controls-top">
                  <div className="admin-search-section">
                    <div className="admin-search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by student, tutor, or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="admin-controls-actions">
                    <button
                      className="btn btn-primary me-2"
                      onClick={openCreateModal}
                    >
                      <i className="fas fa-plus me-2"></i>
                      New Assignment
                    </button>
                    <button
                      className={`btn ${
                        showFilters ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <i className="fas fa-filter me-2"></i>
                      Filters{" "}
                      {selectedStatus
                        ? `(${[selectedStatus].filter(Boolean).length})`
                        : ""}
                    </button>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name_asc">Student A-Z</option>
                      <option value="name_desc">Student Z-A</option>
                      <option value="assigned_newest">Newest First</option>
                      <option value="assigned_oldest">Oldest First</option>
                      <option value="subject_asc">Subject A-Z</option>
                      <option value="subject_desc">Subject Z-A</option>
                    </select>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="admin-filters-panel">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="ended">Ended</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
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

              {/* Assignments Table */}
              <div className="admin-assignments-table-section">
                {filteredAssignments.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-user-friends text-muted mb-3"></i>
                    <h5>No assignments found</h5>
                    <p className="text-muted">
                      Try adjusting your search criteria or filters
                    </p>
                    <button className="btn btn-primary" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table admin-assignments-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Tutor</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Assigned Date</th>
                          <th>End Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td>
                              <div className="admin-assignment-student-info">
                                <div className="admin-assignment-student-name">
                                  {assignment.student.name}
                                </div>
                                <div className="admin-assignment-student-email">
                                  {assignment.student.email}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="admin-assignment-tutor-info">
                                <div className="admin-assignment-tutor-name">
                                  {assignment.tutor.name}
                                </div>
                                <div className="admin-assignment-tutor-email">
                                  {assignment.tutor.email}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="admin-subject-tag">
                                {assignment.subject}
                              </span>
                            </td>
                            <td>{getStatusBadge(assignment.status)}</td>
                            <td>
                              <span className="admin-date">
                                {formatDate(assignment.assignedDate)}
                              </span>
                            </td>
                            <td>
                              {assignment.endDate ? (
                                <span className="admin-date">
                                  {formatDate(assignment.endDate)}
                                </span>
                              ) : (
                                <span className="text-muted">Ongoing</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-primary btn-sm me-1"
                                onClick={() => openAssignmentModal(assignment)}
                              >
                                <i className="fas fa-eye"></i> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
      </div>
      

      
      {showAssignmentModal && selectedAssignment && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-friends me-2"></i>
                  Assignment Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAssignmentModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="assignment-detail-card">
                      <h6>Student Information</h6>
                      <div className="assignment-detail-item">
                        <strong>Name:</strong> {selectedAssignment.student.name}
                      </div>
                      <div className="assignment-detail-item">
                        <strong>Email:</strong> {selectedAssignment.student.email}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="assignment-detail-card">
                      <h6>Tutor Information</h6>
                      <div className="assignment-detail-item">
                        <strong>Name:</strong> {selectedAssignment.tutor.name}
                      </div>
                      <div className="assignment-detail-item">
                        <strong>Email:</strong> {selectedAssignment.tutor.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="assignment-detail-card">
                      <h6>Assignment Details</h6>
                      <div className="assignment-detail-item">
                        <strong>Subject:</strong> {selectedAssignment.subject}
                      </div>
                      <div className="assignment-detail-item">
                        <strong>Status:</strong> {getStatusBadge(selectedAssignment.status)}
                      </div>
                      <div className="assignment-detail-item">
                        <strong>Assigned Date:</strong> {formatDate(selectedAssignment.assignedDate)}
                      </div>
                      <div className="assignment-detail-item">
                        <strong>End Date:</strong>{" "}
                        {selectedAssignment.endDate ? formatDate(selectedAssignment.endDate) : "Ongoing"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="assignment-detail-card">
                      <h6>Notes</h6>
                      <div className="assignment-detail-item">
                        {selectedAssignment.notes || "No notes provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAssignmentModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteAssignment(selectedAssignment.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash me-1"></i>
                      Delete Assignment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  Create New Assignment
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeCreateModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Student</label>
                      <select
                        className="form-select"
                        value={newAssignment.studentId}
                        onChange={(e) => setNewAssignment({...newAssignment, studentId: e.target.value})}
                      >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} ({student.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Tutor</label>
                      <select
                        className="form-select"
                        value={newAssignment.tutorId}
                        onChange={(e) => setNewAssignment({...newAssignment, tutorId: e.target.value})}
                      >
                        <option value="">Select a tutor</option>
                        {tutors.map((tutor) => (
                          <option key={tutor.id} value={tutor.id}>
                            {tutor.firstName} {tutor.lastName} ({tutor.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter subject (e.g., VCE Chemistry)"
                        value={newAssignment.subject}
                        onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={newAssignment.status}
                        onChange={(e) => setNewAssignment({...newAssignment, status: e.target.value})}
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="ended">Ended</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeCreateModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateAssignment}
                    disabled={isProcessing || !newAssignment.studentId || !newAssignment.tutorId || !newAssignment.subject}
                  >
                    {isProcessing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-1"></i>
                        Create Assignment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAssignments;