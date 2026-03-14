require('dotenv').config();
const fetch = require('node-fetch');

async function testModalRoot() {
  const url = "https://tasmiyasiddiqui457-26729--chatterbox-tts-serve.modal.run";
  const apiKey = process.env.CHATTERBOX_API_KEY;
  console.log(`Testing Modal root with header: ${url}`);
  
  try {
    const response = await fetch(`${url}/`, {
      headers: {
        "x-api-key": apiKey
      }
    });
    console.log(`Response status: ${response.status}`);
    const text = await response.text();
    console.log(`Response body: ${text}`);
    
    if (response.ok || response.status === 405) {
      console.log("SUCCESS! Modal endpoint is reachable.");
    } else {
      console.log("FAILED! Modal endpoint returned an error.");
    }
  } catch (err) {
    console.error("FAILED to connect to Modal:", err.message);
  }
}

testModalRoot();
