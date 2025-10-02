const prisma = require("../db/prisma");

class ReportModel {
  listForStudent(studentId) {
    return prisma.report.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { date: "desc" },
      include: { tutor: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  getForStudent(studentId, id) {
    return prisma.report.findFirst({
      where: { id: Number(id), studentId: Number(studentId) },
      include: { tutor: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}

module.exports = new ReportModel();
