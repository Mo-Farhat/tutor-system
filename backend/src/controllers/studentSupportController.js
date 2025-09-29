const { supportTicketModel } = require("../models");

exports.list = async (req, res) => {
  try {
    const rows = await supportTicketModel.listMine(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("support.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { subject, message } = req.body || {};
    if (!subject || !message) return res.status(400).json({ success: false, error: "subject and message required" });
    const created = await supportTicketModel.create(req.user.id, { subject, message });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("support.create", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
