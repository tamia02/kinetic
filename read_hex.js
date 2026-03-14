const fs = require('fs');
const buffer = fs.readFileSync('c:/Users/tasmi/OneDrive/agentic workflow/kinetic/prisma/schema.prisma');
console.log(buffer.toString('hex'));
console.log(buffer.toString('utf8'));
