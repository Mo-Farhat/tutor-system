const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/stripeWebhooksController");

// Raw body middleware is handled in app.js for this route
router.post("/stripe/webhook", ctrl.handleWebhook);

module.exports = router;
