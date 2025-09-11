const prisma = require("../db/prisma");

class SetupTokenModel {
  // Create a new setup token
  async create({ token, applicationId, email, expiresAt }) {
    return await prisma.setupToken.create({
      data: {
        token,
        applicationId: Number(applicationId),
        email,
        expiresAt,
      },
    });
  }

  // Find token
  async findByToken(token) {
    return await prisma.setupToken.findUnique({
      where: { token },
    });
  }

  // Delete token
  async delete(token) {
    return await prisma.setupToken.delete({
      where: { token },
    });
  }

  // Count tokens
  async count() {
    return await prisma.setupToken.count();
  }

  // Clean up expired tokens
  async deleteExpired() {
    return await prisma.setupToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  // Find all tokens (for debugging)
  async findAll() {
    return await prisma.setupToken.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = new SetupTokenModel();
