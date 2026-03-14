const fs = require('fs');
const buffer = fs.readFileSync('c:/Users/tasmi/OneDrive/agentic workflow/kinetic/.env');
console.log(buffer.toString('hex'));
console.log(buffer.toString('utf8'));
