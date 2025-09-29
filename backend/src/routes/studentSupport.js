const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentSupportController");
const { authenticateToken, requireStudent } = require("../middleware/auth");

router.get("/auth/student/support-tickets", authenticateToken, requireStudent, ctrl.list);
router.post("/auth/student/support-tickets", authenticateToken, requireStudent, ctrl.create);

module.exports = router;
