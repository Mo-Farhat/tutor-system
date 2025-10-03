import React from "react";
import StudentNavbar from "../../../../components/dashboards/student/snippets/navbar";
import TutorReports from "../../../../components/dashboards/student/tutor-reports/tutor-reports";
import "../../../../css/dashboards/student/snippets/navbar.css";

function StudentTutorReportsPage() {
  return (
    <>
      <StudentNavbar />
      <div className="student-dashboard-content">
        <TutorReports />
      </div>
    </>
  );
}

export default StudentTutorReportsPage;