const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
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

const adminPackagesRoutes = require("./routes/adminPackages");

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
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

app.use("/api", adminPackagesRoutes);


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
