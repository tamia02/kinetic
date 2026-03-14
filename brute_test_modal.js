require('dotenv').config();
const fetch = require('node-fetch');

async function testUrls() {
  const username = "tasmiyasiddiqui457-26729";
  const apiKey = process.env.CHATTERBOX_API_KEY;
  const candidates = [
    `https://${username}--chatterbox-tts-serve.modal.run`,
    `https://${username}--chatterbox-tts-chatterbox-serve.modal.run`,
    `https://${username}--tts-chatterbox-serve.modal.run`,
    `https://${username}--tts-chatterbox-chatterbox-serve.modal.run`,
    `https://${username}--chatterbox-tts.modal.run`,
  ];

  for (const url of candidates) {
    console.log(`Testing: ${url}/generate`);
    try {
      const response = await fetch(`${url}/generate`, {
        method: "POST",
        headers: { "x-api-key": apiKey }
      });
      console.log(`- Status: ${response.status}`);
      if (response.status !== 404) {
        console.log(`FOUND Candidate? ${url}`);
      }
    } catch (err) {
      console.log(`- Error: ${err.message}`);
    }
  }
}

testUrls();
