require('dotenv').config();
const fetch = require('node-fetch');

async function testGenerate() {
  const url = process.env.CHATTERBOX_API_URL;
  const apiKey = process.env.CHATTERBOX_API_KEY;
  
  const body = {
    prompt: "Hello, this is a test generation.",
    voice_key: "voices/system/cmmq4mg60000gbs8z6uc6dcxn", // Updated from DB
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
