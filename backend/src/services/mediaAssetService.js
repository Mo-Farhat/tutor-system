// FILE: src/services/mediaAssetService.js
const prisma = require("../db/prisma");
const { deleteObject } = require("./fileStorageService");

/**
 * Create a MediaAsset record for a file uploaded to S3.
 * @param {Object} params
 * @param {string} params.kind - Logical folder (e.g., "tutor/docs", "students/photos").
 * @param {string} params.key - S3 object key.
 * @param {string} params.url - Public or signed URL.
 * @param {string} params.mimeType - MIME type of the file.
 * @param {number} params.userId - Uploader's userId.
 * @returns {Promise<Object>} The created MediaAsset record.
 */
async function createMediaAsset({ kind, key, url, mimeType, userId }) {
  if (!key || !url) throw new Error("Missing key or URL for MediaAsset");

  const asset = await prisma.mediaAsset.create({
    data: {
      kind,
      s3Key: key,
      url,
      mimeType,
      uploadedById: userId || null,
    },
  });

  return asset;
}

/**
 * Delete a MediaAsset both from S3 and the database.
 * @param {number} id - MediaAsset ID.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function deleteMediaAsset(id) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { success: false, message: "Asset not found" };

  try {
    if (asset.s3Key) {
      await deleteObject(asset.s3Key);
    }
    await prisma.mediaAsset.delete({ where: { id } });
    return { success: true, message: "Asset deleted successfully" };
  } catch (err) {
    console.error("Error deleting media asset:", err);
    throw err;
  }
}

/**
 * Get all MediaAssets for a given user (optional filter by kind).
 * @param {number} userId
 * @param {string} [kind]
 * @returns {Promise<Array>}
 */
async function listUserAssets(userId, kind) {
  const where = { uploadedById: userId };
  if (kind) where.kind = kind;
  return prisma.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" } });
}

/**
 * Admin: get all MediaAssets
 */
async function listAllAssets() {
  return prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
}

module.exports = {
  createMediaAsset,
  deleteMediaAsset,
  listUserAssets,
  listAllAssets,
};
