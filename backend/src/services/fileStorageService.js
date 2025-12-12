const path = require("path");
const crypto = require("crypto");
const { Upload } = require("@aws-sdk/lib-storage");
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl: awsGetSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../lib/s3");

const BUCKET = process.env.AWS_S3_BUCKET;
const PUBLIC_URL = process.env.AWS_S3_PUBLIC_URL; // optional convenience

function keyFor(kind, originalName) {
  const ext = path.extname(originalName || "");
  const base = crypto.randomBytes(16).toString("hex");
  const date = new Date().toISOString().slice(0,10);
  return `${kind}/${date}/${base}${ext}`;
}

async function uploadBuffer(kind, fileBuffer, mimeType, originalName) {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET not set");
  const Key = keyFor(kind, originalName);
  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key,
      Body: fileBuffer,
      ContentType: mimeType || "application/octet-stream",
    },
  });
  await uploader.done();
  const url = PUBLIC_URL ? `${PUBLIC_URL}/${Key}` :
    `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
  return { bucket: BUCKET, key: Key, url };
}

async function deleteObject(key) {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET not set");
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  return { success: true };
}

/**
 * Generate a pre-signed URL for temporary access to a private S3 object
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiry in seconds (default 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
async function getSignedUrl(key, expiresIn = 3600) {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET not set");
  if (!key) throw new Error("S3 key is required");
  
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  const signedUrl = await awsGetSignedUrl(s3, command, { expiresIn });
  return signedUrl;
}

module.exports = { uploadBuffer, deleteObject, getSignedUrl };
