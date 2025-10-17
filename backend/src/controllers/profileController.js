const profileService = require("../services/profileService");
const { tutorProfileModel, tutorDocumentModel } = require("../models");
const { studentProfileModel } = require("../models");

// Get tutor profile
exports.getTutorProfile = async (req, res) => {
  try {
    const username = req.query?.username;

    // If no username provided, use authenticated user (requires auth middleware)
    if (!username && req.user) {
      const result = await profileService.getTutorProfileByUserId(req.user.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.json(result);
    }

    // If username provided, use username lookup (public endpoint)
    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    const result = await profileService.getTutorProfile(username);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update tutor profile
exports.updateTutorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    console.log("🔍 Update tutor profile request:", {
      userId,
      updateData: JSON.stringify(updateData, null, 2),
    });

    const result = await profileService.updateTutorProfile(userId, updateData);

    console.log("🔍 Update result:", result);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await profileService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get profile completion status
exports.getCompletionStatus = async (req, res) => {
  try {
    const username = req.query?.username;

    // If no username provided, use authenticated user (requires auth middleware)
    if (!username && req.user) {
      const result = await profileService.getCompletionStatusByUserId(
        req.user.id
      );
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.json(result);
    }

    // If username provided, use username lookup (public endpoint)
    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    const result = await profileService.getCompletionStatus(username);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get completion status error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Student Profile Endpoints

// Get student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await profileService.getStudentProfile(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get student profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const result = await profileService.updateStudentProfile(
      userId,
      updateData
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Update student profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Upload video intro
exports.uploadVideoIntro = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.files?.videoIntro?.[0];
    if (!file)
      return res
        .status(400)
        .json({ success: false, error: "videoIntro file is required" });

    await tutorProfileModel.update(userId, { intro_video_path: file.path });
    res.json({
      success: true,
      message: "Video intro uploaded",
      path: file.path,
    });
  } catch (e) {
    console.error("Upload video intro error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Upload required documents
exports.uploadRequiredDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const contract = req.files?.contract?.[0];
    const wwcc = req.files?.wwcc?.[0];
    const wwccExpiry = req.body?.wwccExpiry || req.body?.wwcc_expires_at || null; // form-data text

    if (!contract && !wwcc) {
      return res.status(400).json({ success: false, error: "No documents uploaded" });
    }

    const created = [];
    if (contract) {
      created.push(await tutorDocumentModel.create(userId, "contract", contract.path, null));
    }
    if (wwcc) {
      created.push(await tutorDocumentModel.create(userId, "wwcc", wwcc.path, wwccExpiry));
    }

    await profileService.markDocumentsFlag(userId);
    res.json({ success: true, message: "Documents uploaded", data: created });
  } catch (e) {
    console.error("Upload documents error:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Payment info
exports.getPaymentInfo = async (req, res) => {
  const result = await profileService.getPaymentInfo(req.user.id);
  res.status(result.success ? 200 : 404).json(result);
};

exports.updatePaymentInfo = async (req, res) => {
  const payload = {
    abnNumber: req.body.abnNumber ?? null,
    paymentMethod: req.body.paymentMethod ?? null,
    accountName: req.body.accountName ?? null,
    bsb: req.body.bsb ?? null,
    accountNumber: req.body.accountNumber ?? null,
    paypalEmail: req.body.paypalEmail ?? null,
  };
  const result = await profileService.upsertPaymentInfo(req.user.id, payload);
  res.status(result.success ? 200 : 400).json(result);
};

// List uploaded documents
exports.getDocuments = async (req, res) => {
  const result = await profileService.listDocuments(req.user.id);
  const code = result.success ? 200 : 404;
  res.status(code).json(result);
};

// Get live tutors (public endpoint for find-tutor page)
exports.getLiveTutors = async (req, res) => {
  try {
    const result = await profileService.getLiveTutors();

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get live tutors error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

exports.uploadStudentPhoto = async (req, res) => {
  try {
    if (!req.file?.path) return res.status(400).json({ success: false, error: "No file uploaded" });
    await studentProfileModel.update(req.user.id, { photo_url: req.file.path });
    res.json({ success: true, photo_url: req.file.path });
  } catch (e) {
    console.error("uploadStudentPhoto", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get tutor by ID (public endpoint)
exports.getTutorById = async (req, res) => {
  try {
    const tutorId = parseInt(req.params.id);
    
    if (isNaN(tutorId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid tutor ID"
      });
    }

    const result = await profileService.getTutorProfileByUserId(tutorId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Get tutor by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};