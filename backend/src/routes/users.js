const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/userController");

const router = express.Router();

// Admin CRUD over users
router.get("/admin/users", authenticateToken, requireRole("admin"), ctrl.list);
router.get("/admin/users/:id", authenticateToken, requireRole("admin"), ctrl.get);
router.put("/admin/users/:id", authenticateToken, requireRole("admin"), ctrl.update);
router.delete("/admin/users/:id", authenticateToken, requireRole("admin"), ctrl.remove);

// Self-service delete
router.delete("/users/me", authenticateToken, ctrl.removeMe);

module.exports = router;
