const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/lessonPipelineController");
const { authenticateToken, requireTutor, requireRole } = require("../middleware/auth");

// Tutor endpoints - manage pipeline for their students
router.get(
  "/auth/tutor/lesson-pipeline",
  authenticateToken,
  requireTutor,
  ctrl.getAllTutorPipelines
);

router.get(
  "/auth/tutor/lesson-pipeline/:studentId",
  authenticateToken,
  requireTutor,
  ctrl.getTutorStudentPipeline
);

router.put(
  "/auth/tutor/lesson-pipeline/:studentId/stage/:stageName",
  authenticateToken,
  requireTutor,
  ctrl.updateTutorStudentPipelineStage
);

// Admin endpoints - view and manage all pipelines
router.get(
  "/auth/admin/students/:studentId/pipeline",
  authenticateToken,
  requireRole("admin"),
  ctrl.getAdminStudentPipeline
);

router.put(
  "/auth/admin/students/:studentId/pipeline/:tutorId/stage/:stageName",
  authenticateToken,
  requireRole("admin"),
  ctrl.updateAdminStudentPipelineStage
);

router.post(
  "/auth/admin/lesson-pipeline/initialize",
  authenticateToken,
  requireRole("admin"),
  ctrl.initializePipeline
);

module.exports = router;

