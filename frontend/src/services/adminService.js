import authService from "./authService";

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
  }/api`;

class AdminService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method to make authenticated admin requests
  async makeAdminRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          try {
            await authService.refreshToken();
            // Retry with new token
            const newToken = authService.getAccessToken();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, config);
              const retryData = await retryResponse.json();
              return retryData;
            }
          } catch (refreshError) {
            authService.clearTokens();
            window.location.href = "/login";
            throw new Error("Session expired. Please login again.");
          }
        }

        throw new Error(
          data.detail || data.message || data.error || "Request failed"
        );
      }

      return data;
    } catch (error) {
      console.error("Admin API Request failed:", error);
      throw error;
    }
  }

  // User Management
  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append("role", filters.role);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.pageSize) {
      queryParams.append("pageSize", filters.pageSize);
    }

    if (!filters.pageSize && !queryParams.has("pageSize")) {
      queryParams.append("pageSize", 20);
    }

    const endpoint = `/admin/users${queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
    const response = await this.makeAdminRequest(endpoint);

    // Transform response to match expected format
    return {
      success: true,
      data: response.items || response,
      pagination: {
        page: response.page || 1,
        pageSize: response.pageSize || 20,
        total: response.total || (response.items ? response.items.length : 0),
      },
    };
  }

  async getUserById(userId) {
    return this.makeAdminRequest(`/admin/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.makeAdminRequest(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.makeAdminRequest(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  // --- Admin Tutor Management ---
  // List all tutors
  async getTutors(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);
    const endpoint = `/admin/tutors${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return this.makeAdminRequest(endpoint);
  }

  // Get tutor details
  async getTutorById(userId) {
    return this.makeAdminRequest(`/admin/tutors/${userId}`);
  }

  // Change tutor tier
  async changeTutorTier(userId, tier) {
    return this.makeAdminRequest(`/admin/tutors/${userId}/tier`, {
      method: "PUT",
      body: JSON.stringify({ tier }),
    });
  }

  // Get completed lessons for a tutor
  async getTutorCompletedLessons(userId, limit = 50) {
    const endpoint = `/admin/tutors/${userId}/lessons/completed?limit=${limit}`;
    return this.makeAdminRequest(endpoint);
  }

  // Add review for tutor
  async addTutorReview(userId, review) {
    return this.makeAdminRequest(`/admin/tutors/${userId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    });
  }

  // Remove tutor review
  async removeTutorReview(reviewId) {
    return this.makeAdminRequest(`/admin/tutor-reviews/${reviewId}`, {
      method: "DELETE",
    });
  }

  // Approve tutor change request
  async approveTutorChangeRequest(requestId) {
    return this.makeAdminRequest(`/admin/tutor-change-requests/${requestId}/approve`, {
      method: "POST",
    });
  }

  // Reject tutor change request
  async rejectTutorChangeRequest(requestId, reason = "") {
    return this.makeAdminRequest(`/admin/tutor-change-requests/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // List tutor change requests
  async getTutorChangeRequests() {
    return this.makeAdminRequest(`/admin/tutor-change-requests`);
  }

  // Tutor Applications Management
  async getApplications(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const endpoint = `/admin/applications${queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
    const response = await this.makeAdminRequest(endpoint);

    // Transform response to match expected format
    return {
      success: true,
      data: Array.isArray(response) ? response : [response],
      pagination: {
        page: 1,
        pageSize: response.length || 0,
        total: response.length || 0,
      },
    };
  }

  async getApplicationById(applicationId) {
    return this.makeAdminRequest(`/admin/applications/${applicationId}`);
  }

  async updateApplicationStatus(applicationId, status, notes = "") {
    return this.makeAdminRequest(`/admin/applications/${applicationId}`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    });
  }

  async approveApplication(applicationId, notes = "") {
    return this.updateApplicationStatus(applicationId, "approved", notes);
  }

  async rejectApplication(applicationId, notes = "") {
    return this.updateApplicationStatus(applicationId, "rejected", notes);
  }

  // Profile Management
  async getProfiles(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append("role", filters.role);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const endpoint = `/admin/profiles${queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
    return this.makeAdminRequest(endpoint);
  }

  async getProfileById(userId) {
    return this.makeAdminRequest(`/admin/profiles/${userId}`);
  }

  async updateProfile(userId, profileData) {
    return this.makeAdminRequest(`/admin/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Token Management
  async getTokens(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const endpoint = `/admin/tokens${queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
    return this.makeAdminRequest(endpoint);
  }

  async deleteToken(tokenId) {
    return this.makeAdminRequest(`/admin/tokens/${tokenId}`, {
      method: "DELETE",
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const response = await this.makeAdminRequest("/auth/stats");

    // Transform response to match expected format
    return {
      success: true,
      data: {
        usersCount: response.usersCount || 0,
        applicationsCount: response.applicationsCount || 0,
        profilesCount: response.profilesCount || 0,
        pendingApplications: response.pendingApplications || 0,
        todaysSessions: 0, // This would come from a sessions API
        upcomingSessions: 0, // This would come from a sessions API
        completedThisWeek: 0, // This would come from a sessions API
        thisMonthRevenue: 0, // This would come from a finance API
        lastMonthRevenue: 0, // This would come from a finance API
        revenueGrowth: 0, // This would come from a finance API
        applications: response.applications || [],
      },
    };
  }

  // Create Admin User (Development)
  async createAdmin() {
    return this.makeAdminRequest("/auth/create-admin", {
      method: "POST",
    });
  }

  // Tutor Application Management
  async approveTutorApplication(applicationId, notes = "") {
    return this.makeAdminRequest(
      `/admin/applications/${applicationId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ notes }),
      }
    );
  }

  async rejectTutorApplication(applicationId, reason = "") {
    return this.makeAdminRequest(
      `/admin/applications/${applicationId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  }

  // Tutor Profile Management
  async getTutorProfile(userId) {
    return this.makeAdminRequest(`/admin/profiles/${userId}`);
  }

  async updateTutorProfile(userId, profileData) {
    return this.makeAdminRequest(`/admin/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async makeTutorLive(userId) {
    try {
      console.log('📡 API Call: makeTutorLive', userId);
      
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await this.makeAdminRequest(`/admin/profiles/${userId}/make-live`, {
        method: "PUT",
      });

      console.log('✅ makeTutorLive response:', response);

      // Validate response
      if (!response) {
        throw new Error("No response from server");
      }

      return response;
    } catch (error) {
      console.error('❌ makeTutorLive error:', error);
      throw error;
    }
  }

  async makeTutorOffline(userId) {
    try {
      console.log('📡 API Call: makeTutorOffline', userId);
      
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await this.makeAdminRequest(`/admin/profiles/${userId}/make-offline`, {
        method: "PUT",
      });

      console.log('✅ makeTutorOffline response:', response);

      // Validate response
      if (!response) {
        throw new Error("No response from server");
      }

      return response;
    } catch (error) {
      console.error('❌ makeTutorOffline error:', error);
      throw error;
    }
  }

  // Document Management
  async getTutorDocuments(userId) {
    return this.makeAdminRequest(`/admin/profiles/${userId}`);
  }

  // Get tutor applications with detailed info
  async getTutorApplications(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const endpoint = `/admin/applications${queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
    const response = await this.makeAdminRequest(endpoint);

    // Transform response to match expected format
    return {
      success: true,
      data: Array.isArray(response) ? response : [response],
      pagination: {
        page: 1,
        pageSize: response.length || 0,
        total: response.length || 0,
      },
    };
  }

  // Admin-specific authentication
  async adminLogin(credentials) {
    try {
      const response = await authService.login(credentials);

      // Verify admin role
      if (response.user && response.user.role === "admin") {
        return response;
      } else {
        authService.logout();
        throw new Error("Admin access required");
      }
    } catch (error) {
      throw error;
    }
  }

  // Check if current user is admin
  isAdmin() {
    const user = authService.getUserInfo();
    return user && user.role === "admin";
  }

  // Get admin user info
  getAdminInfo() {
    if (!this.isAdmin()) {
      return null;
    }
    return authService.getUserInfo();
  }

  // Assignment Management
  async getAssignments(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.studentId) queryParams.append("studentId", filters.studentId);
    if (filters.tutorId) queryParams.append("tutorId", filters.tutorId);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const endpoint = `/admin/assignments${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return this.makeAdminRequest(endpoint);
  }

  async getAssignmentById(assignmentId) {
    return this.makeAdminRequest(`/admin/assignments/${assignmentId}`);
  }

  // Tutor Change Requests (using the methods from tutor management)
  async getChangeRequests(filters = {}) {
    return this.getTutorChangeRequests();
  }

  async approveChangeRequest(changeRequestId, comments = "") {
    return this.approveTutorChangeRequest(changeRequestId);
  }

  async rejectChangeRequest(changeRequestId, comments = "") {
    return this.rejectTutorChangeRequest(changeRequestId, comments);
  }

  // Get profile diff for change request
  async getProfileDiff(changeRequestId) {
    return this.makeAdminRequest(`/tutor/profile/change-diff/${changeRequestId}`);
  }

  // Package Management
  async getPackages(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.isActive !== undefined) queryParams.append("isActive", filters.isActive);
    if (filters.subject) queryParams.append("subject", filters.subject);
    if (filters.q) queryParams.append("q", filters.q);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.pageSize) queryParams.append("pageSize", filters.pageSize);

    const endpoint = `/admin/packages${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return this.makeAdminRequest(endpoint);
  }

  async getPackageById(packageId) {
    return this.makeAdminRequest(`/admin/packages/${packageId}`);
  }

  async createPackage(packageData) {
    return this.makeAdminRequest("/admin/packages", {
      method: "POST",
      body: JSON.stringify(packageData),
    });
  }

  async updatePackage(packageId, packageData) {
    return this.makeAdminRequest(`/admin/packages/${packageId}`, {
      method: "PUT",
      body: JSON.stringify(packageData),
    });
  }

  async retirePackage(packageId) {
    return this.makeAdminRequest(`/admin/packages/${packageId}/retire`, {
      method: "POST",
    });
  }

  async deletePackage(packageId) {
    return this.makeAdminRequest(`/admin/packages/${packageId}`, {
      method: "DELETE",
    });
  }

  // Student Profile Management
  async getStudentProfile(userId) {
    try {
      const response = await this.makeAdminRequest(
        `GET /admin/students/${userId}/profile`
      );
      return response;
    } catch (error) {
      console.error("Error fetching student profile:", error);
      return { success: false, error: error.message };
    }
  }

  async updateStudentProfile(userId, data) {
    try {
      const response = await this.makeAdminRequest(
        `PUT /admin/students/${userId}/profile`,
        data
      );
      return response;
    } catch (error) {
      console.error("Error updating student profile:", error);
      return { success: false, error: error.message };
    }
  }
}



// Create and export singleton instance
const adminService = new AdminService();
export default adminService;

// Export individual methods for direct import
export const getUsers = (filters) => adminService.getUsers(filters);
export const getUserById = (userId) => adminService.getUserById(userId);
export const updateUser = (userId, userData) =>
  adminService.updateUser(userId, userData);
export const deleteUser = (userId) => adminService.deleteUser(userId);
export const getApplications = (filters) =>
  adminService.getApplications(filters);
export const getApplicationById = (applicationId) =>
  adminService.getApplicationById(applicationId);
export const updateApplicationStatus = (applicationId, status, notes) =>
  adminService.updateApplicationStatus(applicationId, status, notes);
export const approveApplication = (applicationId, notes) =>
  adminService.approveApplication(applicationId, notes);
export const rejectApplication = (applicationId, notes) =>
  adminService.rejectApplication(applicationId, notes);
export const getProfiles = (filters) => adminService.getProfiles(filters);
export const getProfileById = (userId) => adminService.getProfileById(userId);
export const updateProfile = (userId, profileData) =>
  adminService.updateProfile(userId, profileData);
export const getTokens = (filters) => adminService.getTokens(filters);
export const deleteToken = (tokenId) => adminService.deleteToken(tokenId);
export const getDashboardStats = () => adminService.getDashboardStats();
export const createAdmin = () => adminService.createAdmin();
export const adminLogin = (credentials) => adminService.adminLogin(credentials);
export const isAdmin = () => adminService.isAdmin();
export const getAdminInfo = () => adminService.getAdminInfo();

// Tutor Application Management
export const approveTutorApplication = (applicationId, notes) =>
  adminService.approveTutorApplication(applicationId, notes);
export const rejectTutorApplication = (applicationId, reason) =>
  adminService.rejectTutorApplication(applicationId, reason);

// Tutor Profile Management
export const getTutorProfile = (userId) => adminService.getTutorProfile(userId);
export const updateTutorProfile = (userId, profileData) =>
  adminService.updateTutorProfile(userId, profileData);
export const makeTutorLive = (userId) => adminService.makeTutorLive(userId);
export const makeTutorOffline = (userId) =>
  adminService.makeTutorOffline(userId);

// Document Management
export const getTutorDocuments = (userId) =>
  adminService.getTutorDocuments(userId);

// Tutor Applications
export const getTutorApplications = (filters) =>
  adminService.getTutorApplications(filters);

// Tutor Management
export const getTutors = (filters) => adminService.getTutors(filters);
export const getTutorById = (userId) => adminService.getTutorById(userId);
export const changeTutorTier = (userId, tier) => adminService.changeTutorTier(userId, tier);
export const getTutorCompletedLessons = (userId, limit) => adminService.getTutorCompletedLessons(userId, limit);
export const addTutorReview = (userId, review) => adminService.addTutorReview(userId, review);
export const removeTutorReview = (reviewId) => adminService.removeTutorReview(reviewId);
export const approveTutorChangeRequest = (requestId) => adminService.approveTutorChangeRequest(requestId);
export const rejectTutorChangeRequest = (requestId, reason) => adminService.rejectTutorChangeRequest(requestId, reason);
export const getTutorChangeRequests = () => adminService.getTutorChangeRequests();

// Assignment Management
export const getAssignments = (filters) => adminService.getAssignments(filters);
export const getAssignmentById = (assignmentId) => adminService.getAssignmentById(assignmentId);

// Tutor Change Requests
export const getChangeRequests = (filters) => adminService.getChangeRequests(filters);
export const approveChangeRequest = (changeRequestId, comments) =>
  adminService.approveChangeRequest(changeRequestId, comments);
export const rejectChangeRequest = (changeRequestId, comments) =>
  adminService.rejectChangeRequest(changeRequestId, comments);
export const getProfileDiff = (changeRequestId) =>
  adminService.getProfileDiff(changeRequestId);

// Package Management
export const getPackages = (filters) => adminService.getPackages(filters);
export const getPackageById = (packageId) => adminService.getPackageById(packageId);
export const createPackage = (packageData) => adminService.createPackage(packageData);
export const updatePackage = (packageId, packageData) => adminService.updatePackage(packageId, packageData);
export const retirePackage = (packageId) => adminService.retirePackage(packageId);
export const deletePackage = (packageId) => adminService.deletePackage(packageId);

// Student Profile Management
export const getStudentProfile = (userId) => adminService.getStudentProfile(userId);
export const updateStudentProfile = (userId, data) => adminService.updateStudentProfile(userId, data);
