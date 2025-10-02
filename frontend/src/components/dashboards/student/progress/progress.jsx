import React, { useState, useEffect } from 'react';
import studentService from '../../../../services/studentService';
import '../../../../css/dashboards/student/progress/progress.css';

function StudentProgressMilestones() {
    // Student achievement data
    const [achievementStats, setAchievementStats] = useState({
        currentStreak: 28,
        streakTarget: 30,
        totalLearningTime: 47,
        learningTimeTarget: 50,
        badgesEarned: 0,
        badgesTarget: 20
    });

    // Available badges from tutor system (loaded from API)
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Recent achievements
    const [recentAchievements] = useState([
        {
            title: 'Perfect Attendance',
            description: 'Maintained 100% attendance this month',
            dateAchieved: 'Apr 25, 2025',
            icon: '⭐',
            type: 'attendance'
        },
        {
            title: '40 Hours Milestone',
            description: 'Completed 40 hours of learning',
            dateAchieved: 'Apr 20, 2025',
            icon: '🕐',
            type: 'milestone'
        },
        {
            title: '5-Star Rating',
            description: 'Received excellent feedback from tutor',
            dateAchieved: 'Apr 15, 2025',
            icon: '⭐',
            type: 'feedback'
        }
    ]);

    // Badge categories for filtering
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [badgeCategories, setBadgeCategories] = useState(['All']);

    // Load achievements data from backend
    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await studentService.getAchievements();
            if (response.success) {
                // Transform backend data to frontend format
                const transformedBadges = response.data.map(studentBadge => ({
                    id: studentBadge.id,
                    name: studentBadge.badge.name,
                    description: studentBadge.badge.description || 'Achievement earned',
                    dateEarned: studentBadge.awardedAt,
                    category: getCategoryFromBadgeCode(studentBadge.badge.code),
                    icon: getIconForBadge(studentBadge.badge.code) || studentBadge.badge.iconUrl || '🏆',
                    tutorNote: studentBadge.note,
                    count: studentBadge.count,
                    tutorName: studentBadge.tutor ? `${studentBadge.tutor.firstName} ${studentBadge.tutor.lastName}` : null
                }));

                setEarnedBadges(transformedBadges);

                // Update achievement stats
                setAchievementStats(prev => ({
                    ...prev,
                    badgesEarned: transformedBadges.length
                }));

                // Extract unique categories from badges
                const categories = ['All', ...new Set(transformedBadges.map(badge => badge.category).filter(Boolean))];
                setBadgeCategories(categories);
            } else {
                setError(response.error || 'Failed to load achievements');
            }
        } catch (err) {
            console.error('Error loading achievements:', err);
            setError('Failed to load achievements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get category from badge code
    const getCategoryFromBadgeCode = (code) => {
        if (!code) return 'General';
        const lowerCode = code.toLowerCase();
        
        if (lowerCode.includes('attendance') || lowerCode.includes('punctual') || lowerCode.includes('early')) return 'Attendance';
        if (lowerCode.includes('streak') || lowerCode.includes('consistent')) return 'Streaks';
        if (lowerCode.includes('homework') || lowerCode.includes('dedication')) return 'Dedication';
        if (lowerCode.includes('milestone') || lowerCode.includes('session') || lowerCode.includes('hour')) return 'Milestones';
        if (lowerCode.includes('academic') || lowerCode.includes('concept') || lowerCode.includes('subject')) return 'Academic';
        
        return 'General';
    };

    // Helper function to get icon for badge
    const getIconForBadge = (code) => {
        if (!code) return '🏆';
        const lowerCode = code.toLowerCase();
        
        if (lowerCode.includes('early')) return '🌅';
        if (lowerCode.includes('book') || lowerCode.includes('read')) return '📚';
        if (lowerCode.includes('streak') || lowerCode.includes('consistent')) return '📅';
        if (lowerCode.includes('concept') || lowerCode.includes('master')) return '🎯';
        if (lowerCode.includes('problem') || lowerCode.includes('solve')) return '🧩';
        if (lowerCode.includes('homework')) return '📝';
        if (lowerCode.includes('attendance')) return '⭐';
        if (lowerCode.includes('time') || lowerCode.includes('hour')) return '⏰';
        if (lowerCode.includes('champion')) return '🏆';
        if (lowerCode.includes('star') || lowerCode.includes('rating')) return '⭐';
        
        return '🏆';
    };

    // Filter badges by category
    const filteredBadges = selectedCategory === 'All' 
        ? earnedBadges 
        : earnedBadges.filter(badge => badge.category === selectedCategory);

    // Calculate progress percentages
    const streakProgress = (achievementStats.currentStreak / achievementStats.streakTarget) * 100;
    const learningTimeProgress = (achievementStats.totalLearningTime / achievementStats.learningTimeTarget) * 100;
    const badgeProgress = (achievementStats.badgesEarned / achievementStats.badgesTarget) * 100;

    // Loading state
    if (loading) {
        return (
            <div className="student-progress-dashboard">
                <div className="student-progress-content">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading your achievements...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="student-progress-dashboard">
                <div className="student-progress-content">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Error Loading Achievements</h4>
                        <p>{error}</p>
                        <hr />
                        <button className="btn btn-outline-danger" onClick={loadAchievements}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-progress-dashboard">
            <div className="student-progress-content">
                <div className="student-progress-section">
                    <h4 className="student-progress-section-title">Your Achievements</h4>
                    <p className="student-progress-section-subtitle">Track your progress and earn badges as you learn</p>
                </div>

                {/* Achievement Statistics */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                        <div className="card student-progress-stat-card h-100">
                            <div className="card-body">
                                <div className="student-progress-stat-icon">🔥</div>
                                <div className="student-progress-stat-title">{achievementStats.currentStreak} Days</div>
                                <div className="student-progress-stat-subtitle">Current Streak</div>
                                <div className="student-progress-progress-container">
                                    <div className="progress student-progress-progress">
                                        <div 
                                            className="progress-bar student-progress-progress-streak" 
                                            style={{width: `${streakProgress}%`}}
                                        ></div>
                                    </div>
                                    <div className="student-progress-progress-text">
                                        {achievementStats.streakTarget - achievementStats.currentStreak} days until next milestone
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card student-progress-stat-card h-100">
                            <div className="card-body">
                                <div className="student-progress-stat-icon">⏰</div>
                                <div className="student-progress-stat-title">{achievementStats.totalLearningTime} Hours</div>
                                <div className="student-progress-stat-subtitle">Total Learning Time</div>
                                <div className="student-progress-progress-container">
                                    <div className="progress student-progress-progress">
                                        <div 
                                            className="progress-bar student-progress-progress-time" 
                                            style={{width: `${learningTimeProgress}%`}}
                                        ></div>
                                    </div>
                                    <div className="student-progress-progress-text">
                                        {achievementStats.learningTimeTarget - achievementStats.totalLearningTime} hours until next badge
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card student-progress-stat-card h-100">
                            <div className="card-body">
                                <div className="student-progress-stat-icon">⭐</div>
                                <div className="student-progress-stat-title">{achievementStats.badgesEarned} Badges</div>
                                <div className="student-progress-stat-subtitle">Earned So Far</div>
                                <div className="student-progress-progress-container">
                                    <div className="progress student-progress-progress">
                                        <div 
                                            className="progress-bar student-progress-progress-badges" 
                                            style={{width: `${badgeProgress}%`}}
                                        ></div>
                                    </div>
                                    <div className="student-progress-progress-text">
                                        {achievementStats.badgesTarget - achievementStats.badgesEarned} badges to next level
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Your Badges Section */}
                <div className="student-progress-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="student-progress-subsection-title">Your Badges</h5>
                        <div className="student-progress-filter-buttons">
                            {badgeCategories.map(category => (
                                <button
                                    key={category}
                                    className={`btn student-progress-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="row g-3 mb-4">
                        {filteredBadges.map((badge, index) => (
                            <div key={index} className="col-6 col-md-4 col-lg-3">
                                <div className="card student-progress-badge-card h-100">
                                    <div className="card-body text-center">
                                        <div className="student-progress-badge-icon">{badge.icon}</div>
                                        <h6 className="student-progress-badge-title">{badge.name}</h6>
                                        <p className="student-progress-badge-description">{badge.description}</p>
                                        <div className="student-progress-badge-category">{badge.category}</div>
                                        <div className="student-progress-badge-date">
                                            Earned on {new Date(badge.dateEarned).toLocaleDateString()}
                                        </div>
                                        {badge.tutorNote && (
                                            <div className="student-progress-badge-note">
                                                <small className="text-muted">"{badge.tutorNote}"</small>
                                            </div>
                                        )}
                                        {badge.tutorName && (
                                            <div className="student-progress-badge-tutor">
                                                <small className="text-muted">Awarded by: {badge.tutorName}</small>
                                            </div>
                                        )}
                                        {badge.count > 1 && (
                                            <div className="student-progress-badge-count">
                                                <small className="text-primary">×{badge.count}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredBadges.length === 0 && (
                        <div className="student-progress-empty-state">
                            <div className="student-progress-empty-icon">🏆</div>
                            <h6>{selectedCategory === 'All' ? 'No badges earned yet' : `No badges in ${selectedCategory} category yet`}</h6>
                            <p>Keep learning to earn more badges!</p>
                            {earnedBadges.length === 0 && (
                                <button className="btn btn-outline-primary" onClick={loadAchievements}>
                                    <i className="fas fa-sync-alt me-2"></i>Refresh
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Achievements */}
                <div className="card student-progress-achievements-card">
                    <div className="card-body">
                        <div className="student-progress-achievements-title mb-3">Recent Achievements</div>
                        <div className="student-progress-achievements-list">
                            {recentAchievements.map((achievement, index) => (
                                <div key={index} className="student-progress-achievement-item">
                                    <div className="student-progress-achievement-icon">
                                        {achievement.icon}
                                    </div>
                                    <div className="student-progress-achievement-content">
                                        <h6 className="student-progress-achievement-title">{achievement.title}</h6>
                                        <p className="student-progress-achievement-description">{achievement.description}</p>
                                        <small className="student-progress-achievement-date">
                                            Achieved on {achievement.dateAchieved}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Achievement Goals */}
                <div className="card mt-4 student-progress-goals-card">
                    <div className="card-body">
                        <div className="student-progress-goals-title mb-3">Upcoming Goals</div>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="student-progress-goal-item">
                                    <div className="student-progress-goal-icon">🎯</div>
                                    <h6 className="student-progress-goal-title">Master Badge</h6>
                                    <p className="student-progress-goal-description">Complete 100 lessons to unlock</p>
                                    <div className="student-progress-goal-progress">
                                        <div className="progress">
                                            <div className="progress-bar bg-warning" style={{width: '47%'}}></div>
                                        </div>
                                        <small className="text-muted">47/100 lessons</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="student-progress-goal-item">
                                    <div className="student-progress-goal-icon">📈</div>
                                    <h6 className="student-progress-goal-title">Learning Champion</h6>
                                    <p className="student-progress-goal-description">Reach 60 hours of learning</p>
                                    <div className="student-progress-goal-progress">
                                        <div className="progress">
                                            <div className="progress-bar bg-success" style={{width: '78%'}}></div>
                                        </div>
                                        <small className="text-muted">47/60 hours</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="student-progress-goal-item">
                                    <div className="student-progress-goal-icon">🔥</div>
                                    <h6 className="student-progress-goal-title">Streak Master</h6>
                                    <p className="student-progress-goal-description">Maintain 60-day streak</p>
                                    <div className="student-progress-goal-progress">
                                        <div className="progress">
                                            <div className="progress-bar bg-danger" style={{width: '47%'}}></div>
                                        </div>
                                        <small className="text-muted">28/60 days</small>
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

export default StudentProgressMilestones;
