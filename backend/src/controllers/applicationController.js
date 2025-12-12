const { tutorApplicationModel, setupTokenModel } = require("../models");
const authService = require("../services/authService");
const emailService = require("../services/emailService");
const { getSignedUrl } = require("../services/fileStorageService");

// Helper to generate pre-signed URLs for application files
async function addSignedUrlsToApplication(app) {
  if (!app || !app.files) return app;
  
  const signedFiles = { ...app.files };
  
  // Generate pre-signed URLs for each file type
  for (const [key, fileUrl] of Object.entries(app.files)) {
    if (fileUrl && typeof fileUrl === 'string') {
      // Extract S3 key from URL or use as-is if it's already a key
      let s3Key = null;
      
      // Check if it's an S3 URL and extract key
      if (fileUrl.includes('.s3.') || fileUrl.includes('s3.amazonaws.com')) {
        // Extract key from S3 URL
        const urlParts = new URL(fileUrl);
        s3Key = urlParts.pathname.substring(1); // Remove leading /
      } else if (fileUrl.startsWith('applications/') || fileUrl.startsWith('tutor/')) {
        // It's already an S3 key
        s3Key = fileUrl;
      }
      
      if (s3Key) {
        try {
          signedFiles[key] = await getSignedUrl(s3Key, 3600); // 1 hour expiry
        } catch (err) {
          console.error(`Error generating signed URL for ${key}:`, err);
          signedFiles[key] = fileUrl; // Fallback to original
        }
      }
    }
  }
  
  return { ...app, files: signedFiles };
}

// GET /api/admin/applications
exports.list = async (req, res) => {
  const status = req.query.status;
  const where = status ? { status } : {};
  const apps = await tutorApplicationModel.findAll({ where, orderBy: { createdAt: "desc" } });
  
  // Add signed URLs for all applications
  const appsWithSignedUrls = await Promise.all(
    apps.map(app => addSignedUrlsToApplication(app))
  );
  
  res.json(appsWithSignedUrls);
};

// GET /api/admin/applications/:id
exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const app = await tutorApplicationModel.findById(id);
  if (!app) return res.status(404).json({ error: "Application not found" });
  
  // Add signed URLs for files
  const appWithSignedUrls = await addSignedUrlsToApplication(app);
  res.json(appWithSignedUrls);
};

// PUT /api/admin/applications/:id  (generic metadata update, not status transitions)
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const allowed = [
    "fullName","phone","email","currentStudy","year12State","year12CompletionYear",
    "currentState","atar","canCommit3Hours","canCommit1Year","canTutorMostWeeks",
    "canTutorGroups","subjectsToTutor","hasWorkingWithChildrenCheck","motivation","files"
  ];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const updated = await tutorApplicationModel.update(id, data);
  res.json(updated);
};

// POST /api/admin/applications/:id/reject
exports.reject = async (req, res) => {
  const id = Number(req.params.id);
  const reason = req.body?.reason || "";

  const app = await tutorApplicationModel.findById(id);
  if (!app) return res.status(404).json({ error: "Application not found" });
  if (app.status !== "pending" && app.status !== "approved") {
    return res.status(400).json({ error: `Cannot reject in status '${app.status}'` });
  }

  const updated = await tutorApplicationModel.update(id, { status: "rejected" });

  // Clean any tokens
  try {
    await setupTokenModel.deleteExpired();
  } catch {}

  // Notify
  try {
    await emailService.sendRejectionNotification(app.email, app, reason);
  } catch {}

  res.json({ message: "Application rejected", applicationId: updated.applicationId, status: updated.status });
};

// DELETE /api/admin/applications/:id
exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await tutorApplicationModel.delete(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

