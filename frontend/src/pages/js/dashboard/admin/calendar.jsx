import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminCalendar from "../../../../components/dashboards/admin/calendar/calendar";

const AdminCalendarPage = () => {
  return (
    <div className="admin-calendar-page-main">
      <div className="admin-notifications-nav-bar">
        {/* admin navbar */}
        <Snippets.AdminNavbar />
      </div>
      <div className="admin-calendar-content">
        {/* admin calendar */}
        <AdminCalendar />
      </div>
    </div>
  );
};

export default AdminCalendarPage;
