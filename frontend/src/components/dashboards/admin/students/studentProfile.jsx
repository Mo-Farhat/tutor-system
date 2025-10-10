import React, { useState, useEffect } from "react";
import { getStudentProfile, updateStudentProfile } from "../../../../services/adminService";
import "../../../../css/dashboards/admin/students/studentProfile.css";

const StudentProfileModal = ({ student, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [studentData, setStudentData] = useState(student);
  const [realStudentData, setRealStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFields, setEditingFields] = useState({
    tier: 'basic',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [selectedSessionNotes, setSelectedSessionNotes] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch real student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (student && student.id) {
        try {
          setLoading(true);
          setError(null);
          
          const result = await getStudentProfile(student.id);
          
          if (result.success) {
            setRealStudentData(result.data);
            setEditingFields({
              tier: result.data.tier || 'basic',
              status: result.data.status || 'active'
            });
          } else {
            setError(result.error || 'Failed to load student profile');
          }
        } catch (err) {
          console.error('Error fetching student profile:', err);
          setError('Failed to load student profile');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudentData();
  }, [student]);

  // Mock data for other tabs (Pipeline, Sessions, etc.)
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const result = await updateStudentProfile(student.id, editingFields);
      
      if (result.success) {
        // Update the real student data with the new values
        setRealStudentData(prev => ({
          ...prev,
          tier: editingFields.tier,
          status: editingFields.status
        }));
        
        // Also update the studentData for backward compatibility
        setStudentData(prev => ({
          ...prev,
          tier: editingFields.tier,
          status: editingFields.status
        }));
        
        setIsEditing(false);
        
        // Call the parent update handler if provided
        if (onUpdate) {
          onUpdate({
            ...studentData,
            tier: editingFields.tier,
            status: editingFields.status
          });
        }
        
        alert('Student profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update student profile');
      }
    } catch (err) {
      console.error('Error updating student profile:', err);
      setError('Failed to update student profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditingFields(prev => ({
      ...prev,
      [field]: value
    }));
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

  const renderProfileTab = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading student profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      );
    }

    if (!realStudentData) {
      return (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No profile data available for this student.
        </div>
      );
    }

    return (
      <div className="student-profile-preferences">
        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Admin Editable Fields */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="student-profile-card">
              <h6>
                <i className="fas fa-cog me-2"></i>
                Admin Settings
                {!isEditing && (
                  <button
                    className="btn btn-sm btn-outline-primary ms-3"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit
                  </button>
                )}
              </h6>
              
              {isEditing && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Student Tier</label>
                      <select
                        className="form-select"
                        value={editingFields.tier}
                        onChange={(e) => handleFieldChange('tier', e.target.value)}
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="elite">Elite</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Account Status</label>
                      <select
                        className="form-select"
                        value={editingFields.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Student Tier</label>
                      <div className="form-control-plaintext">
                        <span className={`badge bg-${
                          realStudentData.tier === 'elite' ? 'danger' :
                          realStudentData.tier === 'premium' ? 'warning' : 'secondary'
                        }`}>
                          {realStudentData.tier?.toUpperCase() || 'Basic'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Account Status</label>
                      <div className="form-control-plaintext">
                        <span className={`badge bg-${
                          realStudentData.status === 'active' ? 'success' :
                          realStudentData.status === 'inactive' ? 'secondary' :
                          realStudentData.status === 'pending' ? 'warning' : 'danger'
                        }`}>
                          {realStudentData.status?.toUpperCase() || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Profile Information */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="student-profile-card">
              <h6><i className="fas fa-user me-2"></i>Personal Information</h6>
              <div className="form-group mb-3">
                <label className="form-label">Full Name</label>
                <div className="form-control-plaintext">
                  {realStudentData.firstName && realStudentData.lastName 
                    ? `${realStudentData.firstName} ${realStudentData.lastName}`
                    : 'Not provided'
                  }
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Email</label>
                <div className="form-control-plaintext">
                  {realStudentData.email || 'Not provided'}
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Username</label>
                <div className="form-control-plaintext">
                  @{realStudentData.username || 'Not provided'}
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Phone Number</label>
                <div className="form-control-plaintext">
                  {realStudentData.phoneNumber || 'Not provided'}
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Bio</label>
                <div className="form-control-plaintext">
                  {realStudentData.bio || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="student-profile-card">
              <h6><i className="fas fa-graduation-cap me-2"></i>Academic Information</h6>
              <div className="form-group mb-3">
                <label className="form-label">Current School</label>
                <div className="form-control-plaintext">
                  {realStudentData.currentSchool || 'Not provided'}
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Year Level</label>
                <div className="form-control-plaintext">
                  {realStudentData.yearLevel || 'Not provided'}
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Subjects Interested</label>
                <div className="form-control-plaintext">
                  {realStudentData.subjectsInterested?.length > 0 
                    ? realStudentData.subjectsInterested.map(subject => (
                        <span key={subject} className="badge bg-primary me-1 mb-1">{subject}</span>
                      ))
                    : 'Not provided'
                  }
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Preferred Locations</label>
                <div className="form-control-plaintext">
                  {realStudentData.preferredLocations?.length > 0 
                    ? realStudentData.preferredLocations.map(location => (
                        <span key={location} className="badge bg-info me-1 mb-1">{location}</span>
                      ))
                    : 'Not provided'
                  }
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Learning Goals</label>
                <div className="form-control-plaintext">
                  {realStudentData.learningGoals || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Contacts */}
        {realStudentData.parentContacts && realStudentData.parentContacts.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="student-profile-card">
                <h6><i className="fas fa-users me-2"></i>Parent Contacts</h6>
                <div className="row">
                  {realStudentData.parentContacts.map((parent, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="card-title">
                                {parent.firstName} {parent.lastName}
                                {parent.isPrimary && (
                                  <span className="badge bg-success ms-2">Primary</span>
                                )}
                              </h6>
                              <p className="card-text">
                                <small className="text-muted">
                                  {parent.relation?.charAt(0).toUpperCase() + parent.relation?.slice(1)}
                                </small>
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            {parent.email && (
                              <div className="mb-1">
                                <i className="fas fa-envelope me-1"></i>
                                {parent.email}
                              </div>
                            )}
                            {parent.phone && (
                              <div className="mb-1">
                                <i className="fas fa-phone me-1"></i>
                                {parent.phone}
                              </div>
                            )}
                            {parent.contactPreference && (
                              <div className="mb-1">
                                <i className="fas fa-comment me-1"></i>
                                Prefers: {parent.contactPreference}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Status */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="student-profile-card">
              <h6><i className="fas fa-chart-pie me-2"></i>Profile Completion</h6>
              <div className="row">
                <div className="col-md-8">
                  <div className="progress mb-2" style={{ height: '25px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${realStudentData.profileCompletionPercentage || 0}%` }}
                    >
                      {realStudentData.profileCompletionPercentage || 0}%
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-end">
                    <span className={`badge bg-${realStudentData.isProfileComplete ? 'success' : 'warning'}`}>
                      {realStudentData.isProfileComplete ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="row">
          <div className="col-md-6">
            <div className="student-profile-card">
              <h6><i className="fas fa-calendar me-2"></i>Account Information</h6>
              <div className="form-group mb-3">
                <label className="form-label">Member Since</label>
                <div className="form-control-plaintext">
                  {realStudentData.createdAt 
                    ? new Date(realStudentData.createdAt).toLocaleDateString()
                    : 'Not available'
                  }
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Last Updated</label>
                <div className="form-control-plaintext">
                  {realStudentData.updatedAt 
                    ? new Date(realStudentData.updatedAt).toLocaleDateString()
                    : 'Not available'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Save Changes
                        </>
                      )}
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
