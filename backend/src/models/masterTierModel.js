const prisma = require("../db/prisma");

class MasterTierModel {
  /**
   * Get all tiers
   */
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return prisma.masterTier.findMany({
      where,
      orderBy: { hourlyRate: "desc" },
    });
  }

  /**
   * Get tier by ID
   */
  async findById(id) {
    return prisma.masterTier.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new tier
   */
  async create(data) {
    const payoutRate = parseFloat(data.hourlyRate) - parseFloat(data.striveCut);
    return prisma.masterTier.create({
      data: {
        id: data.id,
        name: data.name,
        hourlyRate: parseFloat(data.hourlyRate),
        striveCut: parseFloat(data.striveCut),
        payoutRate: payoutRate,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update a tier
   */
  async update(id, data) {
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = parseFloat(data.hourlyRate);
    if (data.striveCut !== undefined) updateData.striveCut = parseFloat(data.striveCut);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    // Recalculate payout rate if either rate changed
    if (data.hourlyRate !== undefined || data.striveCut !== undefined) {
      const existing = await this.findById(id);
      const hourlyRate = data.hourlyRate !== undefined ? parseFloat(data.hourlyRate) : parseFloat(existing.hourlyRate);
      const striveCut = data.striveCut !== undefined ? parseFloat(data.striveCut) : parseFloat(existing.striveCut);
      updateData.payoutRate = hourlyRate - striveCut;
    }

    return prisma.masterTier.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a tier (soft delete by setting inactive)
   */
  async delete(id) {
    return prisma.masterTier.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get tier rate for a tutor based on their profile tier
   */
  async getTierRateForTutor(tutorId) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
      select: { tier: true },
    });

    if (!tutorProfile) return null;

    // Map enum tier to master tier id
    const tierId = tutorProfile.tier.toLowerCase(); // "gold", "premium", "elite"
    return this.findById(tierId);
  }
}

module.exports = new MasterTierModel();
