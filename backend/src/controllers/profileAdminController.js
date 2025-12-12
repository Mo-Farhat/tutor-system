const { tutorProfileModel, studentProfileModel, userModel } = require("../models");
const profileService = require("../services/profileService");

// GET /api/admin/profiles
exports.list = async (req, res) => {
  const is_live = req.query.is_live;
  const where = {};
  if (typeof is_live !== "undefined")
    where.is_live = String(is_live) === "true";
  const profiles = await tutorProfileModel.findAll({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json(profiles);
};

// GET /api/admin/profiles/:userId
exports.get = async (req, res) => {
  const userId = Number(req.params.userId);
  const profile = await tutorProfileModel.findByUserId(userId);
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
};

// POST /api/admin/profiles
exports.create = async (req, res) => {
  const { userId, ...data } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const created = await tutorProfileModel.create(userId, data || {});
  res.status(201).json(created);
};

// DELETE /api/admin/profiles/:userId
exports.remove = async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    await tutorProfileModel.delete(userId);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /api/admin/profiles/:userId/make-live
exports.makeLive = async (req, res) => {
  const userId = Number(req.params.userId);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ 
      success: false, 
      error: "Valid user ID is required in URL path" 
    });
  }
  
  try{
    const profile = await tutorProfileModel.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Check if documents are uploaded
    if (!profile.documents_uploaded) {
      return res.status(400).json({
        error: "Cannot make tutor live - documents not uploaded",
      });
    }

    // Make tutor live
    await tutorProfileModel.update(userId, { is_live: true });

    // Invalidate live tutors cache
    profileService.invalidateLiveTutorsCache();

    res.json({
      success: true,
      message: "Tutor made live successfully",
      userId: userId,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// PUT /api/admin/profiles/:userId/make-offline
exports.makeOffline = async (req, res) => {
  console.log('🔍 makeOffline called with params:', req.params);
  console.log('🔍 makeOffline URL:', req.url);
  console.log('🔍 makeOffline body:', req.body);
  
  const userId = Number(req.params.userId);
  console.log('🔍 makeOffline userId:', userId);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ 
      success: false, 
      error: "Valid user ID is required in URL path" 
    });
  }
  
  try {
    const profile = await tutorProfileModel.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Make tutor offline
    await tutorProfileModel.update(userId, { is_live: false });

    // Invalidate live tutors cache
    profileService.invalidateLiveTutorsCache();

    res.json({
      success: true,
      message: "Tutor made offline successfully",
      userId: userId,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// GET /api/admin/students/:userId/profile - Get student profile for admin view
exports.getStudentProfile = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid user ID is required" 
      });
    }

    const result = await profileService.getStudentProfileForAdmin(userId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (e) {
    console.error("admin.getStudentProfile", e);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
};

// PUT /api/admin/students/:userId/profile - Update student tier and status
exports.updateStudentProfile = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { tier, status } = req.body || {};

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid user ID is required" 
      });
    }

    // Validate allowed fields
    const allowedFields = {};
    if (tier !== undefined) {
      if (!['basic', 'premium', 'elite'].includes(tier)) {
        return res.status(400).json({
          success: false,
          error: "Tier must be one of: basic, premium, elite"
        });
      }
      allowedFields.tier = tier;
    }

    if (status !== undefined) {
      // Allow common status values
      if (!['active', 'inactive', 'pending', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status must be one of: active, inactive, pending, suspended"
        });
      }
      allowedFields.status = status;
    }

    if (Object.keys(allowedFields).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields provided for update"
      });
    }

    const result = await profileService.updateStudentTierStatus(userId, allowedFields);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (e) {
    console.error("admin.updateStudentProfile", e);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
};

// GET /api/admin/tutors/:userId/documents - Get tutor documents with S3 URLs
exports.getTutorDocuments = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid user ID is required" 
      });
    }

    // Import prisma and getSignedUrl
    const prisma = require("../db/prisma");
    const { getSignedUrl } = require("../services/fileStorageService");
    
    const documents = await prisma.tutorDocument.findMany({
      where: { userId },
      include: {
        asset: true, // Include linked MediaAsset for S3 URL
      },
      orderBy: { uploadedAt: "desc" },
    });

    // Transform to include pre-signed URL from asset key
    const transformedDocs = await Promise.all(documents.map(async (doc) => {
      const key = doc.asset?.key || doc.key;
      let signedUrl = null;
      
      if (key) {
        try {
          signedUrl = await getSignedUrl(key, 3600); // 1 hour expiry
        } catch (err) {
          console.error("Error generating signed URL for key:", key, err);
        }
      }
      
      return {
        id: doc.id,
        userId: doc.userId,
        type: doc.type,
        url: signedUrl || doc.asset?.url || doc.url || null,
        key: key || null,
        bucket: doc.asset?.bucket || doc.bucket || null,
        number: doc.number,
        status: doc.status,
        expiresAt: doc.expiresAt,
        uploadedAt: doc.uploadedAt,
        assetId: doc.assetId,
      };
    }));

    res.json(transformedDocs);
  } catch (e) {
    console.error("admin.getTutorDocuments", e);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
};
