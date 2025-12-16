/**
 * Subject Controller - API endpoints for subject management
 */
const subjectService = require("../services/subjectService");

/**
 * PUBLIC: Get all active subjects grouped by yearLevel and curriculum
 * GET /api/subjects
 */
exports.listPublic = async (req, res) => {
  try {
    const result = await subjectService.listPublicSubjects();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("subjectController.listPublic error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * PUBLIC: Get metadata (curricula and year levels)
 * GET /api/subjects/metadata
 */
exports.getMetadata = async (req, res) => {
  try {
    const result = await subjectService.getMetadata();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("subjectController.getMetadata error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * PUBLIC: Get subjects for a specific curriculum and year level
 * GET /api/subjects/filter?curriculum=VCE&yearLevel=Year 11/12
 */
exports.filterSubjects = async (req, res) => {
  try {
    const { curriculum, yearLevel } = req.query;

    if (!curriculum || !yearLevel) {
      return res.status(400).json({
        success: false,
        error: "curriculum and yearLevel query parameters are required",
      });
    }

    const result = await subjectService.getSubjectsByCurriculumAndYear(
      curriculum,
      yearLevel
    );
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("subjectController.filterSubjects error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * ADMIN: List all subjects (including inactive)
 * GET /api/admin/subjects
 */
exports.listAll = async (req, res) => {
  try {
    const { curriculum, yearLevel, isActive } = req.query;
    const filters = {};

    if (curriculum) filters.curriculum = curriculum;
    if (yearLevel) filters.yearLevel = yearLevel;
    if (isActive !== undefined) {
      filters.isActive = isActive === "true";
    }

    const result = await subjectService.listAllSubjects(filters);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("subjectController.listAll error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * ADMIN: Get a single subject
 * GET /api/admin/subjects/:id
 */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await subjectService.getSubject(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("subjectController.getOne error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * ADMIN: Create a new subject
 * POST /api/admin/subjects
 */
exports.create = async (req, res) => {
  try {
    console.log("subjectController.create - Request body:", JSON.stringify(req.body, null, 2));
    const { name, curriculum, yearLevel, isActive, sortOrder } = req.body;
    const result = await subjectService.createSubject({
      name,
      curriculum,
      yearLevel,
      isActive,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
    });
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("subjectController.create error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * ADMIN: Update a subject
 * PUT /api/admin/subjects/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, curriculum, yearLevel, isActive, sortOrder } = req.body;
    const result = await subjectService.updateSubject(id, {
      name,
      curriculum,
      yearLevel,
      isActive,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
    });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("subjectController.update error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * ADMIN: Delete a subject
 * DELETE /api/admin/subjects/:id
 */
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await subjectService.deleteSubject(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("subjectController.delete error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * ADMIN: Toggle subject active status
 * PATCH /api/admin/subjects/:id/toggle
 */
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await subjectService.toggleSubjectStatus(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("subjectController.toggleStatus error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * ADMIN: Bulk create subjects
 * POST /api/admin/subjects/bulk
 */
exports.bulkCreate = async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        error: "subjects array is required",
      });
    }

    const result = await subjectService.bulkCreateSubjects(subjects);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("subjectController.bulkCreate error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
