import React from 'react';
import '../../../../css/dashboards/tutor/students/students.css';

const tutors = [
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
  },
];

function TutorStudents() {
  return (
    <div className="tutor-students-container container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="tutor-students-content">
            <h3 className="tutor-students-section-title mb-4">Your Assigned Students</h3>
            <div className="row g-4">
              {tutors.map((tutor, idx) => (
                <div className="col-12 col-md-6" key={idx}>
                  <div className="tutor-students-card d-flex align-items-center p-3">
                    <div className="tutor-students-avatar me-3 flex-shrink-0">
                      <img src={tutor.avatar} alt={tutor.name} className="tutor-students-avatar-img" />
                    </div>
                    <div className="tutor-students-card-body flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
                        <div className="tutor-students-card-title">{tutor.name}</div>
                      </div>
                      <div className="tutor-students-card-degree mb-2">{tutor.degree}</div>
                      <div className="mb-2">
                        {tutor.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={`tutor-students-tag tutor-students-tag-${tag.color} me-2 mb-1`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                      <div className="tutor-students-card-contact d-flex flex-wrap align-items-center gap-3">
                        <span className="tutor-students-card-email">
                          <i className="fas fa-envelope me-1"></i> {tutor.email}
                        </span>
                        <span className="tutor-students-card-phone">
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

export default TutorStudents;
