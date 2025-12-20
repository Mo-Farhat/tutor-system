import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import StudentRequests from "../../../../components/dashboards/tutor/requests/student-requests"
import "../../../../css/dashboards/tutor/requests/student-requests.css"

const TutorStudentRequestsPage = () => {
    return (
      <div className="tutor-student-requests-page-main">
        <div className="tutor-student-requests-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-student-requests-content">
          {/* student requests component */}
          <StudentRequests />
        </div>
        
      </div>
    );
  };
  
  export default TutorStudentRequestsPage;
