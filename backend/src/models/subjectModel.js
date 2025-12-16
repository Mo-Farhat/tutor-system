/**
 * Subject Model - Database operations for Subject CRUD
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const subjectModel = {
  /**
   * Find all subjects with optional filters
   * @param {Object} filters - Filter options
   * @param {boolean} filters.isActive - Filter by active status
   * @param {string} filters.curriculum - Filter by curriculum
   * @param {string} filters.yearLevel - Filter by year level
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.curriculum) {
      where.curriculum = filters.curriculum;
    }

    if (filters.yearLevel) {
      where.yearLevel = filters.yearLevel;
    }

    return prisma.subject.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  /**
   * Find a subject by ID
   * @param {number} id - Subject ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return prisma.subject.findUnique({
      where: { id: Number(id) },
    });
  },

  /**
   * Find subjects by curriculum and year level
   * @param {string} curriculum - Curriculum code (e.g., "VCE", "HSC")
   * @param {string} yearLevel - Year level (e.g., "Year 11/12", "Year 1-10")
   * @returns {Promise<Array>}
   */
  async findByCurriculumAndYear(curriculum, yearLevel) {
    return prisma.subject.findMany({
      where: {
        curriculum,
        yearLevel,
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  /**
   * Create a new subject
   * @param {Object} data - Subject data
   * @param {string} data.name - Subject name
   * @param {string} data.curriculum - Curriculum code
   * @param {string} data.yearLevel - Year level
   * @param {boolean} data.isActive - Active status
   * @param {number} data.sortOrder - Sort order
   * @returns {Promise<Object>}
   */
  async create(data) {
    // Ensure required fields exist (defensive check)
    if (!data.name || !data.curriculum || !data.yearLevel) {
      throw new Error(`Missing required fields: ${JSON.stringify({ 
        name: !!data.name, 
        curriculum: !!data.curriculum, 
        yearLevel: !!data.yearLevel 
      })}`);
    }
    
    return prisma.subject.create({
      data: {
        name: data.name.trim(),
        curriculum: data.curriculum.trim(),
        yearLevel: data.yearLevel.trim(),
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : (parseInt(data.sortOrder) || 0),
      },
    });
  },

  /**
   * Update a subject
   * @param {number} id - Subject ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const updateData = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.curriculum !== undefined) {
      updateData.curriculum = data.curriculum.trim();
    }
    if (data.yearLevel !== undefined) {
      updateData.yearLevel = data.yearLevel.trim();
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    return prisma.subject.update({
      where: { id: Number(id) },
      data: updateData,
    });
  },

  /**
   * Delete a subject
   * @param {number} id - Subject ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return prisma.subject.delete({
      where: { id: Number(id) },
    });
  },

  /**
   * Check if a subject with the same name, curriculum, and yearLevel exists
   * @param {string} name - Subject name
   * @param {string} curriculum - Curriculum code
   * @param {string} yearLevel - Year level
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<Object|null>}
   */
  async findDuplicate(name, curriculum, yearLevel, excludeId = null) {
    // Safety check for null/undefined values
    if (!name || !curriculum || !yearLevel) {
      return null; // Can't be a duplicate if fields are missing
    }
    
    const where = {
      name: name.trim(),
      curriculum: curriculum.trim(),
      yearLevel: yearLevel.trim(),
    };

    if (excludeId) {
      where.NOT = { id: Number(excludeId) };
    }

    return prisma.subject.findFirst({ where });
  },

  /**
   * Get unique curricula
   * @returns {Promise<Array<string>>}
   */
  async getUniqueCurricula() {
    const results = await prisma.subject.findMany({
      where: { isActive: true },
      select: { curriculum: true },
      distinct: ["curriculum"],
      orderBy: { curriculum: "asc" },
    });
    return results.map((r) => r.curriculum);
  },

  /**
   * Get unique year levels
   * @returns {Promise<Array<string>>}
   */
  async getUniqueYearLevels() {
    const results = await prisma.subject.findMany({
      where: { isActive: true },
      select: { yearLevel: true },
      distinct: ["yearLevel"],
      orderBy: { yearLevel: "asc" },
    });
    return results.map((r) => r.yearLevel);
  },

  /**
   * Bulk create subjects
   * @param {Array<Object>} subjects - Array of subject data
   * @returns {Promise<Object>} - Count of created subjects
   */
  async bulkCreate(subjects) {
    return prisma.subject.createMany({
      data: subjects.map((s) => ({
        name: s.name.trim(),
        curriculum: s.curriculum.trim(),
        yearLevel: s.yearLevel.trim(),
        isActive: s.isActive !== undefined ? s.isActive : true,
        sortOrder: s.sortOrder || 0,
      })),
      skipDuplicates: true,
    });
  },
};

module.exports = subjectModel;
