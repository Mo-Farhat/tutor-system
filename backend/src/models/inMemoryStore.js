const prisma = require("../db/prisma");

class DbStore {
  // ---------- Users ----------
  async createUser(userData) {
    return prisma.user.create({ data: userData });
  }
  async getUserById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  }
  async getUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }
  async getUserByUsername(username) {
    return prisma.user.findUnique({ where: { username } });
  }
  async updateUser(id, updateData) {
    return prisma.user.update({ where: { id: Number(id) }, data: updateData });
  }

  // ---------- Tutor Applications ----------
  async createTutorApplication(data) {
    const ts = Date.now();
    const count = await prisma.tutorApplication.count();
    const applicationId = `APP-${ts}-${count + 1}`;
    return prisma.tutorApplication.create({
      data: { applicationId, ...data },
    });
  }
  async getTutorApplicationById(id) {
    return prisma.tutorApplication.findUnique({ where: { id: Number(id) } });
  }
  async getTutorApplicationByApplicationId(applicationId) {
    return prisma.tutorApplication.findUnique({ where: { applicationId } });
  }
  async updateTutorApplication(id, updateData) {
    return prisma.tutorApplication.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }
  async getAllPendingApplications() {
    return prisma.tutorApplication.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });
  }

  // ---------- Setup Tokens ----------
  async createSetupToken({ token, applicationId, email, expiresAt }) {
    await prisma.setupToken.create({
      data: {
        token,
        applicationId: Number(applicationId),
        email,
        expiresAt,
      },
    });
  }
  async getSetupToken(token) {
    return prisma.setupToken.findUnique({ where: { token } });
  }
  async deleteSetupToken(token) {
    await prisma.setupToken.delete({ where: { token } });
    return true;
  }

  // ---------- Tutor Profiles ----------
  async createTutorProfile(userId, profileData) {
    return prisma.tutorProfile.create({
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
  async getTutorProfileByUserId(userId) {
    return prisma.tutorProfile.findUnique({ where: { userId: Number(userId) } });
  }
  async updateTutorProfile(userId, updateData) {
    return prisma.tutorProfile.update({
      where: { userId: Number(userId) },
      data: updateData,
    });
  }

  // ---------- Stats ----------
  async getStats() {
    const [users, applications, profiles, setupTokens] = await Promise.all([
      prisma.user.count(),
      prisma.tutorApplication.count(),
      prisma.tutorProfile.count(),
      prisma.setupToken.count(),
    ]);
    return { users, applications, profiles, setupTokens };
  }

  // in-memory clear() no longer applies
  clear() {
    throw new Error("Not supported on DB store.");
  }
}

module.exports = new DbStore();
