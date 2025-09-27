const prisma = require("../db/prisma");

class StudentTutorModel {
  async assign(studentId, tutorId, data = {}) {
    // Prevent duplicate active pair
    const existing = await prisma.studentTutor.findFirst({
      where: { studentId: Number(studentId), tutorId: Number(tutorId), status: "active" },
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
        tutor: { select: { id: true, firstName: true, lastName: true, email: true, username: true, role: true } },
      },
    });
  }

  async listByTutor(tutorId) {
    return prisma.studentTutor.findMany({
      where: { tutorId: Number(tutorId) },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true, username: true, role: true } },
      },
    });
  }

  async listAll() {
    return prisma.studentTutor.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
        tutor:   { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
      },
    });
  }
}

module.exports = new StudentTutorModel();
