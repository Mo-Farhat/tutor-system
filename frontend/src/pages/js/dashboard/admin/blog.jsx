import React from "react";
import * as Snippets from "../../../../components/dashboards/admin/snippets/snippets-index";
import AdminBlog from "../../../../components/dashboards/admin/blog/blog";

const AdminBlogPage = () => {
  return (
    <div className="admin-blog-page-main d-flex">
      <Snippets.AdminNavbar />
      <div className="admin-content-wrapper flex-grow-1 p-4">
        <AdminBlog />
      </div>
    </div>
  );
};

export default AdminBlogPage;
