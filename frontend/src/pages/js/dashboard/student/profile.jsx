import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentProfileManagement from "../../../../components/dashboards/student/profile/profile"


const StudentProfileManagementPage = () => {
    return (
      <div className="student-profile-management-page-main">
        <div className="student-profile-management-nav-bar">
          {/* student navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-profile-management-content">
          {/* student profile management */}
          <StudentProfileManagement />
        </div>
        
      </div>
    );
  };
  
  export default StudentProfileManagementPage;