const prisma = require("../db/prisma");

class TutorApplicationModel {
  // Create a new tutor application
  async create(data) {
    const ts = Date.now();
    const count = await prisma.tutorApplication.count();
    const applicationId = `APP-${ts}-${count + 1}`;

    return await prisma.tutorApplication.create({
      data: {
        applicationId,
        ...data,
      },
    });
  }

  // Find application by ID
  async findById(id) {
    return await prisma.tutorApplication.findUnique({
      where: { id: Number(id) },
    });
  }

  // Find application by applicationId
  async findByApplicationId(applicationId) {
    return await prisma.tutorApplication.findUnique({
      where: { applicationId },
    });
  }

  // Update application
  async update(id, updateData) {
    return await prisma.tutorApplication.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  // Get all pending applications
  async findPending() {
    return await prisma.tutorApplication.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });
  }

  // Get all applications
  async findAll(options = {}) {
    return await prisma.tutorApplication.findMany({
      orderBy: { createdAt: "desc" },
      ...options,
    });
  }

  // Count applications
  async count() {
    return await prisma.tutorApplication.count();
  }

  // Count by status
  async countByStatus(status) {
    return await prisma.tutorApplication.count({
      where: { status },
    });
  }

  // Delete application
  async delete(id) {
    return await prisma.tutorApplication.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new TutorApplicationModel();
