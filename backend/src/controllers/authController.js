const store = require("../models/inMemoryStore");
const authService = require("../services/authService");
const emailService = require("../services/emailService");

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

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
    const existingUser = store.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password and create user
    const hashedPassword = await authService.hashPassword(password);
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

    const user = store.createUser({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: role || "student",
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = store.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await authService.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // For tutors, check if they're active
    if (user.role === "tutor" && user.status !== "active") {
      return res.status(403).json({
        error: "Account not activated",
        message: "Please complete your account setup or wait for approval",
      });
    }

    // Generate tokens
    const tokens = authService.generateTokens(user);

    // Return response without password
    const { password: _, ...userWithoutPassword } = user;

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
    } = req.body;

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
    const existingUser = store.getUserByEmail(email);
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
    };

    const application = store.createTutorApplication(applicationData);

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

    const application = store.getTutorApplicationById(applicationId);
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
    const updatedApplication = store.updateTutorApplication(applicationId, {
      status: "approved",
      approvedAt: new Date(),
      setupToken,
      setupTokenExpiry: tokenExpiry,
    });

    // Store setup token
    store.createSetupToken({
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

    const tokenData = store.getSetupToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expiresAt)) {
      store.deleteSetupToken(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const application = store.getTutorApplicationById(tokenData.applicationId);
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
    const tokenData = store.getSetupToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date() > new Date(tokenData.expiresAt)) {
      store.deleteSetupToken(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const application = store.getTutorApplicationById(tokenData.applicationId);
    if (!application) {
      return res.status(400).json({ error: "Application not found" });
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create tutor user account
    const username =
      application.email.split("@")[0] + Math.floor(Math.random() * 1000);
    const [firstName, ...lastNameParts] = application.fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    const user = store.createUser({
      firstName,
      lastName,
      email: application.email,
      username,
      password: hashedPassword,
      role: "tutor",
      status: "active",
      applicationId: application.id,
    });

    // Update application status
    store.updateTutorApplication(application.id, {
      status: "onboarded",
      setupCompletedAt: new Date(),
      userId: user.id,
    });

    // Create initial tutor profile
    store.createTutorProfile(user.id, {
      applicationId: application.id,
      phoneNumber: application.phone,
      bio: "",
      subjects: [],
      isProfileComplete: false,
      documentsUploaded: false,
      isLive: false,
      tier: "gold",
    });

    // Delete setup token
    store.deleteSetupToken(token);

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

    const user = store.getUserById(userInfo.userId);
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

    const user = store.getUserById(userInfo.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      authenticated: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Get Application Stats (Debug endpoint)
exports.getStats = async (req, res) => {
  try {
    const stats = store.getStats();
    const pendingApplications = store.getAllPendingApplications();

    res.json({
      ...stats,
      pendingApplications: pendingApplications.length,
      applications: Array.from(store.tutorApplications.values()).map((app) => ({
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
