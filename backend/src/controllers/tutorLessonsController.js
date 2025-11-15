const { lessonModel, studentTutorModel } = require("../models");
const calendarService = require("../services/calendarService");
const crypto = require("crypto");

// List upcoming lessons for tutor
exports.upcoming = async (req, res) => {
  try {
    const rows = await lessonModel.listUpcomingByTutor(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("tutor lessons.upcoming", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// List completed lessons for tutor
exports.completed = async (req, res) => {
  try {
    const rows = await lessonModel.listCompletedByTutor(req.user.id);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error("tutor lessons.completed", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get specific lesson for tutor
exports.getOne = async (req, res) => {
  try {
    const row = await lessonModel.findByIdForTutor(req.params.id, req.user.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    console.error("tutor lessons.getOne", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create new lesson
exports.create = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      startAt,
      endAt,
      zoomLink,
      prepNotes,
      homework,
      isRecurring,
      recurrenceType,
      recurrenceEndDate,
    } = req.body || {};

    if (!studentId || !subject || !startAt || !endAt) {
      return res.status(400).json({
        success: false,
        error: "studentId, subject, startAt, and endAt are required",
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

    // Generate seriesId and recurrenceRule if recurring
    let seriesId = null;
    let recurrenceRule = null;
    
    if (isRecurring && recurrenceType) {
      seriesId = crypto.randomUUID();
      recurrenceRule = calendarService.generateRRULE({
        recurrenceType,
        startAt,
        endDate: recurrenceEndDate || null,
      });
    }

    const created = await lessonModel.createByTutor(req.user.id, {
      studentId,
      subject,
      startAt,
      endAt,
      zoomLink,
      prepNotes,
      homework,
      seriesId,
      recurrenceRule,
    });

    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error("tutor lessons.create", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update lesson
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { subject, startAt, endAt, zoomLink, prepNotes, homework, status, updateRecurringSeries } =
      req.body || {};

    // Verify lesson belongs to this tutor
    const existing = await lessonModel.findByIdForTutor(id, req.user.id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    const updates = {};
    if (subject !== undefined) updates.subject = subject;
    if (startAt !== undefined) updates.startAt = new Date(startAt);
    if (endAt !== undefined) updates.endAt = new Date(endAt);
    if (zoomLink !== undefined) updates.zoomLink = zoomLink;
    if (prepNotes !== undefined) updates.prepNotes = prepNotes;
    if (homework !== undefined) updates.homework = homework;
    if (status !== undefined) updates.status = status;

    // If updating recurring series and lesson has seriesId
    if (updateRecurringSeries && existing.seriesId) {
      // Update all lessons in the series
      const seriesLessons = await lessonModel.findBySeriesId(existing.seriesId, req.user.id);
      
      for (const lesson of seriesLessons) {
        await lessonModel.updateByTutor(lesson.id, req.user.id, updates);
      }
      
      // If startAt or endAt changed, regenerate recurrence rule
      if (startAt !== undefined || endAt !== undefined) {
        const newStartAt = startAt ? new Date(startAt) : existing.startAt;
        const recurrenceRule = existing.recurrenceRule;
        
        if (recurrenceRule) {
          // Extract end date from existing rule if present
          const untilMatch = recurrenceRule.match(/UNTIL=([^;]+)/);
          const endDate = untilMatch ? untilMatch[1] : null;
          
          // Determine recurrence type from rule
          const freqMatch = recurrenceRule.match(/FREQ=(\w+)/);
          const recurrenceType = freqMatch ? freqMatch[1].toLowerCase() : 'weekly';
          
          // Regenerate rule with new start date
          const newRule = calendarService.generateRRULE({
            recurrenceType,
            startAt: newStartAt,
            endDate: endDate ? new Date(endDate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')) : null,
          });
          
          // Update recurrence rule for all lessons in series
          for (const lesson of seriesLessons) {
            await lessonModel.updateByTutor(lesson.id, req.user.id, { recurrenceRule: newRule });
          }
        }
      }
      
      const updated = await lessonModel.findByIdForTutor(id, req.user.id);
      return res.json({ success: true, data: updated, message: "All lessons in series updated" });
    } else if (existing.seriesId && !updateRecurringSeries) {
      // Remove from series if not updating all
      updates.seriesId = null;
      updates.recurrenceRule = null;
    }

    const updated = await lessonModel.updateByTutor(id, req.user.id, updates);
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error("tutor lessons.update", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete lesson
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Verify lesson belongs to this tutor
    const existing = await lessonModel.findByIdForTutor(id, req.user.id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    await lessonModel.removeByTutor(id, req.user.id);
    res.json({ success: true });
  } catch (e) {
    console.error("tutor lessons.remove", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

