// FILE: src/routes/tutorsAdmin.js
const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/tutorAdminController");

const router = express.Router();

// All endpoints require admin
router.get("/admin/tutors", authenticateToken, requireRole("admin"), ctrl.list);
router.get("/admin/tutors/:userId", authenticateToken, requireRole("admin"), ctrl.getOne);
router.put("/admin/tutors/:userId/tier", authenticateToken, requireRole("admin"), ctrl.changeTier);

router.get("/admin/tutors/:userId/lessons/completed", authenticateToken, requireRole("admin"), ctrl.completedLessons);
router.get("/admin/tutors/:userId/lessons", authenticateToken, requireRole("admin"), ctrl.allLessons);

// Reviews (admin adds/removes)
router.post("/admin/tutors/:userId/reviews", authenticateToken, requireRole("admin"), ctrl.addReview);
router.delete("/admin/tutor-reviews/:id", authenticateToken, requireRole("admin"), ctrl.removeReview);

// Change Requests moderation
router.post("/admin/tutor-change-requests/:id/approve", authenticateToken, requireRole("admin"), ctrl.approveChangeRequest);
router.post("/admin/tutor-change-requests/:id/reject", authenticateToken, requireRole("admin"), ctrl.rejectChangeRequest);

router.get("/admin/tutor-change-requests", authenticateToken, requireRole("admin"), ctrl.listChangeRequests);

// Intro Video approval/rejection
router.post("/admin/tutors/:userId/intro-video/approve", authenticateToken, requireRole("admin"), ctrl.approveIntroVideo);
router.post("/admin/tutors/:userId/intro-video/reject", authenticateToken, requireRole("admin"), ctrl.rejectIntroVideo);

module.exports = router;
