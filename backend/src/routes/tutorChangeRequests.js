// FILE: src/routes/tutorChangeRequests.js
const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/tutorSelfChangeRequestsController");
const profileCtrl = require("../controllers/profileChangeRequestController");
const validateTutorChangeRequest = require("../middleware/validateTutorChangeRequest");

// Tutor: submit individual field change request (legacy support)
router.post(
  "/tutor/change-requests",
  authenticateToken,
  requireRole("tutor"),
  validateTutorChangeRequest,
  ctrl.submit
);

// Tutor: submit full profile change request (new)
router.post(
  "/tutor/profile/submit-changes",
  authenticateToken,
  requireRole("tutor"),
  profileCtrl.submitProfileChanges
);

// Tutor: get pending profile changes
router.get(
  "/tutor/profile/pending-changes",
  authenticateToken,
  requireRole("tutor"),
  profileCtrl.getPendingProfileChanges
);

// Tutor/Admin: get diff for a change request
router.get(
  "/tutor/profile/change-diff/:changeRequestId",
  authenticateToken,
  profileCtrl.getProfileDiff
);

// Tutor: list own change requests
router.get(
  "/tutor/change-requests",
  authenticateToken,
  requireRole("tutor"),
  ctrl.listMine
);

module.exports = router;
