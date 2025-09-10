const profileService = require("../services/profileService");

// Get tutor profile
exports.getTutorProfile = async (req, res) => {
  try {
    const { username } = req.query;

    // If no username provided, use authenticated user (requires auth middleware)
    if (!username && req.user) {
      const result = profileService.getTutorProfileByUserId(req.user.id);
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

    const result = profileService.getTutorProfile(username);

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

    const result = profileService.updateTutorProfile(userId, updateData);

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
    const { username } = req.query;

    // If no username provided, use authenticated user (requires auth middleware)
    if (!username && req.user) {
      const result = profileService.getCompletionStatusByUserId(req.user.id);
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

    const result = profileService.getCompletionStatus(username);

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
