import React, { useState, useEffect } from "react";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus,
} from "../../../../services/adminService";
import {
  YEAR_LEVELS,
  YEAR_11_12_CURRICULA,
  YEAR_1_10_STATES,
} from "../constants/adminConstants";
import "../../../../css/dashboards/admin/subjects/subjects.css";

function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    curriculum: "",
    yearLevel: "",
    isActive: "",
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    curriculum: "",
    yearLevel: "",
    sortOrder: 0,
    isActive: true,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load subjects
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getSubjects();
      if (response.success) {
        setSubjects(response.data || []);
      } else {
        setError(response.error || "Failed to load subjects");
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
      setError("Failed to load subjects");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      !searchTerm ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.curriculum.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCurriculum =
      !filters.curriculum || subject.curriculum === filters.curriculum;

    const matchesYearLevel =
      !filters.yearLevel || subject.yearLevel === filters.yearLevel;

    const matchesActive =
      filters.isActive === "" ||
      subject.isActive === (filters.isActive === "true");

    return matchesSearch && matchesCurriculum && matchesYearLevel && matchesActive;
  });

  // Get curriculum options based on year level
  const getCurriculumOptions = (yearLevel) => {
    if (yearLevel === "Year 11/12") {
      return YEAR_11_12_CURRICULA;
    } else if (yearLevel === "Year 1-10") {
      return YEAR_1_10_STATES;
    }
    return [...YEAR_11_12_CURRICULA, ...YEAR_1_10_STATES];
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Reset curriculum if year level changes
      ...(name === "yearLevel" ? { curriculum: "" } : {}),
    }));
    setFormError("");
  };

  // Open modal for new subject
  const handleAddSubject = () => {
    setEditingSubject(null);
    setFormData({
      name: "",
      curriculum: "",
      yearLevel: "",
      sortOrder: 0,
      isActive: true,
    });
    setFormError("");
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      curriculum: subject.curriculum,
      yearLevel: subject.yearLevel,
      sortOrder: subject.sortOrder || 0,
      isActive: subject.isActive,
    });
    setFormError("");
    setShowModal(true);
  };

  // Save subject (create or update)
  const handleSaveSubject = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.name.trim()) {
      setFormError("Subject name is required");
      return;
    }
    if (!formData.yearLevel) {
      setFormError("Year level is required");
      return;
    }
    if (!formData.curriculum) {
      setFormError("Curriculum is required");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      let response;
      if (editingSubject) {
        response = await updateSubject(editingSubject.id, formData);
      } else {
        response = await createSubject(formData);
      }

      if (response.success) {
        setShowModal(false);
        await loadSubjects();
      } else {
        setFormError(response.error || "Failed to save subject");
      }
    } catch (err) {
      console.error("Error saving subject:", err);
      setFormError(err.message || "Failed to save subject");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete subject
  const handleDeleteSubject = async (subject) => {
    if (!window.confirm(`Are you sure you want to delete "${subject.name}"?`)) {
      return;
    }

    try {
      const response = await deleteSubject(subject.id);
      if (response.success) {
        await loadSubjects();
      } else {
        alert(response.error || "Failed to delete subject");
      }
    } catch (err) {
      console.error("Error deleting subject:", err);
      alert("Failed to delete subject");
    }
  };

  // Toggle active status
  const handleToggleStatus = async (subject) => {
    try {
      const response = await toggleSubjectStatus(subject.id);
      if (response.success) {
        await loadSubjects();
      } else {
        alert(response.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update status");
    }
  };

  // Get unique curricula from subjects for filter dropdown
  const uniqueCurricula = [...new Set(subjects.map((s) => s.curriculum))].sort();

  return (
    <div className="admin-subjects-container">
      <div className="admin-subjects-header">
        <div className="header-left">
          <h1>
            <i className="fas fa-book me-2"></i>
            Subjects Management
          </h1>
          <p className="text-muted">
            Manage subjects available for tutoring across different curricula and year levels
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAddSubject}>
          <i className="fas fa-plus me-2"></i>
          Add Subject
        </button>
      </div>

      {/* Filters */}
      <div className="admin-subjects-filters">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filters.yearLevel}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, yearLevel: e.target.value, curriculum: "" }))
              }
            >
              <option value="">All Year Levels</option>
              {YEAR_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filters.curriculum}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, curriculum: e.target.value }))
              }
            >
              <option value="">All Curricula</option>
              {(filters.yearLevel
                ? getCurriculumOptions(filters.yearLevel)
                : uniqueCurricula
              ).map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filters.isActive}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, isActive: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchTerm("");
                setFilters({ curriculum: "", yearLevel: "", isActive: "" });
              }}
            >
              <i className="fas fa-times me-1"></i>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading subjects...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="admin-subjects-stats mb-4">
            <div className="stat-card">
              <div className="stat-value">{subjects.length}</div>
              <div className="stat-label">Total Subjects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {subjects.filter((s) => s.isActive).length}
              </div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {subjects.filter((s) => !s.isActive).length}
              </div>
              <div className="stat-label">Inactive</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{uniqueCurricula.length}</div>
              <div className="stat-label">Curricula</div>
            </div>
          </div>

          {/* Table */}
          <div className="admin-subjects-table-container">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Year Level</th>
                  <th>Curriculum</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                      {searchTerm || filters.curriculum || filters.yearLevel || filters.isActive
                        ? "No subjects match your filters"
                        : "No subjects found. Click 'Add Subject' to create one."}
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.id} className={!subject.isActive ? "inactive-row" : ""}>
                      <td>
                        <strong>{subject.name}</strong>
                      </td>
                      <td>
                        <span className="badge bg-info">{subject.yearLevel}</span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{subject.curriculum}</span>
                      </td>
                      <td>{subject.sortOrder}</td>
                      <td>
                        <span
                          className={`badge ${
                            subject.isActive ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {subject.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEditSubject(subject)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`btn btn-outline-${subject.isActive ? "warning" : "success"}`}
                            onClick={() => handleToggleStatus(subject)}
                            title={subject.isActive ? "Deactivate" : "Activate"}
                          >
                            <i className={`fas fa-${subject.isActive ? "eye-slash" : "eye"}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteSubject(subject)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-muted text-end mt-2">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`fas fa-${editingSubject ? "edit" : "plus"} me-2`}></i>
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveSubject}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger" role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Subject Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g., Physics, Chemistry, Mathematics"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Year Level *</label>
                    <select
                      className="form-select"
                      name="yearLevel"
                      value={formData.yearLevel}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Year Level</option>
                      {YEAR_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {formData.yearLevel === "Year 1-10" ? "State" : "Curriculum"} *
                    </label>
                    <select
                      className="form-select"
                      name="curriculum"
                      value={formData.curriculum}
                      onChange={handleFormChange}
                      required
                      disabled={!formData.yearLevel}
                    >
                      <option value="">
                        Select {formData.yearLevel === "Year 1-10" ? "State" : "Curriculum"}
                      </option>
                      {getCurriculumOptions(formData.yearLevel).map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                    {!formData.yearLevel && (
                      <div className="form-text">Please select a year level first</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      className="form-control"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleFormChange}
                      min="0"
                    />
                    <div className="form-text">
                      Lower numbers appear first. Subjects with the same order are sorted alphabetically.
                    </div>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Active (visible to users)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {editingSubject ? "Update" : "Create"} Subject
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSubjects;
