const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentGoalsController");
const { authenticateToken, requireStudent } = require("../middleware/auth");

router.get("/auth/student/goals", authenticateToken, requireStudent, ctrl.list);
router.post("/auth/student/goals", authenticateToken, requireStudent, ctrl.create);
router.put("/auth/student/goals/:id", authenticateToken, requireStudent, ctrl.update);
router.delete("/auth/student/goals/:id", authenticateToken, requireStudent, ctrl.remove);

module.exports = router;
