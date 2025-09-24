import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import adminService from "../../../services/adminService";
import "../../../css/login-signup/login.css";

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, mockAdminLogin, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace("Input", "");
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      // Use admin service for proper admin authentication
      const response = await adminService.adminLogin({
        username: formData.email,
        password: formData.password,
      });

      if (response.user && response.user.role === "admin") {
        // Update auth context
        await login({
          username: formData.email,
          password: formData.password,
        });
        navigate("/dashboard/admin/home");
      } else {
        throw new Error("Admin access required");
      }
    } catch (err) {
      console.error("Admin login failed:", err);
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="login-card">
                <div className="login-logo-container text-center mb-2">
                  <img
                    src="/Images/logo/logo-v/logo-v-gr.svg"
                    alt="Strive Academics Logo"
                    className="login-logo"
                  />
                </div>

                <h2 className="login-title text-center mb-2">Admin Login</h2>
                <p className="login-subtitle text-center mb-4">
                  Sign in to your admin account
                </p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control login-input"
                      id="emailInput"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="emailInput">
                      <i className="bi bi-envelope login-input-icon"></i> Email
                    </label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control login-input"
                      id="passwordInput"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="passwordInput">
                      <i className="bi bi-lock login-input-icon"></i> Password
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary login-btn w-100 mb-3"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                <div className="login-footer text-center">
                  <Link to="/login" className="login-link">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Login
                  </Link>
                </div>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={async () => {
                      try {
                        const response = await adminService.createAdmin();
                        alert(
                          `Admin created successfully!\nEmail: ${response.email}\nPassword: ${response.password}`
                        );
                      } catch (error) {
                        alert("Failed to create admin: " + error.message);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Create Admin User (Dev)
                  </button>
                  <br />
                  <small className="text-muted">
                    Demo credentials: admin@striveacademy.com / admin123
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
