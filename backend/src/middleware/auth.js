const jwt = require("jsonwebtoken");
const { userModel } = require("../models");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  if (BYPASS_AUTH) {
    // fake admin user in dev
    req.user = { id: 0, email: "dev@local", username: "dev", role: "admin" };
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, error: "Access token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, error: "User not found" });
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
};

// Require tutor role
const requireTutor = (req, res, next) => {
  if (BYPASS_AUTH) return next();
  if (req.user.role !== "tutor") {
    return res.status(403).json({ success: false, error: "Tutor access required" });
  }
  next();
};

// Require specific role (e.g., admin)
const requireRole = (role) => (req, res, next) => {
  if (BYPASS_AUTH) return next();
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ success: false, error: `${role} access required` });
  }
  next();
};

// Only if you use this elsewhere:
const requireOwnProfile = (req, res, next) => {
  if (BYPASS_AUTH) return next();
  const requestedUsername = req.params.username || req.query.username;
  if (requestedUsername && requestedUsername !== req.user.username) {
    return res.status(403).json({ success: false, error: "Can only access your own profile" });
  }
  next();
};

module.exports = { authenticateToken, requireTutor, requireOwnProfile, requireRole };
