import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentProfileDetails from "../../../../components/dashboards/student/profile-details/profile-details"

const StudentProfileDetailsPage = () => {
    return (
      <div className="student-profile-details-page-main">
        <div className="student-profile-details-nav-bar">
          {/* student navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-profile-details-content">
          {/* student profile details */}
          <StudentProfileDetails />
        </div>
        
      </div>
    );
  };
  
  export default StudentProfileDetailsPage;
