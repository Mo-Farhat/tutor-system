import api from "./api";

class ProfileService {
  // Get my tutor profile (authenticated)
  async getMyTutorProfile() {
    try {
      const response = await api.get("/auth/tutor/my-profile");
      return response.data;
    } catch (error) {
      console.error("Get my profile error:", error);
      throw error;
    }
  }

  // Get tutor profile by username (public)
  async getTutorProfile(username) {
    try {
      const response = await api.get(
        `/auth/tutor/profile?username=${username}`
      );
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  // Update tutor profile
  async updateTutorProfile(profileData) {
    try {
      const response = await api.put("/auth/tutor/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put(
        "/auth/tutor/change-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  // Get my profile completion status (authenticated)
  async getMyCompletionStatus() {
    try {
      const response = await api.get("/auth/tutor/my-completion-status");
      return response.data;
    } catch (error) {
      console.error("Get my completion status error:", error);
      throw error;
    }
  }

  // Get profile completion status by username (public)
  async getCompletionStatus(username) {
    try {
      const response = await api.get(
        `/auth/tutor/completion-status?username=${username}`
      );
      return response.data;
    } catch (error) {
      console.error("Get completion status error:", error);
      throw error;
    }
  }

  // Payment Information Methods
  async getPaymentInfo() {
    try {
      const response = await api.get("/auth/tutor/payment");
      return response.data;
    } catch (error) {
      console.error("Get payment info error:", error);
      throw error;
    }
  }

  async updatePaymentInfo(paymentData) {
    try {
      const response = await api.put("/auth/tutor/payment", paymentData);
      return response.data;
    } catch (error) {
      console.error("Update payment info error:", error);
      throw error;
    }
  }

  // Video Introduction Methods
  async uploadVideoIntro(file) {
    try {
      const formData = new FormData();
      formData.append("videoIntro", file);

      const response = await api.post(
        "/auth/tutor/upload/video-intro",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Upload video intro error:", error);
      throw error;
    }
  }

  // Document Upload Methods
  async uploadDocuments(contractFile, wwccFile, wwccExpiry) {
    try {
      const formData = new FormData();
      if (contractFile) formData.append("contract", contractFile);
      if (wwccFile) formData.append("wwcc", wwccFile);
      if (wwccExpiry) formData.append("wwccExpiry", wwccExpiry);

      const response = await api.post(
        "/auth/tutor/upload/documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Upload documents error:", error);
      throw error;
    }
  }

  async getDocuments() {
    try {
      // Profile routes are mounted at /api/auth
      const response = await api.get("/auth/tutor/documents");
      return response.data;
    } catch (error) {
      console.error("Get documents error:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const profileService = new ProfileService();
export default profileService;
