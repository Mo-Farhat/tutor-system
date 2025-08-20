import React, { useState } from 'react';
import '../../../../css/dashboards/tutor/students/s-profile.css';

function StudentProfile() {
  // Student basic info state
  const [studentData] = useState({
    fullName: 'Emma Thompson',
    email: 'emma.thompson@email.com',
    phoneNumber: '+1 (555) 987-6543',
    grade: 'Year 11',
    subjects: ['Mathematics', 'Physics'],
    parentName: 'Sarah Thompson',
    parentEmail: 'sarah.thompson@email.com',
    parentPhone: '+1 (555) 123-4567',
    joinedDate: 'September 2023',
    totalLessons: 42,
    attendance: '95%'
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

  // Badge assignment state
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [badgeNotes, setBadgeNotes] = useState({});

  // Student badges state
  const [studentBadges] = useState([
    { name: 'Concept Master', count: 2, dates: ['2024-01-15', '2024-02-20'], notes: ['Mastered quadratic equations', 'Excellent understanding of calculus'] },
    { name: 'Homework Hero', count: 3, dates: ['2024-01-10', '2024-02-15', '2024-03-05'], notes: ['Perfect homework completion', 'Consistent quality work', 'Always on time'] },
    { name: 'Milestone 25', count: 1, dates: ['2024-02-28'], notes: ['Completed 25 lessons milestone'] }
  ]);

  // Previous reports state
  const [previousReports] = useState([
    {
      term: 'Term 1',
      date: '2024-03-15',
      overallRating: 5,
      progressSummary: 'Emma has made excellent progress in mathematics and is now consistently achieving higher grades.',
      keyAchievements: ['Improved grades/test results', 'Mastered challenging topic'],
      improvementAreas: 'Needs to focus on applying formulas accurately under timed conditions.'
    },
    {
      term: 'Term 2', 
      date: '2024-01-20',
      overallRating: 4,
      progressSummary: 'Strong consistent performance with notable improvement in problem-solving skills.',
      keyAchievements: ['Increased confidence', 'Better homework completion'],
      improvementAreas: 'Continue building speed in mathematical calculations.'
    }
  ]);

  // Available badges
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

  const handleAchievementChange = (achievement, field, value) => {
    setReportData(prev => ({
      ...prev,
      keyAchievements: {
        ...prev.keyAchievements,
        [achievement]: {
          ...prev.keyAchievements[achievement],
          [field]: value
        }
      }
    }));
  };

  const handleGoalChange = (goal, field, value) => {
    setReportData(prev => ({
      ...prev,
      nextTermGoals: {
        ...prev.nextTermGoals,
        [goal]: {
          ...prev.nextTermGoals[goal],
          [field]: value
        }
      }
    }));
  };

  const handleBadgeSelect = (badge) => {
    if (selectedBadges.includes(badge.name)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badge.name));
      const newNotes = { ...badgeNotes };
      delete newNotes[badge.name];
      setBadgeNotes(newNotes);
    } else {
      setSelectedBadges([...selectedBadges, badge.name]);
    }
  };

  const handleBadgeNoteChange = (badgeName, note) => {
    setBadgeNotes(prev => ({
      ...prev,
      [badgeName]: note
    }));
  };

  const submitReport = () => {
    console.log('Submitting report:', reportData);
    setShowReportModal(false);
    setReportData({
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
  };

  const assignBadges = () => {
    console.log('Assigning badges:', selectedBadges, badgeNotes);
    setShowBadgeModal(false);
    setSelectedBadges([]);
    setBadgeNotes({});
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`fas fa-star ${i < rating ? 'text-warning' : 'text-muted'}`}></i>
    ));
  };

  const groupedBadges = availableBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {});

  return (
    <div className="s-profile-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="s-profile-content">
              
              {/* Student Profile Header */}
              <div className="s-profile-section">
                <h4 className="s-profile-section-title">Student Profile</h4>
                <div className="s-profile-card">
                  <div className="s-profile-card-body">
                    <div className="row">
                      <div className="col-lg-8 col-md-12 mb-4">
                        <div className="d-flex align-items-center">
                          <div className="s-profile-avatar me-3">
                            <i className="fas fa-user-graduate"></i>
                          </div>
                          <div>
                            <h6 className="s-profile-card-title">{studentData.fullName}</h6>
                            <p className="s-profile-card-description">
                              {studentData.grade} • {studentData.subjects.join(', ')} • Joined {studentData.joinedDate}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-12 mb-4">
                        <div className="d-flex justify-content-lg-end">
                          <button className="btn btn-outline-secondary s-profile-btn me-2">
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
              <div className="s-profile-section">
                <h4 className="s-profile-section-title">Student Information</h4>
                
                <div className="row">
                  <div className="col-lg-6 col-md-12 mb-4">
                    <div className="s-profile-card">
                      <div className="s-profile-card-body">
                        <h6 className="s-profile-card-title">Contact Details</h6>
                        <p className="s-profile-card-description">Student contact information</p>
                        <div className="s-profile-info-list">
                          <div className="s-profile-info-item">
                            <i className="fas fa-envelope me-2"></i>
                            {studentData.email}
                          </div>
                          <div className="s-profile-info-item">
                            <i className="fas fa-phone me-2"></i>
                            {studentData.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6 col-md-12 mb-4">
                    <div className="s-profile-card">
                      <div className="s-profile-card-body">
                        <h6 className="s-profile-card-title">Parent/Guardian</h6>
                        <p className="s-profile-card-description">Emergency contact information</p>
                        <div className="s-profile-info-list">
                          <div className="s-profile-info-item">
                            <i className="fas fa-user me-2"></i>
                            {studentData.parentName}
                          </div>
                          <div className="s-profile-info-item">
                            <i className="fas fa-envelope me-2"></i>
                            {studentData.parentEmail}
                          </div>
                          <div className="s-profile-info-item">
                            <i className="fas fa-phone me-2"></i>
                            {studentData.parentPhone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-4 col-md-12 mb-4">
                    <div className="s-profile-card">
                      <div className="s-profile-card-body">
                        <h6 className="s-profile-card-title">Total Lessons</h6>
                        <p className="s-profile-card-description">Lessons completed to date</p>
                        <div className="s-profile-stat-number">{studentData.totalLessons}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 col-md-12 mb-4">
                    <div className="s-profile-card">
                      <div className="s-profile-card-body">
                        <h6 className="s-profile-card-title">Attendance Rate</h6>
                        <p className="s-profile-card-description">Overall attendance percentage</p>
                        <div className="s-profile-stat-number">{studentData.attendance}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-4 col-md-12 mb-4">
                    <div className="s-profile-card">
                      <div className="s-profile-card-body">
                        <h6 className="s-profile-card-title">Badges Earned</h6>
                        <p className="s-profile-card-description">Achievement badges collected</p>
                        <div className="s-profile-stat-number">{studentBadges.reduce((sum, badge) => sum + badge.count, 0)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Badges Section */}
              <div className="s-profile-section">
                <h4 className="s-profile-section-title">Achievement Badges</h4>
                <div className="s-profile-card">
                  <div className="s-profile-card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="s-profile-card-title">Student Achievements</h6>
                        <p className="s-profile-card-description">Recognition badges earned by the student</p>
                      </div>
                      <button 
                        className="btn btn-dark s-profile-btn"
                        onClick={() => setShowBadgeModal(true)}
                      >
                        <i className="fas fa-award me-2"></i>
                        Assign Badge
                      </button>
                    </div>
                    
                    {studentBadges.length > 0 ? (
                      <div className="row">
                        {studentBadges.map((badge, index) => (
                          <div key={index} className="col-lg-4 col-md-6 col-12 mb-3">
                            <div className="s-profile-badge-card">
                              <div className="s-profile-badge-icon">
                                <i className="fas fa-award"></i>
                                {badge.count > 1 && (
                                  <span className="s-profile-badge-count">×{badge.count}</span>
                                )}
                              </div>
                              <div className="s-profile-badge-content">
                                <h6 className="s-profile-badge-name">{badge.name}</h6>
                                <small className="text-muted">Last awarded: {badge.dates[badge.dates.length - 1]}</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="s-profile-empty-state">
                        <i className="fas fa-award"></i>
                        <p>No badges assigned yet. Start recognizing achievements!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Reports Section */}
              <div className="s-profile-section">
                <h4 className="s-profile-section-title">Termly Progress Reports</h4>
                <div className="s-profile-card">
                  <div className="s-profile-card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="s-profile-card-title">Academic Progress</h6>
                        <p className="s-profile-card-description">Termly assessment reports and feedback</p>
                      </div>
                      <button 
                        className="btn btn-dark s-profile-btn"
                        onClick={() => setShowReportModal(true)}
                      >
                        <i className="fas fa-file-alt me-2"></i>
                        Create Report
                      </button>
                    </div>
                    
                    {previousReports.length > 0 ? (
                      <div className="row">
                        {previousReports.map((report, index) => (
                          <div key={index} className="col-lg-6 col-md-12 mb-3">
                            <div className="s-profile-report-card">
                              <div className="s-profile-report-header">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="s-profile-report-title">{report.term} Report</h6>
                                    <small className="text-muted">
                                      <i className="fas fa-calendar me-1"></i>
                                      {report.date}
                                    </small>
                                  </div>
                                  <div className="s-profile-report-rating">
                                    {renderStars(report.overallRating)}
                                  </div>
                                </div>
                              </div>
                              <div className="s-profile-report-summary">
                                <p>{report.progressSummary}</p>
                              </div>
                              <div className="s-profile-report-actions">
                                <button className="btn btn-outline-primary btn-sm me-2">
                                  <i className="fas fa-eye me-1"></i>
                                  View
                                </button>
                                <button className="btn btn-outline-secondary btn-sm">
                                  <i className="fas fa-download me-1"></i>
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="s-profile-empty-state">
                        <i className="fas fa-file-alt"></i>
                        <p>No progress reports yet. Create the first report!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Progress Report Modal */}
      {showReportModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-file-alt me-2"></i>
                  Create Termly Progress Report
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowReportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* Term Selection */}
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-calendar me-2"></i>
                      Term
                    </label>
                    <select 
                      className="form-select"
                      value={reportData.term}
                      onChange={(e) => setReportData(prev => ({ ...prev, term: e.target.value }))}
                    >
                      <option value="">Select term...</option>
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                      <option value="Term 4">Term 4</option>
                    </select>
                  </div>

                  {/* Progress Summary */}
                  <div className="mb-3">
                    <label className="form-label">Progress Summary (1-2 sentences)</label>
                    <textarea 
                      className="form-control"
                      rows="2"
                      value={reportData.progressSummary}
                      onChange={(e) => setReportData(prev => ({ ...prev, progressSummary: e.target.value }))}
                      placeholder="Brief overview of how the student has performed this term..."
                    ></textarea>
                  </div>

                  {/* Key Achievements */}
                  <div className="mb-3">
                    <label className="form-label">Key Achievements (select up to 3)</label>
                    <div className="s-profile-modal-list">
                      {Object.entries(reportData.keyAchievements).map(([key, achievement]) => (
                        <div key={key} className="s-profile-modal-item">
                          <div className="form-check">
                            <input 
                              className="form-check-input"
                              type="checkbox"
                              checked={achievement.selected}
                              onChange={(e) => handleAchievementChange(key, 'selected', e.target.checked)}
                            />
                            <label className="form-check-label">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                          </div>
                          {achievement.selected && (
                            <input 
                              type="text"
                              className="form-control form-control-sm mt-2"
                              placeholder="Optional note..."
                              value={achievement.note}
                              onChange={(e) => handleAchievementChange(key, 'note', e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="mb-3">
                    <label className="form-label">Areas for Improvement (1 sentence)</label>
                    <textarea 
                      className="form-control"
                      rows="2"
                      value={reportData.improvementAreas}
                      onChange={(e) => setReportData(prev => ({ ...prev, improvementAreas: e.target.value }))}
                      placeholder="What areas need focus for improvement..."
                    ></textarea>
                  </div>

                  {/* Next Term Goals */}
                  <div className="mb-3">
                    <label className="form-label">Next Term Goals (select up to 2)</label>
                    <div className="s-profile-modal-list">
                      {Object.entries(reportData.nextTermGoals).map(([key, goal]) => (
                        <div key={key} className="s-profile-modal-item">
                          <div className="form-check">
                            <input 
                              className="form-check-input"
                              type="checkbox"
                              checked={goal.selected}
                              onChange={(e) => handleGoalChange(key, 'selected', e.target.checked)}
                            />
                            <label className="form-check-label">
                              {key === 'customGoal' ? 'Custom goal' : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                          </div>
                          {goal.selected && (
                            <input 
                              type="text"
                              className="form-control form-control-sm mt-2"
                              placeholder={key === 'customGoal' ? 'Enter custom goal...' : 'Optional note...'}
                              value={goal.note}
                              onChange={(e) => handleGoalChange(key, 'note', e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Note */}
                  <div className="mb-3">
                    <label className="form-label">Attendance & Engagement</label>
                    <textarea 
                      className="form-control"
                      rows="2"
                      value={reportData.attendanceNote}
                      onChange={(e) => setReportData(prev => ({ ...prev, attendanceNote: e.target.value }))}
                      placeholder="Note about attendance and engagement this term..."
                    ></textarea>
                  </div>

                  {/* Overall Rating */}
                  <div className="mb-3">
                    <label className="form-label">Overall Progress Rating</label>
                    <div className="s-profile-rating-selector">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          className={`btn btn-outline-warning ${reportData.overallRating >= rating ? 'active' : ''}`}
                          onClick={() => setReportData(prev => ({ ...prev, overallRating: rating }))}
                        >
                          <i className="fas fa-star"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={submitReport}
                >
                  <i className="fas fa-save me-2"></i>
                  Save Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Assignment Modal */}
      {showBadgeModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-award me-2"></i>
                  Assign Achievement Badge
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowBadgeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="s-profile-badge-categories">
                  {Object.entries(groupedBadges).map(([category, badges]) => (
                    <div key={category} className="s-profile-badge-category">
                      <h6 className="s-profile-badge-category-title">{category}</h6>
                      <div className="s-profile-badge-options">
                        {badges.map((badge, index) => (
                          <div key={index} className="s-profile-badge-option">
                            <div className="form-check">
                              <input 
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedBadges.includes(badge.name)}
                                onChange={() => handleBadgeSelect(badge)}
                                id={`badge-${badge.name.replace(/\s+/g, '-')}`}
                              />
                              <label className="form-check-label" htmlFor={`badge-${badge.name.replace(/\s+/g, '-')}`}>
                                <strong>{badge.name}</strong>
                                <br />
                                <small className="text-muted">{badge.description}</small>
                              </label>
                            </div>
                            {selectedBadges.includes(badge.name) && (
                              <div className="mt-2">
                                <input 
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Why did the student earn this badge? (optional)"
                                  value={badgeNotes[badge.name] || ''}
                                  onChange={(e) => handleBadgeNoteChange(badge.name, e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBadgeModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={assignBadges}
                  disabled={selectedBadges.length === 0}
                >
                  <i className="fas fa-award me-2"></i>
                  Assign Badges ({selectedBadges.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;
