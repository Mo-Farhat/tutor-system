import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorHome from "../../../../components/dashboards/tutor/home/home"


const TutoHomePage = () => {
    return (
      <div className="tutor-home-page-main">
        <div className="tutor-notifications-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-home-content">
          {/* tutor account-settings */}
          <TutorHome />
        </div>
        
      </div>
    );
  };
  
  export default TutoHomePage;