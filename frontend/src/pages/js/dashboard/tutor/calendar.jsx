import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import TutorCalendar from "../../../../components/dashboards/tutor/calendar/calendar"


const TutorCalendarPage = () => {
    return (
      <div className="tutor-calendar-page-main">
        <div className="tutor-calendar-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-calendar-content">
          {/* tutor account-settings */}
          <TutorCalendar />
        </div>
        
      </div>
    );
  };
  
  export default TutorCalendarPage;