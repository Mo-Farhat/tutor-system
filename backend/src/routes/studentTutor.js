const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentTutorController");
const { authenticateToken, requireRole, requireStudent, requireTutor } = require("../middleware/auth");

// Admin endpoints
router.post("/admin/assignments", authenticateToken, requireRole("admin"), ctrl.adminAssign);
router.put("/admin/assignments/:id", authenticateToken, requireRole("admin"), ctrl.adminUpdate);
router.delete("/admin/assignments/:id", authenticateToken, requireRole("admin"), ctrl.adminRemove);
// Authenticated self-views
router.get("/auth/student/my-tutors", authenticateToken, requireStudent, ctrl.myTutors);
router.get("/auth/tutor/my-students", authenticateToken, requireTutor, ctrl.myStudents);

module.exports = router;
