const API_BASE_URL = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
}/api/auth`;

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Setup automatic token refresh interceptor
    this.interceptFetch();
  }

  interceptFetch() {
    const originalFetch = window.fetch;

    window.fetch = async (url, options = {}) => {
      const urlStr = typeof url === "string" ? url : (url && url.url) || "";
      const publicFetchPaths = [
        "/api/auth/tutor/apply/",
        "/api/auth/login/",
        "/api/auth/register/",
        "/api/auth/token/",
        "/api/auth/token/refresh/",
      ];
      const isPublicFetch = publicFetchPaths.some((p) => urlStr.includes(p));
      // First attempt
      let response = await this.makeAuthenticatedRequest(
        url,
        { ...options, __isPublic: isPublicFetch },
        originalFetch
      );

      // If token expired, try to refresh and retry
      if (!isPublicFetch && response.status === 401 && this.getRefreshToken()) {
        try {
          await this.refreshTokenSilently();
          // Retry the original request with new token
          response = await this.makeAuthenticatedRequest(
            url,
            options,
            originalFetch
          );
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          this.clearTokens();
          window.location.href = "/login";
          throw refreshError;
        }
      }

      return response;
    };
  }

  async makeAuthenticatedRequest(url, options, originalFetch) {
    const config = { ...options };

    // Add auth token if this is an API request
    const urlStr = typeof url === "string" ? url : (url && url.url) || "";
    const isPublic = Boolean(config && config.__isPublic);
    if (!isPublic && urlStr.includes("/api/") && this.getAccessToken()) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.getAccessToken()}`,
      };
    }
    // Remove internal flag before sending
    if ("__isPublic" in config) {
      delete config.__isPublic;
    }

    return originalFetch(url, config);
  }

  // Helper method to make API calls with enhanced error handling
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {},
      ...options,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Add any additional headers
    if (options.headers) {
      Object.assign(config.headers, options.headers);
    }

    // Add auth token if available and not a public endpoint
    const publicEndpoints = [
      "/login/",
      "/register/",
      "/token/",
      "/token/refresh/",
    ];
    const isPublicEndpoint = publicEndpoints.some((ep) =>
      endpoint.includes(ep)
    );

    if (!isPublicEndpoint && this.getAccessToken()) {
      config.headers.Authorization = `Bearer ${this.getAccessToken()}`;
    }

    try {
      const response = await fetch(url, config);

      // Handle different response types
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data && typeof data === "object") {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else if (typeof messages === "string") {
              errorMessages.push(messages);
            }
          }
          throw new Error(errorMessages.join(". ") || "Validation failed");
        }

        // Handle authentication errors
        if (response.status === 401) {
          // Don't auto-refresh for login attempts
          if (!endpoint.includes("/login/")) {
            this.clearTokens();
          }
        }

        throw new Error(
          data.detail || data.message || data.error || "Request failed"
        );
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Register a new student user
  async registerStudent(userData) {
    const data = await this.makeRequest("/register/", {
      method: "POST",
      body: JSON.stringify({
        ...userData,
        role: "student", // Force student role for signup page
      }),
    });

    // Store tokens after successful registration
    if (data.tokens) {
      this.setTokens(data.tokens.access, data.tokens.refresh);
    }

    return data;
  }

  // Login user (any role) - Enhanced version
  async login(credentials) {
    const data = await this.makeRequest("/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store tokens after successful login
    if (data.tokens) {
      this.setTokens(data.tokens.access, data.tokens.refresh);
    }

    // Store user info for quick access
    if (data.user) {
      localStorage.setItem("user_info", JSON.stringify(data.user));
    }

    return data;
  }

  // Logout user
  async logout() {
    try {
      // Call the logout endpoint to invalidate the session on the server
      await this.makeRequest("/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
      // Continue with local logout even if server request fails
    }

    // Clear tokens and user info
    this.clearTokens();
    localStorage.removeItem("user_info");

    // Redirect to login page
    window.location.href = "/login";
  }

  // Check if user is authenticated
  async checkAuthStatus() {
    try {
      // First check if we have a valid token
      if (!this.getAccessToken()) {
        throw new Error("No access token");
      }

      // Verify token with backend
      const data = await this.makeRequest("/check-auth/");

      // Update stored user info
      if (data.user) {
        localStorage.setItem("user_info", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      // Try to refresh token if we have a refresh token
      if (this.getRefreshToken()) {
        try {
          await this.refreshTokenSilently();
          return await this.makeRequest("/check-auth/");
        } catch (refreshError) {
          this.clearTokens();
          throw refreshError;
        }
      }
      this.clearTokens();
      throw error;
    }
  }

  // Refresh access token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const data = await this.makeRequest("/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }

      // Update refresh token if provided (token rotation)
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      return data;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Silent token refresh (used by interceptor)
  async refreshTokenSilently() {
    if (this.isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const data = await this.refreshToken();

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => resolve(data));
      this.failedQueue = [];

      return data;
    } catch (error) {
      // Process failed queue
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const data = await this.makeRequest("/profile/");
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Alias for getCurrentUser for consistency
  async getUserProfile() {
    return this.getCurrentUser();
  }

  // Tutor password setup functions (keeping existing functionality)
  async verifyPasswordSetupToken(token) {
    try {
      const data = await this.makeRequest(`/tutor/setup-password/${token}/`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setupTutorPassword(token, passwordData) {
    try {
      const url = `${API_BASE_URL}/tutor/setup-password/${token}/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 400 && data && typeof data === "object") {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else if (typeof messages === "string") {
              errorMessages.push(messages);
            }
          }
          throw new Error(errorMessages.join(". ") || "Validation failed");
        }

        throw new Error(
          data.detail || data.message || data.error || "Request failed"
        );
      }

      if (data.tokens) {
        this.setTokens(data.tokens.access, data.tokens.refresh);
      }

      return { success: true, data };
    } catch (error) {
      console.error("Password setup error:", error);
      return { success: false, error: error.message };
    }
  }

  // Document management methods (keeping existing functionality)
  async getTutorDocuments() {
    try {
      const data = await this.makeRequest("/tutor/documents/");
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadTutorDocuments(documentData) {
    try {
      const formData = new FormData();

      if (documentData.tutorContract) {
        formData.append("tutor_contract", documentData.tutorContract);
      }

      if (documentData.wwccDocument) {
        formData.append("wwcc_document", documentData.wwccDocument);
      }

      const data = await this.makeRequest("/tutor/documents/", {
        method: "POST",
        body: formData,
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Payment management methods (keeping existing functionality)
  async getPaymentDetails() {
    try {
      const data = await this.makeRequest("/tutor/payment-details/");
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updatePaymentDetails(paymentData) {
    try {
      const data = await this.makeRequest("/tutor/payment-details/", {
        method: "PUT",
        body: JSON.stringify(paymentData),
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTransactionHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append("status", filters.status);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.limit) queryParams.append("limit", filters.limit);

      const endpoint = `/tutor/transactions/${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const data = await this.makeRequest(endpoint);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Subject selection methods (keeping existing functionality)
  async getSubjectSelectionData() {
    try {
      const data = await this.makeRequest("/tutor/subjects/");
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTutorSubjects() {
    try {
      const data = await this.makeRequest("/tutor/subjects/");
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTutorSubjects(subjectsData) {
    try {
      const data = await this.makeRequest("/tutor/subjects/", {
        method: "PUT",
        body: JSON.stringify(subjectsData),
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Public tutor search methods (keeping existing functionality)
  async getLiveTutors() {
    try {
      const data = await this.makeRequest("/tutor/tutors/live", {
        method: "GET",
      });

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTutorById(tutorId) {
    try {
      const data = await this.makeRequest(`/tutor/tutors/${tutorId}/`, {
        method: "GET",
      });

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Profile update methods (keeping existing functionality)
  async updateUserProfile(profileData) {
    try {
      const data = await this.makeRequest("/profile/", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUserProfileWithFiles(profileData) {
    try {
      const formData = new FormData();

      Object.keys(profileData).forEach((key) => {
        if (
          profileData[key] !== null &&
          profileData[key] !== undefined &&
          key !== "profile_picture"
        ) {
          formData.append(key, profileData[key]);
        }
      });

      if (profileData.profile_picture instanceof File) {
        formData.append("profile_picture", profileData.profile_picture);
      }

      const data = await this.makeRequest("/profile/", {
        method: "PUT",
        body: formData,
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTutorProfile(profileData) {
    try {
      const data = await this.makeRequest("/tutor/profile/", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTutorVideoSubmission(videoFile) {
    try {
      const formData = new FormData();
      formData.append("video_submission", videoFile);

      const data = await this.makeRequest("/tutor/profile/", {
        method: "PUT",
        body: formData,
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Token management methods
  setTokens(accessToken, refreshToken) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    // Set token expiry for auto-refresh
    this.setTokenExpiry(accessToken);
  }

  setTokenExpiry(token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      localStorage.setItem("token_expiry", expiry.toString());
    } catch (error) {
      console.error("Failed to parse token expiry:", error);
    }
  }

  getAccessToken() {
    return localStorage.getItem("access_token");
  }

  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  }

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("user_info");
  }

  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    const expiry = localStorage.getItem("token_expiry");
    if (expiry && Date.now() > parseInt(expiry)) {
      return false;
    }

    return true;
  }

  // Get user info from stored data or decode token
  getUserInfo() {
    // First try to get from stored user info
    const storedUserInfo = localStorage.getItem("user_info");
    if (storedUserInfo) {
      try {
        return JSON.parse(storedUserInfo);
      } catch (error) {
        console.error("Failed to parse stored user info:", error);
      }
    }

    // Fallback to decoding token
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        userId: payload.user_id,
        username: payload.username,
        email: payload.email,
        firstName: payload.first_name,
        lastName: payload.last_name,
        role: payload.role,
        exp: payload.exp,
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  // Generate user-specific URLs
  getUserSpecificUrl(basePath, userId = null) {
    const userInfo = this.getUserInfo();
    const id = userId || (userInfo && userInfo.userId) || "";
    return `${basePath}${id ? `/${id}` : ""}`;
  }

  // Submit tutor application
  async submitTutorApplication(applicationData) {
    // Create FormData for file uploads
    const formData = new FormData();

    // Add all fields with API-expected names and types
    formData.append("fullName", applicationData.fullName || "");
    formData.append("phone", applicationData.phone || "");
    formData.append("email", (applicationData.email || "").toLowerCase());
    formData.append("currentStudy", applicationData.currentStudy || "");
    formData.append("year12State", applicationData.year12State || "");
    if (applicationData.year12CompletionYear) {
      formData.append(
        "year12CompletionYear",
        parseInt(applicationData.year12CompletionYear, 10)
      );
    }
    formData.append("currentState", applicationData.currentState || "");
    if (
      applicationData.atar !== undefined &&
      applicationData.atar !== null &&
      `${applicationData.atar}`.trim() !== ""
    ) {
      formData.append("atar", parseFloat(applicationData.atar));
    }
    const toBool = (v) => v === true || v === "yes" || v === "true";
    formData.append("canCommit3Hours", toBool(applicationData.canCommit3Hours));
    formData.append("canCommit1Year", toBool(applicationData.canCommit1Year));
    formData.append(
      "canTutorMostWeeks",
      toBool(applicationData.canTutorMostWeeks)
    );
    formData.append("canTutorGroups", toBool(applicationData.canTutorGroups));
    formData.append("subjectsToTutor", applicationData.subjectsToTutor || "");
    formData.append(
      "hasWorkingWithChildrenCheck",
      toBool(applicationData.hasWorkingWithChildrenCheck)
    );
    formData.append("motivation", applicationData.motivation || "");

    // Add files if they exist
    if (applicationData.videoSubmission) {
      formData.append("videoSubmission", applicationData.videoSubmission);
    }

    if (applicationData.resume) {
      formData.append("resume", applicationData.resume);
    }

    // Make request WITHOUT authentication for tutor application
    const url = `${API_BASE_URL}/tutor/apply/`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    // Handle response
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // Handle validation errors
      if (response.status === 400 && data && typeof data === "object") {
        const errorMessages = [];
        for (const [field, messages] of Object.entries(data)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages);
          } else if (typeof messages === "string") {
            errorMessages.push(messages);
          }
        }
        throw new Error(errorMessages.join(". ") || "Validation failed");
      }

      throw new Error(
        data.detail || data.message || data.error || "Request failed"
      );
    }

    return data;
  }

  // Admin-specific methods
  async adminLogin(credentials) {
    try {
      const response = await this.login(credentials);

      // Verify admin role
      if (response.user && response.user.role === "admin") {
        return response;
      } else {
        this.logout();
        throw new Error("Admin access required");
      }
    } catch (error) {
      throw error;
    }
  }

  isAdmin() {
    const user = this.getUserInfo();
    return user && user.role === "admin";
  }

  getAdminInfo() {
    if (!this.isAdmin()) {
      return null;
    }
    return this.getUserInfo();
  }

  // Mock admin login for development (if needed)
  async mockAdminLogin(credentials) {
    // This can be used for development/testing
    // In production, use adminLogin instead
    return this.adminLogin(credentials);
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

// Export individual functions for direct import
export const registerStudent = (userData) =>
  authService.registerStudent(userData);
export const submitTutorApplication = (applicationData) =>
  authService.submitTutorApplication(applicationData);
export const login = (credentials) => authService.login(credentials);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const getUserProfile = () => authService.getUserProfile();
export const checkAuthStatus = () => authService.checkAuthStatus();
export const verifyPasswordSetupToken = (token) =>
  authService.verifyPasswordSetupToken(token);
export const setupTutorPassword = (token, passwordData) =>
  authService.setupTutorPassword(token, passwordData);
export const refreshToken = () => authService.refreshToken();
export const isAuthenticated = () => authService.isAuthenticated();
export const getUserInfo = () => authService.getUserInfo();
export const getUserSpecificUrl = (basePath, userId) =>
  authService.getUserSpecificUrl(basePath, userId);
export const getTutorDocuments = () => authService.getTutorDocuments();
export const uploadTutorDocuments = (documentData) =>
  authService.uploadTutorDocuments(documentData);
export const getPaymentDetails = () => authService.getPaymentDetails();
export const updatePaymentDetails = (paymentData) =>
  authService.updatePaymentDetails(paymentData);
export const getTransactionHistory = (filters) =>
  authService.getTransactionHistory(filters);
export const getSubjectSelectionData = () =>
  authService.getSubjectSelectionData();
export const getTutorSubjects = () => authService.getTutorSubjects();
export const updateTutorSubjects = (subjectsData) =>
  authService.updateTutorSubjects(subjectsData);
export const getLiveTutors = () => authService.getLiveTutors();
export const getTutorById = (tutorId) => authService.getTutorById(tutorId);
export const updateUserProfile = (profileData) =>
  authService.updateUserProfile(profileData);
export const updateUserProfileWithFiles = (profileData) =>
  authService.updateUserProfileWithFiles(profileData);
export const updateTutorProfile = (profileData) =>
  authService.updateTutorProfile(profileData);
export const updateTutorVideoSubmission = (videoFile) =>
  authService.updateTutorVideoSubmission(videoFile);
export const adminLogin = (credentials) => authService.adminLogin(credentials);
export const isAdmin = () => authService.isAdmin();
export const getAdminInfo = () => authService.getAdminInfo();
export const mockAdminLogin = (credentials) =>
  authService.mockAdminLogin(credentials);
