const {
  userModel,
  tutorApplicationModel,
  tutorProfileModel,
  studentProfileModel,
  setupTokenModel,
} = require("../models");
const authService = require("../services/authService");
const emailService = require("../services/emailService");
const { generateUniqueUsername } = require("../services/usernameService");

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    // Handle both camelCase and snake_case field names
    const firstName = req.body.firstName || req.body.first_name;
    const lastName = req.body.lastName || req.body.last_name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
        fields: ["firstName", "lastName", "email", "password"],
      });
    }

    if (!authService.validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordValidation = authService.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password and create user
    const hashedPassword = await authService.hashPassword(password);
    const username = await generateUniqueUsername(email.split("@")[0]);

    const user = await userModel.create({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: role || "student",
    });

    // Create initial student profile
    await studentProfileModel.create(user.id, {
      phone_number: null,
      bio: "",
      current_school: "",
      year_level: "",
      subjects_interested: [],
      preferred_locations: [],
      learning_goals: "",
      is_profile_complete: false,
    });

    // Generate tokens
    const tokens = authService.generateTokens(user);

    // Return response without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "Student registered successfully",
      user: userWithoutPassword,
      tokens,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    // Handle both email and username fields
    const email = req.body.email || req.body.username;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email (since both email and username can be used as login)
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If the tutor hasn't activated (no password yet), short-circuit
    if (user.role === "tutor" && !user.password) {
      return res.status(403).json({
        error: "Account not activated",
        message: "Please use the setup link from your email to set a password.",
      });
    }

    // Tutors must be active before login
    if (user.role === "tutor" && user.status !== "active") {
      return res.status(403).json({
        error: "Account not activated",
        message:
          "Please use the setup link from your email to activate your account.",
      });
    }

    // Check password
    const isValidPassword = await authService.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens and return user (without password)
    const tokens = authService.generateTokens(user);
    const { password: _omit, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      tokens,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Submit Tutor Application
exports.submitTutorApplication = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const {
      fullName,
      phone,
      email,
      currentStudy,
      year12State,
      year12CompletionYear,
      currentState,
      atar,
      canCommit3Hours,
      canCommit1Year,
      canTutorMostWeeks,
      canTutorGroups,
      subjectsToTutor,
      hasWorkingWithChildrenCheck,
      motivation,
    } = req.body || {};

    // Basic validation
    if (!fullName || !email || !phone || !atar || !motivation) {
      return res.status(400).json({
        error: "Required fields missing",
        required: ["fullName", "email", "phone", "atar", "motivation"],
      });
    }

    if (!authService.validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check for duplicate application
    const existingUser = await userModel.findByEmail(email);
    if (existingUser && existingUser.role === "tutor") {
      return res
        .status(400)
        .json({ error: "Application already exists for this email" });
    }

    // ATAR validation
    const atarNumber = parseFloat(atar);
    if (isNaN(atarNumber) || atarNumber < 0 || atarNumber > 99.95) {
      return res
        .status(400)
        .json({ error: "ATAR must be between 0 and 99.95" });
    }

    // Handle file uploads
    let videoSubmissionPath = null;
    let resumePath = null;

    if (req.files) {
      if (req.files.videoSubmission && req.files.videoSubmission[0]) {
        videoSubmissionPath = req.files.videoSubmission[0].path;
      }
      if (req.files.resume && req.files.resume[0]) {
        resumePath = req.files.resume[0].path;
      }
    }

    // Create application
    const applicationData = {
      fullName,
      phone,
      email,
      currentStudy,
      year12State,
      year12CompletionYear: parseInt(year12CompletionYear),
      currentState,
      atar: atarNumber,
      canCommit3Hours: canCommit3Hours === "yes",
      canCommit1Year: canCommit1Year === "yes",
      canTutorMostWeeks: canTutorMostWeeks === "yes",
      canTutorGroups: canTutorGroups === "yes",
      subjectsToTutor,
      hasWorkingWithChildrenCheck: hasWorkingWithChildrenCheck === "yes",
      motivation,
      files: {
        videoSubmission: videoSubmissionPath,
        resume: resumePath,
      },
    };

    const applicationId = authService.generateApplicationId();
    const application = await tutorApplicationModel.create({
      applicationId,
      ...applicationData,
    });

    // Create user account (without password - will be set during password setup)
    const username = await generateUniqueUsername(email.split("@")[0]);
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    const user = await userModel.create({
      firstName,
      lastName,
      email,
      username,
      password: "", // Empty password - will be set later
      role: "tutor",
      status: "pending", // Pending until password is set
    });

    // Link application to user
    await tutorApplicationModel.update(application.id, {
      userId: user.id,
    });

    // Send confirmation email to applicant
    try {
      await emailService.sendApplicationConfirmation(email, application);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Send notification email to admin
    try {
      await emailService.sendAdminNotification(application);
    } catch (emailError) {
      console.error("Failed to send admin notification:", emailError);
    }

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId: application.applicationId,
      status: application.status,
    });
  } catch (error) {
    console.error("Application submission error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve Tutor Application (Admin endpoint)
exports.approveTutorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const applicationId = parseInt(id);

    const application = await tutorApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        error: "Application already processed",
        currentStatus: application.status,
      });
    }

    // Generate setup token
    const setupToken = authService.generateSetupToken();
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7); // 7 days expiry

    // Update application status
    const updatedApplication = await tutorApplicationModel.update(
      applicationId,
      {
        status: "approved",
        approvedAt: new Date(),
        setupToken,
        setupTokenExpiry: tokenExpiry,
      }
    );

    // await store setup token
    await setupTokenModel.create({
      token: setupToken,
      applicationId: applicationId,
      email: application.email,
      expiresAt: tokenExpiry,
    });

    // Send approval email
    try {
      await emailService.sendApprovalNotification(
        application.email,
        application,
        setupToken
      );
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    res.json({
      message: "Application approved successfully",
      applicationId: updatedApplication.applicationId,
      status: updatedApplication.status,
      setupTokenGenerated: true,
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify Password Setup Token
exports.verifyPasswordSetupToken = async (req, res) => {
  try {
    const { token } = req.params;

    const tokenData = await setupTokenModel.findByToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expiresAt)) {
      await setupTokenModel.delete(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const application = await tutorApplicationModel.findById(
      tokenData.applicationId
    );
    if (!application) {
      return res.status(400).json({ error: "Application not found" });
    }

    res.json({
      valid: true,
      email: tokenData.email,
      tutorName: application.fullName,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Set Password (Complete Setup)
exports.setupTutorPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password and confirmation are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const passwordValidation = authService.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Verify token
    const tokenData = await setupTokenModel.findByToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date() > new Date(tokenData.expiresAt)) {
      await setupTokenModel.delete(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const application = await tutorApplicationModel.findById(
      tokenData.applicationId
    );
    if (!application) {
      return res.status(400).json({ error: "Application not found" });
    }

    // Get existing user (should already exist from application submission)
    const user = await userModel.findByEmail(application.email);
    if (!user) {
      return res.status(400).json({
        error: "User account not found. Please contact support.",
      });
    }

    // Check if password is already set
    if (user.password && user.password !== "") {
      return res.status(400).json({
        error:
          "Password already set for this account. Please try logging in instead.",
      });
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Update user with password
    await userModel.update(user.id, {
      password: hashedPassword,
      status: "active",
    });

    // Update application status
    await tutorApplicationModel.update(application.id, {
      status: "onboarded",
      approvedAt: new Date(),
      userId: user.id,
    });

    // Create initial tutor profile with all required fields
    await tutorProfileModel.create(user.id, {
      phone_number: application.phone,
      bio: "",
      hourly_rate: 45.0,
      university: "",
      current_studies: [],
      subjects: [],
      subjects_selected: [],
      locations: [],
      preferred_locations: [],
      schools_attended: [],
      is_profile_complete: false,
      documents_uploaded: false,
      is_live: false,
      tier: "gold",
      rating: 0.0,
      atar: application.atar || 0.0,
      approved_at: new Date(),
    });

    // Delete setup token
    await setupTokenModel.delete(token);

    // Generate login tokens
    const tokens = authService.generateTokens(user);

    // Return response without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Password setup completed successfully",
      user: userWithoutPassword,
      tokens,
    });
  } catch (error) {
    console.error("Password setup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userInfo = authService.getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await userModel.findById(userInfo.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check Auth Status
exports.checkAuthStatus = async (req, res) => {
  try {
    const userInfo = authService.getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await userModel.findById(userInfo.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      authenticated: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Create Admin User (Development endpoint)
exports.createAdmin = async (req, res) => {
  try {
    const adminEmail = "admin@striveacademy.com";
    const adminPassword = "admin123"; // Change this in production!

    // Check if admin already exists
    const existingAdmin = await userModel.findByEmail(adminEmail);
    if (existingAdmin) {
      return res.json({
        message: "Admin user already exists",
        email: adminEmail,
        note: "You can log in with this email and password: admin123",
      });
    }

    // Hash password and create admin user
    const hashedPassword = await authService.hashPassword(adminPassword);
    const { generateUniqueUsername } = require("../services/usernameService");
    const username = await generateUniqueUsername("admin");

// Inside createAdmin controller
try {
  const admin = await userModel.create({
    firstName: "Admin",
    lastName: "User",
    email: adminEmail,
    username,
    password: hashedPassword,
    role: "admin",
    status: "active",
  });

  res.json({
    message: "Admin user created successfully",
    email: adminEmail,
    password: adminPassword,
    adminId: admin.id,
  });
} catch (err) {
  console.error("Full DB error during admin creation:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message || "No additional info",
  });
}


    res.json({
      message: "Admin user created successfully",
      email: adminEmail,
      password: adminPassword,
      note: "Save these credentials and change the password after first login",
      adminId: admin.id,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Application Stats (Debug endpoint)
exports.getStats = async (req, res) => {
  try {
    const [usersCount, applicationsCount, profilesCount, setupTokensCount] =
      await Promise.all([
        userModel.count(),
        tutorApplicationModel.count(),
        tutorProfileModel.count(),
        setupTokenModel.count(),
      ]);

    const pendingApplications = await tutorApplicationModel.findPending();
    const allApplications = await tutorApplicationModel.findAll();

    res.json({
      usersCount,
      applicationsCount,
      profilesCount,
      setupTokensCount,
      pendingApplications: pendingApplications.length,
      applications: allApplications.map((app) => ({
        id: app.id,
        applicationId: app.applicationId,
        fullName: app.fullName,
        email: app.email,
        status: app.status,
        createdAt: app.createdAt,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // The authenticateToken middleware already validated the token
    // We can optionally blacklist the token here if needed
    // For now, we'll just return success since the client will clear tokens

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
