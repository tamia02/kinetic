require('dotenv').config();
const fetch = require('node-fetch');

async function testModal() {
  const url = "https://tasmiyasiddiqui457--chatterbox-tts-chatterbox-serve.modal.run";
  console.log(`Testing Modal endpoint: ${url}`);
  
  try {
    const response = await fetch(`${url}/docs`);
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
