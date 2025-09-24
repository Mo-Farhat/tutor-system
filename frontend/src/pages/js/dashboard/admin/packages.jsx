import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminPackages from "../../../../components/dashboards/admin/packages/packages";

const AdminPackagesPage = () => {
  return (
    <div className="admin-packages-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <AdminPackages />
      </div>
    </div>
  );
};

export default AdminPackagesPage;
