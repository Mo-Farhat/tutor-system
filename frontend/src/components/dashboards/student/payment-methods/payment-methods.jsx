import React, { useState, useEffect } from 'react';
import authService from '../../../../services/authService';
import StripeProvider from '../../../stripe/StripeProvider';
import AddPaymentMethodForm from '../../../stripe/AddPaymentMethodForm';
import '../../../../css/dashboards/student/payment-methods/payment-methods.css';

function StudentPaymentMethods() {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.get('/student/payment-methods');
            
            if (response.success) {
                setPaymentMethods(response.data || []);
            } else {
                setError(response.error || 'Failed to load payment methods');
            }
        } catch (err) {
            console.error('Error loading payment methods:', err);
            setError('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setShowAddCardModal(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setShowAddCardModal(false);
        document.body.style.overflow = 'auto';
    };

    const handlePaymentMethodAdded = (paymentMethod) => {
        console.log('Payment method added:', paymentMethod);
        handleCloseModal();
        loadPaymentMethods();
    };

    const handlePaymentMethodError = (error) => {
        console.error('Payment method error:', error);
        alert(`Error adding payment method: ${error}`);
    };

    const handleDeletePaymentMethod = async (paymentMethodId) => {
        if (!window.confirm('Are you sure you want to delete this payment method?')) {
            return;
        }

        try {
            const response = await authService.delete(`/student/payment-methods/${paymentMethodId}`);
            
            if (response.success) {
                alert('Payment method deleted successfully!');
                await loadPaymentMethods();
            } else {
                alert(`Failed to delete payment method: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting payment method:', error);
            alert('Failed to delete payment method. Please try again.');
        }
    };

    const handleSetDefault = async (paymentMethodId) => {
        try {
            setIsProcessing(true);
            const response = await authService.put(`/student/payment-methods/${paymentMethodId}/default`);
            
            if (response.success) {
                await loadPaymentMethods();
            } else {
                alert(`Failed to set default payment method: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error setting default payment method:', error);
            alert('Failed to set default payment method. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getBrandDisplay = (brand) => {
        const brands = {
            visa: 'VISA',
            mastercard: 'MC', 
            amex: 'AMEX',
            discover: 'DISC',
            unknown: 'Card'
        };
        return brands[brand] || brands.unknown;
    };

    const formatCardType = (brand) => {
        return brand?.charAt(0).toUpperCase() + brand?.slice(1) || 'Card';
    };

    return (
        <div className="student-payment-methods-dashboard">
            <div className="student-payment-methods-content">
                {/* Header Section */}
                <div className="student-payment-methods-section">
                    <h4 className="student-payment-methods-section-title">Payment Methods</h4>
                    <p className="student-payment-methods-section-subtitle">
                        Manage your payment information securely with Stripe
                    </p>
                </div>

                {/* Saved Payment Methods Section */}
                <div className="student-payment-methods-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="student-payment-methods-subsection-title">Saved Payment Methods</h5>
                        <button 
                            className="btn student-payment-methods-btn-add"
                            onClick={handleOpenModal}
                            disabled={loading}
                        >
                            <span className="student-payment-methods-plus-icon">+</span> Add New Method
                        </button>
                    </div>
                    
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading payment methods...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                            <button 
                                className="btn btn-sm btn-outline-danger ms-3" 
                                onClick={loadPaymentMethods}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && paymentMethods.length === 0 && (
                        <div className="text-center py-5">
                            <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                            <h6>No payment methods saved</h6>
                            <p className="text-muted">Add a secure payment method to get started</p>
                        </div>
                    )}

                    {/* Payment Methods List */}
                    {!loading && !error && paymentMethods.length > 0 && (
                        <div className="row g-3 mb-4">
                            {paymentMethods.map((method) => (
                                <div key={method.id} className="col-12">
                                    <div className="card student-payment-methods-method-card">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <div className="student-payment-methods-card-icon">
                                                        <span className={`student-payment-methods-${method.brand}-icon`}>
                                                            {getBrandDisplay(method.brand)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="student-payment-methods-card-info">
                                                        <h6 className="student-payment-methods-card-title">
                                                            {formatCardType(method.brand)}
                                                            {method.last4 && ` ending in ${method.last4}`}
                                                        </h6>
                                                        <p className="student-payment-methods-card-subtitle">
                                                            {method.billingName || 'No billing name'}
                                                            {method.stripePaymentMethodId && (
                                                                <span className="badge bg-success ms-2 small">Stripe Secured</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                {method.isDefault && (
                                                    <div className="col-auto">
                                                        <span className="badge student-payment-methods-default-badge">Default</span>
                                                    </div>
                                                )}
                                                <div className="col-auto">
                                                    <div className="dropdown">
                                                        <button 
                                                            className="btn student-payment-methods-menu-btn" 
                                                            data-bs-toggle="dropdown"
                                                            disabled={isProcessing}
                                                        >
                                                            ⋮
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            {!method.isDefault && (
                                                                <li>
                                                                    <button 
                                                                        className="dropdown-item" 
                                                                        onClick={() => handleSetDefault(method.id)}
                                                                        disabled={isProcessing}
                                                                    >
                                                                        Set as Default
                                                                    </button>
                                                                </li>
                                                            )}
                                                            <li>
                                                                <button 
                                                                    className="dropdown-item text-danger" 
                                                                    onClick={() => handleDeletePaymentMethod(method.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Security Notice */}
                <div className="student-payment-methods-section">
                    <div className="alert alert-info">
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <i className="fas fa-shield-alt fa-2x text-info"></i>
                            </div>
                            <div className="col">
                                <h6 className="mb-1">Your payments are secure</h6>
                                <p className="mb-0 small">
                                    We use Stripe to process payments securely. Your card information is encrypted 
                                    and never stored on our servers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="student-payment-methods-section">
                    <h5 className="student-payment-methods-subsection-title">Recent Activity</h5>
                    <div className="card student-payment-methods-history-card mb-4">
                        <div className="card-body">
                            <div className="text-center py-4 text-muted">
                                <i className="fas fa-clock fa-2x mb-2"></i>
                                <p>Your payment history will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Payment Method Modal */}
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
                            <div className="mb-3">
                                <div className="alert alert-info small">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Your payment information is secured by Stripe and encrypted in transit.
                                </div>
                            </div>
                            
                            <AddPaymentMethodForm 
                                onSuccess={handlePaymentMethodAdded}
                                onError={handlePaymentMethodError}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentPaymentMethods;