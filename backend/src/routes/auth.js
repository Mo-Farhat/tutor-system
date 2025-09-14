const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
  tutorApplicationUpload,
  handleUploadError,
} = require("../middleware/upload");

// Student registration
router.post("/register", authController.registerStudent);

// User login (students, tutors, admin)
router.post("/login", authController.login);

// Tutor application submission
router.post(
  "/tutor/apply",
  tutorApplicationUpload,
  handleUploadError,
  authController.submitTutorApplication
);

// Admin: Approve tutor application
// router.post("/tutor/approve/:id", authController.approveTutorApplication);
router.post(
  "/tutor/approve/:id",
  authenticateToken,
  requireRole("admin"),
  authController.approveTutorApplication
);

// Password setup endpoints
router.get(
  "/tutor/setup-password/:token",
  authController.verifyPasswordSetupToken
);
router.post("/tutor/setup-password/:token", authController.setupTutorPassword);

// User profile endpoints
router.get("/profile", authController.getUserProfile);

// Auth status check
router.get("/check-auth", authenticateToken, authController.checkAuthStatus);

// Debug endpoint for development
router.get("/stats", authController.getStats);

// Health check for auth routes
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Authentication Service",
    timestamp: new Date().toISOString(),
  });
});

router.get("/tutor/stats", authController.getStats);

module.exports = router;
