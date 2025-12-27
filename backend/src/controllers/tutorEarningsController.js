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
    console.log(`[Stripe Connect] Starting setup for tutor ID: ${tutorId}`);
    
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const stripeService = require("../services/stripeService");

    // Log environment check
    console.log(`[Stripe Connect] STRIPE_SECRET_KEY present: ${!!process.env.STRIPE_SECRET_KEY}`);
    console.log(`[Stripe Connect] FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET (using localhost)'}`);

    // Get tutor profile
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
      include: { user: true }
    });

    console.log(`[Stripe Connect] Profile found: ${!!profile}, Email: ${profile?.user?.email || 'N/A'}`);

    if (!profile) {
      console.log(`[Stripe Connect] ERROR: Tutor profile not found for ID ${tutorId}`);
      return res.status(404).json({ success: false, error: "Tutor profile not found" });
    }

    let accountId = profile.stripeConnectAccountId;
    console.log(`[Stripe Connect] Existing Connect Account ID: ${accountId || 'NONE'}`);

    // Create account if not exists
    if (!accountId) {
      console.log(`[Stripe Connect] Creating new Connect account...`);
      const account = await stripeService.createConnectAccount(tutorId, profile.user.email);
      accountId = account.id;
      console.log(`[Stripe Connect] New account created: ${accountId}`);
    }

    // Create onboarding link
    // TEMPORARY HARDCODED - Stripe live mode requires HTTPS
    const baseUrl = "https://striveacademics.com.au";
    // const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    console.log(`[Stripe Connect] Creating account link with baseUrl: ${baseUrl}`);
    
    const accountLink = await stripeService.createAccountLink(
      accountId,
      `${baseUrl}/dashboard/tutor/earnings?stripe_return=true`,
      `${baseUrl}/dashboard/tutor/earnings?stripe_refresh=true`
    );
    
    console.log(`[Stripe Connect] Account link created successfully`);

    res.json({
      success: true,
      data: {
        url: accountLink.url,
        accountId: accountId
      }
    });
  } catch (e) {
    console.error("tutorEarnings.setupStripeConnect", e);
    // Return detailed error for debugging
    const errorDetails = {
      message: e.message || "Unknown error",
      type: e.type || e.name || "UnknownError",
      code: e.code || null,
      stripeError: e.raw?.message || null
    };
    console.error("Stripe Connect Error Details:", errorDetails);
    res.status(500).json({ 
      success: false, 
      error: "Failed to setup Stripe Connect",
      details: process.env.NODE_ENV !== 'production' ? errorDetails : errorDetails.message
    });
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

