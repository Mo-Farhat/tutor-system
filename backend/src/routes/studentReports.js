const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentReportsController");
const { authenticateToken, requireStudent } = require("../middleware/auth");

router.get("/auth/student/reports", authenticateToken, requireStudent, ctrl.list);
router.get("/auth/student/reports/:id", authenticateToken, requireStudent, ctrl.get);

module.exports = router;
