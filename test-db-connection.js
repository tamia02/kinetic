const { Client } = require('pg');

async function testConnection() {
  const url = process.env.DATABASE_URL || "postgresql://postgres.wldwzqnwjmdfesxindkh:%40Kinetic1402a@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
  console.log("Testing connection:", url.replace(/:[^:@]*@/, ':***@'));
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("SUCCESS! Connected to database.");
    await client.query('SELECT 1');
    await client.end();
  } catch (err) {
    console.error("FAILED to connect:", err.message);
  }
}

testConnection();
