const prisma = require("../db/prisma");

class TutorPaymentModel {
  async upsert(userId, data) {
    return prisma.tutorPaymentInfo.upsert({
      where: { userId: Number(userId) },
      update: data,
      create: { userId: Number(userId), ...data },
    });
  }
  async findByUserId(userId) {
    return prisma.tutorPaymentInfo.findUnique({ where: { userId: Number(userId) } });
  }
}

module.exports = new TutorPaymentModel();
