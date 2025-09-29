const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentPaymentMethodsController");
const { authenticateToken, requireStudent } = require("../middleware/auth");

router.get("/auth/student/payment-methods", authenticateToken, requireStudent, ctrl.list);
router.post("/auth/student/payment-methods", authenticateToken, requireStudent, ctrl.create);
router.delete("/auth/student/payment-methods/:id", authenticateToken, requireStudent, ctrl.remove);

module.exports = router;
