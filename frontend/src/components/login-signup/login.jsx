import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../css/login-signup/login.css";

function Login() {
  const [formData, setFormData] = useState({
    email_or_phone: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const { login, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle success message from password setup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Pre-fill email if provided
      if (location.state?.email) {
        setFormData((prev) => ({
          ...prev,
          email_or_phone: location.state.email,
        }));
      }
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace("Input", "");

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }

    // Clear general error
    if (error) {
      clearError();
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email_or_phone.trim()) {
      newErrors.email_or_phone = "Email or phone number is required";
    } else {
      const value = formData.email_or_phone.trim();
      // Check if it's a valid email or phone number
      const isEmail = /\S+@\S+\.\S+/.test(value);
      const isPhone = /^\+?[\d\s-()]+$/.test(value);

      if (!isEmail && !isPhone) {
        newErrors.email_or_phone =
          "Please enter a valid email address or phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine if input is email, username, or phone and format accordingly
      const loginData = {
        password: formData.password,
      };

      const value = formData.email_or_phone.trim();
      const isEmail = /\S+@\S+\.\S+/.test(value);

      if (isEmail) {
        loginData.username = value; // Use email as username for now
      } else {
        loginData.username = value; // Use as username
      }

      console.log("Login data being sent:", loginData); // Debug log
      const response = await login(loginData);
      console.log("Login response:", response); // Debug log

      // Redirect based on user role
      const userRole = response.user?.role || "tutor"; // Default to tutor for approved users
      const isNewTutor = location.state?.isNewTutor;

      switch (userRole) {
        case "student":
          navigate("/dashboard/student/home");
          break;
        case "tutor":
          navigate("/dashboard/tutor/profile", {
            state: isNewTutor
              ? {
                  message:
                    "Welcome to Strive Academics! Please complete your profile setup.",
                }
              : undefined,
          });
          break;
        case "admin":
          navigate("/dashboard/admin/home");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Error is handled by the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
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

                <h2 className="login-title text-center mb-2">Welcome Back</h2>
                <p className="login-subtitle text-center mb-4">
                  Please sign in to continue
                </p>

                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control login-input ${
                        errors.email_or_phone ? "is-invalid" : ""
                      }`}
                      id="email_or_phoneInput"
                      placeholder="Email or Phone Number"
                      value={formData.email_or_phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting || isLoading}
                    />
                    <label htmlFor="email_or_phoneInput">
                      <i className="bi bi-envelope login-input-icon"></i> Email
                      or Phone Number
                    </label>
                    {errors.email_or_phone && (
                      <div className="invalid-feedback">
                        {errors.email_or_phone}
                      </div>
                    )}
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className={`form-control login-input ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="passwordInput"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting || isLoading}
                    />
                    <label htmlFor="passwordInput">
                      <i className="bi bi-lock login-input-icon"></i> Password
                    </label>
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between mb-4 align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input login-checkbox"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        disabled={isSubmitting || isLoading}
                      />
                      <label
                        className="form-check-label login-check-label"
                        htmlFor="rememberMe"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="login-forgot-link">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn login-submit-btn w-100 mb-4"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i> Sign
                        In
                      </>
                    )}
                  </button>

                  <div className="login-signup-prompt text-center">
                    <span>Don't have an account?</span>
                    <Link to="/signup" className="login-signup-link ms-1">
                      Sign up
                    </Link>
                  </div>
                </form>

                {/* Admin Demo Login */}
                <div className="mt-4 pt-4 border-top">
                  <div className="text-center mb-3">
                    <small className="text-muted">Demo Admin Access</small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-warning w-100"
                    onClick={handleAdminLogin}
                    disabled={isSubmitting || isLoading}
                  >
                    <i className="fas fa-user-shield me-2"></i>
                    Login as Admin
                  </button>
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Click to access admin login page
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
