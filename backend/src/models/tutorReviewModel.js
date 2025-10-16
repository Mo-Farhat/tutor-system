// ./src/models/tutorReviewModel.js
const prisma = require("../db/prisma");

class TutorReviewModel {
  // Create a review (admin adds Google review etc.)
  create({ tutorUserId, source = "google", content, addedBy }) {
    return prisma.tutorReview.create({
      data: {
        tutorUserId: Number(tutorUserId),
        source,
        content,
        addedBy: Number(addedBy),
      },
    });
  }

  // List reviews for a tutor
  listByTutor(tutorUserId) {
    return prisma.tutorReview.findMany({
      where: { tutorUserId: Number(tutorUserId) },
      orderBy: { createdAt: "desc" },
    });
  }

  // Delete a review
  remove(id) {
    return prisma.tutorReview.delete({ where: { id: Number(id) } });
  }

  // Count reviews for a tutor
  countByTutor(tutorUserId) {
    return prisma.tutorReview.count({
      where: { tutorUserId: Number(tutorUserId) },
    });
  }
}

module.exports = new TutorReviewModel();
