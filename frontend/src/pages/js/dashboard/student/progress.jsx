import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentProgressMilestones from "../../../../components/dashboards/student/progress/progress"


const StudentProgressMilestonesPage = () => {
    return (
      <div className="student-progress-milestones-page-main">
        <div className="student-progress-milestones-nav-bar">
          {/* student navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-progress-milestones-content">
          {/* student progress milestones */}
          <StudentProgressMilestones />
        </div>
        
      </div>
    );
  };
  
  export default StudentProgressMilestonesPage;