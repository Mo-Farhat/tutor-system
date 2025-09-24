import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminHome from "../../../../components/dashboards/admin/home/home";

const AdminHomePage = () => {
  return (
    <div className="admin-home-page-main">
      <div className="admin-notifications-nav-bar">
        {/* admin navbar */}
        <Snippets.AdminNavbar />
      </div>
      <div className="admin-home-content">
        {/* admin home */}
        <AdminHome />
      </div>
    </div>
  );
};

export default AdminHomePage;
