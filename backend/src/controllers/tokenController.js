const { setupTokenModel } = require("../models");

// GET /api/admin/tokens
exports.list = async (_req, res) => {
  const tokens = await setupTokenModel.findAll();
  res.json(tokens);
};

// DELETE /api/admin/tokens/:token
exports.remove = async (req, res) => {
  const token = req.params.token;
  try {
    await setupTokenModel.delete(token);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// POST /api/admin/tokens/cleanup
exports.cleanup = async (_req, res) => {
  const result = await setupTokenModel.deleteExpired();
  res.json({ deleted: result.count ?? result });
};
