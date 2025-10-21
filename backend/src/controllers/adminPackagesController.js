// ./src/controllers/adminPackagesController.js
const { packageTypeModel } = require("../models");

// POST /api/admin/packages
exports.create = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.discountType === "percentage") body.discountType = "percent";

    // Expect dollars in body.price (e.g., "100.05") and optional body.discountValue (dollars)
    const newPackage = await packageTypeModel.create(body);
    return res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    console.error("Create package error:", error);
    const status = error.status || 400;
    return res.status(status).json({ success: false, error: error.message });
  }
};

// GET /api/admin/packages
exports.list = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "50"), 1), 200);
    const skip = (page - 1) * pageSize;

    const where = {};
    // if you really want a lifecycle status, add it to Prisma. Otherwise:
    if (req.query.isActive != null) where.isActive = req.query.isActive === "true";
    if (req.query.subject) where.subject = { contains: req.query.subject, mode: "insensitive" };
    if (req.query.q) {
      where.OR = [
        { name: { contains: req.query.q, mode: "insensitive" } },
        { subject: { contains: req.query.q, mode: "insensitive" } },
        { description: { contains: req.query.q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      packageTypeModel.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      packageTypeModel.count(where),
    ]);

    res.json({ success: true, page, pageSize, total, items });
  } catch (e) {
    console.error("admin.packages.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// GET /api/admin/packages/:id
exports.get = async (req, res) => {
  try {
    const row = await packageTypeModel.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: "Package not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    console.error("admin.packages.get", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// PUT /api/admin/packages/:id
exports.update = async (req, res) => {
  try {
    const updated = await packageTypeModel.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("admin.packages.update", e);
    res.status(400).json({ success: false, error: e.message });
  }
};

// POST /api/admin/packages/:id/retire
exports.retire = async (req, res) => {
  try {
    const row = await packageTypeModel.retire(req.params.id);
    res.json({ success: true, data: row, message: "Package retired" });
  } catch (e) {
    console.error("admin.packages.retire", e);
    res.status(400).json({ success: false, error: e.message });
  }
};

// DELETE /api/admin/packages/:id  (use sparingly)
exports.remove = async (req, res) => {
  try {
    await packageTypeModel.remove(req.params.id);
    res.json({ success: true });
  } catch (e) {
    console.error("admin.packages.remove", e);
    res.status(400).json({ success: false, error: e.message });
  }
};
