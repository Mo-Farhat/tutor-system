import React, { useState, useEffect } from "react";
import "../../../../css/dashboards/admin/students/studentProfile.css";

const StudentProfileModal = ({ student, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [studentData, setStudentData] = useState(student);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSessionNotes, setSelectedSessionNotes] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    if (student) {
      // Mock lesson pipeline data
      const pipelineData = {
        1: {
          // Alice Chen
          stages: [
            {
              name: "Initial Contact",
              status: "completed",
              date: "2024-02-15",
              notes: "Student inquiry received",
            },
            {
              name: "Academic Consultation",
              status: "completed",
              date: "2024-02-20",
              notes: "Chemistry and Biology consultation completed",
            },
            {
              name: "First Paid Lesson",
              status: "completed",
              date: "2024-02-25",
              notes: "Chemistry fundamentals session",
            },
            {
              name: "Package Purchase",
              status: "completed",
              date: "2024-03-01",
              notes: "10-hour package purchased",
            },
            {
              name: "Regular Sessions",
              status: "in_progress",
              date: "2024-03-15",
              notes: "Ongoing weekly sessions",
            },
          ],
          timeToConsultation: 5, // days
          conversionRate: 100, // percentage
        },
        2: {
          // Benjamin Smith
          stages: [
            {
              name: "Initial Contact",
              status: "completed",
              date: "2024-03-20",
              notes: "Parent inquiry received",
            },
            {
              name: "Academic Consultation",
              status: "scheduled",
              date: "2024-03-25",
              notes: "Mathematics consultation scheduled",
            },
            {
              name: "First Paid Lesson",
              status: "pending",
              date: null,
              notes: "Awaiting consultation completion",
            },
            {
              name: "Package Purchase",
              status: "pending",
              date: null,
              notes: "Not yet purchased",
            },
            {
              name: "Regular Sessions",
              status: "pending",
              date: null,
              notes: "Not started",
            },
          ],
          timeToConsultation: 5, // days
          conversionRate: 0, // percentage
        },
        3: {
          // Charlotte Wilson
          stages: [
            {
              name: "Initial Contact",
              status: "completed",
              date: "2024-01-10",
              notes: "Student inquiry received",
            },
            {
              name: "Academic Consultation",
              status: "completed",
              date: "2024-01-15",
              notes: "English and History consultation completed",
            },
            {
              name: "First Paid Lesson",
              status: "completed",
              date: "2024-01-20",
              notes: "English essay writing session",
            },
            {
              name: "Package Purchase",
              status: "completed",
              date: "2024-01-25",
              notes: "20-hour package purchased",
            },
            {
              name: "Regular Sessions",
              status: "completed",
              date: "2024-02-01",
              notes: "Regular sessions ongoing",
            },
          ],
          timeToConsultation: 5, // days
          conversionRate: 100, // percentage
        },
      };

      // Mock packages and payments data
      const packagesData = {
        1: [
          {
            id: 1,
            name: "Chemistry Fundamentals Package",
            hours: 10,
            price: 650,
            purchasedDate: "2024-03-01",
            hoursUsed: 7,
            hoursRemaining: 3,
            status: "active",
            expiryDate: "2024-06-01",
          },
          {
            id: 2,
            name: "Biology Advanced Package",
            hours: 15,
            price: 975,
            purchasedDate: "2024-02-15",
            hoursUsed: 15,
            hoursRemaining: 0,
            status: "completed",
            expiryDate: "2024-05-15",
          },
        ],
        2: [],
        3: [
          {
            id: 3,
            name: "English Essay Writing Package",
            hours: 20,
            price: 1300,
            purchasedDate: "2024-01-25",
            hoursUsed: 18,
            hoursRemaining: 2,
            status: "active",
            expiryDate: "2024-04-25",
          },
          {
            id: 4,
            name: "History Research Package",
            hours: 10,
            price: 650,
            purchasedDate: "2024-02-10",
            hoursUsed: 10,
            hoursRemaining: 0,
            status: "completed",
            expiryDate: "2024-05-10",
          },
          {
            id: 5,
            name: "Study Skills Package",
            hours: 5,
            price: 325,
            purchasedDate: "2024-03-10",
            hoursUsed: 2,
            hoursRemaining: 3,
            status: "active",
            expiryDate: "2024-06-10",
          },
        ],
      };

      // Mock payment history
      const paymentHistory = {
        1: [
          {
            id: 1,
            date: "2024-03-01",
            description: "Chemistry Fundamentals Package",
            amount: 650,
            status: "paid",
            invoiceUrl: "#",
          },
          {
            id: 2,
            date: "2024-02-15",
            description: "Biology Advanced Package",
            amount: 975,
            status: "paid",
            invoiceUrl: "#",
          },
          {
            id: 3,
            date: "2024-02-10",
            description: "Refund - Biology Package",
            amount: -200,
            status: "refunded",
            invoiceUrl: "#",
          },
        ],
        2: [],
        3: [
          {
            id: 4,
            date: "2024-03-10",
            description: "Study Skills Package",
            amount: 325,
            status: "paid",
            invoiceUrl: "#",
          },
          {
            id: 5,
            date: "2024-02-10",
            description: "History Research Package",
            amount: 650,
            status: "paid",
            invoiceUrl: "#",
          },
          {
            id: 6,
            date: "2024-01-25",
            description: "English Essay Writing Package",
            amount: 1300,
            status: "paid",
            invoiceUrl: "#",
          },
        ],
      };

      // Mock sessions data
      const sessionsData = {
        1: [
          {
            id: 1,
            date: "2024-03-25",
            time: "10:00 AM",
            duration: 60,
            subject: "VCE Chemistry",
            tutor: "Sarah Johnson",
            status: "scheduled",
            notes: {
              private: "Student struggling with organic chemistry concepts",
              shareable: "Focus on reaction mechanisms and functional groups",
            },
            materials: [
              { name: "Organic Chemistry Slides", type: "PDF", url: "#" },
              { name: "Practice Problems", type: "PDF", url: "#" },
            ],
          },
          {
            id: 2,
            date: "2024-03-20",
            time: "2:00 PM",
            duration: 60,
            subject: "VCE Biology",
            tutor: "Michael Chen",
            status: "completed",
            notes: {
              private: "Excellent progress on cell division concepts",
              shareable: "Great understanding of mitosis and meiosis",
            },
            materials: [
              { name: "Cell Division Worksheet", type: "PDF", url: "#" },
              { name: "Video Resources", type: "Link", url: "#" },
            ],
          },
        ],
        2: [],
        3: [
          {
            id: 3,
            date: "2024-03-24",
            time: "2:00 PM",
            duration: 90,
            subject: "QCE English",
            tutor: "Emma Thompson",
            status: "scheduled",
            notes: {
              private: "Working on essay structure and argument development",
              shareable: "Focus on thesis statements and evidence analysis",
            },
            materials: [
              { name: "Essay Structure Guide", type: "PDF", url: "#" },
              { name: "Sample Essays", type: "PDF", url: "#" },
            ],
          },
        ],
      };

      // Mock reports and badges data
      const reportsData = {
        1: [
          {
            id: 1,
            month: "March 2024",
            subject: "VCE Chemistry",
            tutor: "Sarah Johnson",
            status: "submitted",
            submittedDate: "2024-03-20",
            content:
              "Student showing excellent progress in organic chemistry. Recommended additional practice problems.",
            approved: false,
          },
        ],
        2: [],
        3: [
          {
            id: 2,
            month: "March 2024",
            subject: "QCE English",
            tutor: "Emma Thompson",
            status: "submitted",
            submittedDate: "2024-03-18",
            content:
              "Outstanding improvement in essay writing. Student has mastered argument structure.",
            approved: true,
          },
        ],
      };

      const badgesData = {
        1: [
          {
            name: "Early Bird",
            description: "Never missed a morning session",
            category: "Attendance",
            earned: true,
            dateEarned: "2024-03-15",
          },
          {
            name: "Consistent",
            description: "30-day streak achieved",
            category: "Streaks",
            earned: true,
            dateEarned: "2024-03-10",
          },
          {
            name: "Concept Master",
            description: "Mastered challenging concepts",
            category: "Academic",
            earned: true,
            dateEarned: "2024-03-05",
          },
          {
            name: "Homework Hero",
            description: "100% completion rate",
            category: "Dedication",
            earned: false,
            dateEarned: null,
          },
        ],
        2: [],
        3: [
          {
            name: "Bookworm",
            description: "Completed 50 sessions",
            category: "Milestones",
            earned: true,
            dateEarned: "2024-03-15",
          },
          {
            name: "Problem Solver",
            description: "Exceptional logical thinking",
            category: "Academic",
            earned: true,
            dateEarned: "2024-02-28",
          },
          {
            name: "Essay Expert",
            description: "Mastered essay writing",
            category: "Academic",
            earned: true,
            dateEarned: "2024-03-01",
          },
        ],
      };

      // Mock SMART goals data
      const smartGoalsData = {
        1: [
          {
            subject: "VCE Chemistry",
            goal: "Achieve 85% in Unit 3 SAC",
            targetDate: "2024-04-15",
            progress: 70,
            status: "on_track",
            milestones: [
              { name: "Complete organic chemistry basics", completed: true },
              { name: "Master reaction mechanisms", completed: true },
              { name: "Practice exam questions", completed: false },
            ],
          },
          {
            subject: "VCE Biology",
            goal: "Improve understanding of cell division",
            targetDate: "2024-04-01",
            progress: 90,
            status: "exceeding",
            milestones: [
              { name: "Understand mitosis process", completed: true },
              { name: "Understand meiosis process", completed: true },
              { name: "Apply knowledge to exam questions", completed: true },
            ],
          },
        ],
        2: [],
        3: [
          {
            subject: "QCE English",
            goal: "Write A-grade essays consistently",
            targetDate: "2024-04-30",
            progress: 80,
            status: "on_track",
            milestones: [
              { name: "Master essay structure", completed: true },
              { name: "Develop strong arguments", completed: true },
              { name: "Improve evidence analysis", completed: false },
            ],
          },
        ],
      };

      setStudentData({
        ...student,
        pipeline: pipelineData[student.id] || pipelineData[1],
        packages: packagesData[student.id] || [],
        payments: paymentHistory[student.id] || [],
        sessions: sessionsData[student.id] || [],
        reports: reportsData[student.id] || [],
        badges: badgesData[student.id] || [],
        smartGoals: smartGoalsData[student.id] || [],
      });
    }
  }, [student]);

  const handleSave = () => {
    onUpdate(studentData);
    setIsEditing(false);
  };

  const handleMarkConsultationCompleted = () => {
    const updatedStages = studentData.pipeline.stages.map((stage) =>
      stage.name === "Academic Consultation"
        ? {
            ...stage,
            status: "completed",
            date: new Date().toISOString().split("T")[0],
          }
        : stage
    );

    setStudentData({
      ...studentData,
      pipeline: {
        ...studentData.pipeline,
        stages: updatedStages,
      },
    });
  };

  const handleApproveReport = (reportId) => {
    const updatedReports = studentData.reports.map((report) =>
      report.id === reportId ? { ...report, approved: true } : report
    );
    setStudentData({ ...studentData, reports: updatedReports });
  };

  const handleAssignBadge = (badgeName) => {
    const updatedBadges = studentData.badges.map((badge) =>
      badge.name === badgeName
        ? {
            ...badge,
            earned: true,
            dateEarned: new Date().toISOString().split("T")[0],
          }
        : badge
    );
    setStudentData({ ...studentData, badges: updatedBadges });
  };

  const handleRemoveBadge = (badgeName) => {
    const updatedBadges = studentData.badges.map((badge) =>
      badge.name === badgeName
        ? { ...badge, earned: false, dateEarned: null }
        : badge
    );
    setStudentData({ ...studentData, badges: updatedBadges });
  };

  const handleViewNotes = (session) => {
    setSelectedSessionNotes(session.notes);
    setShowNotesModal(true);
  };

  const closeNotesModal = () => {
    setShowNotesModal(false);
    setSelectedSessionNotes(null);
  };

  const handleViewMaterials = (session) => {
    setSelectedSession(session);
    setShowMaterialsModal(true);
  };

  const closeMaterialsModal = () => {
    setShowMaterialsModal(false);
    setSelectedSession(null);
  };

  const renderOverviewTab = () => (
    <div className="student-profile-overview">
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="student-profile-card">
            <h6>Student Information</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="student-info-item">
                  <strong>Name:</strong> {studentData.name}
                </div>
                <div className="student-info-item">
                  <strong>Email:</strong> {studentData.email}
                </div>
                <div className="student-info-item">
                  <strong>Phone:</strong> {studentData.phone}
                </div>
                <div className="student-info-item">
                  <strong>Grade:</strong> {studentData.grade}
                </div>
              </div>
              <div className="col-md-6">
                <div className="student-info-item">
                  <strong>Parent:</strong> {studentData.parentName}
                </div>
                <div className="student-info-item">
                  <strong>Parent Email:</strong> {studentData.parentEmail}
                </div>
                <div className="student-info-item">
                  <strong>Joined:</strong>{" "}
                  {new Date(studentData.joinedDate).toLocaleDateString()}
                </div>
                <div className="student-info-item">
                  <strong>Status:</strong>
                  <span
                    className={`badge bg-${
                      studentData.status === "active" ? "success" : "warning"
                    } ms-2`}
                  >
                    {studentData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="student-profile-card">
            <h6>Quick Stats</h6>
            <div className="student-info-item">
              <strong>Total Sessions:</strong> {studentData.totalSessions}
            </div>
            <div className="student-info-item">
              <strong>Packages Purchased:</strong>{" "}
              {studentData.packagesPurchased}
            </div>
            <div className="student-info-item">
              <strong>Consultation:</strong>
              <span
                className={`badge bg-${
                  studentData.consultationCompleted ? "success" : "warning"
                } ms-2`}
              >
                {studentData.consultationCompleted ? "Completed" : "Pending"}
              </span>
            </div>
            <div className="student-info-item">
              <strong>Next Session:</strong>{" "}
              {studentData.nextSession || "None scheduled"}
            </div>
          </div>
        </div>
      </div>

      <div className="student-profile-card">
        <h6>Subjects</h6>
        <div className="d-flex flex-wrap gap-2">
          {studentData.subjects.map((subject, index) => (
            <span key={index} className="badge bg-primary">
              {subject}
            </span>
          ))}
        </div>
      </div>

      <div className="student-profile-card">
        <h6>Assigned Tutors</h6>
        <div className="d-flex flex-wrap gap-2">
          {studentData.assignedTutors.map((tutor, index) => (
            <span key={index} className="badge bg-info">
              {tutor}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPipelineTab = () => (
    <div className="student-profile-pipeline">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="student-profile-card">
            <h6>Pipeline Progress</h6>
            <div className="pipeline-tracker">
              {studentData.pipeline.stages.map((stage, index) => (
                <div key={index} className="pipeline-stage">
                  <div className={`pipeline-stage-indicator ${stage.status}`}>
                    <i
                      className={`fas fa-${
                        stage.status === "completed"
                          ? "check"
                          : stage.status === "in_progress"
                          ? "clock"
                          : "circle"
                      }`}
                    ></i>
                  </div>
                  <div className="pipeline-stage-content">
                    <div className="pipeline-stage-name">{stage.name}</div>
                    <div className="pipeline-stage-status">
                      <span
                        className={`badge bg-${
                          stage.status === "completed"
                            ? "success"
                            : stage.status === "in_progress"
                            ? "primary"
                            : "secondary"
                        }`}
                      >
                        {stage.status.replace("_", " ")}
                      </span>
                    </div>
                    {stage.date && (
                      <div className="pipeline-stage-date">
                        {new Date(stage.date).toLocaleDateString()}
                      </div>
                    )}
                    <div className="pipeline-stage-notes">{stage.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="student-profile-card">
            <h6>Pipeline Metrics</h6>
            <div className="pipeline-metrics">
              <div className="metric-item">
                <strong>Time to Consultation:</strong>{" "}
                {studentData.pipeline.timeToConsultation} days
              </div>
              <div className="metric-item">
                <strong>Conversion Rate:</strong>{" "}
                {studentData.pipeline.conversionRate}%
              </div>
            </div>
            <div className="mt-3">
              <button
                className="btn btn-success btn-sm"
                onClick={handleMarkConsultationCompleted}
                disabled={
                  studentData.pipeline.stages.find(
                    (s) => s.name === "Academic Consultation"
                  )?.status === "completed"
                }
              >
                <i className="fas fa-check me-1"></i>
                Mark Consultation Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackagesTab = () => (
    <div className="student-profile-packages">
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="student-profile-card">
            <h6>Purchased Packages</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Hours</th>
                    <th>Price</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>{pkg.name}</td>
                      <td>{pkg.hours}</td>
                      <td>${pkg.price}</td>
                      <td>{pkg.hoursUsed}</td>
                      <td>{pkg.hoursRemaining}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            pkg.status === "active"
                              ? "success"
                              : pkg.status === "completed"
                              ? "info"
                              : "secondary"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                      <td>{new Date(pkg.expiryDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="student-profile-card">
            <h6>Payment History</h6>
            <div className="payment-history">
              {studentData.payments.map((payment) => (
                <div key={payment.id} className="payment-item">
                  <div className="payment-date">
                    {new Date(payment.date).toLocaleDateString()}
                  </div>
                  <div className="payment-description">
                    {payment.description}
                  </div>
                  <div className="payment-amount">
                    <span
                      className={`badge bg-${
                        payment.amount > 0 ? "success" : "danger"
                      }`}
                    >
                      ${Math.abs(payment.amount)}
                    </span>
                  </div>
                  <div className="payment-status">
                    <span
                      className={`badge bg-${
                        payment.status === "paid" ? "success" : "warning"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="payment-actions">
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="fas fa-download"></i> Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessionsTab = () => (
    <div className="student-profile-sessions">
      <div className="row mb-4">
        <div className="col-12">
          <div className="student-profile-card">
            <h6>Session Schedule & Notes</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Tutor</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{new Date(session.date).toLocaleDateString()}</td>
                      <td>{session.time}</td>
                      <td>{session.subject}</td>
                      <td>{session.tutor}</td>
                      <td>{session.duration} min</td>
                      <td>
                        <span
                          className={`badge bg-${
                            session.status === "completed"
                              ? "success"
                              : session.status === "scheduled"
                              ? "primary"
                              : "secondary"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            onClick={() => handleViewNotes(session)}
                          >
                            <i className="fas fa-sticky-note"></i>
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleViewMaterials(session)}
                          >
                            <i className="fas fa-paperclip"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="student-profile-reports">
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="student-profile-card">
            <h6>Monthly Reports</h6>
            <div className="reports-list">
              {studentData.reports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-header">
                    <div className="report-title">
                      {report.month} - {report.subject}
                    </div>
                    <div className="report-tutor">by {report.tutor}</div>
                    <div className="report-status">
                      <span
                        className={`badge bg-${
                          report.approved ? "success" : "warning"
                        }`}
                      >
                        {report.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="report-content">{report.content}</div>
                  <div className="report-actions">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApproveReport(report.id)}
                      disabled={report.approved}
                    >
                      <i className="fas fa-check me-1"></i>
                      Approve
                    </button>
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="fas fa-edit me-1"></i>
                      Request Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="student-profile-card">
            <h6>Badges Management</h6>
            <div className="badges-list">
              {studentData.badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  <div className="badge-info">
                    <div className="badge-name">{badge.name}</div>
                    <div className="badge-description">{badge.description}</div>
                    <div className="badge-category">{badge.category}</div>
                    {badge.earned && (
                      <div className="badge-date">
                        Earned:{" "}
                        {new Date(badge.dateEarned).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="badge-actions">
                    {badge.earned ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveBadge(badge.name)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAssignBadge(badge.name)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="student-profile-preferences">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="student-profile-card">
            <h6>Student Details</h6>
            <div className="form-group mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={studentData.name}
                onChange={(e) =>
                  setStudentData({ ...studentData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={studentData.email}
                onChange={(e) =>
                  setStudentData({ ...studentData, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={studentData.phone}
                onChange={(e) =>
                  setStudentData({ ...studentData, phone: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Learning Preferences</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Enter learning preferences..."
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="student-profile-card">
            <h6>SMART Goals</h6>
            <div className="smart-goals-list">
              {studentData.smartGoals.map((goal, index) => (
                <div key={index} className="smart-goal-item">
                  <div className="smart-goal-header">
                    <div className="smart-goal-subject">{goal.subject}</div>
                    <div className="smart-goal-target">{goal.targetDate}</div>
                  </div>
                  <div className="smart-goal-description">{goal.goal}</div>
                  <div className="smart-goal-progress">
                    <div className="progress">
                      <div
                        className={`progress-bar bg-${
                          goal.status === "exceeding"
                            ? "success"
                            : goal.status === "on_track"
                            ? "primary"
                            : "warning"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="smart-goal-progress-text">
                      {goal.progress}%
                    </div>
                  </div>
                  <div className="smart-goal-milestones">
                    {goal.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className={`milestone-item ${
                          milestone.completed ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas fa-${
                            milestone.completed ? "check-circle" : "circle"
                          }`}
                        ></i>
                        <span>{milestone.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!studentData) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-user-graduate me-2"></i>
              Student Profile - {studentData.name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "overview" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  <i className="fas fa-user me-1"></i>
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "pipeline" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("pipeline")}
                >
                  <i className="fas fa-project-diagram me-1"></i>
                  Lesson Pipeline
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "packages" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("packages")}
                >
                  <i className="fas fa-box me-1"></i>
                  Packages & Payments
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "sessions" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("sessions")}
                >
                  <i className="fas fa-calendar me-1"></i>
                  Sessions & Notes
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "reports" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("reports")}
                >
                  <i className="fas fa-chart-line me-1"></i>
                  Reports & Badges
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="fas fa-cog me-1"></i>
                  Profile & Preferences
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "pipeline" && renderPipelineTab()}
            {activeTab === "packages" && renderPackagesTab()}
            {activeTab === "sessions" && renderSessionsTab()}
            {activeTab === "reports" && renderReportsTab()}
            {activeTab === "profile" && renderProfileTab()}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            {activeTab === "profile" && (
              <>
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSave}
                    >
                      <i className="fas fa-save me-1"></i>
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Notes Modal */}
      {showNotesModal && selectedSessionNotes && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-sticky-note me-2"></i>
                  Session Notes
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeNotesModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Private Notes (Admin Only)</h6>
                    <div className="notes-content">
                      {selectedSessionNotes.private}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>Shareable Notes (Student Visible)</h6>
                    <div className="notes-content">
                      {selectedSessionNotes.shareable}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeNotesModal}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-edit me-1"></i>
                  Edit Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Materials Modal */}
      {showMaterialsModal && selectedSession && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-paperclip me-2"></i>
                  Session Materials - {selectedSession.subject}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeMaterialsModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="materials-list">
                  {selectedSession.materials.map((material, index) => (
                    <div key={index} className="material-item">
                      <div className="material-info">
                        <div className="material-name">{material.name}</div>
                        <div className="material-type">{material.type}</div>
                      </div>
                      <div className="material-actions">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-download me-1"></i>
                          Download
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="fas fa-eye me-1"></i>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>
                    Add Material
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeMaterialsModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfileModal;
