import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentScheduling from "../../../../components/dashboards/student/scheduling/scheduling"


const StudentSchedulingPage = () => {
    return (
      <div className="student-scheduling-page-main">
        <div className="student-scheduling-nav-bar">
          {/* tutor navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-scheduling-content">
          {/* student scheduling */}
          <StudentScheduling />
        </div>
        
      </div>
    );
  };
  
  export default StudentSchedulingPage;