const calendarService = require("../services/calendarService");

exports.list = async (req, res) => {
  try {
    const { dateFrom, dateTo, tutorId, studentId, subject, status, view } = req.query || {};
    const result = await calendarService.listLessons({ dateFrom, dateTo, tutorId, studentId, subject, status, view });
    res.json(result);
  } catch (e) {
    console.error("admin.calendar.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.get = async (req, res) => {
  try {
    const result = await calendarService.getLesson(req.params.id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (e) {
    console.error("admin.calendar.get", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await calendarService.createLesson(req.body || {});
    res.status(result.success ? 201 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.create", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await calendarService.updateLesson(req.params.id, req.body || {});
    res.status(result.success ? 200 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.update", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.reschedule = async (req, res) => {
  try {
    const result = await calendarService.rescheduleLesson(req.params.id, req.body || {});
    res.status(result.success ? 200 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.reschedule", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.complete = async (req, res) => {
  try {
    const result = await calendarService.markCompleted(req.params.id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.complete", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.cancel = async (req, res) => {
  try {
    const result = await calendarService.cancelLesson(req.params.id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.cancel", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.duplicate = async (req, res) => {
  try {
    const result = await calendarService.duplicateLesson(req.params.id, req.body || {});
    res.status(result.success ? 201 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.duplicate", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.createRecurring = async (req, res) => {
  try {
    const result = await calendarService.createRecurringSeries(req.body || {});
    res.status(result.success ? 201 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.createRecurring", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Materials
exports.addMaterial = async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    const file = req.file;
    const { title, url, type } = req.body || {};
const finalUrl = file?.cloudUrl ?? url ?? file?.path ?? null;
   const inferredType =
     type ?? (file ? (file.mimetype || "").split("/")[1] : (url ? "link" : "other"));
    const result = await calendarService.addMaterial(lessonId, {
     title: title ?? (file?.originalname || null),
     type: inferredType,
     path: null,                // keep storage URL in `url` for consistency
     url: finalUrl,
     addedBy: req.user.id,
        });
    res.status(201).json(result);
  } catch (e) {
    console.error("admin.calendar.addMaterial", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.listMaterials = async (req, res) => {
  try {
    const result = await calendarService.listMaterials(req.params.id);
    res.json(result);
  } catch (e) {
    console.error("admin.calendar.listMaterials", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.removeMaterial = async (req, res) => {
  try {
    const result = await calendarService.removeMaterial(req.params.materialId);
    res.json(result);
  } catch (e) {
    console.error("admin.calendar.removeMaterial", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Zoom registry
exports.listZoomLinks = async (req, res) => {
  try {
    const result = await calendarService.listZoomLinks(req.params.tutorId);
    res.json(result);
  } catch (e) {
    console.error("admin.calendar.listZoomLinks", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.setDefaultZoom = async (req, res) => {
  try {
    const result = await calendarService.setDefaultZoomLink(req.params.tutorId, req.body || {});
    res.status(result.success ? 200 : 400).json(result);
  } catch (e) {
    console.error("admin.calendar.setDefaultZoom", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Batch ensure zoom links
exports.ensureZoomLinks = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query || {};
    const result = await calendarService.ensureZoomLinks({ dateFrom, dateTo });
    res.json(result);
  } catch (e) {
    console.error("admin.calendar.ensureZoomLinks", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
