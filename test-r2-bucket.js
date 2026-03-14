require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

async function testR2() {
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    console.log(`Testing R2 connection for bucket: ${process.env.R2_BUCKET_NAME}...`);
    const res = await s3.send(new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        MaxKeys: 1
    }));
    console.log("SUCCESS! Connected to R2 bucket.");
  } catch (err) {
    console.error("FAILED to connect to R2 bucket:", err.message);
  }
}

testR2();
