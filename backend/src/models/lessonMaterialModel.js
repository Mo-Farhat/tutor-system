const prisma = require("../db/prisma");

class LessonMaterialModel {
  add({ lessonId, title = null, type = null, path = null, url = null, addedBy }) {
    return prisma.lessonMaterial.create({
      data: {
        lessonId: Number(lessonId),
        title,
        type,
        path,
        url,
        addedBy: Number(addedBy),
      },
    });
  }

  list(lessonId) {
    return prisma.lessonMaterial.findMany({
      where: { lessonId: Number(lessonId) },
      orderBy: { createdAt: "desc" },
    });
  }

  remove(id) {
    return prisma.lessonMaterial.delete({ where: { id: Number(id) } });
  }
}

module.exports = new LessonMaterialModel();
