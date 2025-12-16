import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminSubjects from "../../../../components/dashboards/admin/subjects/subjects";

const AdminSubjectsPage = () => {
  return (
    <div className="admin-subjects-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <AdminSubjects />
      </div>
    </div>
  );
};

export default AdminSubjectsPage;
