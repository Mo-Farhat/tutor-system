import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import StudentProfile from "../../../../components/dashboards/tutor/students/s-profile"


const StudentProfilePage = () => {
    return (
      <div className="s-profile-page-main">
        <div className="s-profile-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="s-profile-content">
          {/* tutor account-settings */}
          <StudentProfile />
        </div>
        
      </div>
    );
  };
  
  export default StudentProfilePage;