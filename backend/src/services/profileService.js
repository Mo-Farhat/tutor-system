const store = require("../models/inMemoryStore");
const bcrypt = require("bcrypt");

class ProfileService {
  // Get tutor profile by user ID
  async getTutorProfileByUserId(userId) {
    const user = await store.getUserById(userId);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor profile not found" };
    }

    const tutorProfile = await store.getTutorProfileByUserId(user.id);
    if (!tutorProfile) {
      return { success: false, error: "Tutor profile not found" };
    }

    // Calculate profile completion
    const completionStatus = this.calculateCompletionStatus(tutorProfile, user);

    return { 
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          created_at: user.createdAt,
        },
        ...tutorProfile,
        completion_status: completionStatus,
      },
    };
  }

  // Get tutor profile by username
  async getTutorProfile(username) {
    const user = await store.getUserByUsername(username);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor profile not found" };
    }

    const tutorProfile = await store.getTutorProfileByUserId(user.id);
    if (!tutorProfile) {
      return { success: false, error: "Tutor profile not found" };
    }

    // Calculate profile completion
    const completionStatus = this.calculateCompletionStatus(tutorProfile, user);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          created_at: user.createdAt,
        },
        ...tutorProfile,
        completion_status: completionStatus,
      },
    };
  }

  // Update tutor profile
  async updateTutorProfile(userId, updateData) {
    const user = await store.getUserById(userId);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor not found" };
    }

    const tutorProfile = await store.getTutorProfileByUserId(userId);
    if (!tutorProfile) {
      return { success: false, error: "Tutor profile not found" };
    }

    // Update profile data
    const updatedProfile = {
      ...tutorProfile,
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Recalculate completion status
    updatedProfile.is_profile_complete = this.isProfileComplete(updatedProfile);

    // Save updated profile
    await store.updateTutorProfile(userId, updatedProfile);

    return {
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    };
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await store.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await store.updateUser(userId, { password: hashedPassword });

    return {
      success: true,
      message: "Password changed successfully",
    };
  }

  // Calculate profile completion status
  calculateCompletionStatus(profile, user) {
    const requiredFields = [
      "bio",
      "hourly_rate",
      "university",
      "phone_number",
      "subjects_selected",
      "preferred_locations",
    ];

    const missingItems = [];
    let completedFields = 0;

    requiredFields.forEach((field) => {
      if (
        !profile[field] ||
        (Array.isArray(profile[field]) && profile[field].length === 0)
      ) {
        missingItems.push(field);
      } else {
        completedFields++;
      }
    });

    const completionPercentage = Math.round(
      (completedFields / requiredFields.length) * 100
    );
    const fullyComplete = missingItems.length === 0;

    return {
      completion_percentage: completionPercentage,
      fully_complete: fullyComplete,
      missing_items: missingItems,
      completed_fields: completedFields,
      total_fields: requiredFields.length,
    };
  }

  // Check if profile is complete
  isProfileComplete(profile) {
    const requiredFields = [
      "bio",
      "hourly_rate",
      "university",
      "phone_number",
      "subjects_selected",
      "preferred_locations",
    ];

    return requiredFields.every((field) => {
      if (Array.isArray(profile[field])) {
        return profile[field].length > 0;
      }
      return profile[field] && profile[field].toString().trim() !== "";
    });
  }

  // Get profile completion status by user ID
  async getCompletionStatusByUserId(userId) {
    const user = await store.getUserById(userId);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor not found" };
    }

    const tutorProfile = await store.getTutorProfileByUserId(user.id);
    if (!tutorProfile) {
      return { success: false, error: "Tutor profile not found" };
    }

    const completionStatus = this.calculateCompletionStatus(tutorProfile, user);

    return {
      success: true,
      data: completionStatus,
    };
  }

  // Get profile completion status by username
  async getCompletionStatus(username) {
    const user = await store.getUserByUsername(username);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor not found" };
    }

    const tutorProfile = await store.getTutorProfileByUserId(user.id);
    if (!tutorProfile) {
      return { success: false, error: "Tutor profile not found" };
    }

    const completionStatus = this.calculateCompletionStatus(tutorProfile, user);

    return {
      success: true,
      data: completionStatus,
    };
  }
}

module.exports = new ProfileService();
