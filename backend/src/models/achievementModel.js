const prisma = require("../db/prisma");

class AchievementModel {
  listForStudent(studentId) {
    return prisma.studentBadge.findMany({
      where: { studentId: Number(studentId) },
      include: { badge: true, tutor: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { awardedAt: "desc" },
    });
  }
}

module.exports = new AchievementModel();
