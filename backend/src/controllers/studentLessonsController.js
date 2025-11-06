const { lessonModel } = require("../models");

// Student: upcoming lessons
exports.upcoming = async (req, res) => {
  try {
    const data = await lessonModel.listUpcomingByStudent(req.user.id, Number(req.query.limit || 20));
    res.json({ success: true, data });
  } catch (e) {
    console.error("lessons.upcoming", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Student: completed lessons
exports.completed = async (req, res) => {
  try {
    const data = await lessonModel.listCompletedByStudent(req.user.id, Number(req.query.limit || 50));
    
    // Calculate feedback statistics
    const totalCompleted = data.length;
    const pendingFeedback = data.filter(lesson => !lesson.feedback).length;
    const withFeedback = totalCompleted - pendingFeedback;
    
    // Add metadata about feedback status
    const response = {
      success: true,
      data,
      metadata: {
        totalCompleted,
        pendingFeedback,
        withFeedback,
      },
    };
    
    res.json(response);
  } catch (e) {
    console.error("lessons.completed", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Student: view one lesson
exports.getOne = async (req, res) => {
  try {
    const row = await lessonModel.findByIdForStudent(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ success: false, error: "Lesson not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    console.error("lessons.getOne", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Student: leave feedback on completed lesson
exports.giveFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    if (!rating && !comment) return res.status(400).json({ success: false, error: "rating or comment required" });
    const row = await lessonModel.findByIdForStudent(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ success: false, error: "Lesson not found" });
    if (row.status !== "completed") return res.status(400).json({ success: false, error: "Feedback only for completed lessons" });

    const created = await lessonModel.addFeedback(row.id, { rating, comment });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("lessons.giveFeedback", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Student: get pending feedback lessons
exports.pendingFeedback = async (req, res) => {
  try {
    const allCompleted = await lessonModel.listCompletedByStudent(req.user.id, Number(req.query.limit || 50));
    const pending = allCompleted.filter(lesson => !lesson.feedback);
    res.json({ success: true, data: pending, count: pending.length });
  } catch (e) {
    console.error("lessons.pendingFeedback", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// ICS download
exports.downloadIcs = async (req, res) => {
  try {
    const row = await lessonModel.findByIdForStudent(req.params.id, req.user.id);
    if (!row) return res.status(404).end();

    const dtStart = new Date(row.startAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtEnd   = new Date(row.endAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const uid     = `lesson-${row.id}@strive`;
    const summary = `Tutoring: ${row.subject}`;
    const desc    = (row.prepNotes ? `Prep: ${row.prepNotes}\n` : "") + (row.homework ? `Homework: ${row.homework}` : "");
    const location = row.zoomLink ? row.zoomLink : "Online";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Strive//Lessons//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStart}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=lesson-${row.id}.ics`);
    res.send(ics);
  } catch (e) {
    console.error("lessons.downloadIcs", e);
    res.status(500).end();
  }
};
