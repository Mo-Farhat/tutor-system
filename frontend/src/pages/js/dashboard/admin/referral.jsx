import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminReferral from "../../../../components/dashboards/admin/referral/referral";

const AdminReferralPage = () => {
  return (
    <div className="admin-referral-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <AdminReferral />
      </div>
    </div>
  );
};

export default AdminReferralPage;
