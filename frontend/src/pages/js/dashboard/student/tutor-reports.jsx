import React from "react";
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index";
import TutorReports from "../../../../components/dashboards/student/tutor-reports/tutor-reports";
import "../../../../css/dashboards/student/tutor-reports/tutor-reports-page.css";

const StudentTutorReportsPage = () => {
  return (
    <div className="student-tutor-reports-page-main">
      <div className="student-tutor-reports-nav-bar">
        {/* student navbar */}
        <Snippets.StudentNavbar />
      </div>
      <div className="student-tutor-reports-content">
        {/* student tutor reports */}
        <TutorReports />
      </div>
    </div>
  );
};

export default StudentTutorReportsPage;
