const multer = require("multer");
const path = require("path");
const { uploadBuffer } = require("../services/fileStorageService");

// ✅ Use memoryStorage — no local disk
const storage = multer.memoryStorage();

// ✅ Same allowed file types as before
const allowedTypes = {
  videoSubmission: [".mp4", ".mov", ".avi", ".wmv", ".webm"],
  resume: [".pdf", ".doc", ".docx"],
  videoIntro: [".mp4", ".mov", ".avi", ".wmv", ".webm"],
  contract: [".pdf", ".doc", ".docx"],
  wwcc: [".pdf", ".doc", ".docx"],
  photo: [".jpg", ".jpeg", ".png", ".webp"],
  file: [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov", ".avi", ".wmv", ".webm"],
};

// ✅ Reuse your fileFilter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const field = file.fieldname;
  if (allowedTypes[field] && allowedTypes[field].includes(ext)) cb(null, true);
  else cb(new Error(`Invalid file type for ${field}. Allowed: ${allowedTypes[field]?.join(", ")}`));
};

// ✅ Main upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // up to 100 MB
});

// 🔧 Helper: wrap multer + upload to S3
function uploadAndSyncToS3(kind, handler) {
  return async (req, res, next) => {
    handler(req, res, async (err) => {
      if (err) return next(err);

      try {
        // Single file
        if (req.file) {
          const uploaded = await uploadBuffer(kind, req.file.buffer, req.file.mimetype, req.file.originalname);
          req.file.cloudUrl = uploaded.url;
          req.file.s3Key = uploaded.key;
        }

        // Multiple files
        if (req.files) {
          for (const field in req.files) {
            for (const f of req.files[field]) {
              const uploaded = await uploadBuffer(kind, f.buffer, f.mimetype, f.originalname);
              f.cloudUrl = uploaded.url;
              f.s3Key = uploaded.key;
            }
          }
        }

        next();
      } catch (e) {
        console.error("S3 upload error:", e);
        res.status(500).json({ success: false, error: "Failed to upload to S3" });
      }
    });
  };
}

// ✅ Specific upload types

const tutorApplicationUpload = upload.fields([
  { name: "videoSubmission", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);
const tutorVideoUpload = upload.fields([{ name: "videoIntro", maxCount: 1 }]);
const tutorDocsUpload = upload.fields([
  { name: "contract", maxCount: 1 },
  { name: "wwcc", maxCount: 1 },
]);
const studentPhotoUpload = upload.single("photo");
const tutorPhotoUpload = upload.single("photo");
const lessonMaterialsUpload = upload.single("file");

// ✅ Wrap each with uploadAndSyncToS3
const uploadTutorApplication = uploadAndSyncToS3("tutor/applications", tutorApplicationUpload);
const uploadTutorVideo = uploadAndSyncToS3("tutor/videos", tutorVideoUpload);
const uploadTutorDocs = uploadAndSyncToS3("tutor/docs", tutorDocsUpload);
const uploadStudentPhoto = uploadAndSyncToS3("students/photos", studentPhotoUpload);
const uploadTutorPhoto = uploadAndSyncToS3("tutor/photos", tutorPhotoUpload);
const uploadLessonMaterial = uploadAndSyncToS3("lessons/materials", lessonMaterialsUpload);

// ✅ Error handler stays the same
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 100MB." });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files uploaded." });
    }
  }
  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};

module.exports = {
  uploadTutorApplication,
  uploadTutorVideo,
  uploadTutorDocs,
  uploadStudentPhoto,
  uploadTutorPhoto,
  uploadLessonMaterial,
  handleUploadError,
};
