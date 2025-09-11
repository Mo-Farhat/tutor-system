const prisma = require("../db/prisma");

class UserModel {
  // Create a new user
  async create(userData) {
    return await prisma.user.create({
      data: userData,
    });
  }

  // Find user by ID
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id: Number(id) },
    });
  }

  // Find user by email
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by username
  async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  // Update user
  async update(id, updateData) {
    return await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  // Delete user
  async delete(id) {
    return await prisma.user.delete({
      where: { id: Number(id) },
    });
  }

  // Count users
  async count() {
    return await prisma.user.count();
  }

  // Find users with pagination
  async findMany(options = {}) {
    return await prisma.user.findMany(options);
  }
}

module.exports = new UserModel();
