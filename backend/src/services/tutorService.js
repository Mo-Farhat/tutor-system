// FILE: src/services/tutorService.js
const prisma = require("../db/prisma");
const {
  tutorProfileModel,
  tutorDocumentModel,
} = require("../models");
const { getSignedUrl } = require("./fileStorageService");

// Now use your provided models
const tutorChangeRequestModel = require("../models/tutorChangeRequestModel");
const tutorReviewModel = require("../models/tutorReviewModel");

class TutorService {

  async listTutors(raw = {}) {
    const search = (raw.q || raw.search || "").trim();
    const status = (raw.status || "").trim().toLowerCase();
    const tier = (raw.tier || "").trim().toLowerCase();
    const subjectsParam = raw.subjects;
    const sort = (raw.sort || "name_asc").toLowerCase();
    const page = Math.max(parseInt(raw.page || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(raw.pageSize || "20", 10), 1), 100);
    const skip = (page - 1) * pageSize;

    /** @type {import('@prisma/client').Prisma.TutorProfileWhereInput} */
    const where = {};

    // Status mapping heuristic
    if (status) {
      if (status === "live") {
        where.is_live = true;
      } else if (status === "pending") {
        where.AND = [{ is_live: false }, { documents_uploaded: true }];
      } else if (status === "suspended" || status === "changes_requested") {
        where.user = { status: status };
      }
    }

    if (tier) where.tier = tier;

    let subjects = [];
    if (Array.isArray(subjectsParam)) {
      subjects = subjectsParam;
    } else if (typeof subjectsParam === "string" && subjectsParam.trim() !== "") {
      subjects = subjectsParam.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (subjects.length) {
      where.subjects = { hasSome: subjects };
    }

    if (search) {
      where.user = {
        ...where.user,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    let orderBy;
    if (sort === "name_asc") {
      orderBy = [{ user: { firstName: "asc" } }, { user: { lastName: "asc" } }];
    } else if (sort === "name_desc") {
      orderBy = [{ user: { firstName: "desc" } }, { user: { lastName: "desc" } }];
    } else if (sort === "created_desc") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "created_asc") {
      orderBy = { createdAt: "asc" };
    } else {
      orderBy = [{ user: { firstName: "asc" } }, { user: { lastName: "asc" } }];
    }

    const [items, total] = await Promise.all([
      tutorProfileModel.findAll({ where, orderBy, skip, take: pageSize }),
      prisma.tutorProfile.count({ where }),
    ]);

    return {
      success: true,
      page,
      pageSize,
      total,
      items: items.map((p) => ({
        id: p.userId,
        name: `${p.user.firstName} ${p.user.lastName}`.trim(),
        email: p.user.email,
        status: p.user.status || (p.is_live ? "live" : "pending"),
        tier: p.tier,
        subjects: p.subjects || [],
        is_live: p.is_live,
        documents_uploaded: p.documents_uploaded,
        createdAt: p.createdAt,
      })),
    };
  }

  /**
   * Admin: Get full tutor profile with aggregates
   */
  async getTutorProfile(userId) {
    const id = Number(userId);
    const profile = await tutorProfileModel.findByUserId(id);
    if (!profile) return { success: false, error: "Tutor profile not found" };

    const documents = await tutorDocumentModel.findByUserId(id);

    const [completedCount, recentLessons] = await Promise.all([
      prisma.lesson.count({ where: { tutorId: id, status: "completed" } }),
      prisma.lesson.findMany({
        where: { tutorId: id },
        orderBy: { startAt: "desc" },
        take: 10,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    // Pending change requests (filter by tutor)
    const allPending = await tutorChangeRequestModel.findPending();
    const pendingChanges = (allPending || []).filter((cr) => Number(cr.tutorId) === id);

    // Reviews
    const reviews = await tutorReviewModel.listByTutor(id);

    return {
      success: true,
      data: {
        user: {
          id: profile.user.id,
          firstName: profile.user.firstName,
          lastName: profile.user.lastName,
          email: profile.user.email,
          username: profile.user.username,
          role: profile.user.role,
          status: profile.user.status || (profile.is_live ? "live" : "pending"),
          createdAt: profile.user.createdAt,
        },
        profile: {
          userId: profile.userId,
          bio: profile.bio || "",
          hourly_rate: profile.hourly_rate,
          university: profile.university,
          current_studies: profile.current_studies || [],
          subjects: profile.subjects || [],
          subjects_selected: profile.subjects_selected || [],
          preferred_locations: profile.preferred_locations || [],
          schools_attended: profile.schools_attended || [],
          is_profile_complete: profile.is_profile_complete,
          documents_uploaded: profile.documents_uploaded,
          is_live: profile.is_live,
          tier: profile.tier,
          rating: profile.rating,
          atar: profile.atar,
          // Generate signed URL for video if S3 key exists
          intro_video_path: profile.intro_video_path 
            ? await getSignedUrl(profile.intro_video_path, 86400) // 24 hour validity
            : null,
          intro_video_status: profile.intro_video_status,
          approved_at: profile.approved_at,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
        aggregates: { completedLessons: completedCount },
        recentLessons,
        documents,
        pendingChanges,
        reviews,
      },
    };
  }

  /**
   * Admin: Change tier (promote/demote)
   */
  async changeTier(userId, newTier) {
    const allowed = ["gold", "premium", "elite"];
    if (!allowed.includes(String(newTier))) {
      return { success: false, error: `Invalid tier. Allowed: ${allowed.join(", ")}` };
    }
    const updated = await tutorProfileModel.update(Number(userId), { tier: newTier });
    return { success: true, data: updated };
  }

  /**
   * Admin: Add an external review to a tutor
   */
  async addReview(userId, { source = "google", content }, adminId) {
    if (!content || !content.trim()) {
      return { success: false, error: "Review content is required" };
    }
    const created = await tutorReviewModel.create({
      tutorUserId: Number(userId),
      source,
      content: content.trim(),
      addedBy: Number(adminId),
    });
    return { success: true, data: created };
  }

  async removeReview(reviewId) {
    const deleted = await tutorReviewModel.remove(Number(reviewId));
    return { success: true, data: deleted };
  }

  /**
   * Admin: List completed lessons for a tutor
   */
  async getCompletedLessons(userId, limit = 50) {
    const rows = await prisma.lesson.findMany({
      where: { tutorId: Number(userId), status: "completed" },
      orderBy: { startAt: "desc" },
      take: limit,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return { success: true, data: rows };
  }

  /**
   * Admin: List all lessons for a tutor (scheduled, completed, cancelled)
   */
  async getAllLessons(userId, limit = 100) {
    const rows = await prisma.lesson.findMany({
      where: { tutorId: Number(userId) },
      orderBy: { startAt: "desc" },
      take: limit,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return { success: true, data: rows };
  }

  /**
   * Tutor: submit a change request
   */
  async submitChangeRequest(userId, { type, oldValue = "", newValue = "" }) {
    if (!type) return { success: false, error: "type is required" };
    const created = await tutorChangeRequestModel.create(
      Number(userId),
      String(type),
      String(oldValue ?? ""),
      String(newValue ?? "")
    );
    return { success: true, data: created };
  }

  /**
   * Admin: approve/reject a change request
   */
  async approveChangeRequest(changeRequestId, adminId, comments = "") {
    // First, get the change request to check its type
    const changeRequest = await tutorChangeRequestModel.findById(
      Number(changeRequestId)
    );

    if (!changeRequest) {
      return { success: false, error: "Change request not found" };
    }

    // Approve the change request
    const updated = await tutorChangeRequestModel.approve(
      Number(changeRequestId),
      Number(adminId),
      String(comments ?? "")
    );

    // If it's a profile_update type, apply the changes to the tutor's profile
    if (changeRequest.type === "profile_update" && changeRequest.newValue) {
      try {
        const newProfileData = JSON.parse(changeRequest.newValue);

        // Update the tutor's profile with the new data
        await tutorProfileModel.update(changeRequest.tutorId, {
          bio: newProfileData.bio,
          hourly_rate: newProfileData.hourly_rate,
          university: newProfileData.university,
          current_studies: newProfileData.current_studies,
          subjects_selected: newProfileData.subjects_selected,
          preferred_locations: newProfileData.preferred_locations,
          schools_attended: newProfileData.schools_attended,
          phone_number: newProfileData.phone_number,
        });

        console.log(`Applied profile changes for tutor ${changeRequest.tutorId}`);
      } catch (error) {
        console.error("Error applying profile changes:", error);
        // Don't fail the approval, but log the error
      }
    }

    return { success: true, data: updated };
  }

  async rejectChangeRequest(changeRequestId, adminId, comments = "") {
    const updated = await tutorChangeRequestModel.reject(
      Number(changeRequestId),
      Number(adminId),
      String(comments ?? "")
    );
    return { success: true, data: updated };
  }

  /**
   * Admin: Update intro video status (approve/reject)
   */
  async updateIntroVideoStatus(userId, status, reason = null) {
    const validStatuses = ['none', 'pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Allowed: ${validStatuses.join(", ")}` };
    }

    const profile = await tutorProfileModel.findByUserId(Number(userId));
    if (!profile) {
      return { success: false, error: "Tutor profile not found" };
    }

    const updateData = { intro_video_status: status };
    
    // If rejecting, optionally clear the video path (or keep for re-review)
    // For now, keep the video and just change status
    
    const updated = await tutorProfileModel.update(Number(userId), updateData);
    
    // Generate signed URL for video if it exists
    let signedVideoUrl = null;
    if (updated.intro_video_path) {
      try {
        signedVideoUrl = await getSignedUrl(updated.intro_video_path, 86400);
      } catch (err) {
        console.error("Error generating signed URL:", err);
      }
    }
    
    return { 
      success: true, 
      data: {
        userId: updated.userId,
        intro_video_path: signedVideoUrl,  // Return signed URL
        intro_video_status: updated.intro_video_status,
      },
      message: `Video ${status === 'approved' ? 'approved' : 'rejected'} successfully`
    };
  }
}

module.exports = new TutorService();
