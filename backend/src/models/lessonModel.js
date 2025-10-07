const prisma = require("../db/prisma");

class LessonModel {
  listUpcomingByStudent(studentId, limit = 20) {
    return prisma.lesson.findMany({
      where: {
        studentId: Number(studentId),
        startAt: { gte: new Date() },
        status: "scheduled",
      },
      orderBy: { startAt: "asc" },
      take: limit,
      include: {
        tutor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  listCompletedByStudent(studentId, limit = 50) {
    return prisma.lesson.findMany({
      where: { studentId: Number(studentId), status: "completed" },
      orderBy: { startAt: "desc" },
      take: limit,
      include: {
        tutor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feedback: true,
      },
    });
  }

  findByIdForStudent(id, studentId) {
    return prisma.lesson.findFirst({
      where: { id: Number(id), studentId: Number(studentId) },
      include: {
        tutor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feedback: true,
      },
    });
  }

  addFeedback(lessonId, { rating, comment }) {
    return prisma.studentFeedback.create({
      data: {
        lessonId: Number(lessonId),
        rating: rating ? Number(rating) : null,
        comment: comment ?? null,
      },
    });
  }

  // Tutor-side helpers (optional)
  createByTutor(tutorId, payload) {
    return prisma.lesson.create({
      data: {
        tutorId: Number(tutorId),
        studentId: Number(payload.studentId),
        subject: payload.subject,
        startAt: new Date(payload.startAt),
        endAt: new Date(payload.endAt),
        zoomLink: payload.zoomLink ?? null,
        prepNotes: payload.prepNotes ?? null,
        homework: payload.homework ?? null,
      },
    });
  }

  updateByTutor(id, tutorId, updates) {
    return prisma.lesson.update({
      where: { id: Number(id), tutorId: Number(tutorId) },
      data: updates,
    });
  }

   findCompletedByTutor(tutorId, { limit = 100 } = {}) {
    return prisma.lesson.findMany({
      where: { tutorId: Number(tutorId), status: "completed" },
      orderBy: { startAt: "desc" },
      take: limit,
      select: {
        id: true,
        subject: true,
        startAt: true,
        endAt: true,
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  countCompletedByTutor(tutorId) {
    return prisma.lesson.count({
      where: { tutorId: Number(tutorId), status: "completed" },
    });
  }

  listByTutorCalendar(tutorId, { dateFrom, dateTo, status, subject } = {}) {
    const where = {
      tutorId: Number(tutorId),
      ...(status ? { status } : {}),
      ...(subject ? { subject } : {}),
      ...(dateFrom || dateTo
        ? {
            startAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    };
    return prisma.lesson.findMany({
      where,
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        subject: true,
        startAt: true,
        endAt: true,
        status: true,
        zoomLink: true,
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  listByStudentCalendar(studentId, { dateFrom, dateTo, status, subject } = {}) {
    const where = {
      studentId: Number(studentId),
      ...(status ? { status } : {}),
      ...(subject ? { subject } : {}),
      ...(dateFrom || dateTo
        ? {
            startAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    };
    return prisma.lesson.findMany({
      where,
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        subject: true,
        startAt: true,
        endAt: true,
        status: true,
        zoomLink: true,
        tutor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  // Ensure every scheduled session has a zoom link (for compliance checks)
  listScheduledMissingZoom({ dateFrom, dateTo } = {}) {
    const where = {
      status: "scheduled",
      OR: [{ zoomLink: null }, { zoomLink: "" }],
      ...(dateFrom || dateTo
        ? {
            startAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    };
    return prisma.lesson.findMany({
      where,
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        subject: true,
        startAt: true,
        endAt: true,
        tutor: { select: { id: true, firstName: true, lastName: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
      }
    });
  }

  // Tutor-side lesson queries
  listUpcomingByTutor(tutorId, limit = 20) {
    return prisma.lesson.findMany({
      where: {
        tutorId: Number(tutorId),
        startAt: { gte: new Date() },
        status: "scheduled",
      },
      orderBy: { startAt: "asc" },
      take: limit,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  // Move listCompletedByTutor to correct class scope
  listCompletedByTutor(tutorId, limit = 50) {
    return prisma.lesson.findMany({
      where: { tutorId: Number(tutorId), status: "completed" },
      orderBy: { startAt: "desc" },
      take: limit,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feedback: true,
      },
    });
  }

  findByIdForTutor(id, tutorId) {
    return prisma.lesson.findFirst({
      where: { id: Number(id), tutorId: Number(tutorId) },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feedback: true,
      },
    });
  }

  removeByTutor(id, tutorId) {
    return prisma.lesson.delete({
      where: { id: Number(id), tutorId: Number(tutorId) },
    });
  }
}




module.exports = new LessonModel();
