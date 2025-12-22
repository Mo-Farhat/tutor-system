import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import TierManagement from "../../../../components/dashboards/admin/finance/TierManagement";

const AdminTiersPage = () => {
  return (
    <div className="admin-finance-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <TierManagement />
      </div>
    </div>
  );
};

export default AdminTiersPage;
