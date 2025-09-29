import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminStudents from "../../../../components/dashboards/admin/students/students";

const AdminStudentsPage = () => {
  return (
    <div className="admin-students-page-main">
      <div className="admin-notifications-nav-bar">
        {/* admin navbar */}
        <Snippets.AdminNavbar />
      </div>
      <div className="admin-students-content">
        {/* admin students */}
        <AdminStudents />
      </div>
    </div>
  );
};

export default AdminStudentsPage;
