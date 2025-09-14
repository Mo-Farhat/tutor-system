import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/student/payment-methods/payment-methods.css';

function StudentPaymentMethods() {
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [cardForm, setCardForm] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        isDefault: false
    });
    const [formErrors, setFormErrors] = useState({});

    // Handle opening the modal
    const handleOpenModal = () => {
        setShowAddCardModal(true);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setShowAddCardModal(false);
        document.body.style.overflow = 'auto'; // Restore scrolling
        setCardForm({
            cardNumber: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            cardholderName: '',
            isDefault: false
        });
        setFormErrors({});
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'cardNumber') {
            // Format card number with spaces
            const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            if (formattedValue.replace(/\s/g, '').length <= 16) {
                setCardForm(prev => ({ ...prev, [name]: formattedValue }));
            }
        } else if (name === 'cvv') {
            // Limit CVV to 4 digits
            if (value.length <= 4 && /^\d*$/.test(value)) {
                setCardForm(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'expiryMonth' || name === 'expiryYear') {
            // Ensure numeric input
            if (/^\d*$/.test(value)) {
                setCardForm(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setCardForm(prev => ({ 
                ...prev, 
                [name]: type === 'checkbox' ? checked : value 
            }));
        }
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        
        if (!cardForm.cardNumber.replace(/\s/g, '')) {
            errors.cardNumber = 'Card number is required';
        } else if (cardForm.cardNumber.replace(/\s/g, '').length !== 16) {
            errors.cardNumber = 'Card number must be 16 digits';
        }
        
        if (!cardForm.expiryMonth) {
            errors.expiryMonth = 'Month is required';
        } else if (parseInt(cardForm.expiryMonth) < 1 || parseInt(cardForm.expiryMonth) > 12) {
            errors.expiryMonth = 'Invalid month';
        }
        
        if (!cardForm.expiryYear) {
            errors.expiryYear = 'Year is required';
        } else if (parseInt(cardForm.expiryYear) < new Date().getFullYear()) {
            errors.expiryYear = 'Card has expired';
        }
        
        if (!cardForm.cvv) {
            errors.cvv = 'CVV is required';
        } else if (cardForm.cvv.length < 3) {
            errors.cvv = 'CVV must be at least 3 digits';
        }
        
        if (!cardForm.cardholderName.trim()) {
            errors.cardholderName = 'Cardholder name is required';
        }
        
        return errors;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        // Here you would typically send the data to your backend
        console.log('New card data:', cardForm);
        
        // For demo purposes, just close the modal
        alert('Payment method added successfully!');
        handleCloseModal();
    };

    // Determine card type based on card number
    const getCardType = (cardNumber) => {
        const number = cardNumber.replace(/\s/g, '');
        if (number.startsWith('4')) return 'visa';
        if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
        if (number.startsWith('3')) return 'amex';
        return 'unknown';
    };

    return (
        <div className="student-payment-methods-dashboard">
            <div className="student-payment-methods-content">
                {/* Header Section */}
                <div className="student-payment-methods-section">
                    <h4 className="student-payment-methods-section-title">Payment Methods</h4>
                    <p className="student-payment-methods-section-subtitle">Manage your payment information securely</p>
                </div>

                {/* Saved Payment Methods Section */}
                <div className="student-payment-methods-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="student-payment-methods-subsection-title">Saved Payment Methods</h5>
                        <button 
                            className="btn student-payment-methods-btn-add"
                            onClick={handleOpenModal}
                        >
                            <span className="student-payment-methods-plus-icon">+</span> Add New Method
                        </button>
                    </div>
                    
                    <div className="row g-3 mb-4">
                        <div className="col-12">
                            <div className="card student-payment-methods-method-card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <div className="student-payment-methods-card-icon">
                                                <span className="student-payment-methods-visa-icon">VISA</span>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="student-payment-methods-card-info">
                                                <h6 className="student-payment-methods-card-title">Visa ending in 4242</h6>
                                                <p className="student-payment-methods-card-subtitle">Expires 08/2025</p>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <span className="badge student-payment-methods-default-badge">Default</span>
                                        </div>
                                        <div className="col-auto">
                                            <div className="dropdown">
                                                <button className="btn student-payment-methods-menu-btn" data-bs-toggle="dropdown">
                                                    ⋮
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><a className="dropdown-item" href="#">Edit</a></li>
                                                    <li><a className="dropdown-item" href="#">Set as Default</a></li>
                                                    <li><a className="dropdown-item text-danger" href="#">Delete</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card student-payment-methods-method-card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <div className="student-payment-methods-card-icon">
                                                <span className="student-payment-methods-mastercard-icon">MC</span>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="student-payment-methods-card-info">
                                                <h6 className="student-payment-methods-card-title">Mastercard ending in 8888</h6>
                                                <p className="student-payment-methods-card-subtitle">Expires 11/2025</p>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <div className="dropdown">
                                                <button className="btn student-payment-methods-menu-btn" data-bs-toggle="dropdown">
                                                    ⋮
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><a className="dropdown-item" href="#">Edit</a></li>
                                                    <li><a className="dropdown-item" href="#">Set as Default</a></li>
                                                    <li><a className="dropdown-item text-danger" href="#">Delete</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History Section */}
                <div className="student-payment-methods-section">
                    <h5 className="student-payment-methods-subsection-title">Payment History</h5>
                    <div className="card student-payment-methods-history-card mb-4">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-borderless student-payment-methods-table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Apr 15, 2025</td>
                                            <td>Monthly Tutoring Package</td>
                                            <td>$199.00</td>
                                            <td><span className="badge student-payment-methods-status-paid">Paid</span></td>
                                            <td>
                                                <a href="#" className="student-payment-methods-download-link">
                                                    📥 Download
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Mar 15, 2025</td>
                                            <td>Monthly Tutoring Package</td>
                                            <td>$199.00</td>
                                            <td><span className="badge student-payment-methods-status-paid">Paid</span></td>
                                            <td>
                                                <a href="#" className="student-payment-methods-download-link">
                                                    📥 Download
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Payments Section */}
                <div className="student-payment-methods-section">
                    <h5 className="student-payment-methods-subsection-title">Upcoming Payments</h5>
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="card student-payment-methods-upcoming-card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="student-payment-methods-upcoming-title">Monthly Tutoring Package</h6>
                                            <p className="student-payment-methods-upcoming-subtitle">Next payment: May 15, 2025</p>
                                        </div>
                                        <div className="col-auto">
                                            <div className="student-payment-methods-upcoming-amount">$199.00</div>
                                            <div className="student-payment-methods-upcoming-frequency">Recurring Monthly</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card student-payment-methods-upcoming-card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="student-payment-methods-upcoming-title">Advanced Mathematics Course</h6>
                                            <p className="student-payment-methods-upcoming-subtitle">Due: May 1, 2025</p>
                                        </div>
                                        <div className="col-auto">
                                            <div className="student-payment-methods-upcoming-amount">$299.00</div>
                                            <div className="student-payment-methods-upcoming-frequency">One-time Payment</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Card Modal */}
            {showAddCardModal && (
                <div className="student-payment-methods-modal-overlay" onClick={handleCloseModal}>
                    <div className="student-payment-methods-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="student-payment-methods-modal-header">
                            <h5 className="student-payment-methods-modal-title">Add New Payment Method</h5>
                            <button 
                                type="button" 
                                className="student-payment-methods-close-btn"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="student-payment-methods-modal-body">
                            <form onSubmit={handleSubmit}>
                                {/* Card Number */}
                                <div className="student-payment-methods-form-group">
                                    <label className="student-payment-methods-form-label">
                                        Card Number *
                                    </label>
                                    <div className="student-payment-methods-input-group">
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={cardForm.cardNumber}
                                            onChange={handleInputChange}
                                            placeholder="1234 5678 9012 3456"
                                            className={`student-payment-methods-form-input ${formErrors.cardNumber ? 'error' : ''}`}
                                        />
                                        {cardForm.cardNumber && (
                                            <div className="student-payment-methods-card-type-icon">
                                                {getCardType(cardForm.cardNumber) === 'visa' && (
                                                    <span className="student-payment-methods-visa-small">VISA</span>
                                                )}
                                                {getCardType(cardForm.cardNumber) === 'mastercard' && (
                                                    <span className="student-payment-methods-mastercard-small">MC</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {formErrors.cardNumber && (
                                        <span className="student-payment-methods-error-text">{formErrors.cardNumber}</span>
                                    )}
                                </div>

                                {/* Expiry Date and CVV */}
                                <div className="row">
                                    <div className="col-4">
                                        <div className="student-payment-methods-form-group">
                                            <label className="student-payment-methods-form-label">
                                                Month *
                                            </label>
                                            <input
                                                type="text"
                                                name="expiryMonth"
                                                value={cardForm.expiryMonth}
                                                onChange={handleInputChange}
                                                placeholder="MM"
                                                maxLength="2"
                                                className={`student-payment-methods-form-input ${formErrors.expiryMonth ? 'error' : ''}`}
                                            />
                                            {formErrors.expiryMonth && (
                                                <span className="student-payment-methods-error-text">{formErrors.expiryMonth}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="student-payment-methods-form-group">
                                            <label className="student-payment-methods-form-label">
                                                Year *
                                            </label>
                                            <input
                                                type="text"
                                                name="expiryYear"
                                                value={cardForm.expiryYear}
                                                onChange={handleInputChange}
                                                placeholder="YYYY"
                                                maxLength="4"
                                                className={`student-payment-methods-form-input ${formErrors.expiryYear ? 'error' : ''}`}
                                            />
                                            {formErrors.expiryYear && (
                                                <span className="student-payment-methods-error-text">{formErrors.expiryYear}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="student-payment-methods-form-group">
                                            <label className="student-payment-methods-form-label">
                                                CVV *
                                            </label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={cardForm.cvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                className={`student-payment-methods-form-input ${formErrors.cvv ? 'error' : ''}`}
                                            />
                                            {formErrors.cvv && (
                                                <span className="student-payment-methods-error-text">{formErrors.cvv}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Cardholder Name */}
                                <div className="student-payment-methods-form-group">
                                    <label className="student-payment-methods-form-label">
                                        Cardholder Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="cardholderName"
                                        value={cardForm.cardholderName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className={`student-payment-methods-form-input ${formErrors.cardholderName ? 'error' : ''}`}
                                    />
                                    {formErrors.cardholderName && (
                                        <span className="student-payment-methods-error-text">{formErrors.cardholderName}</span>
                                    )}
                                </div>

                                {/* Set as Default */}
                                <div className="student-payment-methods-form-group">
                                    <div className="student-payment-methods-checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            name="isDefault"
                                            checked={cardForm.isDefault}
                                            onChange={handleInputChange}
                                            className="student-payment-methods-checkbox"
                                        />
                                        <label htmlFor="isDefault" className="student-payment-methods-checkbox-label">
                                            Set as default payment method
                                        </label>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="student-payment-methods-modal-actions">
                                    <button
                                        type="button"
                                        className="btn student-payment-methods-btn-cancel"
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn student-payment-methods-btn-save"
                                    >
                                        Add Payment Method
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

export default StudentPaymentMethods;
