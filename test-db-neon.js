require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not found in .env");
    return;
  }
  
  console.log("Testing connection to Neon DB...");
  const client = new Client({
    connectionString: url,
    ssl: { 
      rejectUnauthorized: false 
    }
  });

  try {
    await client.connect();
    console.log("SUCCESS! Connected to Neon database.");
    const res = await client.query('SELECT current_database(), session_user');
    console.log("DB Info:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("FAILED to connect:", err.message);
  }
}

testConnection();
