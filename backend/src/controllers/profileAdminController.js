const { tutorProfileModel } = require("../models");

// GET /api/admin/profiles
exports.list = async (req, res) => {
  const is_live = req.query.is_live;
  const where = {};
  if (typeof is_live !== "undefined")
    where.is_live = String(is_live) === "true";
  const profiles = await tutorProfileModel.findAll({
    where,
    orderBy: { createdAt: "desc" },
  });
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

// PUT /api/admin/profiles/:userId/make-live
exports.makeLive = async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    const profile = await tutorProfileModel.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Check if documents are uploaded
    if (!profile.documents_uploaded) {
      return res.status(400).json({
        error: "Cannot make tutor live - documents not uploaded",
      });
    }

    // Make tutor live
    await tutorProfileModel.update(userId, { is_live: true });

    res.json({
      success: true,
      message: "Tutor made live successfully",
      userId: userId,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /api/admin/profiles/:userId/make-offline
exports.makeOffline = async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    const profile = await tutorProfileModel.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Make tutor offline
    await tutorProfileModel.update(userId, { is_live: false });

    res.json({
      success: true,
      message: "Tutor made offline successfully",
      userId: userId,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
