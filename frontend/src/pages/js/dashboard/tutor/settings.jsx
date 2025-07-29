import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorSettings from "../../../../components/dashboards/tutor/account-settings/settings"


const TutorSettingsPage = () => {
    return (
      <div className="tutor-settings-page-main">
        <div className="tutor-settings-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-settinngs-content">
          {/* tutor account-settings */}
          <TutorSettings />
        </div>
        
      </div>
    );
  };
  
  export default TutorSettingsPage;