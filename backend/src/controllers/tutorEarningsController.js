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

    // Get monthly earnings for chart
    const monthlyEarnings = await tutorPayoutModel.getMonthlyEarnings(tutorId, 6);

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
        
        // Monthly chart data
        chartData: monthlyEarnings,
        
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

/**
 * Setup Stripe Connect account and get onboarding link
 * POST /auth/tutor/payouts/setup
 */
exports.setupStripeConnect = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const stripeService = require("../services/stripeService");

    // Get tutor profile
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
      include: { user: true }
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: "Tutor profile not found" });
    }

    let accountId = profile.stripeConnectAccountId;

    // Create account if not exists
    if (!accountId) {
      const account = await stripeService.createConnectAccount(tutorId, profile.user.email);
      accountId = account.id;
    }

    // Create onboarding link
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const accountLink = await stripeService.createAccountLink(
      accountId,
      `${baseUrl}/dashboard/tutor/earnings?stripe_return=true`,
      `${baseUrl}/dashboard/tutor/earnings?stripe_refresh=true`
    );

    res.json({
      success: true,
      data: {
        url: accountLink.url,
        accountId: accountId
      }
    });
  } catch (e) {
    console.error("tutorEarnings.setupStripeConnect", e);
    res.status(500).json({ success: false, error: "Failed to setup Stripe Connect" });
  }
};

/**
 * Check Stripe Connect onboarding status
 * GET /auth/tutor/payouts/stripe-status
 */
exports.checkStripeStatus = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const stripeService = require("../services/stripeService");

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId }
    });

    if (!profile || !profile.stripeConnectAccountId) {
      return res.json({
        success: true,
        data: {
          onboardingComplete: false,
          hasAccount: false
        }
      });
    }

    // Retrieve account from Stripe
    const account = await stripeService.getAccount(profile.stripeConnectAccountId);
    const isComplete = account.details_submitted && account.charges_enabled;

    // Update database if changed
    if (isComplete !== profile.stripeOnboardingComplete) {
      await prisma.tutorProfile.update({
        where: { userId: tutorId },
        data: { stripeOnboardingComplete: isComplete }
      });
    }

    res.json({
      success: true,
      data: {
        onboardingComplete: isComplete,
        hasAccount: true,
        accountId: profile.stripeConnectAccountId,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled
      }
    });
  } catch (e) {
    console.error("tutorEarnings.checkStripeStatus", e);
    res.status(500).json({ success: false, error: "Failed to check Stripe status" });
  }
};

