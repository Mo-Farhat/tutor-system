const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tutorLessonsController");
const sessionCtrl = require("../controllers/sessionController");
const { authenticateToken, requireTutor } = require("../middleware/auth");

// Tutor lesson management endpoints
router.get(
  "/auth/tutor/lessons/upcoming",
  authenticateToken,
  requireTutor,
  ctrl.upcoming
);
router.get(
  "/auth/tutor/lessons/completed",
  authenticateToken,
  requireTutor,
  ctrl.completed
);
router.get(
  "/auth/tutor/lessons/:id",
  authenticateToken,
  requireTutor,
  ctrl.getOne
);
router.post(
  "/auth/tutor/lessons",
  authenticateToken,
  requireTutor,
  ctrl.create
);
router.put(
  "/auth/tutor/lessons/:id",
  authenticateToken,
  requireTutor,
  ctrl.update
);
router.delete(
  "/auth/tutor/lessons/:id",
  authenticateToken,
  requireTutor,
  ctrl.remove
);

// Session completion endpoint
router.post(
  "/auth/tutor/lessons/:id/complete",
  authenticateToken,
  requireTutor,
  sessionCtrl.completeSession
);

module.exports = router;

