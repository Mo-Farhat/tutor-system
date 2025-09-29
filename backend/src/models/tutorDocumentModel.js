const prisma = require("../db/prisma");

class TutorDocumentModel {
  async create(userId, type, path, expiresAt = null) {
    return prisma.tutorDocument.create({
      data: { userId: Number(userId), type, path, expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
  }
  async findByUserId(userId) {
    return prisma.tutorDocument.findMany({
      where: { userId: Number(userId) },
      orderBy: { uploadedAt: "desc" },
    });
  }
  async hasDoc(userId, type) {
    const c = await prisma.tutorDocument.count({ where: { userId: Number(userId), type } });
    return c > 0;
  }
  async getLatestWWCC(userId) {
    return prisma.tutorDocument.findFirst({
      where: { userId: Number(userId), type: "wwcc" },
      orderBy: { uploadedAt: "desc" },
    });
  }
  async countByType(userId, type) {
    return prisma.tutorDocument.count({ where: { userId: Number(userId), type } });
  }
}

module.exports = new TutorDocumentModel();
