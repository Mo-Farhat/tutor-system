module.exports = {
  validateCreateOrUpdate(req, res, next) {
    const { tutorId, studentId, subject, startAt, endAt } = req.body || {};
    const errors = [];
    if (req.method === "POST" && (tutorId == null || studentId == null)) errors.push("tutorId and studentId are required");
    if (subject && typeof subject !== "string") errors.push("subject must be string");
    if (startAt && isNaN(new Date(startAt))) errors.push("startAt must be a valid date");
    if (endAt && isNaN(new Date(endAt))) errors.push("endAt must be a valid date");
    if (errors.length) return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    next();
  }
};
