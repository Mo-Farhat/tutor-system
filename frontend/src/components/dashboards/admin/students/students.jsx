import React, { useState, useEffect } from "react";
import {
  STUDENT_STATUS,
  STUDENT_STATUS_LABELS,
  COMMON_SUBJECTS,
} from "../constants/adminConstants";
import StudentProfileModal from "./studentProfile";
import adminService from "../../../../services/adminService";
import "../../../../css/dashboards/admin/students/students.css";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [sortBy, setSortBy] = useState("name_asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Mock student data
  const mockStudents = [
    {
      id: 1,
      name: "Alice Chen",
      email: "alice.chen@email.com",
      status: STUDENT_STATUS.ACTIVE,
      subjects: ["VCE Chemistry", "VCE Biology"],
      joinedDate: "2024-02-15",
      totalSessions: 24,
      assignedTutors: ["Sarah Johnson", "Michael Chen"],
      grade: "Year 12",
      parentName: "David Chen",
      parentEmail: "david.chen@email.com",
      phone: "+61 400 111 222",
      consultationCompleted: true,
      packagesPurchased: 2,
      nextSession: "2024-03-25 10:00",
      profilePicture: null,
    },
    {
      id: 2,
      name: "Benjamin Smith",
      email: "ben.smith@email.com",
      status: STUDENT_STATUS.CONSULTATION_PENDING,
      subjects: ["HSC Mathematics Advanced"],
      joinedDate: "2024-03-20",
      totalSessions: 0,
      assignedTutors: [],
      grade: "Year 11",
      parentName: "Jennifer Smith",
      parentEmail: "jen.smith@email.com",
      phone: "+61 400 333 444",
      consultationCompleted: false,
      packagesPurchased: 0,
      nextSession: null,
      profilePicture: null,
    },
    {
      id: 3,
      name: "Charlotte Wilson",
      email: "charlotte.wilson@email.com",
      status: STUDENT_STATUS.ACTIVE,
      subjects: ["QCE English", "QCE Modern History"],
      joinedDate: "2024-01-10",
      totalSessions: 45,
      assignedTutors: ["Emma Thompson"],
      grade: "Year 12",
      parentName: "Robert Wilson",
      parentEmail: "rob.wilson@email.com",
      phone: "+61 400 555 666",
      consultationCompleted: true,
      packagesPurchased: 3,
      nextSession: "2024-03-24 14:00",
      profilePicture: null,
    },
    {
      id: 4,
      name: "Daniel Kim",
      email: "daniel.kim@email.com",
      status: STUDENT_STATUS.INACTIVE,
      subjects: ["VCE Mathematical Methods"],
      joinedDate: "2023-11-05",
      totalSessions: 18,
      assignedTutors: ["James Wilson"],
      grade: "Year 11",
      parentName: "Grace Kim",
      parentEmail: "grace.kim@email.com",
      phone: "+61 400 777 888",
      consultationCompleted: true,
      packagesPurchased: 1,
      nextSession: null,
      profilePicture: null,
    },
  ];

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, selectedStatus, selectedSubjects, sortBy]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);

      // Fetch students from API
      const response = await adminService.getUsers({ role: "student" });

      if (response.success && response.data) {
        // Transform API data to match component expectations
        const studentsData = response.data.map((student) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          status: student.status || STUDENT_STATUS.ACTIVE,
          subjects: student.subjects || [],
          joinedDate: student.createdAt,
          totalSessions: student.totalSessions || 0,
          assignedTutors: student.assignedTutors || [],
          grade: student.grade || "",
          parentName: student.parentName || "",
          parentEmail: student.parentEmail || "",
          phone: student.phone || "",
          consultationCompleted: student.consultationCompleted || false,
          packagesPurchased: student.packagesPurchased || 0,
          nextSession: student.nextSession || null,
          profilePicture: student.profilePicture || null,
        }));

        setStudents(studentsData);
      } else {
        // Fallback to mock data if API fails
        setStudents(mockStudents);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      // Fallback to mock data on error
      setStudents(mockStudents);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(
        (student) => student.status === selectedStatus
      );
    }

    // Subjects filter
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter((student) =>
        student.subjects.some((subject) =>
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

    setFilteredStudents(filtered);
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
    setSelectedSubjects([]);
    setSortBy("name_asc");
  };

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setShowStudentModal(false);
  };

  const handleStudentUpdate = (updatedStudent) => {
    setStudents(
      students.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
    setSelectedStudent(updatedStudent);
  };

  const getStatusBadge = (status) => {
    const colors = {
      [STUDENT_STATUS.ACTIVE]: "success",
      [STUDENT_STATUS.INACTIVE]: "secondary",
      [STUDENT_STATUS.SUSPENDED]: "danger",
      [STUDENT_STATUS.CONSULTATION_PENDING]: "warning",
    };
    const color = colors[status];
    const label = STUDENT_STATUS_LABELS[status];
    return <span className={`badge bg-${color}`}>{label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "None scheduled";
    return new Date(dateTimeString).toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="admin-students-container">
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
                  <p className="mt-3">Loading students...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-students-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-students-content">
              {/* Header */}
              <div className="admin-students-header">
                <div className="admin-students-title-section">
                  <h2 className="admin-students-title">Students Management</h2>
                  <p className="admin-students-subtitle text-muted">
                    Manage student profiles, sessions, and learning progress
                  </p>
                </div>
                <div className="admin-students-stats">
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {filteredStudents.length}
                    </span>
                    <span className="admin-stats-label">Total Shown</span>
                  </div>
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {
                        students.filter(
                          (s) => s.status === STUDENT_STATUS.ACTIVE
                        ).length
                      }
                    </span>
                    <span className="admin-stats-label">Active</span>
                  </div>
                  <div className="admin-stats-item">
                    <span className="admin-stats-number">
                      {
                        students.filter(
                          (s) =>
                            s.status === STUDENT_STATUS.CONSULTATION_PENDING
                        ).length
                      }
                    </span>
                    <span className="admin-stats-label">Pending</span>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="admin-students-controls">
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
                        showFilters ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <i className="fas fa-filter me-2"></i>
                      Filters{" "}
                      {selectedStatus || selectedSubjects.length > 0
                        ? `(${
                            [selectedStatus, ...selectedSubjects].filter(
                              Boolean
                            ).length
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
                      <div className="col-12 col-md-4">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          {Object.entries(STUDENT_STATUS_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
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

              {/* Students Table */}
              <div className="admin-students-table-section">
                {filteredStudents.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-search text-muted mb-3"></i>
                    <h5>No students found</h5>
                    <p className="text-muted">
                      Try adjusting your search criteria or filters
                    </p>
                    <button className="btn btn-primary" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table admin-students-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Status</th>
                          <th>Grade</th>
                          <th>Subjects</th>
                          <th>Sessions</th>
                          <th>Assigned Tutors</th>
                          <th>Next Session</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td>
                              <div className="admin-student-info">
                                <div className="admin-student-avatar">
                                  {student.profilePicture ? (
                                    <img
                                      src={student.profilePicture}
                                      alt={student.name}
                                    />
                                  ) : (
                                    <div className="admin-avatar-placeholder">
                                      {(student.name || "?")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </div>
                                  )}
                                </div>
                                <div className="admin-student-details">
                                  <div className="admin-student-name">
                                    {student.name}
                                  </div>
                                  <div className="admin-student-email">
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{getStatusBadge(student.status)}</td>
                            <td>
                              <span className="admin-grade-badge">
                                {student.grade}
                              </span>
                            </td>
                            <td>
                              <div className="admin-subjects-list">
                                {student.subjects
                                  .slice(0, 2)
                                  .map((subject, index) => (
                                    <span
                                      key={index}
                                      className="admin-subject-tag"
                                    >
                                      {subject}
                                    </span>
                                  ))}
                                {student.subjects.length > 2 && (
                                  <span className="admin-subject-more">
                                    +{student.subjects.length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="admin-sessions-count">
                                {student.totalSessions}
                              </span>
                            </td>
                            <td>
                              <div className="admin-tutors-list">
                                {student.assignedTutors.length > 0 ? (
                                  <>
                                    {student.assignedTutors
                                      .slice(0, 2)
                                      .map((tutor, index) => (
                                        <span
                                          key={index}
                                          className="admin-tutor-tag"
                                        >
                                          {tutor}
                                        </span>
                                      ))}
                                    {student.assignedTutors.length > 2 && (
                                      <span className="admin-tutor-more">
                                        +{student.assignedTutors.length - 2}{" "}
                                        more
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-muted">
                                    None assigned
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="admin-next-session">
                                {formatDateTime(student.nextSession)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => openStudentModal(student)}
                              >
                                View Profile
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
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      {showStudentModal && selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={closeStudentModal}
          onUpdate={handleStudentUpdate}
        />
      )}
    </div>
  );
}

export default AdminStudents;
