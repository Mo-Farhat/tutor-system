const {
  userModel,
  tutorApplicationModel,
  tutorProfileModel,
  setupTokenModel,
} = require("../models");
const authService = require("../services/authService");
const emailService = require("../services/emailService");

// Tutor Application Submission - POST /api/auth/tutor/apply
exports.apply = async (req, res) => {
  try {
    // Handle both JSON and FormData requests
    const isFormData = req.headers["content-type"]?.includes(
      "multipart/form-data"
    );

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

    // Handle file uploads if present
    const files = req.files || {};
    const videoSubmission = files.videoSubmission?.[0] || null;
    const resume = files.resume?.[0] || null;

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

    // Create application data
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
      // Add file information
      files: {
        videoSubmission: videoSubmission
          ? {
              filename: videoSubmission.filename,
              originalname: videoSubmission.originalname,
              size: videoSubmission.size,
              path: videoSubmission.path,
            }
          : null,
        resume: resume
          ? {
              filename: resume.filename,
              originalname: resume.originalname,
              size: resume.size,
              path: resume.path,
            }
          : null,
      },
    };

    const application = await tutorApplicationModel.create(applicationData);

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

// Tutor Approval - POST /api/auth/tutor/approve/:id
exports.approve = async (req, res) => {
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
      setupToken: setupToken, // Include in response for testing
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify Password Setup Token - GET /api/auth/tutor/setup-password/:token
exports.verifySetupToken = async (req, res) => {
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

// Set Password - POST /api/auth/tutor/setup-password/:token
exports.setPassword = async (req, res) => {
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

// Tutor Login - POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await userModel.findByEmail(email);
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

// Get Current User Profile - GET /api/auth/profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    // Extract user info from JWT token (requires auth middleware)
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await userModel.findById(req.user.id);
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
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Tutor Profile - GET /api/auth/tutor/profile
exports.getTutorProfile = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    console.log("Fetching tutor profile for username:", username);

    const user = await userModel.findByUsername(username);
    if (!user || user.role !== "tutor") {
      return res.status(404).json({
        success: false,
        error: "Tutor profile not found",
      });
    }

    const tutorProfile = await tutorProfileModel.findByUserId(user.id);
    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        error: "Tutor profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          username: user.username,
        },
        ...tutorProfile,
      },
    });
  } catch (error) {
    console.error("Tutor profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Application Stats - GET /api/auth/stats
exports.getStats = async (req, res) => {
  try {
    const [users, applications, profiles, setupTokens] = await Promise.all([
      userModel.count(),
      tutorApplicationModel.count(),
      tutorProfileModel.count(),
      setupTokenModel.count(),
    ]);

    const pendingApplications = await tutorApplicationModel.findPending();
    const allApplications = await tutorApplicationModel.findAll();

    res.json({
      users,
      applications,
      profiles,
      setupTokens,
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
