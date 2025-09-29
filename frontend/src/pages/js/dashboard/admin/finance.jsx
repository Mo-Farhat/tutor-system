import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminFinance from "../../../../components/dashboards/admin/finance/finance";

const AdminFinancePage = () => {
  return (
    <div className="admin-finance-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <AdminFinance />
      </div>
    </div>
  );
};

export default AdminFinancePage;
