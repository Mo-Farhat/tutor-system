// Validation middleware for tutor profile

const validateProfileUpdate = (req, res, next) => {
  console.log(
    "🔍 Validating profile update request:",
    JSON.stringify(req.body, null, 2)
  );

  const {
    bio,
    hourly_rate,
    university,
    phone_number,
    locations,
    subjects,
    preferred_locations,
    subjects_selected,
    current_studies,
    schools_attended,
  } = req.body;
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

  // Validate locations (legacy field)
  if (locations && !Array.isArray(locations)) {
    errors.push("Locations must be an array");
  }

  // Validate subjects (legacy field)
  if (subjects && !Array.isArray(subjects)) {
    errors.push("Subjects must be an array");
  }

  // Validate preferred_locations (current field)
  if (preferred_locations && !Array.isArray(preferred_locations)) {
    errors.push("Preferred locations must be an array");
  }

  // Validate subjects_selected (current field)
  if (subjects_selected && !Array.isArray(subjects_selected)) {
    errors.push("Selected subjects must be an array");
  }

  // Validate current_studies
  if (current_studies && !Array.isArray(current_studies)) {
    errors.push("Current studies must be an array");
  }

  // Validate schools_attended
  if (schools_attended && !Array.isArray(schools_attended)) {
    errors.push("Schools attended must be an array");
  }

  // Validate subjects_selected structure if provided
  if (subjects_selected && Array.isArray(subjects_selected)) {
    subjects_selected.forEach((subject, index) => {
      if (!subject.year_level || !subject.curriculum || !subject.subject) {
        errors.push(
          `Subject entry ${
            index + 1
          } must have year_level, curriculum, and subject`
        );
      }
    });
  }

  if (errors.length > 0) {
    console.log("❌ Validation errors found:", errors);
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  console.log("✅ Profile validation passed");
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

const validatePaymentInfo = (req, res, next) => {
  const {
    abnNumber,
    paymentMethod,
    accountName,
    bsb,
    accountNumber,
    paypalEmail,
  } = req.body;
  console.log("🔍 Payment validation - received data:", {
    abnNumber,
    paymentMethod,
    accountName,
    bsb,
    accountNumber,
    paypalEmail,
  });
  const errors = [];

  // ABN: 11 digits (basic check) - make it optional for now
  if (
    abnNumber &&
    abnNumber.trim() !== "" &&
    !/^\d{11}$/.test(String(abnNumber))
  ) {
    errors.push("ABN must be exactly 11 digits");
  }

  // Payment method
  if (paymentMethod && !["bank_transfer", "paypal"].includes(paymentMethod)) {
    errors.push("paymentMethod must be 'bank_transfer' or 'paypal'");
  }

  if (paymentMethod === "bank_transfer") {
    if (!accountName || accountName.trim() === "")
      errors.push("Account name is required for bank transfer");
    if (bsb && bsb.trim() !== "" && !/^\d{3}-?\d{3}$/.test(bsb))
      errors.push("BSB must be in format 000-000 or 000000");
    if (
      accountNumber &&
      accountNumber.trim() !== "" &&
      !/^\d{4,20}$/.test(String(accountNumber))
    )
      errors.push("Account number must be 4-20 digits");
  }

  if (paymentMethod === "paypal") {
    if (!paypalEmail || paypalEmail.trim() === "")
      errors.push("PayPal email is required for PayPal");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail))
      errors.push("PayPal email format is invalid");
  }

  if (errors.length) {
    console.log("❌ Payment validation errors:", errors);
    return res.status(400).json({
      success: false,
      error: "Payment validation failed",
      details: errors,
    });
  }
  console.log("✅ Payment validation passed");
  next();
};

module.exports = {
  validateProfileUpdate,
  validatePasswordChange,
  validatePaymentInfo,
};
