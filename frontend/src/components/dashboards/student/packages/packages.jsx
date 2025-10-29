import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../../../../services/studentService';
import authService from '../../../../services/authService';
import '../../../../css/dashboards/student/packages/packages.css';

function StudentPackages() {
    const navigate = useNavigate();
    const [availablePackages, setAvailablePackages] = useState([]);
    const [purchasedPackages, setPurchasedPackages] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState({});
    const [showNoPaymentMethodAlert, setShowNoPaymentMethodAlert] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPackageModal, setShowPackageModal] = useState(false);

    useEffect(() => {
        loadPackagesData();
    }, []);

    const loadPackagesData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load packages and payment methods
            const [packagesResult, paymentMethodsResult] = await Promise.all([
                studentService.getPackages(),
                authService.get('/student/payment-methods')
            ]);

            if (packagesResult.success) {
                // Handle new response format with available and purchased packages
                const available = packagesResult.data.available || [];
                const purchased = packagesResult.data.purchased || packagesResult.data || [];
                
                setAvailablePackages(available);
                setPurchasedPackages(purchased.filter(pkg => pkg.status === 'active'));
            } else {
                console.error('Failed to load packages:', packagesResult.error);
                setError('Failed to load packages. Please try again.');
            }

            // Load payment methods
            if (paymentMethodsResult.success) {
                setPaymentMethods(paymentMethodsResult.data || []);
            } else {
                console.error('Failed to load payment methods:', paymentMethodsResult.error);
            }

        } catch (err) {
            console.error('Error loading packages data:', err);
            setError('Failed to load packages information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchasePackage = async (packageData) => {
        // Check if user has payment methods
        if (!paymentMethods || paymentMethods.length === 0) {
            setShowNoPaymentMethodAlert(true);
            return;
        }

        try {
            setPurchaseLoading(prev => ({ ...prev, [packageData.id]: true }));

            // Create checkout session for package purchase
            const response = await studentService.createPackageCheckout({
                packageId: packageData.id,
                subject: packageData.subject
            });

            if (response.success && response.data.checkout_url) {
                // Redirect to Stripe checkout
                window.location.href = response.data.checkout_url;
            } else {
                alert('Failed to create checkout session: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error purchasing package:', error);
            alert('Error purchasing package: ' + error.message);
        } finally {
            setPurchaseLoading(prev => ({ ...prev, [packageData.id]: false }));
        }
    };

    const handleViewPackageDetails = (packageData) => {
        setSelectedPackage(packageData);
        setShowPackageModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
        }).format(amount);
    };

    const calculateFinalPrice = (price, discount, discountType) => {
        if (discountType === 'percentage') {
            return price * (1 - discount / 100);
        }
        return Math.max(0, price - discount);
    };

    const getSubjectIcon = (subject) => {
        const icons = {
            'Mathematics': '📊',
            'English': '📚',
            'Science': '🔬',
            'Physics': '⚛️',
            'Chemistry': '⚗️',
            'Biology': '🧬',
            'History': '📜',
            'Geography': '🌍',
            'Economics': '💰',
            'Psychology': '🧠'
        };
        return icons[subject] || '📖';
    };

    if (loading) {
        return (
            <div className="student-packages-container">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">Loading packages...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-packages-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="student-packages-content">
                            {/* Header */}
                            <div className="student-packages-header mb-4">
                                <div className="student-packages-title-section">
                                    <h2 className="student-packages-title">Available Packages</h2>
                                    <p className="student-packages-subtitle text-muted">
                                        Choose from our tutoring packages designed to help you succeed
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {/* My Active Packages */}
                            {purchasedPackages.length > 0 && (
                                <div className="student-packages-section mb-5">
                                    <h4 className="section-title">My Active Packages</h4>
                                    <div className="row g-4">
                                        {purchasedPackages.map((pkg) => {
                                            const progressPercent = pkg.hoursTotal > 0 ? ((pkg.hoursTotal - pkg.hoursUsed) / pkg.hoursTotal) * 100 : 0;
                                            return (
                                                <div key={pkg.id} className="col-md-6 col-lg-4">
                                                    <div className="student-package-card purchased">
                                                        <div className="package-header">
                                                            <div className="package-icon">
                                                                {getSubjectIcon(pkg.subject)}
                                                            </div>
                                                            <div className="package-info">
                                                                <h5 className="package-title">{pkg.subject} Package</h5>
                                                                <span className="badge bg-success">Active</span>
                                                            </div>
                                                        </div>
                                                        <div className="package-progress">
                                                            <div className="progress-info">
                                                                <span>Progress: {pkg.hoursUsed}/{pkg.hoursTotal} hours</span>
                                                                <span>{Math.round(progressPercent)}%</span>
                                                            </div>
                                                            <div className="progress">
                                                                <div 
                                                                    className="progress-bar bg-success" 
                                                                    style={{ width: `${progressPercent}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div className="package-footer">
                                                            <small className="text-muted">
                                                                Purchased: {new Date(pkg.purchasedAt).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Available Packages */}
                            <div className="student-packages-section">
                                <h4 className="section-title">Available Packages</h4>
                                {availablePackages.length === 0 ? (
                                    <div className="student-empty-state">
                                        <i className="fas fa-box text-muted mb-3"></i>
                                        <h5>No packages available</h5>
                                        <p className="text-muted">
                                            Check back later for new tutoring packages
                                        </p>
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {availablePackages.map((pkg) => {
                                            const finalPrice = calculateFinalPrice(pkg.price, pkg.discount, pkg.discountType);
                                            const isPurchasing = purchaseLoading[pkg.id];
                                            
                                            return (
                                                <div key={pkg.id} className="col-md-6 col-lg-4">
                                                    <div className="student-package-card available">
                                                        <div className="package-header">
                                                            <div className="package-icon">
                                                                {getSubjectIcon(pkg.subject)}
                                                            </div>
                                                            <div className="package-info">
                                                                <h5 className="package-title">{pkg.name}</h5>
                                                                <span className="badge bg-primary">{pkg.subject}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="package-details">
                                                            <div className="package-hours">
                                                                <i className="fas fa-clock me-2"></i>
                                                                {pkg.hours} hours of tutoring
                                                            </div>
                                                            
                                                            <div className="package-validity">
                                                                <i className="fas fa-calendar me-2"></i>
                                                                Valid for {pkg.validityMonths} months
                                                            </div>
                                                            
                                                            {pkg.description && (
                                                                <div className="package-description">
                                                                    <p className="text-muted">{pkg.description}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="package-pricing">
                                                            {pkg.discount > 0 && (
                                                                <div className="original-price">
                                                                    <span className="text-decoration-line-through text-muted">
                                                                        {formatCurrency(pkg.price)}
                                                                    </span>
                                                                    <span className="discount-badge">
                                                                        -{pkg.discountType === 'percentage' ? `${pkg.discount}%` : formatCurrency(pkg.discount)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="final-price">
                                                                <strong>{formatCurrency(finalPrice)}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="package-actions">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm me-2"
                                                                onClick={() => handleViewPackageDetails(pkg)}
                                                            >
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                Details
                                                            </button>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handlePurchasePackage(pkg)}
                                                                disabled={isPurchasing}
                                                            >
                                                                {isPurchasing ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-shopping-cart me-1"></i>
                                                                        Purchase
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {pkg.refundable && (
                                                            <div className="package-features">
                                                                <small className="text-success">
                                                                    <i className="fas fa-undo me-1"></i>
                                                                    Refundable
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Details Modal */}
            {showPackageModal && selectedPackage && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-box-open me-2"></i>
                                    {selectedPackage.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPackageModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="package-detail-section">
                                            <h6>Package Information</h6>
                                            <div className="detail-item">
                                                <strong>Subject:</strong> {selectedPackage.subject}
                                            </div>
                                            <div className="detail-item">
                                                <strong>Hours:</strong> {selectedPackage.hours} hours
                                            </div>
                                            <div className="detail-item">
                                                <strong>Validity:</strong> {selectedPackage.validityMonths} months
                                            </div>
                                            <div className="detail-item">
                                                <strong>Refundable:</strong> 
                                                <span className={`badge bg-${selectedPackage.refundable ? 'success' : 'secondary'} ms-2`}>
                                                    {selectedPackage.refundable ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="package-detail-section">
                                            <h6>Pricing</h6>
                                            <div className="detail-item">
                                                <strong>Original Price:</strong> {formatCurrency(selectedPackage.price)}
                                            </div>
                                            {selectedPackage.discount > 0 && (
                                                <div className="detail-item">
                                                    <strong>Discount:</strong>
                                                    <span className="text-success">
                                                        -{selectedPackage.discountType === 'percentage' 
                                                            ? `${selectedPackage.discount}%` 
                                                            : formatCurrency(selectedPackage.discount)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="detail-item">
                                                <strong>Final Price:</strong>
                                                <span className="text-primary fs-5">
                                                    {formatCurrency(calculateFinalPrice(selectedPackage.price, selectedPackage.discount, selectedPackage.discountType))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {selectedPackage.description && (
                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <h6>Description</h6>
                                            <p>{selectedPackage.description}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowPackageModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowPackageModal(false);
                                        handlePurchasePackage(selectedPackage);
                                    }}
                                    disabled={purchaseLoading[selectedPackage.id]}
                                >
                                    <i className="fas fa-shopping-cart me-1"></i>
                                    Purchase Package
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Payment Method Alert */}
            {showNoPaymentMethodAlert && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-credit-card me-2"></i>
                                    Payment Method Required
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowNoPaymentMethodAlert(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>You need to add a payment method before purchasing packages.</p>
                                <p>Would you like to add a payment method now?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowNoPaymentMethodAlert(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowNoPaymentMethodAlert(false);
                                        navigate('/dashboard/student/payment-methods');
                                    }}
                                >
                                    Add Payment Method
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentPackages;