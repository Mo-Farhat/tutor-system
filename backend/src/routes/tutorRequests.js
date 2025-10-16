const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tutorRequestController");
const { authenticateToken, requireStudent, requireTutor } = require("../middleware/auth");

// Student -> create + list
router.post("/auth/student/tutor-requests", authenticateToken, requireStudent, ctrl.requestTutor);
router.get("/auth/student/tutor-requests", authenticateToken, requireStudent, ctrl.listMine);

// Tutor -> list received + respond
router.get("/auth/tutor/tutor-requests", authenticateToken, requireTutor, ctrl.listReceived);
router.post("/auth/tutor/tutor-requests/:id/respond", authenticateToken, requireTutor, ctrl.respond);

module.exports = router;
