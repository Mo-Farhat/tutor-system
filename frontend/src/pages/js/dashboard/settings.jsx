import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorSettings from "../../../../components/dashboards/tutor/account-settings/settings"
import "../../../css/dashboards/tutor/settings.css"


const SettingsPage = () => {
    return (
      <div className="tutor-settings-page-main">
        <div className="tutor-settings-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-account-settinngs-content w-100">
          {/* tutor account-settings */}
        </div>
        
      </div>
    );
  };
  
  export default SettingsPage;