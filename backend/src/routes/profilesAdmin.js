const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/profileAdminController");

const router = express.Router();

router.get(
  "/admin/profiles",
  authenticateToken,
  requireRole("admin"),
  ctrl.list
);
router.get(
  "/admin/profiles/:userId",
  authenticateToken,
  requireRole("admin"),
  ctrl.get
);
router.post(
  "/admin/profiles",
  authenticateToken,
  requireRole("admin"),
  ctrl.create
);
router.delete(
  "/admin/profiles/:userId",
  authenticateToken,
  requireRole("admin"),
  ctrl.remove
);
router.put(
  "/admin/profiles/:userId/make-live",
  authenticateToken,
  requireRole("admin"),
  ctrl.makeLive
);
router.put(
  "/admin/profiles/:userId/make-offline",
  authenticateToken,
  requireRole("admin"),
  ctrl.makeOffline
);

// Student profile endpoints for admin
router.get(
  "/admin/students/:userId/profile",
  authenticateToken,
  requireRole("admin"),
  ctrl.getStudentProfile
);
router.put(
  "/admin/students/:userId/profile",
  authenticateToken,
  requireRole("admin"),
  ctrl.updateStudentProfile
);

// Mock endpoints for development (unprotected)
router.get("/mock/profiles", ctrl.list);
router.put("/mock/profiles/:userId/make-live", ctrl.makeLive);
router.put("/mock/profiles/:userId/make-offline", ctrl.makeOffline);

// Admin: Get tutor documents by userId
router.get(
  "/admin/tutors/:userId/documents",
  authenticateToken,
  requireRole("admin"),
  ctrl.getTutorDocuments
);

module.exports = router;
