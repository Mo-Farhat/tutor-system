import api from "./api";

// Dedicated service for tutor verification flow only
class TutorService {
  // Submit tutor application
  async submitApplication(applicationData) {
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add all text fields
      Object.keys(applicationData).forEach((key) => {
        if (
          key !== "videoSubmission" &&
          key !== "resume" &&
          applicationData[key] !== null
        ) {
          formData.append(key, applicationData[key]);
        }
      });

      // Add files if they exist
      if (applicationData.videoSubmission) {
        formData.append("videoSubmission", applicationData.videoSubmission);
      }

      if (applicationData.resume) {
        formData.append("resume", applicationData.resume);
      }

      const response = await api.post("/auth/tutor/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Tutor application error:", error);
      throw error;
    }
  }

  // Verify password setup token
  async verifyPasswordSetupToken(token) {
    try {
      const response = await api.get(`/auth/tutor/setup-password/${token}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Setup tutor password
  async setupPassword(token, passwordData) {
    try {
      const response = await api.post(
        `/auth/tutor/setup-password/${token}`,
        passwordData
      );

      if (response.data.tokens) {
        // Store tokens for auto-login
        localStorage.setItem("access_token", response.data.tokens.access);
        localStorage.setItem("refresh_token", response.data.tokens.refresh);
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Password setup error:", error);
      return { success: false, error: error.message };
    }
  }

  // Login specifically for tutors
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);

      // Store tokens after successful login
      if (response.data.tokens) {
        localStorage.setItem("access_token", response.data.tokens.access);
        localStorage.setItem("refresh_token", response.data.tokens.refresh);
      }

      return response.data;
    } catch (error) {
      console.error("Tutor login error:", error);
      throw error;
    }
  }

  // Get application stats (for admin testing)
  async getApplicationStats() {
    try {
      const response = await api.get("/auth/stats");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Admin function - approve tutor application
  async approveApplication(applicationId) {
    try {
      const response = await api.post(`/auth/tutor/approve/${applicationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const tutorService = new TutorService();
export default tutorService;
