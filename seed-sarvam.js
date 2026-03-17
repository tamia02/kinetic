const { Client } = require('pg');
require('dotenv').config();

const SARVAM_VOICES = [
  { id: "shubh", name: "Shubh", gender: "male", description: "Friendly default voice for IVR and support" },
  { id: "priya", name: "Priya", gender: "female", description: "Upbeat voice with personality" },
  { id: "suhani", name: "Suhani", gender: "female", description: "Pleasant and soothing voice" },
  { id: "ashutosh", name: "Ashutosh", gender: "male", description: "Traditional Hindi narration style" },
  { id: "ritu", name: "Ritu", gender: "female", description: "Soft, approachable voice for customer interactions" },
  { id: "amartya", name: "Amartya", gender: "male", description: "Professional male voice with clear articulation" },
  { id: "ananya", name: "Ananya", gender: "female", description: "Expressive female voice, great for stories" },
  { id: "sarika", name: "Sarika", gender: "female", description: "Warm and friendly tones" },
  { id: "dhruv", name: "Dhruv", gender: "male", description: "Energized young male voice" },
];

async function main() {
  const url = process.env.DATABASE_URL;
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB for seeding...");

    for (const voice of SARVAM_VOICES) {
      const id = `sarvam_${voice.id}`;
      // Check if exists
      const check = await client.query('SELECT id FROM "Voice" WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        console.log(`Adding voice: ${voice.name}`);
        await client.query(
          `INSERT INTO "Voice" (id, name, description, category, language, variant, provider, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [id, voice.name, voice.description, 'GENERAL', 'hi-IN', 'SYSTEM', 'SARVAM']
        );
      } else {
        console.log(`Voice exists: ${voice.name}. Updating...`);
        await client.query(
          `UPDATE "Voice" SET name = $2, description = $3, provider = $4, variant = $5, language = $6, "updatedAt" = NOW() WHERE id = $1`,
          [id, voice.name, voice.description, 'SARVAM', 'SYSTEM', 'hi-IN']
        );
      }
    }
    console.log("Seeding complete!");
  } catch (e) {
    console.error("SEED ERROR:", e.message);
  } finally {
    await client.end();
  }
}

main();
