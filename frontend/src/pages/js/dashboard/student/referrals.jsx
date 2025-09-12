import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentReferrals from "../../../../components/dashboards/student/referrals/referrals"


const StudentReferralsPage = () => {
    return (
      <div className="student-referrals-page-main">
        <div className="student-referrals-nav-bar">
          {/* tutor navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-referrals-content">
          {/* student referrals */}
          <StudentReferrals />
        </div>
        
      </div>
    );
  };
  
  export default StudentReferralsPage;