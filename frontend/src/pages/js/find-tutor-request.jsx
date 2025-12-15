import React from "react";
import FindTutorRequest from "../../components/find-tutor/findt-request";
import * as Snippets from "../../components/snippets/snippets-index";

const FindTutorRequestPage = () => {
  return (
    <div className="find-tutor-request-container">
      <Snippets.Navbar />
      <FindTutorRequest />
      <Snippets.Footer />
    </div>
  );
};

export default FindTutorRequestPage;
