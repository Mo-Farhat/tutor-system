import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminAssignments from "../../../../components/dashboards/admin/assignments/assignments";
import "../../../../css/dashboards/admin/assignments/assignments.css";

function AdminAssignmentsPage() {
  return (
    <div className="admin-assignments-page-main">
      <div className="admin-notifications-nav-bar">
        {/* admin navbar */}
        <Snippets.AdminNavbar />
      </div>
      <div className="admin-assignments-content">
        {/* admin assignments */}
        <AdminAssignments />
      </div>
    </div>
  );
}

export default AdminAssignmentsPage;