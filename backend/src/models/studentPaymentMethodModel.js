const prisma = require("../db/prisma");

class StudentPaymentMethodModel {
  list(studentId) {
    return prisma.studentPaymentMethod.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { createdAt: "desc" },
    });
  }
  create(studentId, data) {
    return prisma.studentPaymentMethod.create({
      data: { studentId: Number(studentId), ...data },
    });
  }
  remove(studentId, id) {
    return prisma.studentPaymentMethod.delete({ where: { id: Number(id) } });
  }
}

module.exports = new StudentPaymentMethodModel();
