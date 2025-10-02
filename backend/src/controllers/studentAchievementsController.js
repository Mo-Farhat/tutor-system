const { achievementModel } = require("../models");
exports.list = async (req, res) => {
  try {
    const rows = await achievementModel.listForStudent(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("achievements.list", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
