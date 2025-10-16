// FILE: src/routes/tutorChangeRequests.js
const express = require("express");
const router = express.Router();
const { authenticateToken, requireTutor } = require("../middleware/auth");
const ctrl = require("../controllers/tutorSelfChangeRequestsController");
const validateTutorChangeRequest = require("../middleware/validateTutorChangeRequest");

// Tutor submits a change request / lists their own
router.post("/auth/tutor/change-requests", authenticateToken, requireTutor, ctrl.submit);
router.get("/auth/tutor/change-requests", authenticateToken, requireTutor, ctrl.listMine);
router.post("/auth/tutor/change-requests",
  authenticateToken,
  requireTutor,
  validateTutorChangeRequest,
  ctrl.submit
);

module.exports = router;
