const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const {
  authenticateToken,
  requireTutor,
  requireOwnProfile,
} = require("../middleware/auth");
const {
  validateProfileUpdate,
  validatePasswordChange,
} = require("../middleware/validation");

// Get tutor profile (public endpoint for profile viewing)
router.get("/tutor/profile", profileController.getTutorProfile);

// Get my profile (authenticated endpoint)
router.get(
  "/tutor/my-profile",
  authenticateToken,
  requireTutor,
  profileController.getTutorProfile
);

// Get profile completion status (public endpoint)
router.get("/tutor/completion-status", profileController.getCompletionStatus);

// Get my completion status (authenticated endpoint)
router.get(
  "/tutor/my-completion-status",
  authenticateToken,
  requireTutor,
  profileController.getCompletionStatus
);

// Update tutor profile (protected - tutors only, own profile only)
router.put(
  "/tutor/profile",
  authenticateToken,
  requireTutor,
  validateProfileUpdate,
  profileController.updateTutorProfile
);

// Change password (protected - tutors only)
router.put(
  "/tutor/change-password",
  authenticateToken,
  requireTutor,
  validatePasswordChange,
  profileController.changePassword
);

module.exports = router;
