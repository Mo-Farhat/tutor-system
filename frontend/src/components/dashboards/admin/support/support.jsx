import React, { useState, useEffect } from "react";
import {
  PRIORITY_LEVELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "../constants/adminConstants";
import "../../../../css/dashboards/admin/support/support.css";

function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock support tickets
      const mockTickets = [
        {
          id: "TCK-001",
          subject: "Unable to access tutor dashboard",
          description:
            "I'm getting an error when trying to log into my tutor dashboard. It says 'Invalid credentials' but I'm sure my password is correct.",
          submittedBy: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          priority: PRIORITY_LEVELS.HIGH,
          status: "open",
          category: "Technical",
          assignee: "Admin Team",
          submittedDate: "2024-03-20 09:30",
          lastUpdated: "2024-03-20 10:15",
          responses: 2,
        },
        {
          id: "TCK-002",
          subject: "Payment not processed",
          description:
            "I completed a tutoring session 3 days ago but the payment hasn't been processed yet. The session was for 2 hours of VCE Chemistry.",
          submittedBy: "Michael Chen",
          email: "michael.chen@email.com",
          priority: PRIORITY_LEVELS.MEDIUM,
          status: "in_progress",
          category: "Billing",
          assignee: "Finance Team",
          submittedDate: "2024-03-19 14:20",
          lastUpdated: "2024-03-20 08:45",
          responses: 1,
        },
        {
          id: "TCK-003",
          subject: "Schedule change request",
          description:
            "Need to reschedule my regular Tuesday sessions to Wednesday due to a new commitment. Can someone help with this?",
          submittedBy: "Emma Wilson",
          email: "emma.wilson@email.com",
          priority: PRIORITY_LEVELS.LOW,
          status: "resolved",
          category: "Scheduling",
          assignee: "Support Team",
          submittedDate: "2024-03-18 16:45",
          lastUpdated: "2024-03-19 09:30",
          responses: 3,
        },
        {
          id: "TCK-004",
          subject: "Document upload issue",
          description:
            "Having trouble uploading my WWCC document. The file keeps getting rejected even though it's a PDF under 5MB.",
          submittedBy: "James Wilson",
          email: "james.wilson@email.com",
          priority: PRIORITY_LEVELS.MEDIUM,
          status: "open",
          category: "Technical",
          assignee: "Tech Support",
          submittedDate: "2024-03-20 11:15",
          lastUpdated: "2024-03-20 11:15",
          responses: 0,
        },
      ];

      setTickets(mockTickets);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: "danger",
      in_progress: "warning",
      resolved: "success",
      closed: "secondary",
    };

    const formatStatus = (status) => {
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
      <span className={`badge bg-${colors[status] || "secondary"}`}>
        {formatStatus(status)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const color = PRIORITY_COLORS[priority];
    const label = PRIORITY_LABELS[priority];
    return <span className={`badge bg-${color}`}>{label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-AU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResponseText("");
    setShowTicketModal(true);
  };

  const handleUpdateStatus = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              lastUpdated: new Date().toISOString(),
            }
          : ticket
      )
    );
  };

  const handleSendResponse = async () => {
    if (!responseText.trim() || !selectedTicket) return;

    setIsSubmittingResponse(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update ticket with response
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                responses: ticket.responses + 1,
                lastUpdated: new Date().toISOString(),
                // If it was open, move to in_progress when first response is sent
                status:
                  ticket.status === "open" ? "in_progress" : ticket.status,
              }
            : ticket
        )
      );

      // Reset form and close modal
      setResponseText("");
      setShowTicketModal(false);

      // Show success message (you could add a toast notification here)
      alert("Response sent successfully!");
    } catch (error) {
      console.error("Error sending response:", error);
      alert("Failed to send response. Please try again.");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleCloseModal = () => {
    setShowTicketModal(false);
    setResponseText("");
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || ticket.status === filterStatus;
    const matchesPriority =
      !filterPriority || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="admin-support-container">
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
                  <p className="mt-3">Loading support tickets...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-support-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-support-content">
              {/* Header */}
              <div className="admin-support-header">
                <h2 className="admin-support-title">Support Center</h2>
                <p className="admin-support-subtitle text-muted">
                  Manage support tickets and customer inquiries
                </p>
              </div>

              {/* Stats Cards */}
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="admin-support-card">
                    <div className="admin-support-card-icon bg-danger">
                      <i className="fas fa-exclamation-circle"></i>
                    </div>
                    <div className="admin-support-card-content">
                      <h3>
                        {tickets.filter((t) => t.status === "open").length}
                      </h3>
                      <p>Open Tickets</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-support-card">
                    <div className="admin-support-card-icon bg-warning">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="admin-support-card-content">
                      <h3>
                        {
                          tickets.filter((t) => t.status === "in_progress")
                            .length
                        }
                      </h3>
                      <p>In Progress</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-support-card">
                    <div className="admin-support-card-icon bg-success">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="admin-support-card-content">
                      <h3>
                        {tickets.filter((t) => t.status === "resolved").length}
                      </h3>
                      <p>Resolved</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="admin-support-card">
                    <div className="admin-support-card-icon bg-info">
                      <i className="fas fa-ticket-alt"></i>
                    </div>
                    <div className="admin-support-card-content">
                      <h3>{tickets.length}</h3>
                      <p>Total Tickets</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="admin-support-controls mb-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="admin-search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="">All Priorities</option>
                      {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tickets Table */}
              <div className="admin-support-table-section">
                {filteredTickets.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-ticket-alt text-muted mb-3"></i>
                    <h5>No tickets found</h5>
                    <p className="text-muted">
                      No support tickets match your current filters
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table admin-support-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Subject</th>
                          <th>Submitted By</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Last Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td>
                              <strong>{ticket.id}</strong>
                            </td>
                            <td>
                              <div>
                                <strong>{ticket.subject}</strong>
                                <br />
                                <small className="text-muted">
                                  {ticket.responses} responses
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                {ticket.submittedBy}
                                <br />
                                <small className="text-muted">
                                  {ticket.email}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {ticket.category}
                              </span>
                            </td>
                            <td>{getPriorityBadge(ticket.priority)}</td>
                            <td>{getStatusBadge(ticket.status)}</td>
                            <td>{formatDate(ticket.lastUpdated)}</td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewTicket(ticket)}
                                >
                                  <i className="fas fa-eye me-1"></i>View &
                                  Respond
                                </button>
                                {ticket.status === "in_progress" && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() =>
                                      handleUpdateStatus(ticket.id, "resolved")
                                    }
                                  >
                                    <i className="fas fa-check me-1"></i>Mark as
                                    Resolved
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedTicket.id} - {selectedTicket.subject}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTicketModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Submitted By:</strong> {selectedTicket.submittedBy}
                    <br />
                    <strong>Email:</strong> {selectedTicket.email}
                    <br />
                    <strong>Category:</strong> {selectedTicket.category}
                  </div>
                  <div className="col-md-6">
                    <strong>Priority:</strong>{" "}
                    {getPriorityBadge(selectedTicket.priority)}
                    <br />
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(selectedTicket.status)}
                    <br />
                    <strong>Assignee:</strong> {selectedTicket.assignee}
                  </div>
                  <div className="col-12">
                    <hr />
                    <h6>Description:</h6>
                    <p>{selectedTicket.description}</p>
                  </div>
                  <div className="col-12">
                    <h6>Send Response:</h6>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Write your response here..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    ></textarea>
                    <small className="text-muted">
                      Responses will automatically move "Open" tickets to "In
                      Progress"
                    </small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSendResponse}
                  disabled={!responseText.trim() || isSubmittingResponse}
                >
                  {isSubmittingResponse ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    "Send Response"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSupport;
