const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/profileAdminController");

const router = express.Router();

router.get("/admin/profiles", authenticateToken, requireRole("admin"), ctrl.list);
router.get("/admin/profiles/:userId", authenticateToken, requireRole("admin"), ctrl.get);
router.post("/admin/profiles", authenticateToken, requireRole("admin"), ctrl.create);
router.delete("/admin/profiles/:userId", authenticateToken, requireRole("admin"), ctrl.remove);

module.exports = router;
