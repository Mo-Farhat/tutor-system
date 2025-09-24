import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminTutors from "../../../../components/dashboards/admin/tutors/tutors";

const AdminTutorsPage = () => {
  return (
    <div className="admin-tutors-page-main">
      <div className="admin-notifications-nav-bar">
        {/* admin navbar */}
        <Snippets.AdminNavbar />
      </div>
      <div className="admin-tutors-content">
        {/* admin tutors */}
        <AdminTutors />
      </div>
    </div>
  );
};

export default AdminTutorsPage;
