const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tutorEarningsController");
const { authenticateToken, requireTutor } = require("../middleware/auth");

// GET /auth/tutor/earnings - Get earnings summary
router.get("/auth/tutor/earnings", authenticateToken, requireTutor, ctrl.getEarnings);

// GET /auth/tutor/payouts - Get all payouts
router.get("/auth/tutor/payouts", authenticateToken, requireTutor, ctrl.getPayouts);

module.exports = router;
