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

  // Upload profile documents (for future implementation)
  async uploadDocument(file, documentType) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const response = await api.post("/auth/tutor/upload-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Upload document error:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const profileService = new ProfileService();
export default profileService;
