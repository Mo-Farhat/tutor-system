// Validation middleware for tutor profile

const validateProfileUpdate = (req, res, next) => {
  const { bio, hourly_rate, university, phone_number, locations, subjects } =
    req.body;
  const errors = [];

  // Validate bio
  if (bio && bio.length < 10) {
    errors.push("Bio must be at least 10 characters long");
  }

  // Validate hourly rate
  if (hourly_rate !== undefined) {
    const rate = parseFloat(hourly_rate);
    if (isNaN(rate) || rate < 0 || rate > 1000) {
      errors.push("Hourly rate must be between 0 and 1000");
    }
  }

  // Validate phone number
  if (phone_number && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone_number)) {
    errors.push("Invalid phone number format");
  }

  // Validate university
  if (university && university.length < 2) {
    errors.push("University name must be at least 2 characters");
  }

  // Validate locations
  if (locations && !Array.isArray(locations)) {
    errors.push("Locations must be an array");
  }

  // Validate subjects
  if (subjects && !Array.isArray(subjects)) {
    errors.push("Subjects must be an array");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push("Current password is required");
  }

  if (!newPassword) {
    errors.push("New password is required");
  } else if (newPassword.length < 8) {
    errors.push("New password must be at least 8 characters long");
  }

  if (newPassword !== confirmPassword) {
    errors.push("New password and confirmation do not match");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Password validation failed",
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateProfileUpdate,
  validatePasswordChange,
};
