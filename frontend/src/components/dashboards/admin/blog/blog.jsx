import React, { useState, useEffect } from "react";
import "../../../../css/dashboards/admin/blog/blog.css";

function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    status: "draft",
    publishDate: "",
    featuredImage: null,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock blog posts
      const mockPosts = [
        {
          id: 1,
          title: "How to Ace Your VCE Chemistry Exam",
          excerpt:
            "Essential tips and strategies for excelling in VCE Chemistry...",
          content:
            "<h2>Introduction</h2><p>VCE Chemistry can be challenging, but with the right approach...</p>",
          category: "Study Tips",
          tags: ["VCE", "Chemistry", "Exam Prep"],
          status: "published",
          publishDate: "2024-03-15",
          author: "Admin User",
          views: 1250,
          likes: 89,
          comments: 15,
        },
        {
          id: 2,
          title: "The Benefits of One-on-One Tutoring",
          excerpt:
            "Discover why personalized tutoring makes all the difference...",
          content:
            "<h2>Why Choose One-on-One Tutoring?</h2><p>Personalized learning has many advantages...</p>",
          category: "Tutoring",
          tags: ["Tutoring", "Education", "Learning"],
          status: "published",
          publishDate: "2024-03-12",
          author: "Admin User",
          views: 890,
          likes: 67,
          comments: 8,
        },
        {
          id: 3,
          title: "UCAT Preparation Guide 2024",
          excerpt: "Complete guide to preparing for the UCAT exam...",
          content:
            "<h2>UCAT Overview</h2><p>The University Clinical Aptitude Test (UCAT) is...</p>",
          category: "UCAT",
          tags: ["UCAT", "Medical", "University"],
          status: "draft",
          publishDate: null,
          author: "Admin User",
          views: 0,
          likes: 0,
          comments: 0,
        },
        {
          id: 4,
          title: "Building Confidence in Mathematics",
          excerpt: "Strategies to help students overcome math anxiety...",
          content:
            "<h2>Understanding Math Anxiety</h2><p>Many students struggle with mathematics...</p>",
          category: "Study Tips",
          tags: ["Mathematics", "Confidence", "Anxiety"],
          status: "scheduled",
          publishDate: "2024-03-25",
          author: "Admin User",
          views: 0,
          likes: 0,
          comments: 0,
        },
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setNewPost({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      status: "draft",
      publishDate: "",
      featuredImage: null,
    });
    setShowCreateModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      status: post.status,
      publishDate: post.publishDate || "",
      featuredImage: null,
    });
    setShowCreateModal(true);
  };

  const handleSavePost = () => {
    // In real implementation, this would call an API
    const postData = {
      ...newPost,
      author: "Admin User",
      views: 0,
      likes: 0,
      comments: 0,
    };

    if (editingPost) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPost.id ? { ...post, ...postData } : post
        )
      );
    } else {
      setPosts((prev) => [{ id: Date.now(), ...postData }, ...prev]);
    }

    setShowCreateModal(false);
  };

  const handlePublishPost = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              status: "published",
              publishDate: new Date().toISOString().split("T")[0],
            }
          : post
      )
    );
  };

  const handlePreviewPost = (post) => {
    setPreviewPost(post);
    setShowPreviewModal(true);
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      setPosts((prev) => prev.filter((post) => post.id !== postToDelete.id));
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewPost(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: "success",
      draft: "secondary",
      scheduled: "info",
      archived: "warning",
    };
    return (
      <span className={`badge bg-${colors[status] || "secondary"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="admin-blog-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading blog posts...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-blog-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-blog-content">
              {/* Header */}
              <div className="admin-blog-header">
                <div className="admin-blog-title-section">
                  <h2 className="admin-blog-title">Blog Management</h2>
                  <p className="admin-blog-subtitle text-muted">
                    Create, edit, and manage blog posts
                  </p>
                </div>
                <button className="btn btn-primary" onClick={handleCreatePost}>
                  <i className="fas fa-plus me-2"></i>
                  Create Post
                </button>
              </div>

              {/* Controls */}
              <div className="admin-blog-controls mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="admin-search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <select className="form-select">
                      <option value="">All Categories</option>
                      <option value="study-tips">Study Tips</option>
                      <option value="tutoring">Tutoring</option>
                      <option value="ucat">UCAT</option>
                      <option value="news">News</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Posts Table */}
              <div className="admin-blog-table-section">
                {filteredPosts.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-blog text-muted mb-3"></i>
                    <h5>No blog posts found</h5>
                    <p className="text-muted">
                      Create your first blog post to get started
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreatePost}
                    >
                      Create Post
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table admin-blog-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Publish Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPosts.map((post) => (
                          <tr key={post.id}>
                            <td>
                              <div>
                                <strong>{post.title}</strong>
                                <br />
                                <small className="text-muted">
                                  {post.excerpt.substring(0, 50)}...
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {post.category}
                              </span>
                            </td>
                            <td>{getStatusBadge(post.status)}</td>
                            <td>{formatDate(post.publishDate)}</td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditPost(post)}
                                >
                                  Edit
                                </button>
                                {post.status === "draft" && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handlePublishPost(post.id)}
                                  >
                                    Publish
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handlePreviewPost(post)}
                                >
                                  Preview
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeletePost(post)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Post Modal */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPost ? "Edit Post" : "Create New Post"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Post title"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newPost.category}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Category</option>
                      <option value="Study Tips">Study Tips</option>
                      <option value="Tutoring">Tutoring</option>
                      <option value="UCAT">UCAT</option>
                      <option value="News">News</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Excerpt</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={newPost.excerpt}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          excerpt: e.target.value,
                        }))
                      }
                      placeholder="Brief description of the post"
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">
                      Content (Rich Text Editor Placeholder)
                    </label>
                    <textarea
                      className="form-control"
                      rows="10"
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Write your blog post content here..."
                    ></textarea>
                    <small className="text-muted">
                      In production, this would be a rich text editor like
                      TinyMCE or Quill
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newPost.status}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Publish Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newPost.publishDate}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          publishDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleSavePost}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setNewPost((prev) => ({ ...prev, status: "published" }));
                    handleSavePost();
                  }}
                  disabled={!newPost.title || !newPost.content}
                >
                  {editingPost ? "Update & Publish" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewPost && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Preview: {previewPost.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePreviewModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="blog-preview">
                  {/* Blog Header */}
                  <div className="blog-preview-header mb-4">
                    <h1 className="blog-preview-title">{previewPost.title}</h1>
                    <div className="blog-preview-meta">
                      <span className="badge bg-info me-2">
                        {previewPost.category}
                      </span>
                      <span className="text-muted me-3">
                        <i className="fas fa-user me-1"></i>
                        {previewPost.author}
                      </span>
                      <span className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(previewPost.publishDate)}
                      </span>
                    </div>
                  </div>

                  {/* Blog Excerpt */}
                  <div className="blog-preview-excerpt mb-4">
                    <p className="lead">{previewPost.excerpt}</p>
                  </div>

                  {/* Blog Content */}
                  <div className="blog-preview-content">
                    <div
                      dangerouslySetInnerHTML={{ __html: previewPost.content }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closePreviewModal}
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    closePreviewModal();
                    handleEditPost(previewPost);
                  }}
                >
                  Edit Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Confirm Delete
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="fas fa-warning me-2"></i>
                  <strong>Warning:</strong> This action cannot be undone.
                </div>
                <p>Are you sure you want to delete this blog post?</p>
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">{postToDelete.title}</h6>
                    <p className="card-text text-muted">
                      {postToDelete.excerpt.substring(0, 100)}...
                    </p>
                    <div className="d-flex gap-2">
                      <span className="badge bg-info">
                        {postToDelete.category}
                      </span>
                      <span
                        className={`badge bg-${
                          postToDelete.status === "published"
                            ? "success"
                            : "secondary"
                        }`}
                      >
                        {postToDelete.status.charAt(0).toUpperCase() +
                          postToDelete.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDeletePost}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlog;
