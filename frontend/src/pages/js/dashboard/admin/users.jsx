import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminUsers from "../../../../components/dashboards/admin/users/users";

const AdminUsersPage = () => {
  return (
    <div className="admin-users-page-main">
      <div className="admin-users-nav-bar">
        <Snippets.AdminNavbar />
      </div>
      <div className="admin-users-content">
        <AdminUsers />
      </div>
    </div>
  );
};

export default AdminUsersPage;
