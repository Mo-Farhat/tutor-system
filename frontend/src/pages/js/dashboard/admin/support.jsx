import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminSupport from "../../../../components/dashboards/admin/support/support";

const AdminSupportPage = () => {
  return (
    <div className="admin-support-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <AdminSupport />
      </div>
    </div>
  );
};

export default AdminSupportPage;
