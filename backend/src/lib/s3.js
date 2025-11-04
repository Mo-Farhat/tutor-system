const { S3Client } = require("@aws-sdk/client-s3");

const required = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
for (const k of required) {
  if (!process.env[k]) {
    console.warn(`[S3] Missing ${k}. S3 uploads will fail until configured.`);
  }
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

module.exports = s3;
