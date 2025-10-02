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
}

export default new TutorService();
