import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import tutorService from "../services/tutorService";

const TutorPasswordSetup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const result = await tutorService.verifyPasswordSetupToken(token);
        if (result.success) {
          setTokenData(result.data);
        } else {
          setError(result.error || "Invalid or expired token");
        }
      } catch (err) {
        setError("Failed to verify token");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("No token provided");
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await tutorService.setupPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        setSuccess(true);

        // Auto-login the user with the returned tokens
        if (result.data.user && result.data.tokens) {
          // Store tokens (already done in tutorService.setupPassword)
          // Update auth context with user data
          contextLogin({
            user: result.data.user,
            access: result.data.tokens.access,
            refresh: result.data.tokens.refresh,
          });

          // Redirect to tutor dashboard
          setTimeout(() => {
            navigate("/dashboard/tutor/profile", {
              state: {
                message: "Welcome! Please complete your profile setup.",
                isNewTutor: true,
              },
            });
          }, 2000);
        } else {
          // If no tokens, redirect to login
          setTimeout(() => {
            navigate("/login", {
              state: {
                message:
                  "Password set successfully! Please log in to continue.",
              },
            });
          }, 2000);
        }
      } else {
        setError(result.error || "Failed to set password");
      }
    } catch (err) {
      setError("An error occurred while setting up your password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Verifying your setup link...</p>
        </div>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <div className="text-danger mb-3">
                    <i className="fas fa-exclamation-triangle fa-3x"></i>
                  </div>
                  <h4 className="card-title text-danger">Invalid Setup Link</h4>
                  <p className="card-text">{error}</p>
                  <p className="text-muted">
                    This link may have expired or already been used. Please
                    contact support if you need assistance.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/login")}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-success">
                <div className="card-body text-center">
                  <div className="text-success mb-3">
                    <i className="fas fa-check-circle fa-3x"></i>
                  </div>
                  <h4 className="card-title text-success">
                    Password Set Successfully!
                  </h4>
                  <p className="card-text">
                    Welcome to Strive Academy, {tokenData?.tutorName}!
                  </p>
                  <p className="text-muted">
                    You're being redirected to your dashboard...
                  </p>
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Redirecting...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title text-primary">Set Your Password</h2>
                  <p className="text-muted">
                    Welcome, {tokenData?.tutorName}! <br />
                    Create a secure password for your tutor account.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        error && error.includes("Password") ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                    />
                    <div className="form-text">
                      Must be at least 8 characters with uppercase, lowercase,
                      and number.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        error && error.includes("match") ? "is-invalid" : ""
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Setting Password...
                        </>
                      ) : (
                        "Set Password & Continue"
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted small">
                    Having trouble? Contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPasswordSetup;
