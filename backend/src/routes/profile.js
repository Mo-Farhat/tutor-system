const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const {
  authenticateToken,
  requireTutor,
  requireStudent,
  requireOwnProfile,
} = require("../middleware/auth");
const {
  validateProfileUpdate,
  validatePasswordChange,
  validatePaymentInfo,
} = require("../middleware/validation");

const {
  tutorVideoUpload, // NEW
  tutorDocsUpload, // NEW
  studentPhotoUpload,
  handleUploadError,
} = require("../middleware/upload");

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

// Student Profile Routes

// Get student profile (protected - students only)
router.get(
  "/student/profile",
  authenticateToken,
  requireStudent,
  profileController.getStudentProfile
);

// Update student profile (protected - students only)
router.put(
  "/student/profile",
  authenticateToken,
  requireStudent,
  validateProfileUpdate,
  profileController.updateStudentProfile
);

// Change password (protected - students only)
router.put(
  "/student/change-password",
  authenticateToken,
  requireStudent,
  validatePasswordChange,
  profileController.changePassword
);

// Video Introduction
router.post(
  "/tutor/upload/video-intro",
  authenticateToken,
  requireTutor,
  tutorVideoUpload,
  handleUploadError,
  profileController.uploadVideoIntro
);

// Required Documents (contract, wwcc)
router.post(
  "/tutor/upload/documents",
  authenticateToken,
  requireTutor,
  tutorDocsUpload,
  handleUploadError,
  profileController.uploadRequiredDocuments
);

// Payment Info
router.get(
  "/tutor/payment",
  authenticateToken,
  requireTutor,
  profileController.getPaymentInfo
);

router.put(
  "/tutor/payment",
  authenticateToken,
  requireTutor,
  validatePaymentInfo,
  profileController.updatePaymentInfo
);

// List uploaded documents
router.get(
  "/tutor/documents",
  authenticateToken,
  requireTutor,
  profileController.getDocuments
);

router.post(
  "/student/profile/photo",
  authenticateToken,
  requireStudent,
  studentPhotoUpload,
  handleUploadError,
  profileController.uploadStudentPhoto
);

// Get live tutors (public endpoint for find-tutor page)
router.get("/tutor/tutors/live", profileController.getLiveTutors);

// Get tutor by ID (public endpoint)
router.get("/tutor/tutors/:id", profileController.getTutorById);

module.exports = router;
