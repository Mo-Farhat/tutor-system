const { reportModel, studentTutorModel } = require("../models");

// GET /auth/tutor/reports - List all reports by authenticated tutor
exports.list = async (req, res) => {
  try {
    const reports = await reportModel.listForTutor(req.user.id);
    res.json({ success: true, data: reports });
  } catch (e) {
    console.error("tutorReports.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// GET /auth/tutor/reports/:id - Get specific report by ID
exports.get = async (req, res) => {
  try {
    const report = await reportModel.getForTutor(req.user.id, req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }
    res.json({ success: true, data: report });
  } catch (e) {
    console.error("tutorReports.get", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// POST /auth/tutor/reports - Create new report
exports.create = async (req, res) => {
  try {
    const { studentId, type, subject } = req.body || {};

    // Validate required fields
    if (!studentId || !type || !subject) {
      return res.status(400).json({
        success: false,
        error: "studentId, type, and subject are required",
      });
    }

    // Validate report type
    if (!["lesson", "termly"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "type must be either 'lesson' or 'termly'",
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

    // Create the report
    const report = await reportModel.createByTutor(req.user.id, req.body);
    res.status(201).json({ success: true, data: report });
  } catch (e) {
    console.error("tutorReports.create", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// PUT /auth/tutor/reports/:id - Update existing report
exports.update = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Validate report type if provided
    if (req.body.type && !["lesson", "termly"].includes(req.body.type)) {
      return res.status(400).json({
        success: false,
        error: "type must be either 'lesson' or 'termly'",
      });
    }

    // Update the report (model will check ownership and locked status)
    const report = await reportModel.updateByTutor(
      req.user.id,
      reportId,
      req.body
    );
    res.json({ success: true, data: report });
  } catch (e) {
    console.error("tutorReports.update", e);
    if (e.message === "Report not found or access denied") {
      return res.status(404).json({ success: false, error: e.message });
    }
    if (e.message === "Cannot edit locked report") {
      return res.status(403).json({ success: false, error: e.message });
    }
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// DELETE /auth/tutor/reports/:id - Delete report
exports.remove = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Delete the report (model will check ownership and locked status)
    await reportModel.deleteByTutor(req.user.id, reportId);
    res.json({ success: true, message: "Report deleted successfully" });
  } catch (e) {
    console.error("tutorReports.remove", e);
    if (e.message === "Report not found or access denied") {
      return res.status(404).json({ success: false, error: e.message });
    }
    if (e.message === "Cannot delete locked report") {
      return res.status(403).json({ success: false, error: e.message });
    }
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

