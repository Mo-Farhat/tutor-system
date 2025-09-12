import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentNotifications from "../../../../components/dashboards/student/notifications/notifications"

const StudentNotificationsPage = () => {
    return (
      <div className="student-notifications-page-main">
        <div className="student-notifications-nav-bar">
          {/* student navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-notifications-content">
          {/* student notifications */}
          <StudentNotifications />
        </div>
        
      </div>
    );
  };
  
  export default StudentNotificationsPage;
