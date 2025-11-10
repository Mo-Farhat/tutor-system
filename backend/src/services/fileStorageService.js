const path = require("path");
const crypto = require("crypto");
const { Upload } = require("@aws-sdk/lib-storage");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
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

module.exports = { uploadBuffer, deleteObject };
