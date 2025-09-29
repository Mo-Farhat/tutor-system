import React, { useState, useEffect } from "react";
import {
  PAYMENT_STATUS,
  PRIORITY_LEVELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "../constants/adminConstants";
import "../../../../css/dashboards/admin/finance/finance.css";

function AdminFinance() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    status: "",
    dateRange: "this_month",
  });

  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock data for different tabs
  const [financeData, setFinanceData] = useState({
    invoices: [],
    payouts: [],
    refunds: [],
    analytics: {
      totalRevenue: 45250.75,
      totalPayouts: 28340.5,
      totalRefunds: 1250.0,
      netIncome: 15660.25,
      monthlyGrowth: 12.5,
      averageInvoiceValue: 187.5,
      totalInvoices: 241,
      paidInvoices: 198,
      pendingInvoices: 35,
      overdueInvoices: 8,
    },
    referralBonuses: [],
  });

  useEffect(() => {
    loadFinanceData();
  }, [activeTab]);

  const loadFinanceData = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data based on active tab
      const mockData = {
        invoices: [
          {
            id: "INV-2024-001",
            studentName: "Alice Chen",
            amount: 150.0,
            status: "paid",
            dueDate: "2024-03-15",
            paidDate: "2024-03-14",
            package: "10 Hour Chemistry Package",
            paymentMethod: "Credit Card",
          },
          {
            id: "INV-2024-002",
            studentName: "Benjamin Smith",
            amount: 75.0,
            status: "pending",
            dueDate: "2024-03-20",
            paidDate: null,
            package: "Consultation Session",
            paymentMethod: "Bank Transfer",
          },
          {
            id: "INV-2024-003",
            studentName: "Charlotte Wilson",
            amount: 300.0,
            status: "overdue",
            dueDate: "2024-03-10",
            paidDate: null,
            package: "20 Hour Premium Package",
            paymentMethod: "Credit Card",
          },
          {
            id: "INV-2024-004",
            studentName: "David Kim",
            amount: 225.0,
            status: "paid",
            dueDate: "2024-03-18",
            paidDate: "2024-03-17",
            package: "15 Hour Mathematics Package",
            paymentMethod: "PayPal",
          },
          {
            id: "INV-2024-005",
            studentName: "Emma Davis",
            amount: 450.0,
            status: "pending",
            dueDate: "2024-03-25",
            paidDate: null,
            package: "Premium Physics Package",
            paymentMethod: "Credit Card",
          },
          {
            id: "INV-2024-006",
            studentName: "Frank Miller",
            amount: 125.0,
            status: "paid",
            dueDate: "2024-03-12",
            paidDate: "2024-03-11",
            package: "5 Hour English Package",
            paymentMethod: "Bank Transfer",
          },
        ],
        payouts: [
          {
            id: "PAY-2024-001",
            tutorName: "Sarah Johnson",
            amount: 450.0,
            status: "completed",
            period: "February 2024",
            processedDate: "2024-03-01",
            sessionsCount: 15,
            hourlyRate: 30.0,
            bankAccount: "****1234",
          },
          {
            id: "PAY-2024-002",
            tutorName: "Michael Chen",
            amount: 225.0,
            status: "pending",
            period: "March 2024",
            processedDate: null,
            sessionsCount: 8,
            hourlyRate: 28.0,
            bankAccount: "****5678",
          },
          {
            id: "PAY-2024-003",
            tutorName: "Emma Thompson",
            amount: 675.0,
            status: "processing",
            period: "March 2024",
            processedDate: null,
            sessionsCount: 22,
            hourlyRate: 30.0,
            bankAccount: "****9012",
          },
          {
            id: "PAY-2024-004",
            tutorName: "James Wilson",
            amount: 320.0,
            status: "completed",
            period: "February 2024",
            processedDate: "2024-03-02",
            sessionsCount: 12,
            hourlyRate: 26.0,
            bankAccount: "****3456",
          },
          {
            id: "PAY-2024-005",
            tutorName: "Lisa Brown",
            amount: 180.0,
            status: "pending",
            period: "March 2024",
            processedDate: null,
            sessionsCount: 6,
            hourlyRate: 30.0,
            bankAccount: "****7890",
          },
        ],
        refunds: [
          {
            id: "REF-2024-001",
            studentName: "Daniel Kim",
            originalAmount: 150.0,
            refundAmount: 75.0,
            reason: "Partial package cancellation",
            status: "completed",
            processedDate: "2024-03-12",
          },
          {
            id: "REF-2024-002",
            studentName: "Emma Davis",
            originalAmount: 300.0,
            refundAmount: 300.0,
            reason: "Full package refund",
            status: "pending",
            processedDate: null,
          },
        ],
        referralBonuses: [
          {
            id: "RB-2024-001",
            referrerName: "Alice Chen",
            referredName: "Sophie Brown",
            bonusAmount: 20.0,
            status: "paid",
            completedDate: "2024-03-15",
          },
          {
            id: "RB-2024-002",
            referrerName: "David Kim",
            referredName: "Lucas White",
            bonusAmount: 20.0,
            status: "pending",
            completedDate: "2024-03-18",
          },
        ],
      };

      setFinanceData((prev) => ({
        ...prev,
        ...mockData,
      }));
    } catch (error) {
      console.error("Error loading finance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status, type = "default") => {
    const statusColors = {
      paid: "success",
      completed: "success",
      pending: "warning",
      processing: "info",
      overdue: "danger",
      failed: "danger",
    };

    const color = statusColors[status] || "secondary";
    return (
      <span className={`badge bg-${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    // Handle NaN, null, undefined, or non-numeric values
    if (isNaN(amount) || amount === null || amount === undefined) {
      return "$0.00";
    }

    // Ensure amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return "$0.00";
    }

    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(numericAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Modal handlers
  const handleViewInvoice = (invoice) => {
    setSelectedItem(invoice);
    setShowInvoiceModal(true);
  };

  const handleViewPayout = (payout) => {
    setSelectedItem(payout);
    setShowPayoutModal(true);
  };

  const handleViewRefund = (refund) => {
    setSelectedItem(refund);
    setShowRefundModal(true);
  };

  const handleViewReferral = (referral) => {
    setSelectedItem(referral);
    setShowReferralModal(true);
  };

  const closeModals = () => {
    setShowInvoiceModal(false);
    setShowPayoutModal(false);
    setShowRefundModal(false);
    setShowReferralModal(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="admin-finance-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading finance data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-finance-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-finance-content">
              {/* Header */}
              <div className="admin-finance-header">
                <h2 className="admin-finance-title">Finance Dashboard</h2>
                <p className="admin-finance-subtitle text-muted">
                  Manage invoices, payouts, refunds, and financial analytics
                </p>
              </div>

              {/* Analytics Cards */}
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="admin-finance-card">
                    <div className="admin-finance-card-icon bg-success">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="admin-finance-card-content">
                      <h3>
                        {formatCurrency(financeData.analytics.totalRevenue)}
                      </h3>
                      <p>Total Revenue</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-finance-card">
                    <div className="admin-finance-card-icon bg-info">
                      <i className="fas fa-hand-holding-usd"></i>
                    </div>
                    <div className="admin-finance-card-content">
                      <h3>
                        {formatCurrency(financeData.analytics.totalPayouts)}
                      </h3>
                      <p>Total Payouts</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-finance-card">
                    <div className="admin-finance-card-icon bg-warning">
                      <i className="fas fa-undo"></i>
                    </div>
                    <div className="admin-finance-card-content">
                      <h3>
                        {formatCurrency(financeData.analytics.totalRefunds)}
                      </h3>
                      <p>Total Refunds</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-finance-card">
                    <div className="admin-finance-card-icon bg-primary">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="admin-finance-card-content">
                      <h3>{formatCurrency(financeData.analytics.netIncome)}</h3>
                      <p>Net Income</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="admin-finance-tabs">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "invoices" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("invoices")}
                    >
                      <i className="fas fa-file-invoice me-2"></i>
                      Invoices & Payments
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "payouts" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("payouts")}
                    >
                      <i className="fas fa-money-check me-2"></i>
                      Tutor Payouts
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "refunds" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("refunds")}
                    >
                      <i className="fas fa-undo me-2"></i>
                      Refunds & Adjustments
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "referrals" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("referrals")}
                    >
                      <i className="fas fa-gift me-2"></i>
                      Referral Bonuses
                    </button>
                  </li>
                </ul>
              </div>

              {/* Tab Content */}
              <div className="admin-finance-tab-content">
                {/* Invoices Tab */}
                {activeTab === "invoices" && (
                  <div className="admin-finance-section">
                    <div className="table-responsive">
                      <table className="table admin-finance-table">
                        <thead>
                          <tr>
                            <th>Invoice ID</th>
                            <th>Student</th>
                            <th>Package</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financeData.invoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td>
                                <strong>{invoice.id}</strong>
                              </td>
                              <td>{invoice.studentName}</td>
                              <td>{invoice.package}</td>
                              <td>{formatCurrency(invoice.amount)}</td>
                              <td>{formatDate(invoice.dueDate)}</td>
                              <td>{getStatusBadge(invoice.status)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleViewInvoice(invoice)}
                                >
                                  View
                                </button>
                                {invoice.status === "pending" && (
                                  <button className="btn btn-sm btn-outline-warning">
                                    Send Reminder
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payouts Tab */}
                {activeTab === "payouts" && (
                  <div className="admin-finance-section">
                    <div className="table-responsive">
                      <table className="table admin-finance-table">
                        <thead>
                          <tr>
                            <th>Payout ID</th>
                            <th>Tutor</th>
                            <th>Period</th>
                            <th>Sessions</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financeData.payouts.map((payout) => (
                            <tr key={payout.id}>
                              <td>
                                <strong>{payout.id}</strong>
                              </td>
                              <td>{payout.tutorName}</td>
                              <td>{payout.period}</td>
                              <td>{payout.sessionsCount}</td>
                              <td>{formatCurrency(payout.amount)}</td>
                              <td>{getStatusBadge(payout.status)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleViewPayout(payout)}
                                >
                                  View Details
                                </button>
                                {payout.status === "pending" && (
                                  <button className="btn btn-sm btn-success">
                                    Process
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Refunds Tab */}
                {activeTab === "refunds" && (
                  <div className="admin-finance-section">
                    <div className="table-responsive">
                      <table className="table admin-finance-table">
                        <thead>
                          <tr>
                            <th>Refund ID</th>
                            <th>Student</th>
                            <th>Original Amount</th>
                            <th>Refund Amount</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financeData.refunds.map((refund) => (
                            <tr key={refund.id}>
                              <td>
                                <strong>{refund.id}</strong>
                              </td>
                              <td>{refund.studentName}</td>
                              <td>{formatCurrency(refund.originalAmount)}</td>
                              <td>{formatCurrency(refund.refundAmount)}</td>
                              <td>{refund.reason}</td>
                              <td>{getStatusBadge(refund.status)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleViewRefund(refund)}
                                >
                                  View Details
                                </button>
                                {refund.status === "pending" && (
                                  <button className="btn btn-sm btn-success">
                                    Approve
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Referral Bonuses Tab */}
                {activeTab === "referrals" && (
                  <div className="admin-finance-section">
                    <div className="table-responsive">
                      <table className="table admin-finance-table">
                        <thead>
                          <tr>
                            <th>Bonus ID</th>
                            <th>Referrer</th>
                            <th>Referred Student</th>
                            <th>Bonus Amount</th>
                            <th>Completed Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financeData.referralBonuses.map((bonus) => (
                            <tr key={bonus.id}>
                              <td>
                                <strong>{bonus.id}</strong>
                              </td>
                              <td>{bonus.referrerName}</td>
                              <td>{bonus.referredName}</td>
                              <td>{formatCurrency(bonus.bonusAmount)}</td>
                              <td>{formatDate(bonus.completedDate)}</td>
                              <td>{getStatusBadge(bonus.status)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewReferral(bonus)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedItem && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Invoice Details - {selectedItem.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Invoice ID</label>
                    <p>{selectedItem.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Student Name</label>
                    <p>{selectedItem.studentName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Package</label>
                    <p>{selectedItem.package}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Amount</label>
                    <p className="fw-bold text-success">
                      {formatCurrency(selectedItem.amount)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Due Date</label>
                    <p>{formatDate(selectedItem.dueDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Paid Date</label>
                    <p>{formatDate(selectedItem.paidDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Payment Method</label>
                    <p>{selectedItem.paymentMethod}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status</label>
                    <p>{getStatusBadge(selectedItem.status)}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-download me-2"></i>
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Modal */}
      {showPayoutModal && selectedItem && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Payout Details - {selectedItem.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Payout ID</label>
                    <p>{selectedItem.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Tutor Name</label>
                    <p>{selectedItem.tutorName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Period</label>
                    <p>{selectedItem.period}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Sessions Count</label>
                    <p>{selectedItem.sessionsCount}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Hourly Rate</label>
                    <p>{formatCurrency(selectedItem.hourlyRate)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Total Amount</label>
                    <p className="fw-bold text-success">
                      {formatCurrency(selectedItem.amount)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Bank Account</label>
                    <p>{selectedItem.bankAccount}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Processed Date</label>
                    <p>{formatDate(selectedItem.processedDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status</label>
                    <p>{getStatusBadge(selectedItem.status)}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Close
                </button>
                {selectedItem.status === "pending" && (
                  <button type="button" className="btn btn-success">
                    <i className="fas fa-check me-2"></i>
                    Process Payout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Details Modal */}
      {showRefundModal && selectedItem && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Refund Details - {selectedItem.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Refund ID</label>
                    <p>{selectedItem.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Student Name</label>
                    <p>{selectedItem.studentName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Original Amount
                    </label>
                    <p>{formatCurrency(selectedItem.originalAmount)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Refund Amount</label>
                    <p className="fw-bold text-warning">
                      {formatCurrency(selectedItem.refundAmount)}
                    </p>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-bold">Reason</label>
                    <p>{selectedItem.reason}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Processed Date</label>
                    <p>{formatDate(selectedItem.processedDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status</label>
                    <p>{getStatusBadge(selectedItem.status)}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Close
                </button>
                {selectedItem.status === "pending" && (
                  <button type="button" className="btn btn-success">
                    <i className="fas fa-check me-2"></i>
                    Approve Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral Bonus Details Modal */}
      {showReferralModal && selectedItem && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Referral Bonus Details - {selectedItem.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Bonus ID</label>
                    <p>{selectedItem.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Referrer Name</label>
                    <p>{selectedItem.referrerName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Referred Student
                    </label>
                    <p>{selectedItem.referredName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Bonus Amount</label>
                    <p className="fw-bold text-success">
                      {formatCurrency(selectedItem.bonusAmount)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Completed Date</label>
                    <p>{formatDate(selectedItem.completedDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status</label>
                    <p>{getStatusBadge(selectedItem.status)}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Close
                </button>
                {selectedItem.status === "pending" && (
                  <button type="button" className="btn btn-success">
                    <i className="fas fa-gift me-2"></i>
                    Process Bonus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFinance;
