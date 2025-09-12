import React from "react"
import * as Snippets from "../../../../components/dashboards/student/snippets/snippets-index"
import StudentPaymentMethods from "../../../../components/dashboards/student/payment-methods/payment-methods"


const StudentPaymentMethodsPage = () => {
    return (
      <div className="student-payment-methods-page-main">
        <div className="student-payment-methods-nav-bar">
          {/* tutor navbar */}
          <Snippets.StudentNavbar />
        </div>
        <div className="student-payment-methods-content">
          {/* student payment methods */}
          <StudentPaymentMethods />
        </div>
        
      </div>
    );
  };
  
  export default StudentPaymentMethodsPage;