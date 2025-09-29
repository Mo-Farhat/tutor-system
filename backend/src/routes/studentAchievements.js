const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentAchievementsController");
const { authenticateToken, requireStudent } = require("../middleware/auth");

router.get("/auth/student/achievements", authenticateToken, requireStudent, ctrl.list);

module.exports = router;
