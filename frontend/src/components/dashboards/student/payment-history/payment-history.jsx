import React, { useState, useEffect } from 'react';
import studentService from '../../../../services/studentService';
import '../../../../css/dashboards/student/payment-history/payment-history.css';

function StudentPaymentHistory() {
    const [activePackages, setActivePackages] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState({});

    // Available package subjects
    const availablePackages = [
        { 
            subject: 'Mathematics', 
            icon: '√x',
            iconClass: 'student-payment-history-math-icon',
            btnClass: 'student-payment-history-btn-math',
            progressClass: 'student-payment-history-progress-math'
        },
        { 
            subject: 'English', 
            icon: '📚',
            iconClass: 'student-payment-history-english-icon',
            btnClass: 'student-payment-history-btn-english',
            progressClass: 'student-payment-history-progress-english'
        },
        { 
            subject: 'Science', 
            icon: '⚗️',
            iconClass: 'student-payment-history-science-icon',
            btnClass: 'student-payment-history-btn-science',
            progressClass: 'student-payment-history-progress-science'
        }
    ];

    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load both packages and payment history
            const [packagesResult, paymentsResult] = await Promise.all([
                studentService.getPackages(),
                studentService.getPayments()
            ]);

            if (packagesResult.success) {
                // Transform backend packages to frontend format
                const transformedPackages = packagesResult.data
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

        } catch (err) {
            console.error('Error loading billing data:', err);
            setError('Failed to load billing information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchasePackage = async (subject) => {
        try {
            setPurchaseLoading(prev => ({ ...prev, [subject]: true }));
            
            const result = await studentService.purchasePackage({ subject });
            
            if (result.success) {
                // Show success message
                alert(`Successfully purchased ${subject} package! ${result.note || ''}`);
                // Reload billing data to show new package
                await loadBillingData();
            } else {
                alert(`Failed to purchase package: ${result.error}`);
            }
        } catch (error) {
            console.error('Error purchasing package:', error);
            alert('Failed to purchase package. Please try again.');
        } finally {
            setPurchaseLoading(prev => ({ ...prev, [subject]: false }));
        }
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
                                            10 hours of {pkg.subject} tutoring with $50 discount
                                        </p>
                                        <div className="student-payment-history-package-price">$450</div>
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
                                                style={{width: `${pkg.progressPercent}%`}} 
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
                                                    <span className={`badge ${
                                                        payment.type === 'package' ? 'bg-primary' :
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
            </div>
        </div>
    );
}

export default StudentPaymentHistory;
