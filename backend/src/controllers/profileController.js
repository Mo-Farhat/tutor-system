const profileService = require("../services/profileService");

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
