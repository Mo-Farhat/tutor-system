import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminSettings from "../../../../components/dashboards/admin/settings/settings";

const AdminSettingsPage = () => {
  return (
    <div className="admin-settings-page-main">
      <div className="admin-notifications-nav-bar">
        {/* admin navbar */}
        <Snippets.AdminNavbar />
      </div>
      <div className="admin-settings-content">
        {/* admin settings */}
        <AdminSettings />
      </div>
    </div>
  );
};

export default AdminSettingsPage;
