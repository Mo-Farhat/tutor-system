const API_BASE_URL = 'http://localhost:8000/api/auth';

class AuthService {
  // Helper method to make API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {},
      ...options,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Add any additional headers
    if (options.headers) {
      Object.assign(config.headers, options.headers);
    }

    // Add auth token if available
    const token = this.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data && typeof data === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            }
          }
          throw new Error(errorMessages.join('. ') || 'Validation failed');
        }
        
        throw new Error(data.detail || data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Register a new student user
  async registerStudent(userData) {
    const data = await this.makeRequest('/register/', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        role: 'student' // Force student role for signup page
      }),
    });

    // Store tokens after successful registration
    if (data.tokens) {
      this.setTokens(data.tokens.access, data.tokens.refresh);
    }

    return data;
  }

  // Submit tutor application
  async submitTutorApplication(applicationData) {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add all text fields
    formData.append('fullName', applicationData.fullName);
    formData.append('phone', applicationData.phone);
    formData.append('email', applicationData.email);
    formData.append('currentStudy', applicationData.currentStudy);
    formData.append('year12State', applicationData.year12State);
    formData.append('year12CompletionYear', applicationData.year12CompletionYear);
    formData.append('currentState', applicationData.currentState);
    formData.append('atar', parseFloat(applicationData.atar));
    formData.append('canCommit3Hours', applicationData.canCommit3Hours);
    formData.append('canCommit1Year', applicationData.canCommit1Year);
    formData.append('canTutorMostWeeks', applicationData.canTutorMostWeeks);
    formData.append('canTutorGroups', applicationData.canTutorGroups);
    formData.append('subjectsToTutor', applicationData.subjectsToTutor);
    formData.append('hasWorkingWithChildrenCheck', applicationData.hasWorkingWithChildrenCheck);
    formData.append('motivation', applicationData.motivation);
    
    // Add files if they exist
    if (applicationData.videoSubmission) {
      formData.append('videoSubmission', applicationData.videoSubmission);
    }
    
    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }

    // Make request WITHOUT authentication for tutor application
    const url = `${API_BASE_URL}/tutor/apply/`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Explicitly don't add Authorization header - this endpoint doesn't require auth
    });

    // Handle response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // Handle validation errors
      if (response.status === 400 && data && typeof data === 'object') {
        const errorMessages = [];
        for (const [field, messages] of Object.entries(data)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages);
          } else if (typeof messages === 'string') {
            errorMessages.push(messages);
          }
        }
        throw new Error(errorMessages.join('. ') || 'Validation failed');
      }
      
      throw new Error(data.detail || data.message || data.error || 'Request failed');
    }

    return data;
  }

  // Login user (any role)
  async login(credentials) {
    const data = await this.makeRequest('/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens after successful login
    if (data.tokens) {
      this.setTokens(data.tokens.access, data.tokens.refresh);
    }

    return data;
  }

  // Logout user
  async logout() {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      try {
        await this.makeRequest('/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    // Clear tokens regardless of API call success
    this.clearTokens();
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const data = await this.makeRequest('/profile/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Alias for getCurrentUser for consistency
  async getUserProfile() {
    try {
      const data = await this.makeRequest('/profile/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Tutor password setup functions
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
      // Make direct fetch call without authentication headers
      const url = `${API_BASE_URL}/tutor/setup-password/${token}/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      // Handle response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && data && typeof data === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data)) {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            }
          }
          throw new Error(errorMessages.join('. ') || 'Validation failed');
        }
        
        throw new Error(data.detail || data.message || data.error || 'Request failed');
      }
      
      if (data.tokens) {
        // Store tokens and update auth state
        this.setTokens(data.tokens.access, data.tokens.refresh);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Password setup error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is authenticated
  async checkAuthStatus() {
    try {
      return await this.makeRequest('/check-auth/');
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Refresh access token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const data = await this.makeRequest('/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (data.access) {
        localStorage.setItem('access_token', data.access);
      }

      return data;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Token management methods
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Get user info from stored token (decode JWT payload)
  getUserInfo() {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      // Decode JWT payload (simple base64 decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.user_id,
        username: payload.username,
        exp: payload.exp,
        // Note: The Django JWT doesn't include role in token by default
        // We'll get role info from the user profile API call instead
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Document management methods
  async getTutorDocuments() {
    try {
      const data = await this.makeRequest('/tutor/documents/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadTutorDocuments(documentData) {
    try {
      const formData = new FormData();
      
      if (documentData.tutorContract) {
        formData.append('tutor_contract', documentData.tutorContract);
      }
      
      if (documentData.wwccDocument) {
        formData.append('wwcc_document', documentData.wwccDocument);
      }

      const data = await this.makeRequest('/tutor/documents/', {
        method: 'POST',
        body: formData,
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Payment management methods
  async getPaymentDetails() {
    try {
      const data = await this.makeRequest('/tutor/payment-details/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updatePaymentDetails(paymentData) {
    try {
      const data = await this.makeRequest('/tutor/payment-details/', {
        method: 'PUT',
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
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const endpoint = `/tutor/transactions/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const data = await this.makeRequest(endpoint);
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Subject selection methods
  async getSubjectSelectionData() {
    try {
      const data = await this.makeRequest('/subjects/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTutorSubjects() {
    try {
      const data = await this.makeRequest('/tutor/subjects/');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTutorSubjects(subjectsData) {
    try {
      const data = await this.makeRequest('/tutor/subjects/', {
        method: 'PUT',
        body: JSON.stringify(subjectsData),
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Public tutor search methods
  async getLiveTutors() {
    try {
      const data = await this.makeRequest('/tutors/live/', {
        method: 'GET'
      });
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTutorById(tutorId) {
    try {
      const data = await this.makeRequest(`/tutors/${tutorId}/`, {
        method: 'GET'
      });
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Profile update methods
  async updateUserProfile(profileData) {
    try {
      const data = await this.makeRequest('/profile/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTutorProfile(profileData) {
    try {
      const data = await this.makeRequest('/tutor/profile/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

// Export individual functions for direct import
export const registerStudent = (userData) => authService.registerStudent(userData);
export const submitTutorApplication = (applicationData) => authService.submitTutorApplication(applicationData);
export const login = (credentials) => authService.login(credentials);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const getUserProfile = () => authService.getUserProfile();
export const checkAuthStatus = () => authService.checkAuthStatus();
export const verifyPasswordSetupToken = (token) => authService.verifyPasswordSetupToken(token);
export const setupTutorPassword = (token, passwordData) => authService.setupTutorPassword(token, passwordData);
export const refreshToken = () => authService.refreshToken();
export const isAuthenticated = () => authService.isAuthenticated();
export const getUserInfo = () => authService.getUserInfo();
export const getTutorDocuments = () => authService.getTutorDocuments();
export const uploadTutorDocuments = (documentData) => authService.uploadTutorDocuments(documentData);
export const getPaymentDetails = () => authService.getPaymentDetails();
export const updatePaymentDetails = (paymentData) => authService.updatePaymentDetails(paymentData);
export const getTransactionHistory = (filters) => authService.getTransactionHistory(filters);
export const getSubjectSelectionData = () => authService.getSubjectSelectionData();
export const getTutorSubjects = () => authService.getTutorSubjects();
export const updateTutorSubjects = (subjectsData) => authService.updateTutorSubjects(subjectsData);
export const getLiveTutors = () => authService.getLiveTutors();
export const getTutorById = (tutorId) => authService.getTutorById(tutorId);
export const updateUserProfile = (profileData) => authService.updateUserProfile(profileData);
export const updateTutorProfile = (profileData) => authService.updateTutorProfile(profileData); 