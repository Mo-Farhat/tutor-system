import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import adminService from "../services/adminService";

function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use admin login method
      const response = await adminService.adminLogin(credentials);

      if (response.user && response.user.role === "admin") {
        // Update auth context
        await login(credentials);
        navigate("/dashboard/admin/home");
      } else {
        setError("Admin access required");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.createAdmin();
      alert(
        `Admin created successfully!\nEmail: ${response.email}\nPassword: ${response.password}`
      );
    } catch (error) {
      console.error("Create admin error:", error);
      setError(error.message || "Failed to create admin user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="card-title text-primary">Admin Login</h2>
                <p className="text-muted">Strive Academy Admin Panel</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCreateAdmin}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Admin User (Dev)"}
                </button>
              </div>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  Default admin credentials:
                  <br />
                  Email: admin@striveacademy.com
                  <br />
                  Password: admin123
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

