/**
 * Subject Service - Business logic for subject management
 */
const subjectModel = require("../models/subjectModel");

class SubjectService {
  /**
   * List all subjects (public - only active)
   * Returns subjects grouped by yearLevel and curriculum
   * @returns {Promise<Object>}
   */
  async listPublicSubjects() {
    try {
      const subjects = await subjectModel.findAll({ isActive: true });

      // Group subjects by yearLevel, then by curriculum
      const grouped = {};
      const flat = [];

      for (const subject of subjects) {
        const { yearLevel, curriculum, name, id } = subject;

        if (!grouped[yearLevel]) {
          grouped[yearLevel] = {};
        }

        if (!grouped[yearLevel][curriculum]) {
          grouped[yearLevel][curriculum] = [];
        }

        grouped[yearLevel][curriculum].push(name);
        flat.push({ id, name, curriculum, yearLevel });
      }

      return {
        success: true,
        data: grouped,
        flat,
      };
    } catch (error) {
      console.error("SubjectService.listPublicSubjects error:", error);
      return { success: false, error: "Failed to fetch subjects" };
    }
  }

  /**
   * List all subjects for admin (includes inactive)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>}
   */
  async listAllSubjects(filters = {}) {
    try {
      const subjects = await subjectModel.findAll(filters);
      return {
        success: true,
        data: subjects,
        total: subjects.length,
      };
    } catch (error) {
      console.error("SubjectService.listAllSubjects error:", error);
      return { success: false, error: "Failed to fetch subjects" };
    }
  }

  /**
   * Get a single subject by ID
   * @param {number} id - Subject ID
   * @returns {Promise<Object>}
   */
  async getSubject(id) {
    try {
      const subject = await subjectModel.findById(id);
      if (!subject) {
        return { success: false, error: "Subject not found" };
      }
      return { success: true, data: subject };
    } catch (error) {
      console.error("SubjectService.getSubject error:", error);
      return { success: false, error: "Failed to fetch subject" };
    }
  }

  /**
   * Create a new subject
   * @param {Object} data - Subject data
   * @returns {Promise<Object>}
   */
  async createSubject(data) {
    try {
      // Validate required fields
      if (!data.name?.trim()) {
        return { success: false, error: "Subject name is required" };
      }
      if (!data.curriculum?.trim()) {
        return { success: false, error: "Curriculum is required" };
      }
      if (!data.yearLevel?.trim()) {
        return { success: false, error: "Year level is required" };
      }

      // Check for duplicate
      const duplicate = await subjectModel.findDuplicate(
        data.name,
        data.curriculum,
        data.yearLevel
      );
      if (duplicate) {
        return {
          success: false,
          error: "A subject with this name, curriculum, and year level already exists",
        };
      }

      const subject = await subjectModel.create(data);
      return { success: true, data: subject };
    } catch (error) {
      console.error("SubjectService.createSubject error:", error);
      return { success: false, error: "Failed to create subject" };
    }
  }

  /**
   * Update a subject
   * @param {number} id - Subject ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  async updateSubject(id, data) {
    try {
      // Check if subject exists
      const existing = await subjectModel.findById(id);
      if (!existing) {
        return { success: false, error: "Subject not found" };
      }

      // If updating name/curriculum/yearLevel, check for duplicates
      if (data.name || data.curriculum || data.yearLevel) {
        const name = data.name || existing.name;
        const curriculum = data.curriculum || existing.curriculum;
        const yearLevel = data.yearLevel || existing.yearLevel;

        const duplicate = await subjectModel.findDuplicate(
          name,
          curriculum,
          yearLevel,
          id
        );
        if (duplicate) {
          return {
            success: false,
            error: "A subject with this name, curriculum, and year level already exists",
          };
        }
      }

      const subject = await subjectModel.update(id, data);
      return { success: true, data: subject };
    } catch (error) {
      console.error("SubjectService.updateSubject error:", error);
      return { success: false, error: "Failed to update subject" };
    }
  }

  /**
   * Delete a subject
   * @param {number} id - Subject ID
   * @returns {Promise<Object>}
   */
  async deleteSubject(id) {
    try {
      const existing = await subjectModel.findById(id);
      if (!existing) {
        return { success: false, error: "Subject not found" };
      }

      await subjectModel.delete(id);
      return { success: true, message: "Subject deleted successfully" };
    } catch (error) {
      console.error("SubjectService.deleteSubject error:", error);
      return { success: false, error: "Failed to delete subject" };
    }
  }

  /**
   * Toggle subject active status
   * @param {number} id - Subject ID
   * @returns {Promise<Object>}
   */
  async toggleSubjectStatus(id) {
    try {
      const existing = await subjectModel.findById(id);
      if (!existing) {
        return { success: false, error: "Subject not found" };
      }

      const subject = await subjectModel.update(id, {
        isActive: !existing.isActive,
      });
      return { success: true, data: subject };
    } catch (error) {
      console.error("SubjectService.toggleSubjectStatus error:", error);
      return { success: false, error: "Failed to toggle subject status" };
    }
  }

  /**
   * Get subjects for a specific curriculum and year level
   * @param {string} curriculum - Curriculum code
   * @param {string} yearLevel - Year level
   * @returns {Promise<Object>}
   */
  async getSubjectsByCurriculumAndYear(curriculum, yearLevel) {
    try {
      const subjects = await subjectModel.findByCurriculumAndYear(
        curriculum,
        yearLevel
      );
      return {
        success: true,
        data: subjects.map((s) => s.name),
      };
    } catch (error) {
      console.error("SubjectService.getSubjectsByCurriculumAndYear error:", error);
      return { success: false, error: "Failed to fetch subjects" };
    }
  }

  /**
   * Get metadata (unique curricula and year levels)
   * @returns {Promise<Object>}
   */
  async getMetadata() {
    try {
      const [curricula, yearLevels] = await Promise.all([
        subjectModel.getUniqueCurricula(),
        subjectModel.getUniqueYearLevels(),
      ]);

      return {
        success: true,
        data: {
          curricula,
          yearLevels,
        },
      };
    } catch (error) {
      console.error("SubjectService.getMetadata error:", error);
      return { success: false, error: "Failed to fetch metadata" };
    }
  }

  /**
   * Bulk create subjects (for seeding)
   * @param {Array<Object>} subjects - Array of subject data
   * @returns {Promise<Object>}
   */
  async bulkCreateSubjects(subjects) {
    try {
      const result = await subjectModel.bulkCreate(subjects);
      return {
        success: true,
        data: result,
        message: `Created ${result.count} subjects`,
      };
    } catch (error) {
      console.error("SubjectService.bulkCreateSubjects error:", error);
      return { success: false, error: "Failed to bulk create subjects" };
    }
  }
}

module.exports = new SubjectService();
