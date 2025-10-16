const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentBillingController");
const { authenticateToken, requireStudent } = require("../middleware/auth");

router.get("/auth/student/packages", authenticateToken, requireStudent, ctrl.getPackages);
router.post("/auth/student/packages/purchase", authenticateToken, requireStudent, ctrl.purchasePackage);
router.post("/auth/student/packages/checkout", authenticateToken, requireStudent, ctrl.createPackageCheckout);

router.get("/auth/student/payments", authenticateToken, requireStudent, ctrl.getPayments);
router.get("/auth/student/invoices/:id", authenticateToken, requireStudent, ctrl.getInvoice);

module.exports = router;
