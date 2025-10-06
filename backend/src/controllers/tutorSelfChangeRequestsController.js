// FILE: src/controllers/tutorSelfChangeRequestsController.js
const tutorService = require("../services/tutorService");
const tutorChangeRequestModel = require("../models/tutorChangeRequestModel");

exports.submit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, oldValue, newValue } = req.body || {};
    const result = await tutorService.submitChangeRequest(userId, { type, oldValue, newValue });
    res.status(result.success ? 201 : 400).json(result);
  } catch (e) {
    console.error("tutor.changeRequests.submit", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.listMine = async (req, res) => {
  try {
    const rows = await tutorChangeRequestModel.listByTutor(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("tutor.changeRequests.listMine", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
