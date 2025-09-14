import React, { useState } from 'react';
import '../../../../css/dashboards/student/profile-details/profile-details.css';

function StudentProfileDetails() {
  // Student basic info state
  const [studentData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phoneNumber: '+1 (555) 123-4567',
    grade: 'Year 12',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    parentName: 'Jane Doe',
    parentEmail: 'jane.doe@email.com',
    parentPhone: '+1 (555) 987-6543',
    joinedDate: 'January 2023',
    totalLessons: 68,
    attendance: '98%',
    studentId: 'ST20230001',
    dateOfBirth: 'March 15, 2006',
    address: '123 Main Street, City, State 12345',
    emergencyContact: 'Jane Doe (Mother)',
    emergencyPhone: '+1 (555) 987-6543'
  });

  // Progress report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    term: '',
    progressSummary: '',
    keyAchievements: {
      improvedGrades: { selected: false, note: '' },
      masteredTopic: { selected: false, note: '' },
      increasedConfidence: { selected: false, note: '' },
      betterHomework: { selected: false, note: '' },
      improvedStudyHabits: { selected: false, note: '' },
      strongerParticipation: { selected: false, note: '' }
    },
    skillsCovered: [],
    improvementAreas: '',
    nextTermGoals: {
      improveExam: { selected: false, note: '' },
      buildConfidence: { selected: false, note: '' },
      maintainStandard: { selected: false, note: '' },
      developIndependence: { selected: false, note: '' },
      prepareAssessments: { selected: false, note: '' },
      customGoal: { selected: false, note: '' }
    },
    attendanceNote: '',
    overallRating: 5
  });

  // Student badges state
  const [studentBadges] = useState([
    { name: 'Concept Master', count: 3, dates: ['2024-01-15', '2024-02-20', '2024-03-10'], notes: ['Mastered quadratic equations', 'Excellent understanding of calculus', 'Advanced physics concepts'] },
    { name: 'Homework Hero', count: 5, dates: ['2024-01-10', '2024-02-15', '2024-03-05', '2024-03-20', '2024-04-01'], notes: ['Perfect homework completion', 'Consistent quality work', 'Always on time', 'Extra credit work', 'Helping classmates'] },
    { name: 'Milestone 50', count: 1, dates: ['2024-03-15'], notes: ['Completed 50 lessons milestone'] }
  ]);

  // Previous reports state
  const [previousReports] = useState([
    {
      term: 'Term 1',
      date: '2024-03-15',
      overallRating: 5,
      progressSummary: 'John has made excellent progress in all subjects and is consistently achieving high grades. His problem-solving skills have improved significantly.',
      keyAchievements: ['Improved grades/test results', 'Mastered challenging topic', 'Increased confidence'],
      improvementAreas: 'Continue building speed in mathematical calculations and exam techniques.'
    },
    {
      term: 'Term 2', 
      date: '2024-01-20',
      overallRating: 4,
      progressSummary: 'Strong consistent performance with notable improvement in problem-solving skills and subject understanding.',
      keyAchievements: ['Better homework completion', 'Improved study habits'],
      improvementAreas: 'Focus on time management during exams.'
    }
  ]);

  // Available badges for reference
  const availableBadges = [
    // Learning & Academic Milestones
    { category: 'Learning & Academic Milestones', name: 'Concept Master', description: 'Mastered a challenging concept or topic' },
    { category: 'Learning & Academic Milestones', name: 'Subject Specialist', description: 'Consistently strong performance in a particular subject' },
    { category: 'Learning & Academic Milestones', name: 'Rapid Improver', description: 'Significant improvement in marks or understanding in a short time' },
    { category: 'Learning & Academic Milestones', name: 'Exam Ace', description: 'Outstanding performance in a test or exam' },
    { category: 'Learning & Academic Milestones', name: 'Top Scorer', description: 'Achieved the highest score in a class or group' },
    { category: 'Learning & Academic Milestones', name: 'Problem Solver', description: 'Exceptional logical thinking or creative problem-solving' },
    { category: 'Learning & Academic Milestones', name: 'Homework Hero', description: '100% completion and accuracy on all assigned homework' },
    { category: 'Learning & Academic Milestones', name: 'Writing Wizard', description: 'Excellence in essays, reports, or creative writing' },
    { category: 'Learning & Academic Milestones', name: 'Math Magician', description: 'Excellence in solving mathematical problems' },
    { category: 'Learning & Academic Milestones', name: 'Young Scientist', description: 'Excellence in scientific investigation' },
    
    // Consistency & Commitment
    { category: 'Consistency & Commitment', name: 'Perfect Attendance', description: 'Attended every lesson for a term' },
    { category: 'Consistency & Commitment', name: 'Punctual Pro', description: 'Always on time for lessons' },
    { category: 'Consistency & Commitment', name: 'Milestone 10', description: 'Completed 10 lessons' },
    { category: 'Consistency & Commitment', name: 'Milestone 25', description: 'Completed 25 lessons' },
    { category: 'Consistency & Commitment', name: 'Milestone 50', description: 'Completed 50 lessons' },
    { category: 'Consistency & Commitment', name: 'Long-Term Learner', description: 'Studied with the same tutor for over a year' },
    
    // Attitude & Learning Skills
    { category: 'Attitude & Learning Skills', name: 'Curiosity Champion', description: 'Always asking insightful, meaningful questions' },
    { category: 'Attitude & Learning Skills', name: 'Positive Mindset', description: 'Consistently shows resilience and optimism' },
    { category: 'Attitude & Learning Skills', name: 'Self-Starter', description: 'Takes initiative in learning beyond the lesson' },
    { category: 'Attitude & Learning Skills', name: 'Collaborator', description: 'Works well with peers in group sessions' },
    { category: 'Attitude & Learning Skills', name: 'Critical Thinker', description: 'Makes thoughtful and evidence-based arguments' },
    
    // Special Achievements
    { category: 'Special Achievements', name: 'Speed Reader', description: 'Exceptional improvement in reading speed and comprehension' },
    { category: 'Special Achievements', name: 'Memory Master', description: 'Demonstrates outstanding recall of facts and concepts' },
    { category: 'Special Achievements', name: 'UCAT Star', description: 'Achieves a milestone score in UCAT practice' },
    { category: 'Special Achievements', name: 'Goal Smasher', description: 'Achieved a pre-set learning goal ahead of schedule' }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`fas fa-star ${i < rating ? 'text-warning' : 'text-muted'}`}></i>
    ));
  };

  return (
    <div className="student-profile-details-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="student-profile-details-content">
              
              {/* Student Profile Header */}
              <div className="student-profile-details-section">
                <h4 className="student-profile-details-section-title">Tutor Profile</h4>
                <div className="student-profile-details-card">
                  <div className="student-profile-details-card-body">
                    <div className="row">
                      <div className="col-lg-8 col-md-12 mb-4">
                        <div className="d-flex align-items-center">
                          <div className="student-profile-details-avatar me-3">
                            <i className="fas fa-user-graduate"></i>
                          </div>
                          <div>
                            <h6 className="student-profile-details-card-title">{studentData.fullName}</h6>
                            <p className="student-profile-details-card-description">
                              {studentData.grade} • {studentData.subjects.join(', ')} • Student ID: {studentData.studentId}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-12 mb-4">
                        <div className="d-flex justify-content-lg-end">
                          <button className="btn btn-outline-secondary student-profile-details-btn me-2">
                            <i className="fas fa-arrow-left me-2"></i>
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Information Cards */}
              <div className="student-profile-details-section">
                <h4 className="student-profile-details-section-title">Personal Information</h4>
                
                <div className="row">
                  <div className="col-12 mb-4">
                    <div className="student-profile-details-card">
                      <div className="student-profile-details-card-body">
                        <h6 className="student-profile-details-card-title">Contact Details</h6>
                        <p className="student-profile-details-card-description">Your contact information</p>
                        <div className="row">
                          <div className="col-lg-6 col-md-12">
                            <div className="student-profile-details-info-list">
                              <div className="student-profile-details-info-item">
                                <i className="fas fa-envelope me-2"></i>
                                {studentData.email}
                              </div>
                              <div className="student-profile-details-info-item">
                                <i className="fas fa-phone me-2"></i>
                                {studentData.phoneNumber}
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-12">
                            <div className="student-profile-details-info-list">
                              <div className="student-profile-details-info-item">
                                <i className="fas fa-calendar me-2"></i>
                                Date of Birth: {studentData.dateOfBirth}
                              </div>
                              <div className="student-profile-details-info-item">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {studentData.address}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-4 col-md-12 mb-4">
                    <div className="student-profile-details-card">
                      <div className="student-profile-details-card-body">
                        <h6 className="student-profile-details-card-title">Total Lessons</h6>
                        <p className="student-profile-details-card-description">Lessons completed to date</p>
                        <div className="student-profile-details-stat-number">{studentData.totalLessons}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 col-md-12 mb-4">
                    <div className="student-profile-details-card">
                      <div className="student-profile-details-card-body">
                        <h6 className="student-profile-details-card-title">Attendance Rate</h6>
                        <p className="student-profile-details-card-description">Your attendance percentage</p>
                        <div className="student-profile-details-stat-number">{studentData.attendance}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 col-md-12 mb-4">
                    <div className="student-profile-details-card">
                      <div className="student-profile-details-card-body">
                        <h6 className="student-profile-details-card-title">Badges Earned</h6>
                        <p className="student-profile-details-card-description">Achievement badges collected</p>
                        <div className="student-profile-details-stat-number">{studentBadges.reduce((sum, badge) => sum + badge.count, 0)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Badges Section */}
              <div className="student-profile-details-section">
                <h4 className="student-profile-details-section-title">My Achievement Badges</h4>
                <div className="student-profile-details-card">
                  <div className="student-profile-details-card-body">
                    <div className="mb-3">
                      <h6 className="student-profile-details-card-title">Your Achievements</h6>
                      <p className="student-profile-details-card-description">Recognition badges you've earned through your hard work</p>
                    </div>
                    
                    {studentBadges.length > 0 ? (
                      <div className="row">
                        {studentBadges.map((badge, index) => (
                          <div key={index} className="col-lg-4 col-md-6 col-12 mb-3">
                            <div className="student-profile-details-badge-card">
                              <div className="student-profile-details-badge-icon">
                                <i className="fas fa-award"></i>
                                {badge.count > 1 && (
                                  <span className="student-profile-details-badge-count">×{badge.count}</span>
                                )}
                              </div>
                              <div className="student-profile-details-badge-content">
                                <h6 className="student-profile-details-badge-name">{badge.name}</h6>
                                <small className="text-muted">Last earned: {badge.dates[badge.dates.length - 1]}</small>
                                <div className="student-profile-details-badge-notes">
                                  {badge.notes.slice(0, 2).map((note, noteIndex) => (
                                    <small key={noteIndex} className="d-block text-muted">• {note}</small>
                                  ))}
                                  {badge.notes.length > 2 && (
                                    <small className="text-muted">• +{badge.notes.length - 2} more</small>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="student-profile-details-empty-state">
                        <i className="fas fa-award"></i>
                        <p>No badges earned yet. Keep working hard to earn your first achievement!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Reports Section */}
              <div className="student-profile-details-section">
                <h4 className="student-profile-details-section-title">My Progress Reports</h4>
                <div className="student-profile-details-card">
                  <div className="student-profile-details-card-body">
                    <div className="mb-3">
                      <h6 className="student-profile-details-card-title">Academic Progress</h6>
                      <p className="student-profile-details-card-description">Your termly assessment reports and feedback from tutors</p>
                    </div>
                    
                    {previousReports.length > 0 ? (
                      <div className="row">
                        {previousReports.map((report, index) => (
                          <div key={index} className="col-lg-6 col-md-12 mb-3">
                            <div className="student-profile-details-report-card">
                              <div className="student-profile-details-report-header">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="student-profile-details-report-title">{report.term} Report</h6>
                                    <small className="text-muted">
                                      <i className="fas fa-calendar me-1"></i>
                                      {report.date}
                                    </small>
                                  </div>
                                  <div className="student-profile-details-report-rating">
                                    {renderStars(report.overallRating)}
                                  </div>
                                </div>
                              </div>
                              <div className="student-profile-details-report-summary">
                                <p>{report.progressSummary}</p>
                              </div>
                              <div className="student-profile-details-report-achievements">
                                <h6 className="mb-2">Key Achievements:</h6>
                                <ul className="mb-2">
                                  {report.keyAchievements.map((achievement, achIndex) => (
                                    <li key={achIndex} className="small">{achievement}</li>
                                  ))}
                                </ul>
                                <h6 className="mb-2">Areas for Improvement:</h6>
                                <p className="small mb-0">{report.improvementAreas}</p>
                              </div>
                              <div className="student-profile-details-report-actions">
                                <button className="btn btn-outline-primary btn-sm me-2">
                                  <i className="fas fa-eye me-1"></i>
                                  View Full Report
                                </button>
                                <button className="btn btn-outline-secondary btn-sm">
                                  <i className="fas fa-download me-1"></i>
                                  Download PDF
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="student-profile-details-empty-state">
                        <i className="fas fa-file-alt"></i>
                        <p>No progress reports yet. Your first report will appear here after your first term!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileDetails;
