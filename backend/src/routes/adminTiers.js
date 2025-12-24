const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminTiersController");
const { authenticateToken, requireRole } = require("../middleware/auth");

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole("admin"));

// GET /api/admin/tiers - Get all tiers
router.get("/", ctrl.getAllTiers);

// GET /api/admin/tiers/:id - Get tier by ID
router.get("/:id", ctrl.getTierById);

// POST /api/admin/tiers - Create a new tier
router.post("/", ctrl.createTier);

// PUT /api/admin/tiers/:id - Update a tier
router.put("/:id", ctrl.updateTier);

// DELETE /api/admin/tiers/:id - Delete (deactivate) a tier
router.delete("/:id", ctrl.deleteTier);

module.exports = router;
