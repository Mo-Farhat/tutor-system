// FILE: src/models/tutorChangeRequestModel.js
const prisma = require("../db/prisma");

const tutorChangeRequestModel = {
  create: (tutorId, type, oldValue, newValue) =>
    prisma.tutorChangeRequest.create({
      data: { tutorId: Number(tutorId), type, oldValue, newValue },
    }),

  // List by status (admin) or all if none
  list: ({ status } = {}) =>
    prisma.tutorChangeRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    }),

  // Pending only (admin quick)
  findPending: () =>
    prisma.tutorChangeRequest.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" } }),

  // Tutor self-view
  listByTutor: (tutorId) =>
    prisma.tutorChangeRequest.findMany({
      where: { tutorId: Number(tutorId) },
      orderBy: { createdAt: "desc" },
    }),

  approve: (id, adminId, comments) =>
    prisma.tutorChangeRequest.update({
      where: { id: Number(id) },
      data: { status: "approved", reviewedBy: Number(adminId), reviewedAt: new Date(), comments },
    }),

  reject: (id, adminId, comments) =>
    prisma.tutorChangeRequest.update({
      where: { id: Number(id) },
      data: { status: "rejected", reviewedBy: Number(adminId), reviewedAt: new Date(), comments },
    }),

  // Find by ID
  findById: (id) =>
    prisma.tutorChangeRequest.findUnique({
      where: { id: Number(id) },
    }),

  // Update change description
  updateDescription: (id, changeDescription) =>
    prisma.tutorChangeRequest.update({
      where: { id: Number(id) },
      data: { changeDescription },
    }),
};

module.exports = tutorChangeRequestModel;
