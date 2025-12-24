const prisma = require("../db/prisma");

class StudentTutorModel {
  async assign(studentId, tutorId, data = {}) {
    // Prevent duplicate active pair
    const existing = await prisma.studentTutor.findFirst({
      where: {
        studentId: Number(studentId),
        tutorId: Number(tutorId),
        status: "active",
      },
    });
    if (existing) return existing;

    return prisma.studentTutor.create({
      data: {
        studentId: Number(studentId),
        tutorId: Number(tutorId),
        subject: data.subject ?? null,
        status: data.status ?? "active",
      },
    });
  }

  async update(id, updates) {
    return prisma.studentTutor.update({
      where: { id: Number(id) },
      data: updates,
    });
  }

  async remove(id) {
    return prisma.studentTutor.delete({ where: { id: Number(id) } });
  }

  async listByStudent(studentId) {
    return prisma.studentTutor.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { createdAt: "desc" },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  async listByTutor(tutorId) {
    return prisma.studentTutor.findMany({
      where: { tutorId: Number(tutorId) },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  async listAll() {
    return prisma.studentTutor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }

  async findByTutorAndStudent(tutorId, studentId) {
    return prisma.studentTutor.findFirst({
      where: {
        tutorId: Number(tutorId),
        studentId: Number(studentId),
        status: "active",
      },
    });
  }

  /**
   * Find assignment by ID with tutor profile for tier lookup
   */
  async findByIdWithTutor(id) {
    return prisma.studentTutor.findUnique({
      where: { id: Number(id) },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: { tier: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            stripeCustomerId: true,
          },
        },
      },
    });
  }

  /**
   * Find assignment for a specific lesson (by student, tutor, subject)
   */
  async findForLesson(studentId, tutorId, subject) {
    return prisma.studentTutor.findFirst({
      where: {
        studentId: Number(studentId),
        tutorId: Number(tutorId),
        subject: subject,
        status: "active",
      },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: { select: { tier: true } },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            stripeCustomerId: true,
          },
        },
      },
    });
  }

  /**
   * Credit hours to an assignment bucket (e.g., after package purchase)
   */
  async creditHours(id, hours) {
    return prisma.studentTutor.update({
      where: { id: Number(id) },
      data: {
        remainingHours: {
          increment: parseFloat(hours),
        },
      },
    });
  }

  /**
   * Deduct hours from an assignment bucket (e.g., after session completion)
   * Returns the updated assignment with new remaining hours (can be negative for overage)
   */
  async deductHours(id, hours) {
    return prisma.studentTutor.update({
      where: { id: Number(id) },
      data: {
        remainingHours: {
          decrement: parseFloat(hours),
        },
      },
    });
  }

  /**
   * Get remaining hours for an assignment
   */
  async getRemainingHours(id) {
    const assignment = await prisma.studentTutor.findUnique({
      where: { id: Number(id) },
      select: { remainingHours: true },
    });
    return assignment ? parseFloat(assignment.remainingHours) : 0;
  }

  /**
   * Set remaining hours to a specific value (e.g., reset to 0 after overage)
   */
  async setRemainingHours(id, hours) {
    return prisma.studentTutor.update({
      where: { id: Number(id) },
      data: {
        remainingHours: parseFloat(hours),
      },
    });
  }

  /**
   * Get all assignments with low hours (for reminder notifications)
   */
  async findLowBalanceAssignments(threshold = 2) {
    return prisma.studentTutor.findMany({
      where: {
        status: "active",
        remainingHours: { lte: threshold, gt: 0 },
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        tutor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}

module.exports = new StudentTutorModel();

