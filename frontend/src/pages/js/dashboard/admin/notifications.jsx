import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminNotifications from "../../../../components/dashboards/admin/notifications/notifications";

const AdminNotificationsPage = () => {
  return (
    <div className="admin-notifications-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <AdminNotifications />
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
