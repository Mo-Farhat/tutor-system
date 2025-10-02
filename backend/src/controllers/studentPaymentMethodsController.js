const { studentPaymentMethodModel } = require("../models");

exports.list = async (req, res) => {
  try {
    const rows = await studentPaymentMethodModel.list(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("pm.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { type, brand, last4, billingName } = req.body || {};
    if (!type || !["card", "paypal"].includes(type)) return res.status(400).json({ success: false, error: "type must be 'card' or 'paypal'" });
    const created = await studentPaymentMethodModel.create(req.user.id, { type, brand: brand ?? null, last4: last4 ?? null, billingName: billingName ?? null });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("pm.create", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    await studentPaymentMethodModel.remove(req.user.id, Number(req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error("pm.remove", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
