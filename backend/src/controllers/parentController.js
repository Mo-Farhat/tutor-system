const { studentParentModel } = require("../models");

// STUDENT: list own parents
exports.listMine = async (req, res) => {
  try {
    const rows = await studentParentModel.listByStudent(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("listMine error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// STUDENT: create parent
exports.createMine = async (req, res) => {
  try {
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email ?? null,
      phone: req.body.phone ?? null,
      relation: req.body.relation ?? "guardian",
      isPrimary: req.body.isPrimary ?? false,
      contactPreference: req.body.contactPreference ?? null,
      addressLine1: req.body.addressLine1 ?? null,
      addressLine2: req.body.addressLine2 ?? null,
      city: req.body.city ?? null,
      state: req.body.state ?? null,
      postcode: req.body.postcode ?? null,
      country: req.body.country ?? null,
      notes: req.body.notes ?? null,
      consentToContact: req.body.consentToContact ?? true,
    };

    const created = await studentParentModel.create(req.user.id, data);

    // If marked primary, unset others
    if (created.isPrimary) {
      await studentParentModel.setPrimary(req.user.id, created.id);
    }

    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("createMine error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// STUDENT: update parent
exports.updateMine = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await studentParentModel.getById(id);
    if (!existing || existing.studentId !== req.user.id)
      return res.status(404).json({ success: false, error: "Parent contact not found" });

    const updates = { ...req.body };
    const updated = await studentParentModel.update(id, req.user.id, updates);

    // If isPrimary true, enforce one primary
    if (updates.isPrimary === true) {
      await studentParentModel.setPrimary(req.user.id, id);
    }

    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("updateMine error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// STUDENT: delete parent
exports.deleteMine = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await studentParentModel.getById(id);
    if (!existing || existing.studentId !== req.user.id)
      return res.status(404).json({ success: false, error: "Parent contact not found" });

    await studentParentModel.delete(id, req.user.id);
    res.json({ success: true });
  } catch (e) {
    console.error("deleteMine error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// STUDENT: set primary
exports.setPrimaryMine = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await studentParentModel.getById(id);
    if (!existing || existing.studentId !== req.user.id)
      return res.status(404).json({ success: false, error: "Parent contact not found" });

    await studentParentModel.setPrimary(req.user.id, id);
    res.json({ success: true });
  } catch (e) {
    console.error("setPrimaryMine error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// (Optional) ADMIN views for a specific student
exports.adminListForStudent = async (req, res) => {
  try {
    const rows = await studentParentModel.listByStudent(Number(req.params.studentId));
    res.json(rows);
  } catch (e) {
    console.error("adminListForStudent error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};
