import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../css/login-signup/login.css';

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const { login, error, clearError, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        const fieldName = id.replace('Input', '');
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Clear specific field error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
        
        // Clear general error
        if (error) {
            clearError();
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
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
            const response = await login({
                username: formData.username.trim(),
                password: formData.password
            });

            // Redirect based on user role
            const userRole = response.user.role;
            switch (userRole) {
                case 'student':
                    navigate('/');
                    break;
                case 'tutor':
                    navigate('/tutor/account-settings');
                    break;
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            console.error('Login failed:', err);
            // Error is handled by the AuthContext
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
                                    <img src="/Images/logo/logo-v/logo-v-gr.svg" alt="Strive Academics Logo" className="login-logo" />
                                </div>

                                <h2 className="login-title text-center mb-2">Welcome Back</h2>
                                <p className="login-subtitle text-center mb-4">Please sign in to continue</p>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form className="login-form" onSubmit={handleSubmit}>
                                    <div className="form-floating mb-3">
                                        <input 
                                            type="text" 
                                            className={`form-control login-input ${errors.username ? 'is-invalid' : ''}`}
                                            id="usernameInput" 
                                            placeholder="Username" 
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting || isLoading}
                                        />
                                        <label htmlFor="usernameInput">
                                            <i className="bi bi-person login-input-icon"></i> Username
                                        </label>
                                        {errors.username && (
                                            <div className="invalid-feedback">
                                                {errors.username}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="form-floating mb-3">
                                        <input 
                                            type="password" 
                                            className={`form-control login-input ${errors.password ? 'is-invalid' : ''}`}
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
                                            <div className="invalid-feedback">
                                                {errors.password}
                                            </div>
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
                                            <label className="form-check-label login-check-label" htmlFor="rememberMe">
                                                Remember me
                                            </label>
                                        </div>
                                        <Link to="/forgot-password" className="login-forgot-link">Forgot password?</Link>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn login-submit-btn w-100 mb-4"
                                        disabled={isSubmitting || isLoading}
                                    >
                                        {isSubmitting || isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                                            </>
                                        )}
                                    </button>

                                    <div className="login-signup-prompt text-center">
                                        <span>Don't have an account?</span>
                                        <Link to="/signup" className="login-signup-link ms-1">Sign up</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
