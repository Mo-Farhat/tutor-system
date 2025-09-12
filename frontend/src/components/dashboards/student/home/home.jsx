import React, { useState, useEffect } from 'react';
import '../../../../css/dashboards/student/home/home.css';

const assignedTutors = [
  {
    name: 'Dr. James Wilson',
    degree: 'Ph.D. in Mathematics',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    tags: [
      { label: 'Advanced Calculus', color: 'primary' },
      { label: 'Linear Algebra', color: 'primary' },
    ],
    email: 'j.wilson@email.com',
    phone: '+1 (555) 123-4567',
    nextSession: 'Today, 3:00 PM',
    status: 'Active'
  },
  {
    name: 'Prof. Sarah Chen',
    degree: 'M.Sc. in Physics',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    tags: [
      { label: 'Quantum Physics', color: 'purple' },
      { label: 'Mechanics', color: 'purple' },
    ],
    email: 's.chen@email.com',
    phone: '+1 (555) 987-6543',
    nextSession: 'Tomorrow, 10:00 AM',
    status: 'Active'
  },
  {
    name: 'Dr. Michael Brown',
    degree: 'Ph.D. in Chemistry',
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
    tags: [
      { label: 'Organic Chemistry', color: 'success' },
      { label: 'Biochemistry', color: 'success' },
    ],
    email: 'm.brown@email.com',
    phone: '+1 (555) 456-7890',
    nextSession: 'Friday, 2:30 PM',
    status: 'Active'
  },
  {
    name: 'Prof. Emily Taylor',
    degree: 'M.A. in Literature',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    tags: [
      { label: 'English Literature', color: 'danger' },
      { label: 'Creative Writing', color: 'danger' },
    ],
    email: 'e.taylor@email.com',
    phone: '+1 (555) 234-5678',
    nextSession: 'Monday, 11:00 AM',
    status: 'Active'
  },
];

function StudentHome() {
    return (
        <div className="student-home-container container-fluid">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-11">
                    <div className="student-home-content">
                        <h3 className="student-home-section-title mb-4">Your Assigned Tutors</h3>
                        <div className="row g-4">
                            {assignedTutors.map((tutor, idx) => (
                                <div className="col-12 col-md-6" key={idx}>
                                    <div className="student-home-card d-flex align-items-center p-3">
                                        <div className="student-home-avatar me-3 flex-shrink-0">
                                            <img src={tutor.avatar} alt={tutor.name} className="student-home-avatar-img" />
                                        </div>
                                        <div className="student-home-card-body flex-grow-1">
                                            <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
                                                <div className="student-home-card-title">{tutor.name}</div>
                                                <span className="student-home-status-badge">{tutor.status}</span>
                                            </div>
                                            <div className="student-home-card-degree mb-2">{tutor.degree}</div>
                                            <div className="mb-2">
                                                {tutor.tags.map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className={`student-home-tag student-home-tag-${tag.color} me-2 mb-1`}
                                                    >
                                                        {tag.label}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="student-home-next-session mb-2">
                                                <i className="fas fa-clock me-1"></i>
                                                <strong>Next Session:</strong> {tutor.nextSession}
                                            </div>
                                            <div className="student-home-card-contact d-flex flex-wrap align-items-center gap-3">
                                                <span className="student-home-card-email">
                                                    <i className="fas fa-envelope me-1"></i> {tutor.email}
                                                </span>
                                                <span className="student-home-card-phone">
                                                    <i className="fas fa-phone me-1"></i> {tutor.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentHome;
