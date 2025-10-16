import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  verifyPasswordSetupToken,
  setupTutorPassword,
} from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import "../css/login-signup/login.css";

const TutorPasswordSetup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tutorInfo, setTutorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    const result = await verifyPasswordSetupToken(token);

    if (result.success) {
      setTutorInfo(result.data);
    } else {
      setError(result.message || "Invalid or expired setup link");
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Check for common password patterns
    if (/^\d+$/.test(formData.password)) {
      setError("Password cannot be entirely numeric");
      return false;
    }

    // Check for too simple passwords
    const commonPasswords = ["password", "12345678", "qwerty123", "abcdefgh"];
    if (commonPasswords.includes(formData.password.toLowerCase())) {
      setError("Password is too common. Please choose a more secure password.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const result = await setupTutorPassword(token, formData);

    if (result.success) {
      // Redirect to login page with success message
      navigate("/login", {
        state: {
          message:
            "Password set successfully! Please log in with your new password.",
          email: result.data.email,
          username: result.data.username,
          isNewTutor: true,
        },
      });
    } else {
      // Show specific backend error message
      const errorMessage =
        result.error || result.data?.error || "Failed to set password";
      setError(errorMessage);
      console.error("Password setup error:", result);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Verifying setup link...</p>
        </div>
      </div>
    );
  }

  if (error && !tutorInfo) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <i className="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i>
                  <h4 className="card-title text-danger">Invalid Setup Link</h4>
                  <p className="card-text">{error}</p>
                  <p className="text-muted">
                    This link may have expired or been used already. Please
                    contact support if you need assistance.
                  </p>
                  <a
                    href="mailto:tutors@striveacademy.com"
                    className="btn btn-primary"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

                <h2 className="login-title text-center mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Welcome to Strive Academics!
                </h2>
                <p className="login-subtitle text-center mb-4">
                  Your application has been approved. Set your password to
                  continue.
                </p>

                {tutorInfo && (
                  <div className="alert alert-success" role="alert">
                    <strong>
                      Congratulations {tutorInfo.data?.first_name}!
                    </strong>{" "}
                    Your application has been approved.
                  </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control login-input"
                      id="passwordInput"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="8"
                      disabled={submitting}
                    />
                    <label htmlFor="passwordInput">
                      <i className="bi bi-lock login-input-icon"></i> Password
                    </label>
                  </div>

                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control login-input"
                      id="confirmPasswordInput"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                    <label htmlFor="confirmPasswordInput">
                      <i className="bi bi-lock login-input-icon"></i> Confirm
                      Password
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary login-btn w-100"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Setting up your account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Complete Setup & Continue
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    After setting your password, you'll be redirected to your
                    tutor dashboard.
                  </small>
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
