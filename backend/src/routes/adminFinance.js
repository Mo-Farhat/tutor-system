const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminFinanceController");
const { authenticateToken, requireRole } = require("../middleware/auth");

// All routes under /admin/finance are admin-protected
router.get(
  "/admin/finance/analytics",
  authenticateToken,
  requireRole("admin"),
  ctrl.getAnalytics
);

router.get(
  "/admin/finance/invoices",
  authenticateToken,
  requireRole("admin"),
  ctrl.getInvoices
);

router.get(
  "/admin/finance/refunds",
  authenticateToken,
  requireRole("admin"),
  ctrl.getRefunds
);

router.get(
  "/admin/finance/payouts",
  authenticateToken,
  requireRole("admin"),
  ctrl.getPayouts
);

router.get(
  "/admin/finance/referrals",
  authenticateToken,
  requireRole("admin"),
  ctrl.getReferrals
);

module.exports = router;
