import api from "./api";

class TutorService {
  // Lesson management
  async getUpcomingLessons() {
    try {
      const response = await api.get("/auth/tutor/lessons/upcoming");
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming lessons:", error);
      return { success: false, error: error.message };
    }
  }

  async getCompletedLessons() {
    try {
      const response = await api.get("/auth/tutor/lessons/completed");
      return response.data;
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
      return { success: false, error: error.message };
    }
  }

  async getLesson(id) {
    try {
      const response = await api.get(`/auth/tutor/lessons/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      return { success: false, error: error.message };
    }
  }

  async createLesson(lessonData) {
    try {
      const response = await api.post("/auth/tutor/lessons", lessonData);
      return response.data;
    } catch (error) {
      console.error("Error creating lesson:", error);
      return { success: false, error: error.message };
    }
  }

  async updateLesson(id, updates) {
    try {
      const response = await api.put(`/auth/tutor/lessons/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating lesson:", error);
      return { success: false, error: error.message };
    }
  }

  async markSessionComplete(id, deliveryMode = "online") {
    try {
      const response = await api.post(`/auth/tutor/lessons/${id}/complete`, {
        deliveryMode,
      });
      return response.data;
    } catch (error) {
      console.error("Error marking session complete:", error);
      return { success: false, error: error.message };
    }
  }

  async getUpcomingLessons() {
    try {
      const response = await api.get("/auth/tutor/lessons/upcoming");
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming lessons:", error);
      return { success: false, error: error.message };
    }
  }

  async deleteLesson(id) {
    try {
      const response = await api.delete(`/auth/tutor/lessons/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      return { success: false, error: error.message };
    }
  }

  // Student management
  async getMyStudents() {
    try {
      const response = await api.get("/auth/tutor/my-students");
      return response.data;
    } catch (error) {
      console.error("Error fetching my students:", error);
      return { success: false, error: error.message };
    }
  }

  async getStudentProfile(pairId) {
    try {
      const response = await api.get(`/auth/tutor/students/${pairId}/profile`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student profile:", error);
      return { success: false, error: error.message };
    }
  }

  // Tutor earnings
  async getEarnings() {
    try {
      const response = await api.get("/auth/tutor/earnings");
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor earnings:", error);
      return { success: false, error: error.message };
    }
  }

  // Tutor notifications
  async getNotifications() {
    try {
      const response = await api.get("/auth/tutor/notifications");
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor notifications:", error);
      return { success: false, error: error.message };
    }
  }

  // Report management
  async getReports() {
    try {
      const response = await api.get("/auth/tutor/reports");
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor reports:", error);
      return { success: false, error: error.message };
    }
  }

  async getReport(id) {
    try {
      const response = await api.get(`/auth/tutor/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor report:", error);
      return { success: false, error: error.message };
    }
  }

  async createReport(reportData) {
    try {
      const response = await api.post("/auth/tutor/reports", reportData);
      return response.data;
    } catch (error) {
      console.error("Error creating tutor report:", error);
      return { success: false, error: error.message };
    }
  }

  async updateReport(id, reportData) {
    try {
      const response = await api.put(`/auth/tutor/reports/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error("Error updating tutor report:", error);
      return { success: false, error: error.message };
    }
  }

  async deleteReport(id) {
    try {
      const response = await api.delete(`/auth/tutor/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting tutor report:", error);
      return { success: false, error: error.message };
    }
  }

  // Change Requests
  async submitChangeRequest(changeRequestData) {
    try {
      const response = await api.post("/auth/tutor/change-requests", changeRequestData);
      return response.data;
    } catch (error) {
      console.error("Error submitting change request:", error);
      return { success: false, error: error.message };
    }
  }

  async getMyChangeRequests() {
    try {
      const response = await api.get("/auth/tutor/change-requests");
      return response.data;
    } catch (error) {
      console.error("Error fetching change requests:", error);
      return { success: false, error: error.message };
    }
  }

  // Stripe Connect
  async setupStripeConnect() {
    try {
      const response = await api.post("/auth/tutor/payouts/setup");
      return response.data;
    } catch (error) {
      console.error("Error setting up Stripe Connect:", error);
      return { success: false, error: error.message };
    }
  }

  async getStripeStatus() {
    try {
      const response = await api.get("/auth/tutor/payouts/stripe-status");
      return response.data;
    } catch (error) {
      console.error("Error fetching Stripe status:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new TutorService();
