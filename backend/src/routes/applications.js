const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/applicationController");
const authController = require("../controllers/authController"); // reuse approve

const router = express.Router();

// List / read / update / delete
router.get("/admin/applications", authenticateToken, requireRole("admin"), ctrl.list);
router.get("/admin/applications/:id", authenticateToken, requireRole("admin"), ctrl.get);
router.put("/admin/applications/:id", authenticateToken, requireRole("admin"), ctrl.update);
router.delete("/admin/applications/:id", authenticateToken, requireRole("admin"), ctrl.remove);

// Status transitions
router.post("/admin/applications/:id/approve", authenticateToken, requireRole("admin"), authController.approveTutorApplication);
router.post("/admin/applications/:id/reject", authenticateToken, requireRole("admin"), ctrl.reject);

module.exports = router;
