import React, { useEffect, useMemo, useState } from "react";
import adminService from "../../../../services/adminService";
import "../../../../css/dashboards/admin/users/users.css";

const ROLE_OPTIONS = [
  { label: "All Roles", value: "" },
  { label: "Administrators", value: "admin" },
  { label: "Tutors", value: "tutor" },
  { label: "Students", value: "student" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const editableFields = [
  "firstName",
  "lastName",
  "email",
  "username",
  "role",
  "status",
];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState(ROLE_OPTIONS[0].value);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, pageSize]);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        email: selectedUser.email || "",
        username: selectedUser.username || "",
        role: selectedUser.role || "",
        status: selectedUser.status || "",
      });
    } else {
      setEditForm({});
    }
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      return (
        name.toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        (user.username || "").toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function loadUsers(targetPage = 1) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.getUsers({
        role: roleFilter || undefined,
        page: targetPage,
        pageSize,
      });

      if (response?.success) {
        setUsers(response.data || []);
        setTotal(response.pagination?.total || 0);
        setPage(response.pagination?.page || targetPage);
      } else {
        setUsers([]);
        setTotal(0);
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users");
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (direction) => {
    setPage((prev) => {
      const next = prev + direction;
      const bounded = Math.min(Math.max(next, 1), totalPages);
      if (bounded !== prev) {
        loadUsers(bounded);
      }
      return bounded;
    });
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(editForm).filter(([key, val]) =>
          editableFields.includes(key)
        )
      );

      const updated = await adminService.updateUser(selectedUser.id, payload);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === updated.id ? { ...user, ...updated } : user
        )
      );
      setSelectedUser(null);
    } catch (err) {
      console.error("Update user failed:", err);
      setError(err.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setTotal((prev) => Math.max(prev - 1, 0));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Delete user failed:", err);
      setError(err.message || "Failed to delete user");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch (err) {
      return value;
    }
  };

  return (
    <div className="admin-users-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-users-content">
              <div className="admin-users-card">
                <div className="admin-users-header">
                  <div>
                    <h2 className="admin-users-title">User Management</h2>
                    <p className="text-muted mb-0">
                      Review and maintain platform users across roles.
                    </p>
                  </div>
                  <div className="admin-users-header-actions">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => loadUsers(page)}
                      disabled={isLoading}
                    >
                      <i className="fas fa-sync me-2"></i>
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="admin-users-controls">
                  <div className="row g-3 align-items-end">
                    <div className="col-12 col-md-4">
                      <label className="form-label">Search</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name, email, or username"
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={roleFilter}
                        onChange={(event) => {
                          setRoleFilter(event.target.value);
                          setPage(1);
                        }}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Page Size</label>
                      <select
                        className="form-select"
                        value={pageSize}
                        onChange={(event) => {
                          setPageSize(Number(event.target.value));
                          setPage(1);
                        }}
                      >
                        {[10, 20, 50].map((size) => (
                          <option key={size} value={size}>
                            {size} per page
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-2">
                      <label className="form-label">&nbsp;</label>
                      <button
                        type="button"
                        className="btn btn-outline-primary w-100"
                        onClick={() => {
                          setRoleFilter(ROLE_OPTIONS[0].value);
                          setSearchTerm("");
                          setPage(1);
                          setPageSize(10);
                          loadUsers(1);
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="admin-users-table-wrapper">
                  {isLoading ? (
                    <div className="admin-users-empty">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 mb-0">Loading users...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="admin-users-empty">
                      <i className="fas fa-users-slash"></i>
                      <p className="mb-0">No users found.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped align-middle">
                        <thead>
                          <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Username</th>
                            <th scope="col">Role</th>
                            <th scope="col">Status</th>
                            <th scope="col">Created</th>
                            <th scope="col" className="text-end">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div className="admin-users-name">
                                  <div className="admin-users-avatar">
                                    <span>
                                      {(user.firstName || user.email || "")
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="fw-semibold">
                                      {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.firstName ||
                                          user.lastName ||
                                          "-"}
                                    </div>
                                    <small className="text-muted">
                                      ID: {user.id}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{user.email || "-"}</td>
                              <td>{user.username || "-"}</td>
                              <td>
                                <span className="badge bg-secondary text-uppercase">
                                  {user.role || "unknown"}
                                </span>
                              </td>
                              <td>
                                {user.status ? (
                                  <span className="badge bg-light text-dark">
                                    {user.status}
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>{formatDateTime(user.createdAt)}</td>
                              <td className="text-end">
                                <div
                                  className="btn-group btn-group-sm"
                                  role="group"
                                >
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isSaving}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="admin-users-pagination">
                  <div>
                    <small className="text-muted">
                      Showing {filteredUsers.length} of {total} records (page{" "}
                      {page} of {totalPages})
                    </small>
                  </div>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handlePageChange(-1)}
                      disabled={isLoading || page <= 1}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handlePageChange(1)}
                      disabled={isLoading || page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedUser && (
          <div className="admin-users-edit-panel">
            <div className="admin-users-edit-header">
              <h5 className="mb-0">Edit User</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="admin-users-edit-body">
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={editForm.firstName || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={editForm.lastName || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={editForm.email || ""}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  value={editForm.username || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={editForm.role || ""}
                  onChange={handleEditChange}
                >
                  <option value="">Select role</option>
                  {ROLE_OPTIONS.filter((option) => option.value).map(
                    (option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={editForm.status || ""}
                  onChange={handleEditChange}
                >
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedUser(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
