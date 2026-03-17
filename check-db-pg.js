const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const url = process.env.DATABASE_URL;
  console.log("Connecting to database via 'pg' library...");
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    console.log("Checking columns for 'Voice' table...");
    const res = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Voice'
    `);
    const cols = res.rows.map(r => r.column_name);
    console.log("Columns in Voice:", cols.join(", "));

    if (cols.includes('provider')) {
      console.log("SUCCESS: 'provider' column exists!");
    } else {
      console.log("DATABASE IS MISSING 'provider' column. Adding it...");
      await client.query('ALTER TABLE "Voice" ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT \'MODAL\'');
      await client.query('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT \'MODAL\'');
      await client.query('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "model" TEXT DEFAULT \'sarvam-tts-v1\'');
      await client.query('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "pace" DOUBLE PRECISION DEFAULT 1.0');
      await client.query('ALTER TABLE "Generation" ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT \'hi-IN-Swar\'');
      console.log("Database schema updated successfully via pg.");
    }
  } catch (e) {
    console.error("PG ERROR:", e.message);
  } finally {
    await client.end();
  }
}

main();
