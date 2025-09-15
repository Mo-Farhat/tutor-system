const prisma = require("../db/prisma");

class StudentProfileModel {
  // Create a new student profile
  async create(userId, profileData) {
    return await prisma.studentProfile.create({
      data: {
        userId: Number(userId),
        phone_number: profileData.phone_number ?? null,
        bio: profileData.bio ?? "",
        current_school: profileData.current_school ?? "",
        year_level: profileData.year_level ?? "",
        subjects_interested: profileData.subjects_interested ?? [],
        preferred_locations: profileData.preferred_locations ?? [],
        learning_goals: profileData.learning_goals ?? "",
        is_profile_complete: profileData.is_profile_complete ?? false,
      },
    });
  }

  // Find profile by user ID
  async findByUserId(userId) {
    return await prisma.studentProfile.findUnique({
      where: { userId: Number(userId) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  // Update profile
  async update(userId, updateData) {
    return await prisma.studentProfile.update({
      where: { userId: Number(userId) },
      data: updateData,
    });
  }

  // Delete profile
  async delete(userId) {
    return await prisma.studentProfile.delete({
      where: { userId: Number(userId) },
    });
  }

  // Count profiles
  async count() {
    return await prisma.studentProfile.count();
  }

  // Find all profiles with filters
  async findAll(options = {}) {
    return await prisma.studentProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
          },
        },
      },
      ...options,
    });
  }

  // Check if profile exists
  async exists(userId) {
    const count = await prisma.studentProfile.count({
      where: { userId: Number(userId) },
    });
    return count > 0;
  }
}

module.exports = new StudentProfileModel();
