/**
 * Subject Routes
 * Public routes: GET /api/subjects
 * Admin routes: /api/admin/subjects (CRUD)
 */
const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");
const { authenticateToken, requireRole } = require("../middleware/auth");

// ============ PUBLIC ROUTES ============
// No authentication required

// Get all active subjects grouped by yearLevel and curriculum
router.get("/", subjectController.listPublic);

// Get metadata (curricula and year levels)
router.get("/metadata", subjectController.getMetadata);

// Get subjects for a specific curriculum and year level
router.get("/filter", subjectController.filterSubjects);

// ============ ADMIN ROUTES ============
// Require admin role

// List all subjects (including inactive)
router.get(
  "/admin",
  authenticateToken,
  requireRole("admin"),
  subjectController.listAll
);

// Get a single subject
router.get(
  "/admin/:id",
  authenticateToken,
  requireRole("admin"),
  subjectController.getOne
);

// Create a new subject
router.post(
  "/admin",
  authenticateToken,
  requireRole("admin"),
  subjectController.create
);

// Bulk create subjects
router.post(
  "/admin/bulk",
  authenticateToken,
  requireRole("admin"),
  subjectController.bulkCreate
);

// Update a subject
router.put(
  "/admin/:id",
  authenticateToken,
  requireRole("admin"),
  subjectController.update
);

// Toggle subject active status
router.patch(
  "/admin/:id/toggle",
  authenticateToken,
  requireRole("admin"),
  subjectController.toggleStatus
);

// Delete a subject
router.delete(
  "/admin/:id",
  authenticateToken,
  requireRole("admin"),
  subjectController.deleteSubject
);

module.exports = router;

