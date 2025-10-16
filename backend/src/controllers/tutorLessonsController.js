const { lessonModel, studentTutorModel } = require("../models");

// List upcoming lessons for tutor
exports.upcoming = async (req, res) => {
  try {
    const rows = await lessonModel.listUpcomingByTutor(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("tutor lessons.upcoming", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// List completed lessons for tutor
exports.completed = async (req, res) => {
  try {
    const rows = await lessonModel.listCompletedByTutor(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("tutor lessons.completed", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get specific lesson for tutor
exports.getOne = async (req, res) => {
  try {
    const row = await lessonModel.findByIdForTutor(req.params.id, req.user.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    console.error("tutor lessons.getOne", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create new lesson
exports.create = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      startAt,
      endAt,
      zoomLink,
      prepNotes,
      homework,
    } = req.body || {};

    if (!studentId || !subject || !startAt || !endAt) {
      return res.status(400).json({
        success: false,
        error: "studentId, subject, startAt, and endAt are required",
      });
    }

    // Verify tutor is assigned to this student
    const assignment = await studentTutorModel.findByTutorAndStudent(
      req.user.id,
      studentId
    );
    if (!assignment) {
      return res.status(403).json({
        success: false,
        error: "You are not assigned to this student",
      });
    }

    const created = await lessonModel.createByTutor(req.user.id, {
      studentId,
      subject,
      startAt,
      endAt,
      zoomLink,
      prepNotes,
      homework,
    });

    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("tutor lessons.create", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update lesson
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { subject, startAt, endAt, zoomLink, prepNotes, homework, status } =
      req.body || {};

    // Verify lesson belongs to this tutor
    const existing = await lessonModel.findByIdForTutor(id, req.user.id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    const updates = {};
    if (subject !== undefined) updates.subject = subject;
    if (startAt !== undefined) updates.startAt = new Date(startAt);
    if (endAt !== undefined) updates.endAt = new Date(endAt);
    if (zoomLink !== undefined) updates.zoomLink = zoomLink;
    if (prepNotes !== undefined) updates.prepNotes = prepNotes;
    if (homework !== undefined) updates.homework = homework;
    if (status !== undefined) updates.status = status;

    const updated = await lessonModel.updateByTutor(id, req.user.id, updates);
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("tutor lessons.update", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete lesson
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Verify lesson belongs to this tutor
    const existing = await lessonModel.findByIdForTutor(id, req.user.id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    await lessonModel.removeByTutor(id, req.user.id);
    res.json({ success: true });
  } catch (e) {
    console.error("tutor lessons.remove", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

