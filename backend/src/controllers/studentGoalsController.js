const { goalModel } = require("../models");

exports.list = async (req, res) => {
  try {
    const rows = await goalModel.list(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("goals.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { subject, title, details, targetDate } = req.body || {};
    if (!subject || !title) return res.status(400).json({ success: false, error: "subject and title required" });
    const created = await goalModel.create(req.user.id, { subject, title, details: details ?? null, targetDate: targetDate ? new Date(targetDate) : null });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("goals.create", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { subject, title, details, targetDate } = req.body || {};
    const updated = await goalModel.update(req.user.id, id, {
      ...(subject !== undefined ? { subject } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(details !== undefined ? { details } : {}),
      ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : null } : {}),
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("goals.update", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await goalModel.remove(req.user.id, id);
    res.json({ success: true });
  } catch (e) {
    console.error("goals.remove", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
