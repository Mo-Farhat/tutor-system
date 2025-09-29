const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    videoSubmission: [".mp4", ".mov", ".avi", ".wmv", ".webm"],
    resume: [".pdf", ".doc", ".docx"],
    videoIntro: [".mp4", ".mov", ".avi", ".wmv", ".webm"],
    contract: [".pdf", ".doc", ".docx"],
    wwcc: [".pdf", ".doc", ".docx"],
    studentPhoto: [".jpg", ".jpeg", ".png", ".webp"],
  };

  const extension = path.extname(file.originalname).toLowerCase();
  const fieldName = file.fieldname;

  if (allowedTypes[fieldName] && allowedTypes[fieldName].includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type for ${fieldName}. Allowed: ${allowedTypes[
          fieldName
        ]?.join(", ")}`
      )
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 2, // Maximum 2 files
  },
});

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 }, // 100MB
});

const uploadDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 2 }, // 10MB each
});

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const studentPhotoUpload = uploadImage.single("photo");

// Middleware for tutor application uploads
const tutorApplicationUpload = upload.fields([
  { name: "videoSubmission", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

const tutorVideoUpload = uploadVideo.fields([
  { name: "videoIntro", maxCount: 1 },
]);
const tutorDocsUpload = uploadDocs.fields([
  { name: "contract", maxCount: 1 },
  { name: "wwcc", maxCount: 1 },
]);

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 50MB." });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files uploaded." });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Unexpected file field." });
    }
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

module.exports = {
  tutorApplicationUpload,
  tutorVideoUpload,
  tutorDocsUpload,
  handleUploadError,
  studentPhotoUpload,
};
