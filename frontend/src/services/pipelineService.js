import authService from './authService';

const API_BASE_URL = `${
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
}/api`;

/**
 * Pipeline Service
 * Handles all API calls related to lesson pipeline management
 */

class PipelineService {
  /**
   * Get pipeline for a specific student (tutor view)
   * @param {number} studentId - The student ID
   * @returns {Promise} Pipeline data
   */
  async getTutorStudentPipeline(studentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/tutor/lesson-pipeline/${studentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch pipeline');
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching tutor student pipeline:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a specific pipeline stage for a student (tutor updating)
   * @param {number} studentId - The student ID
   * @param {string} stageName - The stage name (e.g., 'initial_contact')
   * @param {object} updateData - The update data { status, date, notes }
   * @returns {Promise} Updated pipeline stage
   */
  async updateTutorStudentPipelineStage(studentId, stageName, updateData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/tutor/lesson-pipeline/${studentId}/stage/${stageName}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update pipeline stage');
      }

      return { success: true, data: data.data, message: data.message };
    } catch (error) {
      console.error('Error updating tutor student pipeline stage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all pipelines for tutor's students
   * @returns {Promise} All student pipelines for the tutor
   */
  async getAllTutorPipelines() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/tutor/lesson-pipeline`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch pipelines');
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching all tutor pipelines:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pipeline for a specific student (admin view)
   * @param {number} studentId - The student ID
   * @returns {Promise} Pipeline data for all tutors
   */
  async getAdminStudentPipeline(studentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/admin/students/${studentId}/pipeline`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch student pipeline');
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching admin student pipeline:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a specific pipeline stage for a student (admin updating)
   * @param {number} studentId - The student ID
   * @param {number} tutorId - The tutor ID
   * @param {string} stageName - The stage name
   * @param {object} updateData - The update data { status, date, notes }
   * @returns {Promise} Updated pipeline stage
   */
  async updateAdminStudentPipelineStage(studentId, tutorId, stageName, updateData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/admin/students/${studentId}/pipeline/${tutorId}/stage/${stageName}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update pipeline stage');
      }

      return { success: true, data: data.data, message: data.message };
    } catch (error) {
      console.error('Error updating admin student pipeline stage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize pipeline for a new student-tutor pair (admin action)
   * @param {number} studentId - The student ID
   * @param {number} tutorId - The tutor ID
   * @returns {Promise} Initialized pipeline
   */
  async initializePipeline(studentId, tutorId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/admin/lesson-pipeline/initialize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
          body: JSON.stringify({ studentId, tutorId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initialize pipeline');
      }

      return { success: true, data: data.data, message: data.message };
    } catch (error) {
      console.error('Error initializing pipeline:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper function to format stage name for display
   * @param {string} stageKey - The stage key (e.g., 'initial_contact')
   * @returns {string} Formatted stage name
   */
  formatStageName(stageKey) {
    const stageNames = {
      initial_contact: 'Initial Contact',
      academic_consultation: 'Academic Consultation',
      payment_method_added: 'Payment Method Added',
      first_paid_lesson: 'First Paid Lesson',
      package_purchase: 'Package Purchase',
      regular_sessions: 'Regular Sessions',
    };
    return stageNames[stageKey] || stageKey;
  }

  /**
   * Get status icon class for pipeline stage
   * @param {string} status - The status (pending, in_progress, completed)
   * @returns {string} Icon class name
   */
  getStatusIcon(status) {
    const icons = {
      completed: 'fa-check',
      in_progress: 'fa-clock',
      pending: 'fa-circle',
    };
    return icons[status] || 'fa-circle';
  }

  /**
   * Get status color class for pipeline stage
   * @param {string} status - The status
   * @returns {string} Color class name
   */
  getStatusColorClass(status) {
    const colors = {
      completed: 'success',
      in_progress: 'primary',
      pending: 'secondary',
    };
    return colors[status] || 'secondary';
  }
}

// Create and export a singleton instance
const pipelineService = new PipelineService();
export default pipelineService;

// Export individual methods for direct import
export const getTutorStudentPipeline = (studentId) =>
  pipelineService.getTutorStudentPipeline(studentId);
export const updateTutorStudentPipelineStage = (studentId, stageName, updateData) =>
  pipelineService.updateTutorStudentPipelineStage(studentId, stageName, updateData);
export const getAllTutorPipelines = () =>
  pipelineService.getAllTutorPipelines();
export const getAdminStudentPipeline = (studentId) =>
  pipelineService.getAdminStudentPipeline(studentId);
export const updateAdminStudentPipelineStage = (studentId, tutorId, stageName, updateData) =>
  pipelineService.updateAdminStudentPipelineStage(studentId, tutorId, stageName, updateData);
export const initializePipeline = (studentId, tutorId) =>
  pipelineService.initializePipeline(studentId, tutorId);
export const formatStageName = (stageKey) =>
  pipelineService.formatStageName(stageKey);
export const getStatusIcon = (status) =>
  pipelineService.getStatusIcon(status);
export const getStatusColorClass = (status) =>
  pipelineService.getStatusColorClass(status);

