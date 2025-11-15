const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// CORS Debug middleware (development only)
if (process.env.NODE_ENV === 'development' || process.env.DEBUG_CORS === 'true') {
  const corsDebugMiddleware = require('./middleware/corsDebug');
  app.use(corsDebugMiddleware);
}

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://striveacademics.com.au',
      'https://www.striveacademics.com.au',
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove any undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional security headers
app.use((req, res, next) => {
  // Set security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Access-Token');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  
  next();
});

// Stripe webhooks need raw body - must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - import
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const userRoutes = require("./routes/users");
const applicationRoutes = require("./routes/applications");
const profilesAdminRoutes = require("./routes/profilesAdmin");
const tokenRoutes = require("./routes/tokens");
const studentTutorRoutes = require("./routes/studentTutor");
const parentRoutes = require("./routes/parents");

const studentLessonsRoutes = require("./routes/studentLessons");
const studentBillingRoutes = require("./routes/studentBilling");
const studentReportsRoutes = require("./routes/studentReports");
const studentAchievementsRoutes = require("./routes/studentAchievements");
const studentGoalsRoutes = require("./routes/studentGoals");
const studentPaymentMethodsRoutes = require("./routes/studentPaymentMethods");
const studentSupportRoutes = require("./routes/studentSupport");
const tutorLessonsRoutes = require("./routes/tutorLessons");
const tutorReportsRoutes = require("./routes/tutorReports");

const tutorsAdminRoutes = require("./routes/tutorsAdmin");

const tutorChangeRequestsRoutes = require("./routes/tutorChangeRequests");
const stripeWebhooksRoutes = require("./routes/stripeWebhooks");

const adminPackagesRoutes = require("./routes/adminPackages");
const adminFinanceRoutes = require("./routes/adminFinance");

const tutorRequestRoutes = require("./routes/tutorRequests");

const adminCalendarRoutes = require("./routes/adminCalendar");
const lessonPipelineRoutes = require("./routes/lessonPipeline");
// Health check with CORS info
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin',
    cors: {
      origin_allowed: true,
      credentials_enabled: true
    }
  });
});

/* ---------- MOUNT ALL ROUTES HERE (BEFORE 404 & ERROR) ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/auth", profileRoutes);
app.use("/api", userRoutes);
app.use("/api", applicationRoutes);
app.use("/api", profilesAdminRoutes);
app.use("/api", tokenRoutes);
app.use("/api", studentTutorRoutes);
app.use("/api", parentRoutes);

app.use("/api", studentLessonsRoutes);
app.use("/api", studentBillingRoutes);
app.use("/api", studentReportsRoutes);
app.use("/api", studentAchievementsRoutes);
app.use("/api", studentGoalsRoutes);
app.use("/api", studentPaymentMethodsRoutes);
app.use("/api", studentSupportRoutes);
app.use("/api", tutorLessonsRoutes);
app.use("/api", tutorReportsRoutes);

app.use("/api", tutorsAdminRoutes);

app.use("/api", tutorChangeRequestsRoutes);

// Stripe webhooks (must be before express.json middleware for raw body)
app.use("/api", stripeWebhooksRoutes);

app.use("/api", adminCalendarRoutes);

app.use("/api", adminPackagesRoutes);
app.use("/api", adminFinanceRoutes);

app.use("/api", tutorRequestRoutes);

app.use("/api", lessonPipelineRoutes);


/* ---------------------------------------------------------------- */

// 404 handler (for unmatched routes)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware (last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong!",
  });
});

module.exports = app;
