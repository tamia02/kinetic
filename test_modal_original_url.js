require('dotenv').config();
const fetch = require('node-fetch');

async function testModal() {
  const url = "https://tasmiyasiddiqui457-26729--chatterbox-tts-serve.modal.run";
  const apiKey = process.env.CHATTERBOX_API_KEY;
  console.log(`Testing Modal endpoint with header: ${url}`);
  
  try {
    const response = await fetch(`${url}/docs`, {
      headers: {
        "x-api-key": apiKey
      }
    });
    console.log(`Response status: ${response.status}`);
    if (response.ok) {
      console.log("SUCCESS! Modal endpoint is reachable.");
    } else {
      console.log("FAILED! Modal endpoint returned an error.");
    }
  } catch (err) {
    console.error("FAILED to connect to Modal:", err.message);
  }
}

testModal();
