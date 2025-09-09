const express = require("express");
const router = express.Router();
const tutorController = require("../controllers/tutorController");
const {
  tutorApplicationUpload,
  handleUploadError,
} = require("../middleware/upload");

// Tutor Verification Flow Routes

// 1. Apply - Submit tutor application (with file upload support)
router.post(
  "/apply",
  tutorApplicationUpload,
  handleUploadError,
  tutorController.apply
);

// 2. Approve - Admin approves application (for testing)
router.post("/approve/:id", tutorController.approve);

// 3. Setup Password - Verify token and set password
router.get("/setup-password/:token", tutorController.verifySetupToken);
router.post("/setup-password/:token", tutorController.setPassword);

// 4. Profile - Get tutor profile data
router.get("/profile", tutorController.getTutorProfile);

// Authentication
router.post("/login", tutorController.login);

// Debug/Stats endpoint
router.get("/stats", tutorController.getStats);

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Tutor Verification Service",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
