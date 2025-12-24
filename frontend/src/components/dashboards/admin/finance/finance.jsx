import React, { useState, useEffect } from "react";
import {
  PAYMENT_STATUS,
  PRIORITY_LEVELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "../constants/adminConstants";
import "../../../../css/dashboards/admin/finance/finance.css";
import adminFinanceService from "../../../../services/adminFinanceService";

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

      // Always refresh analytics
      const analyticsPromise = adminFinanceService.getAnalytics();

      if (activeTab === "invoices") {
        const [invoicesRes, analyticsRes] = await Promise.all([
          adminFinanceService.getInvoices({
            status: selectedFilters.status || undefined,
            search: searchTerm || undefined,
          }),
          analyticsPromise,
        ]);

        setFinanceData((prev) => ({
          ...prev,
          invoices: invoicesRes?.data || [],
          analytics: analyticsRes?.data || prev.analytics,
        }));
      } else if (activeTab === "refunds") {
        const [refundsRes, analyticsRes] = await Promise.all([
          adminFinanceService.getRefunds({}),
          analyticsPromise,
        ]);
        setFinanceData((prev) => ({
          ...prev,
          refunds: refundsRes?.data || [],
          analytics: analyticsRes?.data || prev.analytics,
        }));
      } else if (activeTab === "payouts") {
        const [payoutsRes, analyticsRes] = await Promise.all([
          adminFinanceService.getPayouts({}),
          analyticsPromise,
        ]);
        setFinanceData((prev) => ({
          ...prev,
          payouts: payoutsRes?.data || [],
          analytics: analyticsRes?.data || prev.analytics,
        }));
      } else if (activeTab === "referrals") {
        const [referralsRes, analyticsRes] = await Promise.all([
          adminFinanceService.getReferrals({}),
          analyticsPromise,
        ]);
        setFinanceData((prev) => ({
          ...prev,
          referralBonuses: referralsRes?.data || [],
          analytics: analyticsRes?.data || prev.analytics,
        }));
      } else {
        const analyticsRes = await analyticsPromise;
        setFinanceData((prev) => ({ ...prev, analytics: analyticsRes?.data || prev.analytics }));
      }
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
                    {financeData.payouts.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <i className="fas fa-money-check fa-3x mb-3 d-block"></i>
                        <p>No payouts found.</p>
                      </div>
                    ) : (
                    <div className="table-responsive">
                      <table className="table admin-finance-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Tutor</th>
                            <th>Student</th>
                            <th>Subject</th>
                            <th>Duration</th>
                            <th>Gross</th>
                            <th>Strive Cut</th>
                            <th>Net Payout</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financeData.payouts.map((payout) => (
                            <tr key={payout.id}>
                              <td>
                                <strong>#{payout.id}</strong>
                              </td>
                              <td>{payout.tutorName}</td>
                              <td>{payout.studentName}</td>
                              <td>{payout.subject}</td>
                              <td>{payout.duration?.toFixed(1)}h</td>
                              <td>{formatCurrency(payout.grossAmount)}</td>
                              <td className="text-warning">{formatCurrency(payout.striveCut)}</td>
                              <td className="fw-bold text-success">{formatCurrency(payout.netPayout)}</td>
                              <td>{getStatusBadge(payout.status)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleViewPayout(payout)}
                                >
                                  View
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
                    )}
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
                    <p>#{selectedItem.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Tutor</label>
                    <p>{selectedItem.tutorName}<br/><small className="text-muted">{selectedItem.tutorEmail}</small></p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Student</label>
                    <p>{selectedItem.studentName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Subject</label>
                    <p>{selectedItem.subject}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Lesson Date</label>
                    <p>{formatDate(selectedItem.lessonDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Duration</label>
                    <p>{selectedItem.duration?.toFixed(1)} hours</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Gross Amount</label>
                    <p>{formatCurrency(selectedItem.grossAmount)}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Platform Cut</label>
                    <p className="text-warning">{formatCurrency(selectedItem.striveCut)}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Net Payout</label>
                    <p className="fw-bold text-success fs-5">
                      {formatCurrency(selectedItem.netPayout)}
                    </p>
                  </div>
                  {selectedItem.travelFee > 0 && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Travel Fee</label>
                      <p>{formatCurrency(selectedItem.travelFee)}</p>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Created</label>
                    <p>{formatDate(selectedItem.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status</label>
                    <p>{getStatusBadge(selectedItem.status)}</p>
                  </div>
                  {selectedItem.paidAt && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Paid Date</label>
                      <p>{formatDate(selectedItem.paidAt)}</p>
                    </div>
                  )}
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
