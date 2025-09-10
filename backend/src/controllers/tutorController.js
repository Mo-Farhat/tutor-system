const store = require("../models/inMemoryStore");
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
    const existingUser = await store.getUserByEmail(email);
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

    const application = await store.createTutorApplication(applicationData);

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

    const application = await store.getTutorApplicationById(applicationId);
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
    const updatedApplication = await store.updateTutorApplication(applicationId, {
      status: "approved",
      approvedAt: new Date(),
      setupToken,
      setupTokenExpiry: tokenExpiry,
    });

    // await store setup token
    await store.createSetupToken({
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

    const tokenData = await store.getSetupToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expiresAt)) {
      await store.deleteSetupToken(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const application = await store.getTutorApplicationById(tokenData.applicationId);
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
    const tokenData = await store.getSetupToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date() > new Date(tokenData.expiresAt)) {
      await store.deleteSetupToken(token);
      return res.status(400).json({ error: "Token has expired" });
    }

    const application = await store.getTutorApplicationById(tokenData.applicationId);
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

    const user = await store.createUser({
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
    await store.updateTutorApplication(application.id, {
      status: "onboarded",
      setupCompletedAt: new Date(),
      userId: user.id,
    });

    // Create initial tutor profile with all required fields
    await store.createTutorProfile(user.id, {
      applicationId: application.id,
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
      approved_at: new Date().toISOString(),
    });

    // Delete setup token
    await store.deleteSetupToken(token);

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
    const user = await store.getUserByEmail(email);
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
    // This would normally be extracted from JWT token
    // For now, return a basic profile structure
    const mockProfile = {
      id: 1,
      fullName: "Tutor User",
      email: "tutor@example.com",
      role: "tutor",
      status: "active",
      profileCompleted: false,
      subjects: [],
      experience: "",
      availability: {},
    };

    res.json(mockProfile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Tutor Profile - GET /api/auth/tutor/profile
exports.getTutorProfile = async (req, res) => {
  try {
    const { username } = req.query;
    console.log("Fetching tutor profile for username:", username);

    // Mock tutor profile data that matches frontend expectations
    const mockTutorProfile = {
      success: true,
      data: {
        user: {
          first_name: "Test",
          last_name: "Tutor",
          email: "tutor@example.com",
          username: username || "testtutor",
        },
        phone_number: "+61 400 000 000",
        bio: "I'm a passionate tutor ready to help students succeed!",
        hourly_rate: "45",
        university: "University of Sydney",
        preferred_locations: ["Sydney", "Online"],
        subjects_selected: [
          {
            year_level: "Year 12",
            curriculum: "NSW HSC",
            subject: "Mathematics Advanced",
          },
        ],
        schools_attended: ["Sydney High School"],
        current_studies: ["Bachelor of Mathematics"],
        completion_status: {
          profile_completed: 20,
          total_steps: 5,
          completed_steps: 1,
        },
      },
    };

    res.json(mockTutorProfile);
  } catch (error) {
    console.error("Tutor profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Application Stats - GET /api/auth/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await store.getStats();
    const pendingApplications = await store.getAllPendingApplications();

    res.json({
      ...stats,
      pendingApplications: pendingApplications.length,
      applications: Array.from(await store.tutorApplications.values()).map((app) => ({
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
