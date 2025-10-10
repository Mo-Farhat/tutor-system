// ./src/routes/adminPackages.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminPackagesController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { validatePackageTypeCreate, validatePackageTypeUpdate } = require("../middleware/validation");

// Admin-only package catalog management
router.post(
  "/admin/packages",
  authenticateToken,
  requireRole("admin"),
  validatePackageTypeCreate,   // <-- converts dollars → cents & validates
  ctrl.create
);

router.get(
  "/admin/packages",
  authenticateToken,
  requireRole("admin"),
  ctrl.list
);

router.get(
  "/admin/packages/:id",
  authenticateToken,
  requireRole("admin"),
  ctrl.get
);

router.put(
  "/admin/packages/:id",
  authenticateToken,
  requireRole("admin"),
  validatePackageTypeUpdate,   // <-- converts only provided fields
  ctrl.update
);

router.post(
  "/admin/packages/:id/retire",
  authenticateToken,
  requireRole("admin"),
  ctrl.retire
);

// Optional hard delete (generally avoid in production)
router.delete(
  "/admin/packages/:id",
  authenticateToken,
  requireRole("admin"),
  ctrl.remove
);

module.exports = router;
