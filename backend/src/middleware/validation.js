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

const validateParentContact = (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    relation,
    contactPreference,
    isPrimary,
    consentToContact,
  } = req.body;

  const errors = [];
  if (!firstName || !lastName) errors.push("firstName and lastName are required");

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("Invalid email");

  if (phone && !/^[\+]?[0-9\s\-\(\)]{7,}$/.test(phone))
    errors.push("Invalid phone number");

  const REL = ["mother", "father", "guardian", "other"];
  if (relation && !REL.includes(relation)) errors.push(`relation must be one of ${REL.join(", ")}`);

  const PREF = ["email", "phone", "sms", "any"];
  if (contactPreference && !PREF.includes(contactPreference))
    errors.push(`contactPreference must be one of ${PREF.join(", ")}`);

  if (typeof isPrimary !== "undefined" && typeof isPrimary !== "boolean")
    errors.push("isPrimary must be boolean");

  if (typeof consentToContact !== "undefined" && typeof consentToContact !== "boolean")
    errors.push("consentToContact must be boolean");

  if (errors.length) {
    return res.status(400).json({ success: false, error: "Validation failed", details: errors });
  }
  next();
};

// Accepts dollars in the API and normalizes to cents for the DB

function toNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : NaN;
}

function toInt(n) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.round(v) : NaN;
}

function toCents(n) {
  const v = toNum(n);
  return Number.isFinite(v) ? Math.round(v * 100) : NaN;
}

function normalizeDiscountType(dt) {
  if (!dt) return null;
  if (dt === "percentage") return "percent";
  if (["fixed", "percent"].includes(dt)) return dt;
  return "invalid";
}

// -----------------------------------------------------------------------------
// ✅ MAIN FUNCTION — validatePackageTypeCreate
// -----------------------------------------------------------------------------
function validatePackageTypeCreate(req, res, next) {
  const {
    name,
    subject,
    hours,
    price,                // preferred input (dollars)
    priceDollars,         // alias
    discountType,
    discountValue,
    discountValueDollars, // alias
    discountPercent,
    description,
    validityMonths,
    eligibleTiers,
    refundable,
    autoRenew,
    isActive
  } = req.body || {};

  const errors = [];

  // basic required fields
  if (!name || typeof name !== "string" || !name.trim()) errors.push("name is required");
  if (!subject || typeof subject !== "string" || !subject.trim()) errors.push("subject is required");

  const hoursInt = toInt(hours);
  if (!Number.isInteger(hoursInt) || hoursInt <= 0) errors.push("hours must be a positive integer");

  // price in dollars
  const priceDollarInput = priceDollars ?? price;
  const priceNum = toNum(priceDollarInput);
  if (!Number.isFinite(priceNum) || priceNum < 0)
    errors.push("Price (in dollars) is required and must be a valid number like 100.05.");
  const priceCents = Number.isFinite(priceNum) ? Math.round(priceNum * 100) : NaN;

  // discount validation
  const normType = normalizeDiscountType(discountType);
  if (normType === "invalid") errors.push("discountType must be 'fixed' or 'percentage'");

  let discountValueNum = null;
  let discountValueCents = null;
  let discountPercentInt = null;

  if (normType === "fixed") {
    const dvInput = discountValueDollars ?? discountValue;
    const dvNum = toNum(dvInput);
    if (!Number.isFinite(dvNum) || dvNum < 0) {
      errors.push("discountValue (in dollars) must be a non-negative number");
    } else {
      discountValueNum = Number(dvNum.toFixed(2));
      discountValueCents = Math.round(dvNum * 100);
    }
  } else if (normType === "percent") {
    const dp = toInt(discountPercent);
    if (!Number.isInteger(dp) || dp < 0 || dp > 100) {
      errors.push("discountPercent must be an integer between 0 and 100");
    } else {
      discountPercentInt = dp;
    }
  }

  const validityMonthsInt = validityMonths != null ? toInt(validityMonths) : null;
  if (validityMonths != null && (!Number.isInteger(validityMonthsInt) || validityMonthsInt < 0)) {
    errors.push("validityMonths must be a non-negative integer");
  }

  if (eligibleTiers && !Array.isArray(eligibleTiers)) {
    errors.push("eligibleTiers must be an array of tiers");
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  // normalize to what the model expects
  req.body = {
    name: name.trim(),
    subject: subject.trim(),
    hours: hoursInt,

    priceDollars: Number(priceNum.toFixed(2)),
    priceCents,

    discountType: normType,
    discountValueDollars: discountValueNum,
    discountValueCents,
    discountPercent: discountPercentInt,

    description: typeof description === "string" ? description : null,
    validityMonths: validityMonthsInt,
    eligibleTiers: Array.isArray(eligibleTiers) ? eligibleTiers : [],
    refundable: Boolean(refundable),
    autoRenew: Boolean(autoRenew),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    status: "active",
  };

  next();
}

function validatePackageTypeUpdate(req, res, next) {
  const body = req.body || {};
  const out = {};
  const errors = [];

  // name
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) errors.push("name must be a non-empty string");
    else out.name = body.name.trim();
  }

  // subject
  if (body.subject !== undefined) {
    if (typeof body.subject !== "string" || !body.subject.trim()) errors.push("subject must be a non-empty string");
    else out.subject = body.subject.trim();
  }

  // hours
  if (body.hours !== undefined) {
    const v = toInt(body.hours);
    if (!Number.isInteger(v) || v <= 0) errors.push("hours must be a positive integer");
    else out.hours = v;
  }

  // price (dollars) -> we will pass both dollars and cents downstream
  if (body.price !== undefined || body.priceDollars !== undefined) {
    const priceNum = toNum(body.priceDollars ?? body.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      errors.push("price must be a non-negative number (in dollars)");
    } else {
      out.priceDollars = Number(priceNum.toFixed(2));
      out.priceCents = Math.round(priceNum * 100);
    }
  }

  // discountType (normalize)
  if (body.discountType !== undefined) {
    const dt = body.discountType === "percentage" ? "percent" : body.discountType;
    if (dt && !["fixed", "percent"].includes(dt)) {
      errors.push("discountType must be 'fixed' or 'percentage'");
    } else {
      out.discountType = dt || null;
    }
  }

  // discountValue (dollars for fixed)
  if (body.discountValue !== undefined || body.discountValueDollars !== undefined) {
    const dvNum = toNum(body.discountValueDollars ?? body.discountValue);
    if (!Number.isFinite(dvNum) || dvNum < 0) {
      errors.push("discountValue must be a non-negative number (in dollars)");
    } else {
      out.discountValueDollars = Number(dvNum.toFixed(2));
      out.discountValueCents = Math.round(dvNum * 100);
    }
  }

  // discountPercent (0..100)
  if (body.discountPercent !== undefined) {
    const dp = toInt(body.discountPercent);
    if (!Number.isInteger(dp) || dp < 0 || dp > 100) {
      errors.push("discountPercent must be an integer between 0 and 100");
    } else {
      out.discountPercent = dp;
    }
  }

  // description
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string")
      errors.push("description must be a string or null");
    else out.description = body.description;
  }

  // validityMonths
  if (body.validityMonths !== undefined) {
    const v = toInt(body.validityMonths);
    if (!Number.isInteger(v) || v < 0) errors.push("validityMonths must be a non-negative integer");
    else out.validityMonths = v;
  }

  // eligibleTiers
  if (body.eligibleTiers !== undefined) {
    if (!Array.isArray(body.eligibleTiers)) errors.push("eligibleTiers must be an array");
    else out.eligibleTiers = body.eligibleTiers;
  }

  if (body.refundable !== undefined) out.refundable = Boolean(body.refundable);
  if (body.autoRenew !== undefined) out.autoRenew = Boolean(body.autoRenew);
  if (body.isActive !== undefined) out.isActive = Boolean(body.isActive);
  if (body.status !== undefined) out.status = body.status;

  if (errors.length) {
    return res.status(400).json({ success: false, error: "Validation failed", details: errors });
  }

  req.body = out;
  next();
}

module.exports = {
  validateProfileUpdate,
  validatePasswordChange,
  validatePaymentInfo,
  validateParentContact,
  validatePackageTypeCreate,
  validatePackageTypeUpdate

};
