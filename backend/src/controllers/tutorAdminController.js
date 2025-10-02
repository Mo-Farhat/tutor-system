// FILE: src/controllers/tutorAdminController.js
const tutorService = require("../services/tutorService");
const tutorChangeRequestModel = require("../models/tutorChangeRequestModel");


// GET /api/admin/tutors
exports.list = async (req, res) => {
  try {
    const result = await tutorService.listTutors(req.query || {});
    res.json(result);
  } catch (e) {
    console.error("admin.tutors.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// GET /api/admin/tutors/:userId
exports.getOne = async (req, res) => {
  try {
    const result = await tutorService.getTutorProfile(req.params.userId);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (e) {
    console.error("admin.tutors.getOne", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// PUT /api/admin/tutors/:userId/tier
exports.changeTier = async (req, res) => {
  try {
    const { tier } = req.body || {};
    const result = await tutorService.changeTier(req.params.userId, tier);
    res.status(result.success ? 200 : 400).json(result);
  } catch (e) {
    console.error("admin.tutors.changeTier", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// GET /api/admin/tutors/:userId/lessons/completed
exports.completedLessons = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const result = await tutorService.getCompletedLessons(req.params.userId, limit);
    res.json(result);
  } catch (e) {
    console.error("admin.tutors.completedLessons", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// POST /api/admin/tutors/:userId/reviews
exports.addReview = async (req, res) => {
  try {
    const adminId = req.user?.id; // require admin auth
    const result = await tutorService.addReview(req.params.userId, req.body || {}, adminId);
    res.status(result.success ? 201 : 400).json(result);
  } catch (e) {
    console.error("admin.tutors.addReview", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// DELETE /api/admin/tutor-reviews/:id
exports.removeReview = async (req, res) => {
  try {
    const result = await tutorService.removeReview(req.params.id);
    res.json(result);
  } catch (e) {
    console.error("admin.tutors.removeReview", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// POST /api/admin/tutor-change-requests/:id/approve
exports.approveChangeRequest = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const { comments } = req.body || {};
    const result = await tutorService.approveChangeRequest(req.params.id, adminId, comments);
    res.json(result);
  } catch (e) {
    console.error("admin.tutors.approveChangeRequest", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// POST /api/admin/tutor-change-requests/:id/reject
exports.rejectChangeRequest = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const { comments } = req.body || {};
    const result = await tutorService.rejectChangeRequest(req.params.id, adminId, comments);
    res.json(result);
  } catch (e) {
    console.error("admin.tutors.rejectChangeRequest", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// GET /api/admin/tutor-change-requests?status=pending|approved|rejected
exports.listChangeRequests = async (req, res) => {
  try {
    const status = req.query.status;
    const rows = await tutorChangeRequestModel.list({ status });
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("admin.tutors.listChangeRequests", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};