import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentHome from "../../../../components/dashboards/student/home/home"


const StudentHomePage = () => {
    return (
      <div className="student-home-page-main">
        <div className="student-notifications-nav-bar">
          {/* tutor navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="tutor-home-content">
          {/* tutor account-settings */}
          <StudentHome />
        </div>
        
      </div>
    );
  };
  
  export default StudentHomePage;