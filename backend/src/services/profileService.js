const {
  userModel,
  tutorProfileModel,
  studentProfileModel,
  tutorPaymentModel,
  tutorDocumentModel,
  tutorApplicationModel,
} = require("../models");
const bcrypt = require("bcrypt");

class ProfileService {
  // Get tutor profile by user ID
  async getTutorProfileByUserId(userId) {
    const tutorProfile = await tutorProfileModel.findByUserId(userId);
    if (!tutorProfile || tutorProfile.user.role !== "tutor") {
      return { success: false, error: "Tutor profile not found" };
    }

    // Fetch linked tutor application if it exists
    const application = await tutorApplicationModel.findByUserId(userId);

    // NEW: compute WWCC status and include documents flag
    const wwcc = await this.wwccStatus(tutorProfile.userId);
    const completionStatus = this.calculateCompletionStatus(
      tutorProfile,
      tutorProfile.user,
      {
        requireDocuments: true,
        documentsUploaded: !!tutorProfile.documents_uploaded,
        wwccStatus: wwcc.status,
      }
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
        wwcc_status: wwcc, // ⬅️ convenient for the UI
        completion_status: completionStatus,
        application: application || null, // Include application data for pre-filling
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

    // Fetch linked tutor application if it exists
    const application = await tutorApplicationModel.findByUserId(user.id);

    const wwcc = await this.wwccStatus(user.id);
    const completionStatus = this.calculateCompletionStatus(
      tutorProfile,
      user,
      {
        requireDocuments: true,
        documentsUploaded: !!tutorProfile.documents_uploaded,
        wwccStatus: wwcc.status,
      }
    );

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
        wwcc_status: wwcc,
        completion_status: completionStatus,
        application: application || null, // Include application data for pre-filling
      },
    };
  }

  // Update tutor profile
  async updateTutorProfile(userId, updateData) {
    console.log("🔍 ProfileService updateTutorProfile called with:", {
      userId,
      updateData: JSON.stringify(updateData, null, 2),
    });

    console.log("🔍 FirstName/LastName in updateData:", {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
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

    // Separate User model fields from TutorProfile fields
    const userFields = ["firstName", "lastName"];
    const tutorProfileFields = [
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

    // Prepare User model update data
    const userDataToUpdate = {};
    userFields.forEach((field) => {
      if (updatedProfile[field] !== undefined) {
        userDataToUpdate[field] = updatedProfile[field];
      }
    });

    // Prepare TutorProfile update data
    const profileDataToUpdate = {};
    tutorProfileFields.forEach((field) => {
      if (updatedProfile[field] !== undefined) {
        profileDataToUpdate[field] = updatedProfile[field];
      }
    });

    console.log("🔍 Data to update in database:", {
      userId,
      userDataToUpdate: JSON.stringify(userDataToUpdate, null, 2),
      profileDataToUpdate: JSON.stringify(profileDataToUpdate, null, 2),
    });

    // Update User model if there are user fields to update
    if (Object.keys(userDataToUpdate).length > 0) {
      console.log("🔍 Updating User model with:", userDataToUpdate);
      await userModel.update(userId, userDataToUpdate);
      console.log("✅ User model updated successfully");

      // Verify the update by fetching the user again
      const updatedUser = await userModel.findById(userId);
      console.log("🔍 User after update:", {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });
    }

    // Update TutorProfile model
    await tutorProfileModel.update(userId, profileDataToUpdate);

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

  async wwccStatus(userId) {
    const wwcc = await tutorDocumentModel.getLatestWWCC(userId);
    if (!wwcc) return { status: "missing" };
    if (!wwcc.expiresAt) return { status: "unknown" };

    const now = new Date();
    const expires = new Date(wwcc.expiresAt);
    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { status: "expired", daysLeft };
    if (daysLeft <= 30) return { status: "expiring", daysLeft };
    return { status: "valid", daysLeft };
  }

  // Calculate profile completion status
  calculateCompletionStatus(profile, user, extra = {}) {
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
      const v = profile[field];
      if (
        !v ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === "string" && v.trim() === "")
      ) {
        missingItems.push(field);
      } else {
        completedFields++;
      }
    });

    // Include documents + WWCC validity if requested
    if (extra.requireDocuments) {
      if (extra.documentsUploaded) {
        completedFields++;
      } else {
        missingItems.push("documents_uploaded");
      }

      if (extra.wwccStatus === "valid" || extra.wwccStatus === "expiring") {
        completedFields++;
      } else {
        // surface the key we want the UI to show as missing
        missingItems.push("wwcc_valid");
      }
    }

    const totalFields =
      requiredFields.length + (extra.requireDocuments ? 2 : 0);
    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100
    );

    return {
      completion_percentage: Math.max(0, Math.min(100, completionPercentage)),
      fully_complete: missingItems.length === 0,
      missing_items: missingItems,
      completed_fields: completedFields,
      total_fields: totalFields,
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

    const wwcc = await this.wwccStatus(tutorProfile.userId);
    const completionStatus = this.calculateCompletionStatus(
      tutorProfile,
      tutorProfile.user,
      {
        requireDocuments: true,
        documentsUploaded: !!tutorProfile.documents_uploaded,
        wwccStatus: wwcc.status,
      }
    );

    return {
      success: true,
      data: {
        ...completionStatus,
        wwcc_status: wwcc, // extra detail for the banner (e.g., expiring in N days)
      },
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

    const wwcc = await this.wwccStatus(user.id);
    const completionStatus = this.calculateCompletionStatus(
      tutorProfile,
      user,
      {
        requireDocuments: true,
        documentsUploaded: !!tutorProfile.documents_uploaded,
        wwccStatus: wwcc.status,
      }
    );

    return {
      success: true,
      data: {
        ...completionStatus,
        wwcc_status: wwcc,
      },
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

  // Cache for live tutors (5 minutes TTL)
  _liveTutorsCache = null;
  _liveTutorsCacheTime = 0;
  _liveTutorsCacheTTL = 5 * 60 * 1000; // 5 minutes

  // Get live tutors (approved tutors with documents uploaded)
  async getLiveTutors(forceRefresh = false) {
    try {
      // Check cache
      const now = Date.now();
      if (!forceRefresh && this._liveTutorsCache && (now - this._liveTutorsCacheTime) < this._liveTutorsCacheTTL) {
        console.log('✅ Returning cached live tutors');
        return this._liveTutorsCache;
      }

      console.log('🔄 Fetching live tutors from database');
      const liveTutors = await tutorProfileModel.findLive();

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
        image: tutor.photo_url || null,
        photo_url: tutor.photo_url || null,
      }));

      const result = {
        success: true,
        data: {
          tutors: transformedTutors,
          count: transformedTutors.length,
        },
      };

      // Cache the result
      this._liveTutorsCache = result;
      this._liveTutorsCacheTime = now;
      console.log(`✅ Cached ${transformedTutors.length} live tutors`);

      return result;
    } catch (error) {
      console.error("Get live tutors error:", error);
      return {
        success: false,
        error: "Failed to fetch live tutors",
      };
    }
  }

  // Get student profile for admin view
  async getStudentProfileForAdmin(userId) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Get student profile
      const studentProfile = await studentProfileModel.findByUserId(userId);
      
      // Get parent contacts
      const parentContacts = await this.getParentContactsForStudent(userId);

      // Calculate profile completion
      const completionPercentage = this.calculateStudentProfileCompletion(studentProfile);

      const result = {
        success: true,
        data: {
          // User data
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,

          // Student profile data
          phoneNumber: studentProfile?.phone_number || null,
          bio: studentProfile?.bio || null,
          currentSchool: studentProfile?.current_school || null,
          yearLevel: studentProfile?.year_level || null,
          subjectsInterested: studentProfile?.subjects_interested || [],
          preferredLocations: studentProfile?.preferred_locations || [],
          learningGoals: studentProfile?.learning_goals || null,
          tier: studentProfile?.tier || 'basic',
          isProfileComplete: studentProfile?.is_profile_complete || false,
          profileCompletionPercentage: completionPercentage,
          photoUrl: studentProfile?.photo_url || null,

          // Parent contacts
          parentContacts: parentContacts || [],

          // Profile creation dates
          profileCreatedAt: studentProfile?.createdAt || null,
          profileUpdatedAt: studentProfile?.updatedAt || null,
        }
      };

      return result;
    } catch (error) {
      console.error("Get student profile for admin error:", error);
      return { success: false, error: "Failed to fetch student profile" };
    }
  }

  // Update student tier and status (admin only)
  async updateStudentTierStatus(userId, updates) {
    try {
      const { tier, status } = updates;

      // Update user status if provided
      if (status !== undefined) {
        await userModel.update(userId, { status });
      }

      // Update student profile tier if provided
      if (tier !== undefined) {
        await studentProfileModel.update(userId, { tier });
      }

      // Fetch updated data
      const user = await userModel.findById(userId);
      const studentProfile = await studentProfileModel.findByUserId(userId);

      return {
        success: true,
        data: {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          status: user.status,
          tier: studentProfile?.tier || 'basic',
        },
        message: "Student profile updated successfully"
      };
    } catch (error) {
      console.error("Update student tier status error:", error);
      return { success: false, error: "Failed to update student profile" };
    }
  }

  // Helper: Get parent contacts for a student
  async getParentContactsForStudent(userId) {
    try {
      const { parentContactModel } = require("../models");
      const contacts = await parentContactModel.listByStudent(userId);
      return contacts;
    } catch (error) {
      console.error("Get parent contacts error:", error);
      return [];
    }
  }

  // Helper: Calculate student profile completion percentage
  calculateStudentProfileCompletion(profile) {
    if (!profile) return 0;

    const fields = [
      profile.phone_number,
      profile.bio,
      profile.current_school,
      profile.year_level,
      profile.subjects_interested?.length > 0,
      profile.preferred_locations?.length > 0,
      profile.learning_goals,
      profile.photo_url,
    ];

    const completedFields = fields.filter(field => field && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  // Invalidate live tutors cache (called when tutor is made live/offline)
  invalidateLiveTutorsCache() {
    console.log('🗑️ Invalidating live tutors cache');
    this._liveTutorsCache = null;
    this._liveTutorsCacheTime = 0;
  }
}

module.exports = new ProfileService();
