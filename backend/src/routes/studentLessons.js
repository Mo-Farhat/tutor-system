const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentLessonsController");
const sessionCtrl = require("../controllers/sessionController");
const { authenticateToken, requireStudent } = require("../middleware/auth");

router.get("/auth/student/lessons/upcoming", authenticateToken, requireStudent, ctrl.upcoming);
router.get("/auth/student/lessons/completed", authenticateToken, requireStudent, ctrl.completed);
router.get("/auth/student/lessons/pending-feedback", authenticateToken, requireStudent, ctrl.pendingFeedback);

// Session confirmation endpoints
router.get("/auth/student/lessons/pending-confirmation", authenticateToken, requireStudent, sessionCtrl.getPendingConfirmations);
router.post("/auth/student/lessons/:id/confirm", authenticateToken, requireStudent, sessionCtrl.confirmSession);

router.get("/auth/student/lessons/:id", authenticateToken, requireStudent, ctrl.getOne);
router.post("/auth/student/lessons/:id/feedback", authenticateToken, requireStudent, ctrl.giveFeedback);
router.get("/auth/student/lessons/:id/ics", authenticateToken, requireStudent, ctrl.downloadIcs);

module.exports = router;

