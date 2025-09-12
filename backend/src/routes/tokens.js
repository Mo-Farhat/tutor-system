const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/tokenController");

const router = express.Router();

router.get("/admin/tokens", authenticateToken, requireRole("admin"), ctrl.list);
router.delete("/admin/tokens/:token", authenticateToken, requireRole("admin"), ctrl.remove);
router.post("/admin/tokens/cleanup", authenticateToken, requireRole("admin"), ctrl.cleanup);

module.exports = router;
