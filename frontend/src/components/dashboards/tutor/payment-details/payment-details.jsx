import React, { useState, useEffect } from 'react';
import { getPaymentDetails, updatePaymentDetails, getTransactionHistory } from '../../../../services/authService';
import { useAuth } from '../../../../contexts/AuthContext';
import "../../../../css/dashboards/tutor/payment-details/payment-details.css";

function TutorPaymentDetails() {
    const { user } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [paymentData, setPaymentData] = useState({
        current_balance: 0,
        payment_details: {
            account_name: '',
            bsb: '',
            account_number: ''
        },
        recent_transactions: []
    });

    const [formData, setFormData] = useState({
        account_name: '',
        bsb: '',
        account_number: '',
    });

    const [transactions, setTransactions] = useState([]);
    const [transactionFilters, setTransactionFilters] = useState({
        status: '',
        type: '',
        limit: 50
    });

    useEffect(() => {
        fetchPaymentDetails();
        fetchTransactionHistory();
    }, []);

    const fetchPaymentDetails = async () => {
        try {
            setLoading(true);
            const result = await getPaymentDetails();
            
            if (result.success) {
                setPaymentData(result.data);
                setFormData({
                    account_name: result.data.payment_details.account_name || '',
                    bsb: result.data.payment_details.bsb || '',
                    account_number: result.data.payment_details.account_number || '',
                });
            } else {
                setError(result.error || 'Failed to load payment details');
            }
        } catch (err) {
            setError('Error loading payment details: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionHistory = async () => {
        try {
            const result = await getTransactionHistory(transactionFilters);
            
            if (result.success) {
                setTransactions(result.data.transactions || []);
            } else {
                console.error('Failed to load transaction history:', result.error);
            }
        } catch (err) {
            console.error('Error loading transaction history:', err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format BSB input (add dash after 3 digits)
        if (name === 'bsb') {
            let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
            if (formattedValue.length > 3) {
                formattedValue = formattedValue.substring(0, 3) + '-' + formattedValue.substring(3, 6);
            }
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'account_number') {
            // Only allow digits for account number
            const digitsOnly = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: digitsOnly
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        console.log('Form submitted with data:', formData);
        
        try {
            setSaving(true);
            const result = await updatePaymentDetails(formData);
            
            console.log('API response:', result);
            
            if (result.success) {
                setSuccess('Payment details updated successfully!');
                setIsEditMode(false);
                // Refresh payment details
                await fetchPaymentDetails();
            } else {
                setError(result.error || 'Failed to update payment details');
                console.error('API error:', result.error);
            }
        } catch (err) {
            console.error('Exception during API call:', err);
            setError('Error updating payment details: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setTransactionFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const applyFilters = () => {
        fetchTransactionHistory();
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed':
                return <span className="tutor-payments-status completed">
                    <i className="fas fa-check-circle"></i> Completed
                </span>;
            case 'pending':
                return <span className="tutor-payments-status pending">
                    <i className="fas fa-clock"></i> Pending
                </span>;
            case 'failed':
                return <span className="tutor-payments-status failed">
                    <i className="fas fa-times-circle"></i> Failed
                </span>;
            case 'cancelled':
                return <span className="tutor-payments-status cancelled">
                    <i className="fas fa-ban"></i> Cancelled
                </span>;
            default:
                return null;
        }
    };

    const getTransactionTypeIcon = (type) => {
        switch(type) {
            case 'payment':
                return <i className="fas fa-arrow-down text-success"></i>;
            case 'refund':
                return <i className="fas fa-undo text-warning"></i>;
            case 'bonus':
                return <i className="fas fa-gift text-info"></i>;
            case 'deduction':
                return <i className="fas fa-arrow-up text-danger"></i>;
            default:
                return <i className="fas fa-circle"></i>;
        }
    };

    if (loading) {
        return (
            <div className="tutor-payments-main">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading payment details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tutor-payments-main">
            <h1 className="tutor-payments-title">Payment Details</h1>

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                </div>
            )}

            <div className="tutor-payments-header">
                <div className="tutor-payments-summary">
                    <div className="tutor-payments-balance">
                        <h3>Current Balance</h3>
                        <div className="balance-amount">${paymentData.current_balance ? parseFloat(paymentData.current_balance).toFixed(2) : '0.00'}</div>
                        <button className="withdraw-button" disabled>
                            <i className="fas fa-money-bill-wave"></i> Withdraw Funds
                        </button>
                        <p className="withdraw-note">Contact support to withdraw funds</p>
                    </div>
                </div>
            </div>

            <div className="tutor-payments-form">
                <form onSubmit={handleSubmit}>
                    <div className="edit-button-container">
                        <button 
                            type="button" 
                            className={`edit-mode-button ${isEditMode ? 'active' : ''}`}
                            onClick={() => {
                                setIsEditMode(!isEditMode);
                                setError('');
                                setSuccess('');
                            }}
                        >
                            <i className="fas fa-edit"></i>
                            {isEditMode ? 'Cancel Edit' : 'Edit Payment Details'}
                        </button>
                    </div>

                    <div className="form-section">
                        <h3>
                            <i className="fas fa-wallet"></i> PAYMENT METHOD
                        </h3>
                        <div className="form-section-content">
                            <div className="bank-details">
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-user"></i> Account Name
                                    </label>
                                    <input
                                        type="text"
                                        name="account_name"
                                        value={formData.account_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter account holder name"
                                        disabled={!isEditMode}
                                        className="form-control"
                                        required={isEditMode}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>
                                            <i className="fas fa-university"></i> BSB
                                        </label>
                                        <input
                                            type="text"
                                            name="bsb"
                                            value={formData.bsb}
                                            onChange={handleInputChange}
                                            placeholder="Enter BSB number (e.g., 123-456)"
                                            disabled={!isEditMode}
                                            className="form-control"
                                            maxLength="7"
                                            pattern="[0-9]{3}-[0-9]{3}"
                                            required={isEditMode}
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>
                                            <i className="fas fa-credit-card"></i> Account Number
                                        </label>
                                        <input
                                            type="text"
                                            name="account_number"
                                            value={formData.account_number}
                                            onChange={handleInputChange}
                                            placeholder="Enter account number"
                                            disabled={!isEditMode}
                                            className="form-control"
                                            minLength="6"
                                            maxLength="20"
                                            required={isEditMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="form-submit-container">
                            <button type="submit" className="submit-button" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="form-section">
                <h3>
                    <i className="fas fa-history"></i> TRANSACTION HISTORY
                </h3>
                
                {/* Transaction Filters */}
                <div className="transaction-filters mb-3">
                    <div className="row">
                        <div className="col-md-3">
                            <select 
                                className="form-select"
                                value={transactionFilters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select"
                                value={transactionFilters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="payment">Payment</option>
                                <option value="refund">Refund</option>
                                <option value="bonus">Bonus</option>
                                <option value="deduction">Deduction</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select"
                                value={transactionFilters.limit}
                                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                            >
                                <option value="10">Last 10</option>
                                <option value="25">Last 25</option>
                                <option value="50">Last 50</option>
                                <option value="100">Last 100</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button className="btn btn-primary" onClick={applyFilters}>
                                <i className="fas fa-filter"></i> Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="form-section-content">
                    <div className="transaction-list">
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? transactions.map(transaction => (
                                        <tr key={transaction.id}>
                                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                            <td>{transaction.description}</td>
                                            <td>
                                                {getTransactionTypeIcon(transaction.transaction_type)}
                                                <span className="ms-2 text-capitalize">{transaction.transaction_type}</span>
                                            </td>
                                            <td>
                                                <span className={`transaction-amount ${
                                                    transaction.transaction_type === 'payment' || transaction.transaction_type === 'bonus' ? 'positive' : 'negative'
                                                }`}>
                                                    {transaction.transaction_type === 'payment' || transaction.transaction_type === 'bonus' ? '+' : '-'}
                                                    ${Math.abs(transaction.amount).toFixed(2)}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(transaction.status)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted">
                                                No transactions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorPaymentDetails;
