const prisma = require("../db/prisma");

class SupportTicketModel {
  listMine(studentId) {
    return prisma.supportTicket.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { createdAt: "desc" },
    });
  }
  create(studentId, { subject, message }) {
    return prisma.supportTicket.create({
      data: { studentId: Number(studentId), subject, message },
    });
  }
}

module.exports = new SupportTicketModel();
