const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentPaymentMethodsController");
const { authenticateToken, requireStudent } = require("../middleware/auth");


// Test endpoint to verify routes are working
router.get("/auth/student/payment-methods/test", (req, res) => {
  res.json({ success: true, message: "Payment methods routes are working!" });
});

router.get("/auth/student/payment-methods", authenticateToken, requireStudent, ctrl.list);

router.post("/auth/student/payment-methods/setup-intent", authenticateToken, requireStudent, ctrl.createSetupIntent);
router.post("/auth/student/payment-methods/attach", authenticateToken, requireStudent, ctrl.attachPaymentMethod);
router.delete("/auth/student/payment-methods/:id", authenticateToken, requireStudent, ctrl.remove);
router.put("/auth/student/payment-methods/:id/default", authenticateToken, requireStudent, ctrl.setDefault);

module.exports = router;
