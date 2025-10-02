const prisma = require("../db/prisma");

class ZoomLinkModel {
  upsertDefault(tutorId, { label = "Default", url }) {
    return prisma.$transaction(async (tx) => {
      await tx.zoomLinkRegistry.updateMany({
        where: { tutorId: Number(tutorId), isDefault: true },
        data: { isDefault: false },
      });
      return tx.zoomLinkRegistry.create({
        data: { tutorId: Number(tutorId), label, url, isDefault: true },
      });
    });
  }

  create(tutorId, { label, url, isDefault = false }) {
    return prisma.zoomLinkRegistry.create({
      data: { tutorId: Number(tutorId), label, url, isDefault },
    });
  }

  listByTutor(tutorId) {
    return prisma.zoomLinkRegistry.findMany({
      where: { tutorId: Number(tutorId) },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });
  }

  getDefault(tutorId) {
    return prisma.zoomLinkRegistry.findFirst({
      where: { tutorId: Number(tutorId), isDefault: true },
    });
  }

  remove(id) {
    return prisma.zoomLinkRegistry.delete({ where: { id: Number(id) } });
  }
}

module.exports = new ZoomLinkModel();
