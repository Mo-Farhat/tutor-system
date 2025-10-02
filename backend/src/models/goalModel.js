const prisma = require("../db/prisma");

class GoalModel {
  list(studentId) {
    return prisma.studentGoal.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { createdAt: "desc" },
    });
  }
  create(studentId, data) {
    return prisma.studentGoal.create({ data: { studentId: Number(studentId), ...data } });
  }
  update(studentId, id, data) {
    return prisma.studentGoal.update({ where: { id: Number(id) }, data });
  }
  remove(studentId, id) {
    return prisma.studentGoal.delete({ where: { id: Number(id) } });
  }
}

module.exports = new GoalModel();
