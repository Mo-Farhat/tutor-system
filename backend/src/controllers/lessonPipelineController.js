const lessonPipelineService = require("../services/lessonPipelineService");

/**
 * Get pipeline for a specific student (tutor accessing their student's pipeline)
 * GET /api/auth/tutor/lesson-pipeline/:studentId
 */
async function getTutorStudentPipeline(req, res) {
  try {
    const { studentId } = req.params;
    const tutorId = req.user.id; // From auth middleware

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const pipeline = await lessonPipelineService.getPipeline(studentId, tutorId);

    res.json({
      success: true,
      data: {
        studentId: parseInt(studentId),
        tutorId: tutorId,
        stages: pipeline,
      },
    });
  } catch (error) {
    console.error("Error in getTutorStudentPipeline:", error);
    res.status(500).json({
      error: "Failed to fetch pipeline",
      message: error.message,
    });
  }
}

/**
 * Update a pipeline stage for a student (tutor updating)
 * PUT /api/auth/tutor/lesson-pipeline/:studentId/stage/:stageName
 */
async function updateTutorStudentPipelineStage(req, res) {
  try {
    const { studentId, stageName } = req.params;
    const tutorId = req.user.id; // From auth middleware
    const { status, date, notes } = req.body;

    if (!studentId || !stageName) {
      return res.status(400).json({ error: "Student ID and stage name are required" });
    }

    const updateData = {
      status,
      date,
      notes,
    };

    const updated = await lessonPipelineService.updatePipelineStage(
      studentId,
      tutorId,
      stageName,
      updateData
    );

    res.json({
      success: true,
      data: updated,
      message: "Pipeline stage updated successfully",
    });
  } catch (error) {
    console.error("Error in updateTutorStudentPipelineStage:", error);
    res.status(500).json({
      error: "Failed to update pipeline stage",
      message: error.message,
    });
  }
}

/**
 * Get all pipelines for a student (admin view)
 * GET /api/auth/admin/students/:studentId/pipeline
 */
async function getAdminStudentPipeline(req, res) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const pipelines = await lessonPipelineService.getStudentPipelines(studentId);

    res.json({
      success: true,
      data: {
        studentId: parseInt(studentId),
        tutors: pipelines,
      },
    });
  } catch (error) {
    console.error("Error in getAdminStudentPipeline:", error);
    res.status(500).json({
      error: "Failed to fetch student pipelines",
      message: error.message,
    });
  }
}

/**
 * Update a pipeline stage for a student (admin updating)
 * PUT /api/auth/admin/students/:studentId/pipeline/:tutorId/stage/:stageName
 */
async function updateAdminStudentPipelineStage(req, res) {
  try {
    const { studentId, tutorId, stageName } = req.params;
    const { status, date, notes } = req.body;

    if (!studentId || !tutorId || !stageName) {
      return res.status(400).json({ 
        error: "Student ID, tutor ID, and stage name are required" 
      });
    }

    const updateData = {
      status,
      date,
      notes,
    };

    const updated = await lessonPipelineService.updatePipelineStage(
      studentId,
      tutorId,
      stageName,
      updateData
    );

    res.json({
      success: true,
      data: updated,
      message: "Pipeline stage updated successfully",
    });
  } catch (error) {
    console.error("Error in updateAdminStudentPipelineStage:", error);
    res.status(500).json({
      error: "Failed to update pipeline stage",
      message: error.message,
    });
  }
}

/**
 * Get all pipelines for tutor's students
 * GET /api/auth/tutor/lesson-pipeline
 */
async function getAllTutorPipelines(req, res) {
  try {
    const tutorId = req.user.id; // From auth middleware

    const pipelines = await lessonPipelineService.getTutorPipelines(tutorId);

    res.json({
      success: true,
      data: {
        tutorId: tutorId,
        students: pipelines,
      },
    });
  } catch (error) {
    console.error("Error in getAllTutorPipelines:", error);
    res.status(500).json({
      error: "Failed to fetch tutor pipelines",
      message: error.message,
    });
  }
}

/**
 * Initialize pipeline for a new student-tutor pair (admin action)
 * POST /api/auth/admin/lesson-pipeline/initialize
 */
async function initializePipeline(req, res) {
  try {
    const { studentId, tutorId } = req.body;

    if (!studentId || !tutorId) {
      return res.status(400).json({ 
        error: "Student ID and tutor ID are required" 
      });
    }

    const pipeline = await lessonPipelineService.initializePipelineForPair(
      studentId,
      tutorId
    );

    res.json({
      success: true,
      data: pipeline,
      message: "Pipeline initialized successfully",
    });
  } catch (error) {
    console.error("Error in initializePipeline:", error);
    res.status(500).json({
      error: "Failed to initialize pipeline",
      message: error.message,
    });
  }
}

module.exports = {
  getTutorStudentPipeline,
  updateTutorStudentPipelineStage,
  getAdminStudentPipeline,
  updateAdminStudentPipelineStage,
  getAllTutorPipelines,
  initializePipeline,
};

