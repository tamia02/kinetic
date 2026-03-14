require('dotenv').config();
const fetch = require('node-fetch');

async function reproduceGeneration() {
  const url = process.env.CHATTERBOX_API_URL;
  const apiKey = process.env.CHATTERBOX_API_KEY;
  const voiceKey = "voices/system/cmmq4mmkm000jbs"; // A known valid voice key from seeder

  const body = {
    prompt: "This is a reproduction test for the 500 error.",
    voice_key: voiceKey,
    temperature: 0.8,
    top_p: 0.95,
    top_k: 1000,
    repetition_penalty: 1.2,
    norm_loudness: true,
  };

  console.log(`Replicating generation call to: ${url}/generate`);
  
  try {
    const response = await fetch(`${url}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    console.log(`Response status: ${response.status}`);
    const text = await response.text();
    console.log(`Response body (first 200 chars): ${text.substring(0, 200)}`);
    
    if (response.ok) {
      console.log("SUCCESS! Standalone reproduction worked.");
    } else {
      console.log("FAILED! Standalone reproduction failed.");
    }
  } catch (err) {
    console.error("FAILED to connect to Modal in reproduction:", err.message);
  }
}

reproduceGeneration();
