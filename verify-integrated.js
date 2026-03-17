const { pg } = require('./src/lib/db');

async function main() {
  console.log("SIMULATING ROUTER LOGIC...");
  
  try {
    // 1. Simulate Voice Lookup (Standard Query)
    console.log("Checking voices via pg pool...");
    const voiceRes = await pg.query('SELECT id, name, provider FROM "Voice" WHERE provider = $1 LIMIT 1', ['SARVAM']);
    const voice = voiceRes.rows[0];
    
    if (voice) {
      console.log(`SUCCESS: Found Sarvam Voice: ${voice.name} (${voice.id})`);
    } else {
      console.log("FAILURE: No Sarvam Voice found in DB.");
    }

    // 2. Simulate Generation Creation (Insert with new fields)
    console.log("Simulating Generation creation with provider=SARVAM and model=bulbul:v1...");
    const genId = `test_${Date.now()}`;
    await pg.query(
      `INSERT INTO "Generation" (id, "orgId", text, "voiceName", "voiceId", provider, model, language, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [genId, 'org_test', 'Hello Hindi', voice?.name || 'Test', voice?.id || 'test_id', 'SARVAM', 'bulbul:v1', 'hi-IN']
    );
    console.log(`SUCCESS: Created test generation ${genId}`);

    // 3. Verify Retrieval
    const checkRes = await pg.query('SELECT * FROM "Generation" WHERE id = $1', [genId]);
    const gen = checkRes.rows[0];
    console.log("Retrieved Generation fields:");
    console.log("- Provider:", gen.provider);
    console.log("- Model:", gen.model);
    console.log("- Language:", gen.language);

    // Cleanup
    await pg.query('DELETE FROM "Generation" WHERE id = $1', [genId]);
    console.log("Cleanup complete.");

  } catch (e) {
    console.error("VERIFICATION FAILED:", e.message);
  } finally {
    await pg.end();
  }
}

main();
