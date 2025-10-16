// FILE: src/middleware/validateTutorChangeRequest.js
module.exports = (req, res, next) => {
  const { type, newValue } = req.body || {};
  const errors = [];

  if (!type || typeof type !== "string" || !type.trim()) {
    errors.push("type is required (string)");
  }
  if (typeof newValue === "undefined") {
    errors.push("newValue is required");
  }

  if (errors.length) {
    return res.status(400).json({ success: false, error: "Validation failed", details: errors });
  }
  next();
};
