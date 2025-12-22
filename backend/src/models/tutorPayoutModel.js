const prisma = require("../db/prisma");

class TutorPayoutModel {
  /**
   * Get all payouts for a tutor
   */
  async findByTutor(tutorId, options = {}) {
    const { limit = 50, status } = options;
    
    const where = { tutorId: Number(tutorId) };
    if (status) where.status = status;

    return prisma.tutorPayout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        lesson: {
          select: {
            id: true,
            subject: true,
            startAt: true,
            endAt: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get earnings summary for a tutor
   */
  async getEarningsSummary(tutorId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total earnings (all time)
    const totalResult = await prisma.tutorPayout.aggregate({
      where: { tutorId: Number(tutorId), status: { in: ['confirmed', 'paid'] } },
      _sum: { netPayout: true },
      _count: true,
    });

    // This month earnings
    const thisMonthResult = await prisma.tutorPayout.aggregate({
      where: {
        tutorId: Number(tutorId),
        status: { in: ['confirmed', 'paid'] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { netPayout: true },
      _count: true,
    });

    // Last month earnings
    const lastMonthResult = await prisma.tutorPayout.aggregate({
      where: {
        tutorId: Number(tutorId),
        status: { in: ['confirmed', 'paid'] },
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { netPayout: true },
    });

    // Pending payouts
    const pendingResult = await prisma.tutorPayout.aggregate({
      where: { tutorId: Number(tutorId), status: 'pending' },
      _sum: { netPayout: true },
      _count: true,
    });

    // Get hourly rate from tutor profile
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: Number(tutorId) },
      select: { tier: true },
    });

    const tierRates = await prisma.masterTier.findUnique({
      where: { id: profile?.tier?.toLowerCase() || 'gold' },
    });

    return {
      totalEarnings: parseFloat(totalResult._sum.netPayout || 0),
      totalSessions: totalResult._count,
      thisMonth: parseFloat(thisMonthResult._sum.netPayout || 0),
      sessionsThisMonth: thisMonthResult._count,
      lastMonth: parseFloat(lastMonthResult._sum.netPayout || 0),
      pendingAmount: parseFloat(pendingResult._sum.netPayout || 0),
      pendingSessions: pendingResult._count,
      hourlyRate: tierRates ? parseFloat(tierRates.payoutRate) : 0,
    };
  }

  /**
   * Get monthly earnings for last N months (for chart display)
   */
  async getMonthlyEarnings(tutorId, months = 6) {
    const now = new Date();
    const monthlyData = [];

    for (let i = months - 1; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const result = await prisma.tutorPayout.aggregate({
        where: {
          tutorId: Number(tutorId),
          status: { in: ['confirmed', 'paid'] },
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { netPayout: true },
        _count: true,
      });

      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });
      
      monthlyData.push({
        month: monthName,
        year: startOfMonth.getFullYear(),
        earnings: parseFloat(result._sum.netPayout || 0),
        sessions: result._count,
      });
    }

    return monthlyData;
  }

  /**
   * Get recent sessions with earnings for display
   */
  async getRecentSessions(tutorId, limit = 10) {
    const payouts = await prisma.tutorPayout.findMany({
      where: { tutorId: Number(tutorId) },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        lesson: {
          select: {
            id: true,
            subject: true,
            startAt: true,
            endAt: true,
            deliveryMode: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return payouts.map(p => ({
      id: p.id,
      date: p.lesson?.startAt?.toISOString().split('T')[0] || p.createdAt.toISOString().split('T')[0],
      student: p.lesson?.student ? `${p.lesson.student.firstName} ${p.lesson.student.lastName}` : 'Unknown',
      subject: p.lesson?.subject || 'N/A',
      duration: p.lesson ? this.calculateDuration(p.lesson.startAt, p.lesson.endAt) : 'N/A',
      rate: `$${parseFloat(p.grossAmount).toFixed(2)}`,
      earnings: `$${parseFloat(p.netPayout).toFixed(2)}`,
      status: p.status === 'paid' ? 'Paid' : p.status === 'confirmed' ? 'Confirmed' : 'Pending',
    }));
  }

  calculateDuration(startAt, endAt) {
    if (!startAt || !endAt) return 'N/A';
    const durationMs = new Date(endAt) - new Date(startAt);
    const hours = durationMs / (1000 * 60 * 60);
    return `${hours.toFixed(1)}h`;
  }

  /**
   * Update payout status
   */
  async updateStatus(id, status) {
    const updateData = { status };
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }
    return prisma.tutorPayout.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }
}

module.exports = new TutorPayoutModel();
