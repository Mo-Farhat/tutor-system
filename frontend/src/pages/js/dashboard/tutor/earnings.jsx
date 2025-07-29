import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorEarnings from "../../../../components/dashboards/tutor/earnings/earnings"


const TutorEarningsPage = () => {
    return (
      <div className="tutor-notifications-page-main">
        <div className="tutor-notifications-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-earnings-content">
          {/* tutor account-settings */}
          <TutorEarnings />
        </div>
        
      </div>
    );
  };
  
  export default TutorEarningsPage;