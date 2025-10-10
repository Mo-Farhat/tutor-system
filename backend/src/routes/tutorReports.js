const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tutorReportsController");
const { authenticateToken, requireTutor } = require("../middleware/auth");

// Tutor report routes
router.get("/auth/tutor/reports", authenticateToken, requireTutor, ctrl.list);
router.get("/auth/tutor/reports/:id", authenticateToken, requireTutor, ctrl.get);
router.post("/auth/tutor/reports", authenticateToken, requireTutor, ctrl.create);
router.put("/auth/tutor/reports/:id", authenticateToken, requireTutor, ctrl.update);
router.delete("/auth/tutor/reports/:id", authenticateToken, requireTutor, ctrl.remove);

module.exports = router;

