import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import TutorRequests from "../../../../components/dashboards/student/tutor-requests/tutor-requests"
import "../../../../css/dashboards/student/tutor-requests/tutor-requests.css"

const StudentTutorRequestsPage = () => {
    return (
      <div className="student-tutor-requests-page-main">
        <div className="student-tutor-requests-nav-bar">
          {/* student navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-tutor-requests-content">
          <div className="student-tutor-requests-container">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="student-tutor-requests-main-content">
                    {/* tutor requests component */}
                    <TutorRequests />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    );
  };
  
  export default StudentTutorRequestsPage;
