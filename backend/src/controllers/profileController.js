const profileService = require("../services/profileService");
const prisma = require("../db/prisma");
const { tutorProfileModel, tutorDocumentModel } = require("../models");
const { studentProfileModel } = require("../models");
const { createMediaAsset } = require("../services/mediaAssetService");

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

// Upload video intro (file upload or recorded video)
exports.uploadVideoIntro = async (req, res) => {
  try {
    const { user } = req;
    const file = req.files?.videoIntro?.[0];

    if (!file || !file.s3Key) {
      return res.status(400).json({ success: false, error: "No video uploaded" });
    }

    // Create media asset for tracking
    const asset = await createMediaAsset({
      kind: "tutor/videos",
      key: file.s3Key,
      url: file.cloudUrl,
      mimeType: file.mimetype,
      userId: user.id,
    });

    // Store s3Key (not the public URL) for later signed URL generation
    // Update tutor profile with video path and set status to pending for admin review
    const profile = await prisma.tutorProfile.upsert({
      where: { userId: user.id },
      update: { 
        intro_video_path: file.s3Key,  // Store S3 key, not full URL
        intro_video_status: 'pending'
      },
      create: { 
        userId: user.id, 
        intro_video_path: file.s3Key,  // Store S3 key, not full URL
        intro_video_status: 'pending',
        subjects_selected: []
      },
    });

    // Generate signed URL for immediate playback (valid for 1 hour)
    const { getSignedUrl } = require("../services/fileStorageService");
    const signedVideoUrl = await getSignedUrl(file.s3Key, 3600);

    res.json({ 
      success: true, 
      videoUrl: signedVideoUrl,  // Return signed URL for immediate playback
      videoS3Key: file.s3Key,
      videoStatus: 'pending',
      assetId: asset.id, 
      profile,
      message: 'Video uploaded successfully and is pending admin review'
    });
  } catch (err) {
    console.error("UploadVideoIntro error:", err);
    res.status(500).json({ success: false, error: "Failed to upload video intro" });
  }
};


// Upload required documents
exports.uploadRequiredDocuments = async (req, res) => {
  try {
    const { user } = req;
    if (!req.files) {
      return res.status(400).json({ success: false, error: "No files uploaded" });
    }

    // Extract wwccExpiry from request body (sent as FormData field)
    const wwccExpiry = req.body?.wwccExpiry;
    
    const results = [];

    for (const field in req.files) {
      const fileArr = req.files[field];
      if (!fileArr?.length) continue;

      const f = fileArr[0]; // single file per field
      if (!f.cloudUrl || !f.s3Key) continue; // S3 upload failed earlier

      // 1️⃣ Save media asset
      const asset = await createMediaAsset({
        kind: "tutor/docs",
        key: f.s3Key,
        url: f.cloudUrl,
        mimeType: f.mimetype,
        userId: user.id,
      });

      // Prepare document data
      const docData = { 
        assetId: asset.id,
        url: f.cloudUrl,
        key: f.s3Key,
        status: "uploaded",
      };

      // If this is WWCC and expiry date was provided, add it
      if (field === "wwcc" && wwccExpiry) {
        docData.expiresAt = new Date(wwccExpiry);
      }

      // 2️⃣ Link to TutorDocument - find existing or create new
      const existingDoc = await prisma.tutorDocument.findFirst({
        where: {
          userId: user.id,
          type: field, // "contract" or "wwcc"
        },
      });

      let doc;
      if (existingDoc) {
        // Update existing document with new uploadedAt timestamp
        doc = await prisma.tutorDocument.update({
          where: { id: existingDoc.id },
          data: {
            ...docData,
            uploadedAt: new Date(), // Refresh upload timestamp
          },
        });
      } else {
        doc = await prisma.tutorDocument.create({
          data: {
            userId: user.id,
            type: field,
            ...docData,
          },
        });
      }

      results.push({ type: field, asset, document: doc });
    }

    // Mark documents_uploaded flag if both are present
    await profileService.markDocumentsFlag(user.id);

    res.json({ success: true, uploaded: results });
  } catch (err) {
    console.error("UploadRequiredDocuments error:", err);
    res.status(500).json({ success: false, error: "Failed to upload documents" });
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
    const { user } = req;
    const file = req.file;

    if (!file || !file.cloudUrl) {
      return res.status(400).json({ success: false, error: "No photo uploaded" });
    }

    const asset = await createMediaAsset({
      kind: "students/photos",
      key: file.s3Key,
      url: file.cloudUrl,
      mimeType: file.mimetype,
      userId: user.id,
    });

    const updated = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: { photoAssetId: asset.id },
      create: { userId: user.id, photoAssetId: asset.id },
    });

    res.json({ success: true, photoUrl: asset.url, assetId: asset.id, profile: updated });
  } catch (err) {
    console.error("UploadStudentPhoto error:", err);
    res.status(500).json({ success: false, error: "Failed to upload student photo" });
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