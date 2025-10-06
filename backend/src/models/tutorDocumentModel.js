// ./src/models/tutorDocumentModel.js
const prisma = require("../db/prisma");

// Supported statuses for admin compliance flows
const DOC_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

class TutorDocumentModel {
  async create(userId, type, path, expiresAt = null, opts = {}) {
    // opts: { number?, status? }
    return prisma.tutorDocument.create({
      data: {
        userId: Number(userId),
        type,
        path,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        number: opts.number ?? null,
        status: opts.status ?? DOC_STATUS.PENDING,
      },
    });
  }

  async findByUserId(userId) {
    return prisma.tutorDocument.findMany({
      where: { userId: Number(userId) },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async hasDoc(userId, type) {
    const c = await prisma.tutorDocument.count({
      where: { userId: Number(userId), type },
    });
    return c > 0;
  }

  async getLatestByType(userId, type) {
    return prisma.tutorDocument.findFirst({
      where: { userId: Number(userId), type },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async getLatestWWCC(userId) {
    return this.getLatestByType(userId, "wwcc");
  }

  async countByType(userId, type) {
    return prisma.tutorDocument.count({
      where: { userId: Number(userId), type },
    });
  }

  async setNumber(docId, number) {
    return prisma.tutorDocument.update({
      where: { id: Number(docId) },
      data: { number },
    });
  }

  async setStatus(docId, status) {
    return prisma.tutorDocument.update({
      where: { id: Number(docId) },
      data: { status },
    });
  }

  async approve(docId) {
    return this.setStatus(docId, DOC_STATUS.APPROVED);
  }

  async reject(docId, reason = null) {
    return prisma.tutorDocument.update({
      where: { id: Number(docId) },
      data: { status: DOC_STATUS.REJECTED, rejectionReason: reason },
    });
  }

  async upsertWWCC(userId, { path, number, expiresAt, status }) {
    const latest = await this.getLatestWWCC(userId);
    if (!latest) {
      return this.create(userId, "wwcc", path ?? "", expiresAt ?? null, {
        number: number ?? null,
        status: status ?? DOC_STATUS.PENDING,
      });
    }
    return prisma.tutorDocument.update({
      where: { id: latest.id },
      data: {
        path: path ?? latest.path,
        number: number ?? latest.number,
        expiresAt: expiresAt ? new Date(expiresAt) : latest.expiresAt,
        status: status ?? latest.status,
      },
    });
  }

  async listExpiringWithin(days = 30) {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return prisma.tutorDocument.findMany({
      where: {
        type: "wwcc",
        expiresAt: { gte: now, lte: cutoff },
        status: { in: [DOC_STATUS.PENDING, DOC_STATUS.APPROVED] },
      },
      orderBy: { expiresAt: "asc" },
    });
  }

  async listMissingForCompliance() {
    // Tutors missing either contract or wwcc
    return prisma.user.findMany({
      where: { role: "tutor" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        TutorDocument: true,
      },
    }).then((rows) =>
      rows
        .map((u) => {
          const hasContract = u.TutorDocument?.some((d) => d.type === "contract");
          const hasWwcc = u.TutorDocument?.some((d) => d.type === "wwcc");
          return !hasContract || !hasWwcc
            ? {
                tutorId: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                hasContract,
                hasWwcc,
              }
            : null;
        })
        .filter(Boolean)
    );
  }
}

module.exports = new TutorDocumentModel();
module.exports.DOC_STATUS = DOC_STATUS;
