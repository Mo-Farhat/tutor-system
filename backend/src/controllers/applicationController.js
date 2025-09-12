const { tutorApplicationModel, setupTokenModel } = require("../models");
const authService = require("../services/authService");
const emailService = require("../services/emailService");

// GET /api/admin/applications
exports.list = async (req, res) => {
  const status = req.query.status;
  const where = status ? { status } : {};
  const apps = await tutorApplicationModel.findAll({ where, orderBy: { createdAt: "desc" } });
  res.json(apps);
};

// GET /api/admin/applications/:id
exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const app = await tutorApplicationModel.findById(id);
  if (!app) return res.status(404).json({ error: "Application not found" });
  res.json(app);
};

// PUT /api/admin/applications/:id  (generic metadata update, not status transitions)
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const allowed = [
    "fullName","phone","email","currentStudy","year12State","year12CompletionYear",
    "currentState","atar","canCommit3Hours","canCommit1Year","canTutorMostWeeks",
    "canTutorGroups","subjectsToTutor","hasWorkingWithChildrenCheck","motivation","files"
  ];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const updated = await tutorApplicationModel.update(id, data);
  res.json(updated);
};

// POST /api/admin/applications/:id/reject
exports.reject = async (req, res) => {
  const id = Number(req.params.id);
  const reason = req.body?.reason || "";

  const app = await tutorApplicationModel.findById(id);
  if (!app) return res.status(404).json({ error: "Application not found" });
  if (app.status !== "pending" && app.status !== "approved") {
    return res.status(400).json({ error: `Cannot reject in status '${app.status}'` });
  }

  const updated = await tutorApplicationModel.update(id, { status: "rejected" });

  // Clean any tokens
  try {
    await setupTokenModel.deleteExpired();
  } catch {}

  // Notify
  try {
    await emailService.sendRejectionNotification(app.email, app, reason);
  } catch {}

  res.json({ message: "Application rejected", applicationId: updated.applicationId, status: updated.status });
};

// DELETE /api/admin/applications/:id
exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await tutorApplicationModel.delete(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
