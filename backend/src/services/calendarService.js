const prisma = require("../db/prisma");
const { zoomLinkModel, lessonMaterialModel } = require("../models");
const crypto = require("crypto");
const emailService = require("./emailService");

class CalendarService {
  // Generate RRULE string for recurring lessons
  generateRRULE({ recurrenceType, startAt, endDate }) {
    if (!recurrenceType || !startAt) return null;

    const start = new Date(startAt);
    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][start.getUTCDay()];
    const dayOfMonth = start.getUTCDate();

    let rrule = `FREQ=${recurrenceType.toUpperCase()};BYDAY=${dayOfWeek}`;

    if (recurrenceType === "monthly") {
      // For monthly, use BYMONTHDAY instead of BYDAY for more predictable behavior
      rrule = `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`;
    }

    if (endDate) {
      const end = new Date(endDate);
      // Set to end of day
      end.setUTCHours(23, 59, 59, 999);
      const endStr = end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      rrule += `;UNTIL=${endStr}`;
    }

    return rrule;
  }
  // List lessons with filters for admin calendar
  async listLessons({ dateFrom, dateTo, tutorId, studentId, subject, status, view = "month" }) {
    const where = {};
    if (dateFrom || dateTo) {
      where.startAt = {};
      if (dateFrom) where.startAt.gte = new Date(dateFrom);
      if (dateTo) where.startAt.lte = new Date(dateTo);
    }
    if (tutorId) where.tutorId = Number(tutorId);
    if (studentId) where.studentId = Number(studentId);
    if (subject) where.subject = { contains: String(subject), mode: "insensitive" };
    if (status) where.status = String(status);

    const rows = await prisma.lesson.findMany({
      where,
      orderBy: { startAt: "asc" },
      include: {
        tutor:   { select: { id: true, firstName: true, lastName: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return { success: true, data: rows, view };
  }

  async getLesson(id) {
    const row = await prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: {
        tutor:   { select: { id: true, firstName: true, lastName: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        materials: true,
      },
    });
    if (!row) return { success: false, error: "Lesson not found" };
    return { success: true, data: row };
  }

  // Create / reschedule / update
  async createLesson({ tutorId, studentId, subject, startAt, endAt, zoomLink, prepNotes, homework, seriesId = null, recurrenceRule = null }) {
    const row = await prisma.lesson.create({
      data: {
        tutorId: Number(tutorId),
        studentId: Number(studentId),
        subject,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        zoomLink: zoomLink ?? null,
        prepNotes: prepNotes ?? null,
        homework: homework ?? null,
        seriesId,
        recurrenceRule,
      },
    });
    return { success: true, data: row };
  }

  async updateLesson(id, updates) {
    if (updates.startAt) updates.startAt = new Date(updates.startAt);
    if (updates.endAt) updates.endAt = new Date(updates.endAt);
    const row = await prisma.lesson.update({
      where: { id: Number(id) },
      data: updates,
    });
    return { success: true, data: row };
  }

  async rescheduleLesson(id, { startAt, endAt }) {
    return this.updateLesson(id, { startAt, endAt });
  }

  async markCompleted(id) {
    // Get lesson with student and tutor info before updating
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tutor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feedback: true,
      },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    // Update lesson status to completed
    const row = await prisma.lesson.update({
      where: { id: Number(id) },
      data: { status: "completed" },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tutor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feedback: true,
      },
    });

    // If no feedback exists, send reminder email
    if (!lesson.feedback) {
      try {
        await emailService.sendFeedbackReminderEmail(
          lesson.student.email,
          {
            firstName: lesson.student.firstName,
            lastName: lesson.student.lastName,
          },
          {
            firstName: lesson.tutor.firstName,
            lastName: lesson.tutor.lastName,
          },
          {
            id: lesson.id,
            subject: lesson.subject,
            startAt: lesson.startAt,
          }
        );
      } catch (e) {
        console.error("Failed to send feedback reminder email:", e.message);
        // Don't fail the request if email fails
      }
    }

    return { success: true, data: row };
  }

  async cancelLesson(id) {
    const row = await prisma.lesson.update({
      where: { id: Number(id) },
      data: { status: "cancelled" },
    });
    return { success: true, data: row };
  }

  async duplicateLesson(id, overrides = {}) {
    const src = await prisma.lesson.findUnique({ where: { id: Number(id) } });
    if (!src) return { success: false, error: "Lesson not found" };
    const row = await prisma.lesson.create({
      data: {
        tutorId: src.tutorId,
        studentId: src.studentId,
        subject: overrides.subject ?? src.subject,
        startAt: overrides.startAt ? new Date(overrides.startAt) : src.startAt,
        endAt: overrides.endAt ? new Date(overrides.endAt) : src.endAt,
        zoomLink: overrides.zoomLink ?? src.zoomLink,
        prepNotes: src.prepNotes,
        homework: src.homework,
        status: "scheduled",
      },
    });
    return { success: true, data: row };
  }

  async createRecurringSeries({ tutorId, studentId, subject, startAt, endAt, rrule }) {
    // We store the RRULE and seriesId; client can create specific instances or you can expand here.
    const seriesId = crypto.randomUUID();
    // For scaffold, we only create the anchor event; UI can pre-generate instances or you can add expansion logic.
    const anchor = await prisma.lesson.create({
      data: {
        tutorId: Number(tutorId),
        studentId: Number(studentId),
        subject,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: "scheduled",
        seriesId,
        recurrenceRule: rrule,
      },
    });
    return { success: true, data: { seriesId, anchor } };
  }

  // Materials
  async addMaterial(lessonId, { title, type, path, url, addedBy }) {
    const created = await lessonMaterialModel.add({ lessonId, title, type, path, url, addedBy });
    return { success: true, data: created };
  }

  async listMaterials(lessonId) {
    const rows = await lessonMaterialModel.list(lessonId);
    return { success: true, data: rows };
  }

  async removeMaterial(id) {
    await lessonMaterialModel.remove(id);
    return { success: true };
  }

  // Zoom registry
  async listZoomLinks(tutorId) {
    const rows = await zoomLinkModel.listByTutor(tutorId);
    return { success: true, data: rows };
  }

  async setDefaultZoomLink(tutorId, { label, url }) {
    const row = await zoomLinkModel.upsertDefault(tutorId, { label, url });
    return { success: true, data: row };
  }

  // Ensure lessons in a window have a valid link (registry fallback)
  async ensureZoomLinks({ dateFrom, dateTo }) {
    const where = {
      status: "scheduled",
      startAt: {},
    };
    if (dateFrom) where.startAt.gte = new Date(dateFrom);
    if (dateTo) where.startAt.lte = new Date(dateTo);

    const lessons = await prisma.lesson.findMany({ where });
    const patched = [];

    for (const L of lessons) {
      if (!L.zoomLink) {
        const def = await zoomLinkModel.getDefault(L.tutorId);
        if (def?.url) {
          const updated = await prisma.lesson.update({
            where: { id: L.id },
            data: { zoomLink: def.url },
          });
          patched.push(updated.id);
        }
      }
    }

    return { success: true, data: { patchedCount: patched.length, patchedIds: patched } };
  }
}

module.exports = new CalendarService();
