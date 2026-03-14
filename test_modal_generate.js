require('dotenv').config();
const fetch = require('node-fetch');

async function testGenerate() {
  const url = "https://tasmiyasiddiqui457--chatterbox-tts-serve.modal.run";
  const apiKey = process.env.CHATTERBOX_API_KEY;
  
  // Use a known system voice key from the seeder logic
  // Seeder uses: voices/system/cmmq4mmkm000jbs
  // I'll try to fetch one from DB just to be sure
  
  const body = {
    prompt: "Hello, this is a test generation.",
    voice_key: "voices/system/cmmq4mmkm000jbs", // This is a guess, I should verify
    temperature: 0.8,
    top_p: 0.95,
    top_k: 1000,
    repetition_penalty: 1.2,
    norm_loudness: true,
  };

  console.log(`Testing Modal generate: ${url}/generate`);
  
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
    console.log(`Response body (first 100 chars): ${text.substring(0, 100)}`);
    
    if (response.ok) {
      console.log("SUCCESS! Modal generation is working.");
    } else {
      console.log("FAILED! Modal generation returned an error.");
    }
  } catch (err) {
    console.error("FAILED to connect to Modal:", err.message);
  }
}

testGenerate();
