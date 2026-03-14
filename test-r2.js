require('dotenv').config();
const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");

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
    console.log("Testing R2 connection...");
    await s3.send(new ListBucketsCommand({}));
    console.log("SUCCESS! Connected to R2.");
  } catch (err) {
    console.error("FAILED to connect to R2:", err.message);
  }
}

testR2();
