import React, { useState, useEffect } from 'react';
import { authService } from '../../../../services/authService';
import StripeProvider from '../../../stripe/StripeProvider';
import AddPaymentMethodForm from '../../../stripe/AddPaymentMethodForm';
import '../../../../css/dashboards/student/payment-methods/payment-methods.css';

function StudentPaymentMethodsWithStripe() {
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
            const response = await authService.get('/auth/student/payment-methods');
            
            if (response.data.success) {
                setPaymentMethods(response.data.data || []);
            } else {
                setError(response.data.error || 'Failed to load payment methods');
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
        loadPaymentMethods(); // Reload to show the new payment method
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
            const response = await authService.delete(`/auth/student/payment-methods/${paymentMethodId}`);
            
            if (response.data.success) {
                alert('Payment method deleted successfully!');
                await loadPaymentMethods();
            } else {
                alert(`Failed to delete payment method: ${response.data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting payment method:', error);
            alert('Failed to delete payment method. Please try again.');
        }
    };

    const handleSetDefault = async (paymentMethodId) => {
        try {
            setIsProcessing(true);
            const response = await authService.put(`/auth/student/payment-methods/${paymentMethodId}/default`);
            
            if (response.data.success) {
                await loadPaymentMethods();
            } else {
                alert(`Failed to set default payment method: ${response.data.error || 'Unknown error'}`);
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

    const getCardIcon = (brand) => {
        switch(brand?.toLowerCase()) {
            case 'visa': return '💳';
            case 'mastercard': return '💳';
            case 'amex': return '💳';
            case 'discover': return '💳';
            default: return '💳';
        }
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
                            <p className="text-muted">Add a payment method to get started with secure payments</p>
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
                                                            {method.brand?.charAt(0).toUpperCase() + method.brand?.slice(1) || 'Card'} 
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
                            
                            <StripeProvider>
                                <AddPaymentMethodForm 
                                    onSuccess={handlePaymentMethodAdded}
                                    onError={handlePaymentMethodError}
                                />
                            </StripeProvider>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentPaymentMethodsWithStripe;