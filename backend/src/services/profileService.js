const { userModel, tutorProfileModel } = require("../models");
const bcrypt = require("bcrypt");

class ProfileService {
  // Get tutor profile by user ID
  async getTutorProfileByUserId(userId) {
    const tutorProfile = await tutorProfileModel.findByUserId(userId);
    if (!tutorProfile || tutorProfile.user.role !== "tutor") {
      return { success: false, error: "Tutor profile not found" };
    }

    // Calculate profile completion
    const completionStatus = this.calculateCompletionStatus(
      tutorProfile,
      tutorProfile.user
    );

    return {
      success: true,
      data: {
        user: {
          id: tutorProfile.user.id,
          username: tutorProfile.user.username,
          email: tutorProfile.user.email,
          first_name: tutorProfile.user.firstName,
          last_name: tutorProfile.user.lastName,
          role: tutorProfile.user.role,
          created_at: tutorProfile.user.createdAt,
        },
        ...tutorProfile,
        completion_status: completionStatus,
      },
    };
  }

  // Get tutor profile by username
  async getTutorProfile(username) {
    const user = await userModel.findByUsername(username);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor profile not found" };
    }

    const tutorProfile = await tutorProfileModel.findByUserId(user.id);
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
    const user = await userModel.findById(userId);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor not found" };
    }

    const tutorProfile = await tutorProfileModel.findByUserId(userId);
    if (!tutorProfile) {
      return { success: false, error: "Tutor profile not found" };
    }

    // Transform data types to match Prisma schema
    const transformedData = { ...updateData };

    // Transform subjects array from objects to strings (for subjects field)
    if (transformedData.subjects && Array.isArray(transformedData.subjects)) {
      transformedData.subjects = transformedData.subjects.map((subject) => {
        if (typeof subject === "object") {
          return `${subject.year_level} ${subject.curriculum} ${subject.subject}`;
        }
        return subject;
      });
    }

    // Convert numeric fields
    if (transformedData.hourly_rate !== undefined) {
      transformedData.hourly_rate = Number(transformedData.hourly_rate);
    }
    if (transformedData.rating !== undefined) {
      transformedData.rating = Number(transformedData.rating);
    }
    if (transformedData.atar !== undefined) {
      transformedData.atar = Number(transformedData.atar);
    }

    // Convert boolean fields
    if (transformedData.is_profile_complete !== undefined) {
      transformedData.is_profile_complete = Boolean(
        transformedData.is_profile_complete
      );
    }
    if (transformedData.documents_uploaded !== undefined) {
      transformedData.documents_uploaded = Boolean(
        transformedData.documents_uploaded
      );
    }
    if (transformedData.is_live !== undefined) {
      transformedData.is_live = Boolean(transformedData.is_live);
    }

    // Keep subjects_selected as JSON (already correct format)
    // Keep other array fields as string arrays

    // Update profile data
    const updatedProfile = {
      ...tutorProfile,
      ...transformedData,
    };

    // Recalculate completion status
    updatedProfile.is_profile_complete = this.isProfileComplete(updatedProfile);

    // Filter only valid TutorProfile fields for Prisma update
    const validFields = [
      "phone_number",
      "bio",
      "hourly_rate",
      "university",
      "current_studies",
      "subjects",
      "subjects_selected",
      "locations",
      "preferred_locations",
      "schools_attended",
      "is_profile_complete",
      "documents_uploaded",
      "is_live",
      "tier",
      "rating",
      "atar",
      "approved_at",
    ];

    const dataToUpdate = {};
    validFields.forEach((field) => {
      if (updatedProfile[field] !== undefined) {
        dataToUpdate[field] = updatedProfile[field];
      }
    });

    // Save updated profile
    await tutorProfileModel.update(userId, dataToUpdate);

    return {
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    };
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userModel.findById(userId);
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
    await userModel.update(userId, { password: hashedPassword });

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
    const tutorProfile = await tutorProfileModel.findByUserId(userId);
    if (!tutorProfile || tutorProfile.user.role !== "tutor") {
      return { success: false, error: "Tutor profile not found" };
    }

    const completionStatus = this.calculateCompletionStatus(
      tutorProfile,
      tutorProfile.user
    );

    return {
      success: true,
      data: completionStatus,
    };
  }

  // Get profile completion status by username
  async getCompletionStatus(username) {
    const user = await userModel.findByUsername(username);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor not found" };
    }

    const tutorProfile = await tutorProfileModel.findByUserId(user.id);
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
