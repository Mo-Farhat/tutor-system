import React from "react"
import * as Snippets from "../../../../components/dashboards/tutor/snippets/snippets-index"
import StudentRequests from "../../../../components/dashboards/tutor/requests/student-requests"
import "../../../../css/dashboards/tutor/requests/student-requests.css"

const TutorStudentRequestsPage = () => {
    return (
      <div className="tutor-student-requests-page-main">
        <div className="tutor-student-requests-nav-bar">
          {/* tutor navbar */}
          <Snippets.TutorNavbar2 />
        </div>
        <div className="tutor-student-requests-content">
          <div className="tutor-student-requests-container">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="tutor-student-requests-main-content">
                    {/* student requests component */}
                    <StudentRequests />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    );
  };
  
  export default TutorStudentRequestsPage;
