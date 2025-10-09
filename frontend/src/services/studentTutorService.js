import api from "./api";

class StudentTutorService {
  /**
   * Create a new student-tutor assignment
   * @param {Object} assignmentData - Assignment data containing studentId, tutorId, subject, and status
   * @returns {Promise} Promise that resolves to the created assignment
   */
  async createAssignment(assignmentData) {
    try {
      const response = await api.post("/admin/assignments", assignmentData);
      return response.data;
    } catch (error) {
      console.error("Error creating student-tutor assignment:", error);
      throw error;
    }
  }

  /**
   * Update an existing student-tutor assignment
   * @param {number} assignmentId - ID of the assignment to update
   * @param {Object} updates - Object containing fields to update (subject, status, endedAt)
   * @returns {Promise} Promise that resolves to the updated assignment
   */
  async updateAssignment(assignmentId, updates) {
    try {
      const response = await api.put(`/admin/assignments/${assignmentId}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating student-tutor assignment:", error);
      throw error;
    }
 }

  /**
   * Delete a student-tutor assignment
   * @param {number} assignmentId - ID of the assignment to delete
   * @returns {Promise} Promise that resolves to the deletion result
   */
  async deleteAssignment(assignmentId) {
    try {
      const response = await api.delete(`/admin/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting student-tutor assignment:", error);
      throw error;
    }
  }

  /**
   * Get assignments for the authenticated tutor
   * @returns {Promise} Promise that resolves to the list of assignments
   */
  async getMyStudents() {
    try {
      const response = await api.get("/auth/tutor/my-students");
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor's students:", error);
      throw error;
    }
  }

  /**
   * Get assignments for the authenticated student
   * @returns {Promise} Promise that resolves to the list of assignments
   */
  async getMyTutors() {
    try {
      const response = await api.get("/auth/student/my-tutors");
      return response.data;
    } catch (error) {
      console.error("Error fetching student's tutors:", error);
      throw error;
    }
  }
}

export default new StudentTutorService();