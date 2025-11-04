const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/adminCalendarController");
const { lessonMaterialsUpload, handleUploadError } = require("../middleware/upload");
const { s3PostProcess } = require("../middleware/s3PostProcess");
// All routes are admin-protected
router.get("/admin/calendar/lessons", authenticateToken, requireRole("admin"), ctrl.list);
router.get("/admin/calendar/lessons/:id", authenticateToken, requireRole("admin"), ctrl.get);
router.post("/admin/calendar/lessons", authenticateToken, requireRole("admin"), ctrl.create);
router.put("/admin/calendar/lessons/:id", authenticateToken, requireRole("admin"), ctrl.update);
router.post("/admin/calendar/lessons/:id/reschedule", authenticateToken, requireRole("admin"), ctrl.reschedule);
router.post("/admin/calendar/lessons/:id/complete", authenticateToken, requireRole("admin"), ctrl.complete);
router.post("/admin/calendar/lessons/:id/cancel", authenticateToken, requireRole("admin"), ctrl.cancel);
router.post("/admin/calendar/lessons/:id/duplicate", authenticateToken, requireRole("admin"), ctrl.duplicate);
router.post("/admin/calendar/series", authenticateToken, requireRole("admin"), ctrl.createRecurring);

// Materials
router.post(
  "/admin/calendar/lessons/:id/materials",
  authenticateToken,
  requireRole("admin"),
  lessonMaterialsUpload, // file field name: "file" | or pass url in body
  handleUploadError,
  s3PostProcess("lessons/materials"),
  ctrl.addMaterial
);
router.get("/admin/calendar/lessons/:id/materials", authenticateToken, requireRole("admin"), ctrl.listMaterials);
router.delete("/admin/calendar/materials/:materialId", authenticateToken, requireRole("admin"), ctrl.removeMaterial);

// Zoom registry
router.get("/admin/calendar/zoom-links/:tutorId", authenticateToken, requireRole("admin"), ctrl.listZoomLinks);
router.post("/admin/calendar/zoom-links/:tutorId/default", authenticateToken, requireRole("admin"), ctrl.setDefaultZoom);

// Ensure scheduled lessons have a link
router.post("/admin/calendar/ensure-zoom-links", authenticateToken, requireRole("admin"), ctrl.ensureZoomLinks);

module.exports = router;
