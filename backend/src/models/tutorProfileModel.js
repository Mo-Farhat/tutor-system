const prisma = require("../db/prisma");

class TutorProfileModel {
  // Create a new tutor profile
  async create(userId, profileData) {
    return await prisma.tutorProfile.create({
      data: {
        userId: Number(userId),
        phone_number: profileData.phone_number ?? null,
        bio: profileData.bio ?? "",
        hourly_rate: profileData.hourly_rate ?? 45.0,
        university: profileData.university ?? "",
        current_studies: profileData.current_studies ?? [],
        subjects: profileData.subjects ?? [],
        subjects_selected: profileData.subjects_selected ?? [],
        locations: profileData.locations ?? [],
        preferred_locations: profileData.preferred_locations ?? [],
        schools_attended: profileData.schools_attended ?? [],
        is_profile_complete: profileData.is_profile_complete ?? false,
        documents_uploaded: profileData.documents_uploaded ?? false,
        is_live: profileData.is_live ?? false,
        tier: profileData.tier ?? "gold",
        rating: profileData.rating ?? 0.0,
        atar: profileData.atar ?? null,
        approved_at: profileData.approved_at
          ? new Date(profileData.approved_at)
          : null,
      },
    });
  }

  // Find profile by user ID
  async findByUserId(userId) {
    return await prisma.tutorProfile.findUnique({
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
    return await prisma.tutorProfile.update({
      where: { userId: Number(userId) },
      data: updateData,
    });
  }

  // Delete profile
  async delete(userId) {
    return await prisma.tutorProfile.delete({
      where: { userId: Number(userId) },
    });
  }

  // Count profiles
  async count() {
    return await prisma.tutorProfile.count();
  }

  // Find all profiles with filters
  async findAll(options = {}) {
    return await prisma.tutorProfile.findMany({
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

  // Find live profiles (for public listing)
  async findLive(options = {}) {
    return await prisma.tutorProfile.findMany({
      where: {
        is_live: true,
        documents_uploaded: true,
        ...(options.where || {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  // Check if profile exists
  async exists(userId) {
    const count = await prisma.tutorProfile.count({
      where: { userId: Number(userId) },
    });
    return count > 0;
  }
}

module.exports = new TutorProfileModel();
