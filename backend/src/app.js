const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Tutor Verification Flow
const tutorRoutes = require("./routes/tutor");
app.use("/api/auth/tutor", tutorRoutes);

// Login route (shared between tutors and students)
const tutorController = require("./controllers/tutorController");
app.post("/api/auth/login", tutorController.login);

// Profile route (for dashboard)
app.get("/api/auth/profile", tutorController.getCurrentUserProfile);

// Auth check route
app.get("/api/auth/check-auth", (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: 1,
      role: "tutor",
      status: "active",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Debug stats endpoint
app.get("/api/auth/stats", tutorController.getStats);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
