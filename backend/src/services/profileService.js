const {
  userModel,
  tutorProfileModel,
  studentProfileModel,
  tutorPaymentModel,
  tutorDocumentModel,
} = require("../models");
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
    console.log("🔍 ProfileService updateTutorProfile called with:", {
      userId,
      updateData: JSON.stringify(updateData, null, 2),
    });

    const user = await userModel.findById(userId);
    if (!user || user.role !== "tutor") {
      console.log("❌ Tutor not found:", { userId, userRole: user?.role });
      return { success: false, error: "Tutor not found" };
    }

    const tutorProfile = await tutorProfileModel.findByUserId(userId);
    if (!tutorProfile) {
      console.log("❌ Tutor profile not found for user:", userId);
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

    console.log("🔍 Data to update in database:", {
      userId,
      dataToUpdate: JSON.stringify(dataToUpdate, null, 2),
    });

    // Save updated profile
    await tutorProfileModel.update(userId, dataToUpdate);

    console.log("✅ Database update completed successfully");

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

  // Student Profile Methods

  // Get student profile
  async getStudentProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "student") {
      return { success: false, error: "Student profile not found" };
    }

    // Get student profile if it exists
    const studentProfile = await studentProfileModel.findByUserId(userId);

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
        ...(studentProfile || {}),
      },
    };
  }

  // Update student profile
  async updateStudentProfile(userId, updateData) {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "student") {
      return { success: false, error: "Student not found" };
    }

    // Separate user fields from profile fields
    const userFields = ["firstName", "lastName", "email"];
    const profileFields = [
      "phone_number",
      "bio",
      "current_school",
      "year_level",
      "subjects_interested",
      "preferred_locations",
      "learning_goals",
    ];

    const userUpdateData = {};
    const profileUpdateData = {};

    // Filter user fields
    userFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        userUpdateData[field] = updateData[field];
      }
    });

    // Filter profile fields
    profileFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        profileUpdateData[field] = updateData[field];
      }
    });

    // Update user data if there are user fields to update
    if (Object.keys(userUpdateData).length > 0) {
      await userModel.update(userId, userUpdateData);
    }

    // Update or create student profile
    if (Object.keys(profileUpdateData).length > 0) {
      const profileExists = await studentProfileModel.exists(userId);

      if (profileExists) {
        await studentProfileModel.update(userId, profileUpdateData);
      } else {
        await studentProfileModel.create(userId, profileUpdateData);
      }
    }

    // Get updated data
    const updatedUser = await userModel.findById(userId);
    const studentProfile = await studentProfileModel.findByUserId(userId);

    return {
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          first_name: updatedUser.firstName,
          last_name: updatedUser.lastName,
          role: updatedUser.role,
          created_at: updatedUser.createdAt,
        },
        ...(studentProfile || {}),
      },
      message: "Profile updated successfully",
    };
  }

  async getPaymentInfo(userId) {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor not found" };
    }
    const payment = await tutorPaymentModel.findByUserId(userId);
    return { success: true, data: payment || {} };
  }

  async upsertPaymentInfo(userId, payload) {
    const user = await userModel.findById(userId);
    if (!user || user.role !== "tutor") {
      return { success: false, error: "Tutor not found" };
    }
    const saved = await tutorPaymentModel.upsert(userId, payload);
    return { success: true, data: saved, message: "Payment info saved" };
  }

  async listDocuments(userId) {
    console.log("🔍 ProfileService listDocuments called with userId:", userId);
    const user = await userModel.findById(userId);
    if (!user || user.role !== "tutor") {
      console.log("❌ User not found or not a tutor:", { user: user?.role });
      return { success: false, error: "Tutor not found" };
    }
    console.log("✅ User found, fetching documents...");
    console.log("🔍 tutorDocumentModel:", typeof tutorDocumentModel);
    console.log(
      "🔍 tutorDocumentModel.findByUserId:",
      typeof tutorDocumentModel?.findByUserId
    );
    const docs = await tutorDocumentModel.findByUserId(userId);
    console.log("✅ Documents fetched:", docs);
    return { success: true, data: docs };
  }

  async markDocumentsFlag(userId) {
    // If both contract and wwcc exist, mark documents_uploaded=true
    const contractCount = await tutorDocumentModel.countByType(
      userId,
      "contract"
    );
    const wwccCount = await tutorDocumentModel.countByType(userId, "wwcc");
    const both = contractCount > 0 && wwccCount > 0;
    await tutorProfileModel.update(userId, { documents_uploaded: both });
  }

  // Get live tutors (approved tutors with documents uploaded)
  async getLiveTutors() {
    try {
      const liveTutors = await tutorProfileModel.findLive({
        where: {
          is_live: true,
          documents_uploaded: true,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // Transform the data to match frontend expectations
      const transformedTutors = liveTutors.map((tutor) => ({
        id: tutor.userId,
        name: `${tutor.user.firstName} ${tutor.user.lastName}`,
        username: tutor.user.username,
        email: tutor.user.email,
        bio: tutor.bio || "",
        subjects: tutor.subjects || [],
        preferred_locations: tutor.preferred_locations || [],
        hourly_rate: tutor.hourly_rate ? parseFloat(tutor.hourly_rate) : null,
        university: tutor.university || "",
        current_studies: tutor.current_studies || [],
        schools_attended: tutor.schools_attended || [],
        tier: tutor.tier || "gold",
        rating: tutor.rating ? parseFloat(tutor.rating) : 0,
        atar: tutor.atar ? parseFloat(tutor.atar) : null,
        approved_at: tutor.approved_at,
        status: "approved", // Since we're only getting live tutors
        goldPoints:
          tutor.tier === "gold" ? 100 : tutor.tier === "premium" ? 200 : 300,
        atrPoints: tutor.atar ? Math.round(tutor.atar) : 0,
        image: null, // Placeholder for now
      }));

      return {
        success: true,
        data: {
          tutors: transformedTutors,
          count: transformedTutors.length,
        },
      };
    } catch (error) {
      console.error("Get live tutors error:", error);
      return {
        success: false,
        error: "Failed to fetch live tutors",
      };
    }
  }
}

module.exports = new ProfileService();
