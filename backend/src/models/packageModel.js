const prisma = require("../db/prisma");

class PackageModel {
  listByStudent(studentId) {
    return prisma.packagePurchase.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { purchasedAt: "desc" },
    });
  }

  purchase(studentId, subject) {
    return prisma.$transaction(async (tx) => {
      const pkg = await tx.packagePurchase.create({
        data: { studentId: Number(studentId), subject, hoursTotal: 10, hoursUsed: 0, discountCents: 5000 },
      });
      await tx.paymentTransaction.create({
        data: {
          studentId: Number(studentId),
          packageId: pkg.id,
          type: "package",
          amountCents: Math.max(0, 10 * 1_0000 - pkg.discountCents), // example calc; replace with real pricing
          description: `10-hour package for ${subject}`,
        },
      });
      return pkg;
    });
  }

  listTransactions(studentId) {
    return prisma.paymentTransaction.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { createdAt: "desc" },
    });
  }

  findTransaction(studentId, id) {
    return prisma.paymentTransaction.findFirst({
      where: { id: Number(id), studentId: Number(studentId) },
    });
  }
}

module.exports = new PackageModel();
