import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorStudents from "../../../../components/dashboards/tutor/students/students"


const TutorStudentsPage = () => {
    return (
      <div className="tutor-students-page-main">
        <div className="tutor-students-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-students-content">
          {/* tutor account-settings */}
          <TutorStudents />
        </div>
        
      </div>
    );
  };
  
  export default TutorStudentsPage;