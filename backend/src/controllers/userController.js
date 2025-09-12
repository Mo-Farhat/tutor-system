const prisma = require("../db/prisma");
const { userModel, tutorProfileModel, tutorApplicationModel } = require("../models");

// GET /api/admin/users
exports.list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1"), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "20"), 1), 100);
  const skip = (page - 1) * pageSize;
  const role = req.query.role;

  const where = role ? { role } : {};
  const [items, total] = await Promise.all([
    userModel.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
    userModel.count(),
  ]);

  res.json({ page, pageSize, total, items });
};

// GET /api/admin/users/:id
exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const user = await userModel.findById(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

// PUT /api/admin/users/:id
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const allowed = ["firstName","lastName","email","username","role","status"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  try {
    const updated = await userModel.update(id, data);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /api/admin/users/:id
exports.remove = async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      // Delete dependent profile if exists
      await tx.tutorProfile.deleteMany({ where: { userId: id } });
      // Keep applications for audit, but unlink the userId
      await tx.tutorApplication.updateMany({ where: { userId: id }, data: { userId: null } });
      // Delete user
      await tx.user.delete({ where: { id } });
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /api/users/me  (self-serve account deletion)
exports.removeMe = async (req, res) => {
  const id = Number(req.user.id);
  try {
    await prisma.$transaction(async (tx) => {
      await tx.tutorProfile.deleteMany({ where: { userId: id } });
      await tx.tutorApplication.updateMany({ where: { userId: id }, data: { userId: null } });
      await tx.user.delete({ where: { id } });
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
