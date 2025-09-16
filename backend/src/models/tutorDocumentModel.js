const prisma = require("../db/prisma");

class TutorDocumentModel {
  async create(userId, type, path) {
    return prisma.tutorDocument.create({
      data: { userId: Number(userId), type, path },
    });
  }
  async findByUserId(userId) {
    return prisma.tutorDocument.findMany({
      where: { userId: Number(userId) },
      orderBy: { uploadedAt: "desc" },
    });
  }
  async countByType(userId, type) {
    return prisma.tutorDocument.count({ where: { userId: Number(userId), type } });
  }
}

module.exports = new TutorDocumentModel();
