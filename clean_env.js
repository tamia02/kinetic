const fs = require('fs');
const path = 'c:/Users/tasmi/OneDrive/agentic workflow/kinetic/.env';
const content = fs.readFileSync(path, 'utf8');
// Remove non-printable characters and BOM
const cleaned = content.replace(/[^\x20-\x7E\n\r\t]/g, '').trim();
fs.writeFileSync(path, cleaned, 'utf8');
console.log('Cleaned .env');
