import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorProgress from "../../../../components/dashboards/tutor/progress/progress"


const TutorProgressPage = () => {
    return (
      <div className="tutor-progress-page-main">
        <div className="tutor-progress-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-progress-content">
          {/* tutor account-settings */}
          <TutorProgress />
        </div>
        
      </div>
    );
  };
  
  export default TutorProgressPage;