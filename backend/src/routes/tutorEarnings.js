const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tutorEarningsController");
const { authenticateToken, requireTutor } = require("../middleware/auth");

// GET /auth/tutor/earnings - Get earnings summary
router.get("/auth/tutor/earnings", authenticateToken, requireTutor, ctrl.getEarnings);

// GET /auth/tutor/payouts - Get all payouts
router.get("/auth/tutor/payouts", authenticateToken, requireTutor, ctrl.getPayouts);

// Stripe Connect Onboarding
router.post("/auth/tutor/payouts/setup", authenticateToken, requireTutor, ctrl.setupStripeConnect);
router.get("/auth/tutor/payouts/stripe-status", authenticateToken, requireTutor, ctrl.checkStripeStatus);

// Diagnostic endpoint (temporary - remove after debugging)
router.get("/auth/tutor/payouts/debug", authenticateToken, requireTutor, async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    
    // Check TutorProfile columns
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
      select: {
        userId: true,
        stripeConnectAccountId: true,
        stripeOnboardingComplete: true
      }
    });
    
    res.json({
      success: true,
      diagnostics: {
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
          STRIPE_KEY_EXISTS: !!process.env.STRIPE_SECRET_KEY,
          STRIPE_KEY_TYPE: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 'TEST/MISSING',
          FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET (using localhost:3000)',
          DATABASE_URL_EXISTS: !!process.env.DATABASE_URL
        },
        tutorProfile: profile ? {
          userId: profile.userId,
          hasStripeConnectField: 'stripeConnectAccountId' in profile,
          stripeConnectAccountId: profile.stripeConnectAccountId || 'NULL',
          stripeOnboardingComplete: profile.stripeOnboardingComplete
        } : 'PROFILE_NOT_FOUND'
      }
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
      errorName: e.name,
      isPrismaError: e.name?.includes('Prisma') || e.message?.includes('prisma')
    });
  }
});

module.exports = router;
