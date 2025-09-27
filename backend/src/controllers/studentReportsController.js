const { reportModel } = require("../models");

exports.list = async (req, res) => {
  try {
    const rows = await reportModel.listForStudent(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("studentReports.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.get = async (req, res) => {
  try {
    const row = await reportModel.getForStudent(req.user.id, req.params.id);
    if (!row) return res.status(404).json({ success: false, error: "Report not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    console.error("studentReports.get", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
