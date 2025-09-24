import authService from "./authService";

const API_BASE_URL = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
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
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.pageSize) queryParams.append("pageSize", filters.limit || 20);

    const endpoint = `/admin/users${
      queryParams.toString() ? "?" + queryParams.toString() : ""
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

  // Tutor Applications Management
  async getApplications(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.page) queryParams.append("page", filters.page);
    if (filters.limit) queryParams.append("limit", filters.limit);

    const endpoint = `/admin/applications${
      queryParams.toString() ? "?" + queryParams.toString() : ""
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

    const endpoint = `/admin/profiles${
      queryParams.toString() ? "?" + queryParams.toString() : ""
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

    const endpoint = `/admin/tokens${
      queryParams.toString() ? "?" + queryParams.toString() : ""
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
    return this.makeAdminRequest(`/admin/profiles/${userId}/make-live`, {
      method: "PUT",
    });
  }

  async makeTutorOffline(userId) {
    return this.makeAdminRequest(`/admin/profiles/${userId}/make-offline`, {
      method: "PUT",
    });
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

    const endpoint = `/admin/applications${
      queryParams.toString() ? "?" + queryParams.toString() : ""
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
