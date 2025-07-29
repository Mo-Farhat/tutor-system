import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorProfile from "../../../../components/dashboards/tutor/profile/profile"

const TutorProfilePage = () => {
    return (
      <div className="tutor-profile-page-main">
        <div className="tutor-profile-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-profile-content">
          {/* tutor account-settings */}
          <TutorProfile />
        </div>
        
      </div>
    );
  };
  
  export default TutorProfilePage;