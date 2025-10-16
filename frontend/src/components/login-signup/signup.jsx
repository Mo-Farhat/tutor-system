import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../css/login-signup/signup.css';

function Signup() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const { register, error, clearError, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let fieldName = id.replace('Input', '');
        
        // Handle special field mappings
        if (fieldName === 'telephone') {
            fieldName = 'phone_number';
        } else if (fieldName === 'retypePassword') {
            fieldName = 'password_confirm';
        }
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Generate username from email if email is being changed
        if (fieldName === 'email' && value) {
            const emailUsername = value.split('@')[0];
            setFormData(prev => ({
                ...prev,
                username: emailUsername
            }));
        }

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

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (formData.phone_number && !/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Phone number is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.password_confirm) {
            newErrors.password_confirm = 'Please confirm your password';
        } else if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Passwords do not match';
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
            await register({
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim() || null,
                password: formData.password,
                password_confirm: formData.password_confirm
                // role: 'student' is automatically set in the service
            });

            // Redirect to home page after successful registration
            navigate('/');
        } catch (err) {
            console.error('Registration failed:', err);
            // Error is handled by the AuthContext
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-overlay">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5">
                            <div className="signup-card">
                                <div className="signup-logo-container text-center mb-2">
                                    <img src="/Images/logo/logo-v/logo-v-gr.svg" alt="Strive Academics Logo" className="signup-logo" />
                                </div>

                                <h2 className="signup-title text-center mb-2">Create Student Account</h2>
                                <p className="signup-subtitle text-center mb-4">Join Strive Academics as a student</p>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form className="signup-form" onSubmit={handleSubmit}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input 
                                                    type="text" 
                                                    className={`form-control signup-input ${errors.first_name ? 'is-invalid' : ''}`}
                                                    id="first_nameInput" 
                                                    placeholder="First Name" 
                                                    value={formData.first_name}
                                                    onChange={handleInputChange}
                                                    disabled={isSubmitting || isLoading}
                                                />
                                                <label htmlFor="first_nameInput">
                                                    <i className="bi bi-person signup-input-icon"></i> First Name
                                                </label>
                                                {errors.first_name && (
                                                    <div className="invalid-feedback">
                                                        {errors.first_name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input 
                                                    type="text" 
                                                    className={`form-control signup-input ${errors.last_name ? 'is-invalid' : ''}`}
                                                    id="last_nameInput" 
                                                    placeholder="Last Name" 
                                                    value={formData.last_name}
                                                    onChange={handleInputChange}
                                                    disabled={isSubmitting || isLoading}
                                                />
                                                <label htmlFor="last_nameInput">
                                                    <i className="bi bi-person signup-input-icon"></i> Last Name
                                                </label>
                                                {errors.last_name && (
                                                    <div className="invalid-feedback">
                                                        {errors.last_name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-floating mb-3">
                                        <input 
                                            type="email" 
                                            className={`form-control signup-input ${errors.email ? 'is-invalid' : ''}`}
                                            id="emailInput" 
                                            placeholder="Email address" 
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting || isLoading}
                                        />
                                        <label htmlFor="emailInput">
                                            <i className="bi bi-envelope signup-input-icon"></i> Email address
                                        </label>
                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-floating mb-3">
                                        <input 
                                            type="tel" 
                                            className={`form-control signup-input ${errors.phone_number ? 'is-invalid' : ''}`}
                                            id="telephoneInput" 
                                            placeholder="Telephone Number" 
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting || isLoading}
                                        />
                                        <label htmlFor="telephoneInput">
                                            <i className="bi bi-telephone signup-input-icon"></i> Telephone Number (Optional)
                                        </label>
                                        {errors.phone_number && (
                                            <div className="invalid-feedback">
                                                {errors.phone_number}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="form-floating mb-3">
                                        <input 
                                            type="password" 
                                            className={`form-control signup-input ${errors.password ? 'is-invalid' : ''}`}
                                            id="passwordInput" 
                                            placeholder="Password" 
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting || isLoading}
                                        />
                                        <label htmlFor="passwordInput">
                                            <i className="bi bi-lock signup-input-icon"></i> Password
                                        </label>
                                        {errors.password && (
                                            <div className="invalid-feedback">
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-floating mb-4">
                                        <input 
                                            type="password" 
                                            className={`form-control signup-input ${errors.password_confirm ? 'is-invalid' : ''}`}
                                            id="retypePasswordInput" 
                                            placeholder="Retype Password" 
                                            value={formData.password_confirm}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting || isLoading}
                                        />
                                        <label htmlFor="retypePasswordInput">
                                            <i className="bi bi-lock signup-input-icon"></i> Confirm Password
                                        </label>
                                        {errors.password_confirm && (
                                            <div className="invalid-feedback">
                                                {errors.password_confirm}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn signup-submit-btn w-100 mb-4"
                                        disabled={isSubmitting || isLoading}
                                    >
                                        {isSubmitting || isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-plus me-2"></i> Create Student Account
                                            </>
                                        )}
                                    </button>

                                    <div className="signup-login-prompt text-center">
                                        <span>Already have an account?</span>
                                        <Link to="/login" className="signup-login-link ms-1">Sign in</Link>
                                    </div>

                                    <div className="text-center mt-3">
                                        <small className="text-muted">
                                            Want to become a tutor? <Link to="/join-us" className="text-primary">Apply here</Link>
                                        </small>
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

export default Signup;
