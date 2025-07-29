import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorNotifications from "../../../../components/dashboards/tutor/notifications/notifications"


const TutorNotificationsPage = () => {
    return (
      <div className="tutor-notifications-page-main">
        <div className="tutor-notifications-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-notifications-content">
          {/* tutor account-settings */}
          <TutorNotifications />
        </div>
        
      </div>
    );
  };
  
  export default TutorNotificationsPage;