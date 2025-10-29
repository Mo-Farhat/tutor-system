import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../../../../services/studentService';
import authService from '../../../../services/authService';
import '../../../../css/dashboards/student/payment-history/payment-history.css';

function StudentPaymentHistory() {
    const navigate = useNavigate();
    const [activePackages, setActivePackages] = useState([]);
    const [availablePackages, setAvailablePackages] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState({});
    const [showNoPaymentMethodAlert, setShowNoPaymentMethodAlert] = useState(false);

    // Available package subjects


    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load packages, payment history, and payment methods
            const [packagesResult, paymentsResult, paymentMethodsResult] = await Promise.all([
                studentService.getPackages(),
                studentService.getPayments(),
                authService.get('/student/payment-methods')
            ]);

            if (packagesResult.success) {
                // Handle new response format with available and purchased packages
                const purchasedPackages = packagesResult.data.purchased || packagesResult.data || [];
                const availablePackagesList = packagesResult.data.available || [];

                // Transform backend packages to frontend format
                const transformedPackages = purchasedPackages
                    .filter(pkg => pkg.status === 'active') // Only show active packages
                    .map(pkg => {
                        const packageInfo = availablePackages.find(p => p.subject === pkg.subject) || availablePackages[0];
                        const progressPercent = pkg.hoursTotal > 0 ? ((pkg.hoursTotal - pkg.hoursUsed) / pkg.hoursTotal) * 100 : 0;

                        return {
                            id: pkg.id,
                            subject: pkg.subject,
                            hoursTotal: pkg.hoursTotal,
                            hoursUsed: pkg.hoursUsed,
                            hoursRemaining: pkg.hoursTotal - pkg.hoursUsed,
                            progressPercent: Math.round(progressPercent),
                            purchasedAt: pkg.purchasedAt,
                            status: pkg.status,
                            ...packageInfo
                        };
                    });
                setActivePackages(transformedPackages);
                setAvailablePackages(availablePackagesList);
            } else {
                console.error('Failed to load packages:', packagesResult.error);
            }

            if (paymentsResult.success) {
                // Transform payment transactions
                const transformedPayments = paymentsResult.data.map(payment => ({
                    id: payment.id,
                    date: new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    description: payment.description || `${payment.type} transaction`,
                    amount: (payment.amountCents / 100).toFixed(2),
                    amountCents: payment.amountCents,
                    type: payment.type,
                    createdAt: payment.createdAt
                }));
                setPaymentHistory(transformedPayments);
            } else {
                console.error('Failed to load payments:', paymentsResult.error);
            }

            // Load payment methods
            if (paymentMethodsResult.success) {
                setPaymentMethods(paymentMethodsResult.data || []);
            } else {
                console.error('Failed to load payment methods:', paymentMethodsResult.error);
            }

        } catch (err) {
            console.error('Error loading billing data:', err);
            setError('Failed to load billing information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchasePackage = async (subject) => {
        // Check if user has payment methods
        if (!paymentMethods || paymentMethods.length === 0) {
            setShowNoPaymentMethodAlert(true);
            return;
        }

        try {
            setPurchaseLoading(prev => ({ ...prev, [subject]: true }));

            // Use Stripe Checkout for production-ready payment flow
            const result = await authService.post('/student/packages/checkout', { subject });

            if (result.success && result.data.checkout_url) {
                // Redirect to Stripe Checkout
                window.location.href = result.data.checkout_url;
            } else {
                alert(`Failed to initiate checkout: ${result.error || 'Unknown error'}`);
                setPurchaseLoading(prev => ({ ...prev, [subject]: false }));
            }
        } catch (error) {
            console.error('Error purchasing package:', error);
            alert('Failed to purchase package. Please try again.');
            setPurchaseLoading(prev => ({ ...prev, [subject]: false }));
        }
    };

    const handleGoToPaymentMethods = () => {
        navigate('/dashboard/student/payment-methods');
    };

    const handleDownloadInvoice = async (paymentId) => {
        try {
            const result = await studentService.getInvoice(paymentId);
            if (result.success) {
                // For MVP: show invoice data in alert (in production, this would download a PDF)
                const invoice = result.invoice;
                alert(`Invoice #${invoice.id}\nDate: ${new Date(invoice.date).toLocaleDateString()}\nAmount: $${(invoice.totalCents / 100).toFixed(2)}\n\nNote: PDF download not implemented in MVP`);
            } else {
                alert('Failed to get invoice details.');
            }
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice. Please try again.');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="student-payment-history-dashboard">
                <div className="student-payment-history-content">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading payment history...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="student-payment-history-dashboard">
                <div className="student-payment-history-content">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Error Loading Payment History</h4>
                        <p>{error}</p>
                        <hr />
                        <button className="btn btn-outline-danger" onClick={loadBillingData}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-payment-history-dashboard">
            <div className="student-payment-history-content">
                <div className="student-payment-history-section">
                    <h4 className="student-payment-history-section-title">Payment History & Package Management</h4>
                </div>

                {/* Purchase 10-Hour Package Section */}
                <div className="student-payment-history-section">
                    <h5 className="student-payment-history-subsection-title">Purchase 10-Hour Package</h5>
                    <div className="row g-3 mb-4">
                        {availablePackages.map((pkg) => (
                            <div key={pkg.subject} className="col-12 col-md-4">
                                <div className="card student-payment-history-package-card h-100">
                                    <div className="card-body">
                                        <div className="student-payment-history-package-icon">
                                            <span className={pkg.iconClass}>{pkg.icon}</span>
                                        </div>
                                        <h6 className="student-payment-history-package-title">{pkg.subject}</h6>
                                        <p className="student-payment-history-package-description">
                                            {pkg.hours} hours of {pkg.subject} tutoring
                                        </p>
                                        <div className="student-payment-history-package-price">${pkg.price}</div>
                                        <button
                                            className={`btn ${pkg.btnClass} w-100`}
                                            onClick={() => handlePurchasePackage(pkg.subject)}
                                            disabled={purchaseLoading[pkg.subject]}
                                        >
                                            {purchaseLoading[pkg.subject] ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Purchasing...
                                                </>
                                            ) : (
                                                'Purchase Package'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Packages Section */}
                <div className="student-payment-history-section">
                    <h5 className="student-payment-history-subsection-title">Active Packages</h5>
                    {activePackages.length > 0 ? (
                        activePackages.map((pkg) => (
                            <div key={pkg.id} className="card student-payment-history-active-card mb-4">
                                <div className="card-body">
                                    <div className="row align-items-center mb-3">
                                        <div className="col-12 col-sm-8">
                                            <div className="d-flex align-items-center">
                                                <span className={`${pkg.iconClass} me-2`}>{pkg.icon}</span>
                                                <span className="student-payment-history-active-title">{pkg.subject} Package</span>
                                            </div>
                                            <div className="small text-muted mt-1">
                                                Purchased on {new Date(pkg.purchasedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-4 text-sm-end">
                                            <span className="student-payment-history-remaining">
                                                {pkg.hoursRemaining} of {pkg.hoursTotal} hours remaining
                                            </span>
                                        </div>
                                    </div>
                                    <div className="student-payment-history-progress-container">
                                        <div className="progress student-payment-history-progress">
                                            <div
                                                className={`progress-bar ${pkg.progressClass}`}
                                                role="progressbar"
                                                style={{ width: `${pkg.progressPercent}%` }}
                                                aria-valuenow={pkg.progressPercent}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2 small text-muted">
                                            <span>{pkg.hoursUsed} hours used</span>
                                            <span>{pkg.progressPercent}% remaining</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card student-payment-history-active-card mb-4">
                            <div className="card-body text-center py-5">
                                <div className="text-muted">
                                    <i className="fas fa-box-open fa-3x mb-3"></i>
                                    <h6>No Active Packages</h6>
                                    <p>You don't have any active tutoring packages. Purchase a package above to get started!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment History Section */}
                <div className="card student-payment-history-history-card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="student-payment-history-history-title">Payment History</div>
                            <button className="btn btn-outline-primary btn-sm" onClick={loadBillingData}>
                                <i className="fas fa-sync-alt me-1"></i>Refresh
                            </button>
                        </div>
                        {paymentHistory.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-borderless student-payment-history-table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentHistory.map((payment) => (
                                            <tr key={payment.id}>
                                                <td>{payment.date}</td>
                                                <td>{payment.description}</td>
                                                <td>
                                                    <span className={`badge ${payment.type === 'package' ? 'bg-primary' :
                                                        payment.type === 'session' ? 'bg-success' :
                                                            payment.type === 'refund' ? 'bg-warning' :
                                                                'bg-secondary'
                                                        }`}>
                                                        {payment.type}
                                                    </span>
                                                </td>
                                                <td>${payment.amount}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-link student-payment-history-download-link p-0"
                                                        onClick={() => handleDownloadInvoice(payment.id)}
                                                    >
                                                        📥 Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="text-muted">
                                    <i className="fas fa-receipt fa-3x mb-3"></i>
                                    <h6>No Payment History</h6>
                                    <p>You haven't made any payments yet. Your payment history will appear here after your first purchase.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* No Payment Method Alert Modal */}
                {showNoPaymentMethodAlert && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title">
                                        <i className="fas fa-credit-card text-warning me-2"></i>
                                        Payment Method Required
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowNoPaymentMethodAlert(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="mb-3">
                                        You need to add a payment method before purchasing a package.
                                        This ensures secure and seamless transactions.
                                    </p>
                                    <div className="alert alert-info small mb-0">
                                        <i className="fas fa-shield-alt me-2"></i>
                                        Your payment information is secured by Stripe and encrypted.
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
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
                                        onClick={handleGoToPaymentMethods}
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Add Payment Method
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentPaymentHistory;
