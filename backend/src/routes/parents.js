const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/parentController");
const { authenticateToken, requireStudent, requireRole } = require("../middleware/auth");
const { validateParentContact } = require("../middleware/validation");

// Student self-service
router.get("/auth/student/parents", authenticateToken, requireStudent, ctrl.listMine);
router.post("/auth/student/parents", authenticateToken, requireStudent, validateParentContact, ctrl.createMine);
router.put("/auth/student/parents/:id", authenticateToken, requireStudent, validateParentContact, ctrl.updateMine);
router.delete("/auth/student/parents/:id", authenticateToken, requireStudent, ctrl.deleteMine);
router.post("/auth/student/parents/:id/set-primary", authenticateToken, requireStudent, ctrl.setPrimaryMine);

// Admin (optional)
router.get("/admin/students/:studentId/parents", authenticateToken, requireRole("admin"), ctrl.adminListForStudent);

module.exports = router;
