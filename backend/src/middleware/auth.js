const jwt = require("jsonwebtoken");
const store = require("../models/inMemoryStore");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

// Middleware to check if user is a tutor
const requireTutor = (req, res, next) => {
  if (req.user.role !== "tutor") {
    return res.status(403).json({
      success: false,
      error: "Tutor access required",
    });
  }
  next();
};

// Middleware to check if user can access their own profile
const requireOwnProfile = (req, res, next) => {
  const requestedUsername = req.params.username || req.query.username;

  if (requestedUsername && requestedUsername !== req.user.username) {
    return res.status(403).json({
      success: false,
      error: "Can only access your own profile",
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireTutor,
  requireOwnProfile,
};
