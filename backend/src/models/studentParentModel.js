const prisma = require("../db/prisma");

class StudentParentModel {
  async create(studentId, data) {
    return prisma.parentContact.create({
      data: { studentId: Number(studentId), ...data },
    });
  }

  async update(id, studentId, data) {
    // ensure the record belongs to the student
    return prisma.parentContact.update({
      where: { id: Number(id) },
      data,
    });
  }

  async delete(id, studentId) {
    return prisma.parentContact.delete({ where: { id: Number(id) } });
  }

  async listByStudent(studentId) {
    return prisma.parentContact.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { isPrimary: "desc" },
    });
  }

  async getById(id) {
    return prisma.parentContact.findUnique({ where: { id: Number(id) } });
  }

  async setPrimary(studentId, id) {
    return prisma.$transaction([
      prisma.parentContact.updateMany({
        where: { studentId: Number(studentId), isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.parentContact.update({
        where: { id: Number(id) },
        data: { isPrimary: true },
      }),
    ]);
  }
}

module.exports = new StudentParentModel();
