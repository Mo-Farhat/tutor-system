const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - import
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const userRoutes = require("./routes/users");
const applicationRoutes = require("./routes/applications");    // <- plural
const profilesAdminRoutes = require("./routes/profilesAdmin"); // <- plural
const tokenRoutes = require("./routes/tokens");

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
