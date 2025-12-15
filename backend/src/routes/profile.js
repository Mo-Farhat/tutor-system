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
  uploadTutorApplication,
  uploadTutorVideo,
  uploadTutorDocs,
  uploadStudentPhoto,
  uploadTutorPhoto,
  handleUploadError,
} = require("../middleware/upload");

// const { s3PostProcess } = require("../middleware/s3PostProcess");

// Public: view tutor profile
router.get("/tutor/profile", profileController.getTutorProfile);

// Authenticated tutor: view own profile
router.get(
  "/tutor/my-profile",
  authenticateToken,
  requireTutor,
  profileController.getTutorProfile
);

// Tutor completion status (public)
router.get("/tutor/completion-status", profileController.getCompletionStatus);

// Tutor completion status (authenticated)
router.get(
  "/tutor/my-completion-status",
  authenticateToken,
  requireTutor,
  profileController.getCompletionStatus
);

// Update tutor profile
router.put(
  "/tutor/profile",
  authenticateToken,
  requireTutor,
  validateProfileUpdate,
  profileController.updateTutorProfile
);

// Change password
router.put(
  "/tutor/change-password",
  authenticateToken,
  requireTutor,
  validatePasswordChange,
  profileController.changePassword
);

// -----------------------------------------------------------
// Student profile routes
// -----------------------------------------------------------

router.get(
  "/student/profile",
  authenticateToken,
  requireStudent,
  profileController.getStudentProfile
);

router.put(
  "/student/profile",
  authenticateToken,
  requireStudent,
  validateProfileUpdate,
  profileController.updateStudentProfile
);

router.put(
  "/student/change-password",
  authenticateToken,
  requireStudent,
  validatePasswordChange,
  profileController.changePassword
);

// -----------------------------------------------------------
// Upload endpoints (use new S3 upload middlewares)
// -----------------------------------------------------------

// Tutor video introduction
router.post(
  "/tutor/upload/video-intro",
  authenticateToken,
  requireTutor,
  uploadTutorVideo,      // ✅ updated name
  handleUploadError,
  profileController.uploadVideoIntro
);

// Tutor profile photo
router.post(
  "/tutor/upload/photo",
  authenticateToken,
  requireTutor,
  uploadTutorPhoto,
  handleUploadError,
  profileController.uploadTutorPhoto
);

// Tutor required documents
router.post(
  "/tutor/upload/documents",
  authenticateToken,
  requireTutor,
  uploadTutorDocs,       // ✅ updated name
  handleUploadError,
  profileController.uploadRequiredDocuments
);

// Student profile photo
router.post(
  "/student/profile/photo",
  authenticateToken,
  requireStudent,
  uploadStudentPhoto,    // ✅ updated name
  handleUploadError,
  profileController.uploadStudentPhoto
);

// -----------------------------------------------------------
// Payment info
// -----------------------------------------------------------

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

// -----------------------------------------------------------
// Misc
// -----------------------------------------------------------

// List uploaded tutor documents
router.get(
  "/tutor/documents",
  authenticateToken,
  requireTutor,
  profileController.getDocuments
);

// Public: live tutors (for find-tutor page)
router.get("/tutor/tutors/live", profileController.getLiveTutors);

// Public: tutor by ID
router.get("/tutor/tutors/:id", profileController.getTutorById);

module.exports = router;