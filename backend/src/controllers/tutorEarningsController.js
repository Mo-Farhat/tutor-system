const { tutorPayoutModel } = require("../models");

/**
 * Get tutor earnings summary and recent sessions
 * GET /auth/tutor/earnings
 */
exports.getEarnings = async (req, res) => {
  try {
    const tutorId = req.user.id;

    // Get earnings summary
    const summary = await tutorPayoutModel.getEarningsSummary(tutorId);

    // Get recent sessions with earnings
    const recentSessions = await tutorPayoutModel.getRecentSessions(tutorId, 10);

    res.json({
      success: true,
      data: {
        // Summary stats
        totalEarnings: summary.totalEarnings,
        monthlyEarnings: summary.thisMonth,
        sessionsThisMonth: summary.sessionsThisMonth,
        hourlyRate: summary.hourlyRate,
        pendingAmount: summary.pendingAmount,
        pendingSessions: summary.pendingSessions,
        
        // For chart or comparison
        lastMonthEarnings: summary.lastMonth,
        
        // Recent sessions table
        recentSessions: recentSessions,
      },
    });
  } catch (e) {
    console.error("tutorEarnings.getEarnings", e);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Get all payouts for a tutor
 * GET /auth/tutor/payouts
 */
exports.getPayouts = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { status, limit } = req.query;

    const payouts = await tutorPayoutModel.findByTutor(tutorId, {
      status,
      limit: limit ? parseInt(limit) : 50,
    });

    const formatted = payouts.map(p => ({
      id: p.id,
      lessonId: p.lessonId,
      date: p.createdAt,
      student: p.lesson?.student
        ? `${p.lesson.student.firstName} ${p.lesson.student.lastName}`
        : "Unknown",
      subject: p.lesson?.subject || "N/A",
      grossAmount: parseFloat(p.grossAmount),
      striveCut: parseFloat(p.striveCut),
      netPayout: parseFloat(p.netPayout),
      travelFee: p.travelFee ? parseFloat(p.travelFee) : null,
      status: p.status,
      paidAt: p.paidAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (e) {
    console.error("tutorEarnings.getPayouts", e);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
