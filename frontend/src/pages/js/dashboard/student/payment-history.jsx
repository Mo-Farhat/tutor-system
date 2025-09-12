import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentPaymentHistory from "../../../../components/dashboards/student/payment-history/payment-history"


const StudentPaymentHistoryPage = () => {
    return (
      <div className="student-payment-history-page-main">
        <div className="student-payment-history-nav-bar">
          {/* tutor navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-payment-history-content">
          {/* student payment history */}
          <StudentPaymentHistory />
        </div>
        
      </div>
    );
  };
  
  export default StudentPaymentHistoryPage;