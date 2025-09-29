const { studentTutorModel, userModel } = require("../models");

exports.adminAssign = async (req, res) => {
  try {
    const { studentId, tutorId, subject, status } = req.body;
    if (!studentId || !tutorId) return res.status(400).json({ error: "studentId and tutorId are required" });

    const student = await userModel.findById(studentId);
    const tutor = await userModel.findById(tutorId);
    if (!student || student.role !== "student") return res.status(400).json({ error: "Invalid studentId" });
    if (!tutor || tutor.role !== "tutor") return res.status(400).json({ error: "Invalid tutorId" });

    const pair = await studentTutorModel.assign(studentId, tutorId, { subject, status });
    res.status(201).json(pair);
  } catch (e) {
    console.error("adminAssign error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.adminUpdate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const allowed = ["subject", "status", "endedAt"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const updated = await studentTutorModel.update(id, updates);
    res.json(updated);
  } catch (e) {
    console.error("adminUpdate error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.adminRemove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await studentTutorModel.remove(id);
    res.json({ ok: true });
  } catch (e) {
    console.error("adminRemove error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.myTutors = async (req, res) => {
  try {
    const rows = await studentTutorModel.listByStudent(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("myTutors error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.myStudents = async (req, res) => {
  try {
    const rows = await studentTutorModel.listByTutor(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("myStudents error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
