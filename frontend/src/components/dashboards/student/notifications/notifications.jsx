import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/student/notifications/notifications.css';

function StudentNotifications() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'success',
            title: 'Session Confirmed',
            message: 'Your tutoring session with Dr. Sarah Johnson has been confirmed for tomorrow at 2:00 PM',
            time: '1 hour ago',
            read: false,
            icon: '📅'
        },
        {
            id: 2,
            type: 'info',
            title: 'Payment Processed',
            message: 'Your payment of $120 for this month\'s tutoring package has been processed successfully',
            time: '3 hours ago',
            read: true,
            icon: '💳'
        },
        {
            id: 3,
            type: 'warning',
            title: 'Assignment Reminder',
            message: 'Don\'t forget to submit your Chemistry homework before the next session',
            time: '1 day ago',
            read: false,
            icon: '📝'
        },
        {
            id: 4,
            type: 'success',
            title: 'Progress Update',
            message: 'Great job! You\'ve completed 80% of your Mathematics curriculum',
            time: '2 days ago',
            read: true,
            icon: '🎯'
        },
        {
            id: 5,
            type: 'info',
            title: 'New Tutor Assigned',
            message: 'Dr. Michael Chen has been assigned as your new Physics tutor',
            time: '3 days ago',
            read: true,
            icon: '👨‍🏫'
        },
        {
            id: 6,
            type: 'warning',
            title: 'Session Rescheduled',
            message: 'Your session with Dr. Sarah Johnson has been moved to Friday at 3:00 PM',
            time: '4 days ago',
            read: true,
            icon: '🔄'
        },
        {
            id: 7,
            type: 'success',
            title: 'Achievement Unlocked',
            message: 'Congratulations! You\'ve earned the "Consistent Learner" badge',
            time: '1 week ago',
            read: true,
            icon: '🏆'
        }
    ]);

    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === id 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesFilter = filter === 'all' || 
            (filter === 'unread' && !notification.read) ||
            (filter === 'read' && notification.read);
        
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesFilter && matchesSearch;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="student-notifications-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="student-notifications-content">
                            
                            {/* Header Section */}
                            <div className="student-notifications-section">
                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <div>
                                        <h4 className="student-notifications-section-title">Notifications</h4>
                                        <p className="student-notifications-subtitle text-muted mb-0">
                                            {unreadCount} unread notifications
                                        </p>
                                    </div>
                                    <div className="student-notifications-actions">
                                        <button 
                                            className="btn btn-dark student-notifications-btn"
                                            onClick={markAllAsRead}
                                        >
                                            <i className="fas fa-check me-2"></i>
                                            Mark all as read
                                        </button>
                                        <button className="btn btn-outline-dark student-notifications-btn ms-2">
                                            <i className="fas fa-cog"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Filters and Search Section */}
                            <div className="student-notifications-section">
                                <div className="student-notifications-card">
                                    <div className="student-notifications-card-body">
                                        <div className="row g-3">
                                            <div className="col-lg-6 col-md-12">
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <i className="fas fa-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control student-notifications-search"
                                                        placeholder="Search notifications..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-12">
                                                <div className="btn-group w-100" role="group">
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="filter"
                                                        id="filter-all"
                                                        checked={filter === 'all'}
                                                        onChange={() => setFilter('all')}
                                                    />
                                                    <label className="btn btn-outline-dark" htmlFor="filter-all">
                                                        All
                                                    </label>
                                                    
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="filter"
                                                        id="filter-unread"
                                                        checked={filter === 'unread'}
                                                        onChange={() => setFilter('unread')}
                                                    />
                                                    <label className="btn btn-outline-dark" htmlFor="filter-unread">
                                                        Unread
                                                    </label>
                                                    
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="filter"
                                                        id="filter-read"
                                                        checked={filter === 'read'}
                                                        onChange={() => setFilter('read')}
                                                    />
                                                    <label className="btn btn-outline-dark" htmlFor="filter-read">
                                                        Read
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications List Section */}
                            <div className="student-notifications-section">
                                <div className="student-notifications-card">
                                    <div className="student-notifications-card-body">
                                        {filteredNotifications.length === 0 ? (
                                            <div className="text-center py-5">
                                                <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                                                <h5 className="text-muted">No notifications found</h5>
                                                <p className="text-muted">Try adjusting your filters or search terms</p>
                                            </div>
                                        ) : (
                                            <div className="student-notifications-list">
                                                {filteredNotifications.map(notification => (
                                                    <div 
                                                        key={notification.id} 
                                                        className={`student-notifications-item ${!notification.read ? 'student-notifications-unread' : ''}`}
                                                    >
                                                        <div className="row align-items-center">
                                                            <div className="col-auto">
                                                                <div className={`student-notifications-icon student-notifications-icon-${notification.type}`}>
                                                                    <span className="fs-4">{notification.icon}</span>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div className="flex-grow-1">
                                                                        <h6 className={`student-notifications-item-title mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                                                                            {notification.title}
                                                                            {!notification.read && (
                                                                                <span className="badge bg-primary ms-2">New</span>
                                                                            )}
                                                                        </h6>
                                                                        <p className="student-notifications-item-message text-muted mb-1">
                                                                            {notification.message}
                                                                        </p>
                                                                        <small className="text-muted">
                                                                            {notification.time}
                                                                        </small>
                                                                    </div>
                                                                    <div className="student-notifications-item-actions">
                                                                        {!notification.read && (
                                                                            <button
                                                                                className="btn btn-sm btn-outline-dark me-2"
                                                                                onClick={() => markAsRead(notification.id)}
                                                                                title="Mark as read"
                                                                            >
                                                                                <i className="fas fa-check"></i>
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => deleteNotification(notification.id)}
                                                                            title="Delete notification"
                                                                        >
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pagination Section */}
                            {filteredNotifications.length > 0 && (
                                <div className="student-notifications-section">
                                    <div className="student-notifications-card">
                                        <div className="student-notifications-card-body">
                                            <nav aria-label="Notifications pagination">
                                                <ul className="pagination justify-content-center mb-0">
                                                    <li className="page-item disabled">
                                                        <span className="page-link">
                                                            <i className="fas fa-chevron-left"></i>
                                                        </span>
                                                    </li>
                                                    <li className="page-item active">
                                                        <span className="page-link">1</span>
                                                    </li>
                                                    <li className="page-item">
                                                        <a className="page-link" href="#">2</a>
                                                    </li>
                                                    <li className="page-item">
                                                        <a className="page-link" href="#">3</a>
                                                    </li>
                                                    <li className="page-item">
                                                        <a className="page-link" href="#">
                                                            <i className="fas fa-chevron-right"></i>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentNotifications;
