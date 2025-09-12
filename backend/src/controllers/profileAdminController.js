const { tutorProfileModel } = require("../models");

// GET /api/admin/profiles
exports.list = async (req, res) => {
  const is_live = req.query.is_live;
  const where = {};
  if (typeof is_live !== "undefined") where.is_live = String(is_live) === "true";
  const profiles = await tutorProfileModel.findAll({ where, orderBy: { createdAt: "desc" } });
  res.json(profiles);
};

// GET /api/admin/profiles/:userId
exports.get = async (req, res) => {
  const userId = Number(req.params.userId);
  const profile = await tutorProfileModel.findByUserId(userId);
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
};

// POST /api/admin/profiles
exports.create = async (req, res) => {
  const { userId, ...data } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const created = await tutorProfileModel.create(userId, data || {});
  res.status(201).json(created);
};

// DELETE /api/admin/profiles/:userId
exports.remove = async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    await tutorProfileModel.delete(userId);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
