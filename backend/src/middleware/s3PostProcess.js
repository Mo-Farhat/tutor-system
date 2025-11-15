// src/middleware/s3PostProcess.js
const fs = require("fs/promises");
const { uploadBuffer } = require("../services/fileStorageService");

async function toCloud(kind, f) {
  if (!f) return null;
  let buf = f.buffer;
  if (!buf && f.path) {
    // Multer diskStorage: read from disk
    buf = await fs.readFile(f.path);
  }
  if (!buf) return null; // nothing to upload
  const up = await uploadBuffer(kind, buf, f.mimetype, f.originalname);
  f.cloudUrl = up.url;
  f.s3Key = up.key;
  return up;
}

/** kind: e.g. "tutor/videos", "tutor/docs", "students/photos", "lessons/materials" */
function s3PostProcess(kind) {
  return async function(req, res, next) {
    try {
      if (req.file) {
        await toCloud(kind, req.file);
      }
      if (Array.isArray(req.files)) {
        await Promise.all(req.files.map((f) => toCloud(kind, f)));
      } else if (req.files && typeof req.files === "object") {
        // fields upload
        const arrays = Object.values(req.files).filter(Array.isArray);
        for (const arr of arrays) {
          await Promise.all(arr.map((f) => toCloud(kind, f)));
        }
      }
      next();
    } catch (e) {
      console.error("S3 upload failed:", e);
      res.status(500).json({ success: false, error: "Upload to cloud failed" });
    }
  };
}

module.exports = { s3PostProcess };
